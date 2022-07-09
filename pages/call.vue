<template>
  <v-sheet>
    <!--  loading overlay  -->
    <v-overlay :value="loading" opacity="1">
      <v-row class="d-flex justify-center" no-gutters>
        <h1>{{ loadingText }}</h1>
      </v-row>
      <v-row class="d-flex justify-center mt-5" no-gutters>
        <label style="position: fixed; bottom: 10px" class="overline">EXOROYA</label>
      </v-row>
    </v-overlay>

    <!--    Call Page    -->
    <v-sheet color="white" class="gridVideos mt-5" v-if="!loading">
      <v-row>
        <v-col class="mainStream pa-0" cols="12" sm="12" md="9" lg="9" xl="9">
          <Stream v-if="renderMainStream"
                  :isMainStream="true"
                  :srcObject="getStream(mainStream)"/>
        </v-col>
        <v-col class="listOfStreams px-0 mx-0 pa-0" cols="12" sm="12" md="3" lg="3" xl="3">
          <v-list width="100%" height="100%" class="mx-0">

            <!--      Local Stream      -->
            <v-list-item class="streamItem pt-1 pb-1" v-if="streams.localUserMediaStream && renderLocalStream">
              <Stream @selectAsMainStream="selectAsMainStream"
                      :isMainStream="false"
                      :srcObject="streams.localUserMediaStream"/>
            </v-list-item>

            <!--      ScreenShare Stream      -->
            <v-list-item class="streamItem pt-1 pb-1" v-if="streams.localScreenShareStream && renderScreenShareStream">
              <Stream @selectAsMainStream="selectAsMainStream"
                      :isMainStream="false"
                      :srcObject="streams.localScreenShareStream"/>
            </v-list-item>

            <!--      Remote Stream      -->
            <v-list-item class="streamItem pt-1 pb-1" v-if="streams.remoteUserMediaStream && renderRemoteStream">
              <Stream @selectAsMainStream="selectAsMainStream"
                      :isMainStream="false"
                      :srcObject="streams.remoteUserMediaStream"/>
            </v-list-item>

          </v-list>
        </v-col>
      </v-row>
    </v-sheet>


  </v-sheet>
</template>

<script>
export default {
  name    : "call",
  auth    : true,
  data    : () => {
    return {
      status                 : -1,
      loading                : true,
      loadingText            : '',
      roomInfo               : {},
      socket                 : '',
      creator                : false,
      peerUser               : '',
      myPeerId               : '',
      connection             : null,
      candidateReceiveSet    : false,
      microphone             : false,
      microphoneLoader       : false,
      camera                 : false,
      cameraLoader           : false,
      screenShare            : false,
      screenShareLoader      : false,
      deviceWidth            : 0,
      deviceHeight           : 0,
      mainStream             : 'local',
      streams                : {
        localUserMediaStream  : null,
        localScreenShareStream: null,
        remoteUserMediaStream : null,
      },
      streamsTracks          : {
        localTracks: {
          userMediaTracks  : {
            microphone: null,
            camera    : null,
          },
          screenShareTracks: {
            screenShareVideo: null,
            screenShareAudio: null
          },
        },
      },
      renderLocalStream      : false,
      renderScreenShareStream: false,
      renderRemoteStream     : false,
      renderMainStream       : false,
      peerConnectionConfig   : {
        // iceTransportPolicy: 'relay',
        // iceServers        : [
        //   {
        //     urls      : 'turn:turn.exoroya.ir',
        //     credential: '123',
        //     username  : 'abc'
        //   },
        // ]
      }
    };
  },
  computed: {
    roomId() {
      return this.$store.state.user.roomId;
    },
    userId() {
      return this.$auth.user.id;
    },
    isMobile() {
      const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
      ];

      return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
      });
    },
    selectedMicrophoneId() {
      return this.$store.state.call.selectedMicrophoneId;
    },
    selectedCameraId() {
      return this.$store.state.call.selectedCameraId;
    },
    noiseSuppression() {
      return this.$store.state.call.noiseSuppression;
    },
    echoCancellation() {
      return this.$store.state.call.echoCancellation;
    },
  },
  mounted() {
    // set socket object
    this.socket = this.$websocket.getSocket();

    if (!this.roomId) {
      // redirect to contact page
      this.$router.push({
        path: "/contacts"
      })
    } else {
      // get room data
      this.loadingText = this.$t(`LOADING`);
      this.$axios.get('calls/' + this.roomId).then(response => {
        this.roomInfo = response.data;
        this.creator  = (this.roomInfo.caller === this.userId);
        this.peerUser = this.creator ? this.roomInfo.receiver : this.roomInfo.caller;
        this.status   = 0;

        // call is ended
        if (this.roomInfo.status !== 0 && !(this.roomInfo.status === 1 && !this.creator)) {
          // redirect to contact page
          this.$router.push({
            path: "/contacts"
          })
          return;
        }

        if (this.creator) {
          // prepare call
          this.socket.emit('prepareCall', this.peerUser, this.roomInfo._id);
          this.loadingText = this.$t(`PREPARING_CALL`);
        } else {
          // accept call
          this.socket.emit('acceptCall', this.peerUser, this.roomInfo._id, this.myPeerId);
        }


      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 403:
              this.$notifier.showMessage({
                content: this.$t(`PERMISSION_DENIED`),
                color  : 'error'
              });
              this.$router.push({
                path: "/contacts"
              })
              break;
          }
        } else {
          this.$notifier.showMessage({
            content: this.$t(`REQUEST_FAILED`),
            color  : 'error'
          });
        }
      });
    }

    // Creating peerConnection
    this.connection = new RTCPeerConnection();

    // Create call
    this.socket.on('callAccepted', () => {
      this.loadingText = this.$t(`CONNECTING`);
      this.getUserMediaAccess(() => {
        this.createConnection(() => {
          // Create Offer, setLocalDescription
          this.connection.createOffer().then((offer) => {
            this.connection.setLocalDescription(offer);
            this.socket.emit('offer', this.peerUser, offer);
          });
        });
      });
    });

    // receive call
    this.socket.on('offer', (username, offerDescription) => {
      if (this.peerUser === username) {
        this.getUserMediaAccess(() => {
          this.createConnection(() => {
            // setRemoteDescription and answer the offer
            this.connection.setRemoteDescription(offerDescription);
            this.connection.createAnswer().then((answer) => {
              this.connection.setLocalDescription(answer);
              this.socket.emit('answer', username, answer);

              // Add Candidate Event
              if (!this.candidateReceiveSet) {
                this.connection.onicecandidate = ({candidate}) => {
                  candidate && this.socket.emit('candidate', this.peerUser, candidate);
                };
                this.candidateReceiveSet       = true;
              }

            });
          });
        });
      }
    });

    this.socket.on('callRejected', () => {
      this.loadingText = this.$t(`CALL_REJECTED`);
      setTimeout(() => {
        // redirect to contact page
        this.$router.push({
          path: "/contacts"
        })
      }, 1500);
    });

    this.socket.on('prepareCall', (response) => {
      if (response.status === true) {
        this.loadingText = this.$t(`CALLING`);
      } else {
        if (response.message === 'offline') {
          this.loadingText = this.$t(`USER_IS_OFFLINE`);
          setTimeout(() => {
            // redirect to contact page
            this.$router.push({
              path: "/contacts"
            })
          }, 3000);
        } else if (response.message === 'user is busy') {
          this.loadingText = 'the user is busy';
          setTimeout(() => {
            // redirect to contact page
            this.$router.push({
              path: "/contacts"
            })
          }, 3000)
        }
      }
    });

    this.socket.on('getRemoteStreamConfigs', (configs) => {
      if (this.streams.remoteUserMediaStream != null) {
        let videoTrack = this.streams.remoteUserMediaStream.getTracks().find(streamTrack => streamTrack.kind === 'video');
        let audioTrack = this.streams.remoteUserMediaStream.getTracks().find(streamTrack => streamTrack.kind === 'audio');

        if (configs.video) {
          if (videoTrack) {
            videoTrack.enabled = true;
          }
        } else {
          if (videoTrack) {
            videoTrack.enabled = false;
          }
        }

        if (configs.audio) {
          if (audioTrack) {
            audioTrack.enabled = true;
          }
        } else {
          if (audioTrack) {
            audioTrack.enabled = false;
          }
        }
      }
    });

    this.socket.on('endCall', () => {
      this.loading     = true;
      this.loadingText = this.$t(`CALL_ENDED`);
      setTimeout(() => {
        // redirect to contact page
        this.$router.push({
          path: "/contacts"
        })
      }, 1500);
    });

  },
  methods: {
    toggleMicrophone() {
      this.microphoneLoader = true;
      if (this.microphone) {
        this.streamsTracks.localTracks.userMediaTracks.microphone.enabled = false;
        this.microphone                                                   = false;
      } else {
        this.streamsTracks.localTracks.userMediaTracks.microphone.enabled = true;
        this.microphone                                                   = true;
      }
      this.microphoneLoader = false;
    },
    toggleCamera() {
      this.cameraLoader = true;
      if (this.camera) {
        this.streamsTracks.localTracks.userMediaTracks.camera.enabled = false;
        this.camera                                                   = false;
      } else {
        this.streamsTracks.localTracks.userMediaTracks.camera.enabled = true;
        this.camera                                                   = true;
        if (this.streamsTracks.localTracks.screenShareTracks.screenShareVideo !== null) {
          if (this.screenShare) {
            this.toggleScreenShare();
          }
          for (let sender of this.connection.getSenders()) {
            if (sender.track.kind === 'video') {
              sender.replaceTrack(this.streamsTracks.localTracks.userMediaTracks.camera);
            }
          }
        }
      }
      this.cameraLoader = false;
    },
    toggleScreenShare() {
      this.screenShareLoader = true;
      if (!this.screenShare) {
        let videoOptions = {
          aspectRatio: 1.777777778,
          frameRate  : 60,
          cursor     : "always"
        };

        let audioOptions = {
          sampleRate: 48000
        };

        navigator.getUserMedia = (
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia
        );
        navigator.mediaDevices.getDisplayMedia(
          {
            audio: audioOptions,
            video: videoOptions
          }
        ).then(screenShareStream => {
          screenShareStream.getTracks().forEach((track) => {
            if (track.kind === 'audio') {
              track.name                                                        = 'screenShareAudio';
              this.streamsTracks.localTracks.screenShareTracks.screenShareAudio = track;
              let OutgoingAudioMediaStream                                      = new MediaStream();
              OutgoingAudioMediaStream.addTrack(this.streamsTracks.localTracks.userMediaTracks.microphone);
              let IncomingAudioMediaStream = new MediaStream();
              IncomingAudioMediaStream.addTrack(track);
              const audioContext = new AudioContext();
              let audioIn_01     = audioContext.createMediaStreamSource(OutgoingAudioMediaStream);
              let audioIn_02     = audioContext.createMediaStreamSource(IncomingAudioMediaStream);
              let dest           = audioContext.createMediaStreamDestination();
              audioIn_01.connect(dest);
              audioIn_02.connect(dest);
              let FinalStream = dest.stream;
              for (let sender of this.connection.getSenders()) {
                if (sender.track.kind === 'audio') {
                  sender.replaceTrack(FinalStream.getTracks()[0]);
                }
              }
            }
            if (track.kind === 'video') {
              track.name = 'screenShareVideo';
              track.addEventListener('ended', () => {
                this.screenShare = false;
                if (this.mainStream === 'localScreenShare') {
                  this.mainStream = 'remote';
                }
                this.streams.localScreenShareStream = null;
              });
              this.streamsTracks.localTracks.screenShareTracks.screenShareVideo = track;
            }
          });
          if (this.camera) {
            this.toggleCamera();
          }
          for (let sender of this.connection.getSenders()) {
            if (sender.track.kind === 'video') {
              sender.replaceTrack(this.streamsTracks.localTracks.screenShareTracks.screenShareVideo);
            }
          }
          this.refreshLocalScreenShareStream();
          this.screenShare       = true;
          this.screenShareLoader = false;
        }).catch((err) => {
          if (this.mainStream === 'localScreenShare') {
            this.mainStream = 'remote';
          }
          this.streams.localScreenShareStream = null;
          this.screenShare                    = false;
          this.screenShareLoader              = false;
          console.log(err);
        });
      } else {
        this.streamsTracks.localTracks.screenShareTracks.screenShareVideo.stop();
        if (this.streamsTracks.localTracks.screenShareTracks.screenShareAudio) {
          this.streamsTracks.localTracks.screenShareTracks.screenShareAudio.stop();
        }
        if (this.mainStream === 'localScreenShare') {
          this.mainStream = 'remote';
        }
        this.streams.localScreenShareStream = null;
        this.screenShare                    = false;
        this.screenShareLoader              = false;
      }
    },
    endCall() {
      this.socket.emit('endCall', this.peerUser);
      this.loading     = true;
      this.loadingText = this.$t(`CALL_ENDED`);
      setTimeout(() => {
        // redirect to contact page
        this.$router.push({
          path: "/contacts"
        })
      }, 1500);
    },
    getStream(streamName) {
      switch (streamName) {
        case 'local':
          return this.streams.localUserMediaStream;
        case 'remote':
          return this.streams.remoteUserMediaStream;
        case 'localScreenShare':
          return this.streams.localScreenShareStream;
      }
    },
    reRenderStreams(type = 'local') {
      switch (type) {
        case 'local' :
          this.renderLocalStream = false;
          this.$nextTick(() => {
            this.renderLocalStream = true;
          });
          break;
        case 'screenShare' :
          this.renderScreenShareStream = false;
          this.$nextTick(() => {
            this.renderScreenShareStream = true;
          });
          break;
        case 'remote' :
          this.renderRemoteStream = false;
          this.$nextTick(() => {
            this.renderRemoteStream = true;
          });
          break;
        case 'main' :
          this.renderMainStream = false;
          this.$nextTick(() => {
            this.renderMainStream = true;
          });
          break;
      }
    },
    getUserMediaAccess(callback) {

      let audioOptions = {
        echoCancellation: this.echoCancellation,
        noiseSuppression: this.noiseSuppression,
        sampleRate      : 48000
      };

      let videoOptions = {};

      if (this.selectedMicrophoneId !== '') {
        audioOptions.deviceId = {exact: this.selectedMicrophoneId};
      }

      if (this.selectedCameraId !== '') {
        videoOptions.deviceId = {exact: this.selectedCameraId};
      }

      navigator.getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );

      navigator.getUserMedia({
        audio: audioOptions, video: (this.roomInfo.type === 1 ? videoOptions : false)
      }, (userMediaStream) => {
        userMediaStream.getTracks().forEach((track) => {
          if (track.kind === 'audio') {
            if (this.selectedMicrophoneId === '') {
              this.$store.commit('call/saveSelectedMicrophoneId', track.getSettings().deviceId);
            }
            track.name                                                = 'microphone';
            this.streamsTracks.localTracks.userMediaTracks.microphone = track;
          }
          if (track.kind === 'video') {
            if (this.$store.state.selectedCameraId === '') {
              this.$store.commit('call/saveSelectedCameraId', track.getSettings().deviceId);
            }
            track.name                                            = 'camera';
            track.enabled                                         = false;
            this.streamsTracks.localTracks.userMediaTracks.camera = track;
          }
        });

        this.microphone = true;
        this.camera     = false;

        this.refreshLocalUserMediaStream(() => {
          if (callback && typeof callback === 'function') {
            callback();
          }
        });

        this.userMediaAccess = 1;
      }, (e) => {
        this.userMediaAccess = -1;
        console.log(e);
      });
    },
    refreshLocalUserMediaStream(callback) {
      // create userMediaStream
      let localUserMediaStream = new MediaStream();
      // add userMediaStreamTracks
      if (this.streamsTracks.localTracks.userMediaTracks.microphone != null) {
        localUserMediaStream.addTrack(this.streamsTracks.localTracks.userMediaTracks.microphone);
      }
      if (this.streamsTracks.localTracks.userMediaTracks.camera != null) {
        localUserMediaStream.addTrack(this.streamsTracks.localTracks.userMediaTracks.camera);
      }
      localUserMediaStream.user         = this.$auth.user;
      localUserMediaStream.name         = 'local';
      this.streams.localUserMediaStream = localUserMediaStream;
      this.reRenderStreams('local');
      if (callback && typeof callback === 'function') {
        callback();
      }
      if (this.mainStream === '') {
        this.mainStream = 'local';
      }
    },
    refreshLocalScreenShareStream() {
      // create localScreenShareStream
      let localScreenShareStream = new MediaStream();
      if (this.streamsTracks.localTracks.screenShareTracks.screenShareAudio) {
        localScreenShareStream.addTrack(this.streamsTracks.localTracks.screenShareTracks.screenShareAudio);
      }
      if (this.streamsTracks.localTracks.screenShareTracks.screenShareVideo) {
        localScreenShareStream.addTrack(this.streamsTracks.localTracks.screenShareTracks.screenShareVideo);
      }
      localScreenShareStream.name         = 'localScreenShare';
      localScreenShareStream.user         = this.$auth.user;
      this.streams.localScreenShareStream = localScreenShareStream;
      this.reRenderStreams('screenShare');
    },
    selectAsMainStream(streamObject) {
      this.mainStream = streamObject.name;
    },
    createConnection(callback) {

      // Receive Answer to establish peer connection
      this.socket.on('answer', (username, description) => {
        if (this.peerUser === username) {
          this.connection.setRemoteDescription(description);

          // Add Candidate Event
          if (!this.candidateReceiveSet) {
            this.connection.onicecandidate = ({candidate}) => {
              candidate && this.socket.emit('candidate', this.peerUser, candidate);
            };
            this.candidateReceiveSet       = true;
          }

        }
      });

      // Receive candidates and add to peer connection
      this.socket.on('candidate', (username, candidate) => {
        if (this.peerUser === username) {
          if (candidate.candidate != null && candidate.sdpMid != null && candidate.sdpMLineIndex != null) {
            this.connection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      });

      if (this.streamsTracks.localTracks.userMediaTracks.microphone != null) {
        // add microphone track to connection
        this.connection.addTrack(this.streamsTracks.localTracks.userMediaTracks.microphone);
      }

      if (this.streamsTracks.localTracks.userMediaTracks.camera != null) {
        // add camera track to connection
        this.connection.addTrack(this.streamsTracks.localTracks.userMediaTracks.camera);
      }

      // get remote stream
      this.connection.ontrack = (rtcTrack) => {
        // create remote media stream
        if (this.streams.remoteUserMediaStream === null) {
          this.streams.remoteUserMediaStream      = new MediaStream();
          this.streams.remoteUserMediaStream.name = 'remote';
          this.streams.remoteUserMediaStream.user = this.roomInfo.user;
          this.reRenderStreams('remote');
          this.mainStream = 'remote';
        }
        // add track
        this.streams.remoteUserMediaStream.addTrack(rtcTrack.track);

        if (this.loading) {
          this.loading = false;
        }
      };

      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  },
  watch  : {
    mainStream() {
      this.reRenderStreams('main');
    },
    remoteStream(val) {
      val.user                           = this.roomInfo.user;
      val.name                           = 'remote';
      this.streams.remoteUserMediaStream = val;
      this.mainStream                    = 'remote';
    },
    camera() {
      if (this.peerUser) {
        this.socket.emit('getRemoteStreamConfigs', this.peerUser, {
          video: this.camera || this.screenShare,
          audio: this.microphone || this.screenShare
        });
      }
    },
    microphone() {
      if (this.peerUser) {
        this.socket.emit('getRemoteStreamConfigs', this.peerUser, {
          video: this.camera || this.screenShare,
          audio: this.microphone || this.screenShare
        });
      }
    },
    screenShare() {
      if (this.peerUser) {
        this.socket.emit('getRemoteStreamConfigs', this.peerUser, {
          video: this.camera || this.screenShare,
          audio: this.microphone || this.screenShare
        });
      }
    },
  },
}
</script>

<style scoped>
.gridVideos {
  width: 100% !important;
}

.gridVideos .listOfStreams {
  min-height: calc(100vh - 150px);
  max-height: calc(100vh - 150px);
}

.gridVideos .listOfStreams .streamItem {
  display: block;
  height: 160px;
}

.gridVideos .mainStream {
  max-height: calc(100vh - 150px);
  min-height: calc(100vh - 150px);
}

.gridVideos .listOfStreams {
  width: 100%;
}

@media screen and (max-width: 959px) {
  .gridVideos .mainStream {
    min-height: calc(74vh);
    max-height: calc(74vh);
  }

  .gridVideos .listOfStreams {
    min-height: 185px;
    max-height: 185px;
    overflow-x: scroll;
    padding: 0 !important;
    margin: 0 !important;
  }

  .gridVideos .listOfStreams .streamItem {
    display: inline-block;
    text-decoration: none;
    height: 140px;
    width: 49%;
    max-width: 49%;
  }

}

</style>
