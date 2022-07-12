<template>
  <div>
    <!--  loading overlay  -->
    <v-overlay :value="loading" opacity="1">
      <v-row class="d-flex justify-center" no-gutters>
        <h1>{{ loadingText }}</h1>
      </v-row>
      <label style="position: fixed; bottom: 10px; text-align: center;width: 100%" class="overline">EXOROYA</label>
    </v-overlay>

    <!-- Video Call  -->
    <v-sheet class="gridVideos mt-5" v-if="roomInfo.type === 1 && !loading">

      <!--   Toggles   -->
      <div class="toggles" :style="(directionOfLanguage === 'rtl' ? 'left' : 'right') + ':10px'">

        <!--  End Call    -->
        <v-btn
          @click="endCall"
          color="red"
          icon>
          <v-icon>mdi-phone-remove</v-icon>
        </v-btn>

        <!--   ScreenShare   -->
        <v-btn
          v-if="!isMobile"
          :loading="screenShareLoader"
          :outlined="screenShare"
          @click="toggleScreenShare"
          icon>
          <v-icon v-if="screenShare">mdi-projector-screen-outline</v-icon>
          <v-icon v-else>mdi-projector-screen-off-outline</v-icon>
        </v-btn>

        <!--   Camera   -->
        <v-btn
          :outlined="camera"
          :loading="cameraLoader"
          @click="toggleCamera"
          icon>
          <v-icon v-if="camera">mdi-camera-outline</v-icon>
          <v-icon v-else>mdi-camera-off-outline</v-icon>
        </v-btn>

        <!--   Microphone   -->
        <v-btn
          :outlined="microphone"
          :loading="microphoneLoader"
          @click="toggleMicrophone"
          icon>
          <v-icon v-if="microphone">mdi-microphone</v-icon>
          <v-icon v-else>mdi-microphone-off</v-icon>
        </v-btn>
      </div>

      <!--    Call Page   -->
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

    <!--    Voice Call   -->
    <v-sheet class="pa-5 rounded-lg" min-height="80vh" v-if=" roomInfo.type === 0 && !loading">
      <!--   Avatar   -->
      <v-row class="d-flex justify-center mt-5 mb-0">
        <ContactAvatar :avatar="roomInfo.user.avatar"
                       :name="roomInfo.user.firstName"
                       :color="roomInfo.user.color"
                       :size="180"/>
      </v-row>
      <!--   Name   -->
      <v-row class="d-flex justify-center mt-1">
        <p class="mt-12 text-h5">{{ roomInfo.user.firstName + ' ' + roomInfo.user.lastName }}</p>
      </v-row>
      <!--   Action Buttons   -->
      <v-row class="d-flex justify-center mt-16">
        <!--   Microphone   -->
        <v-btn
          :outlined="microphone"
          :loading="microphoneLoader"
          @click="toggleMicrophone"
          class="mx-5"
          x-large
          icon>
          <v-icon v-if="microphone">mdi-microphone</v-icon>
          <v-icon v-else>mdi-microphone-off</v-icon>
        </v-btn>

        <!--  End Call    -->
        <v-btn
          @click="endCall"
          color="red"
          x-large
          icon>
          <v-icon>mdi-phone-remove</v-icon>
        </v-btn>

      </v-row>
      <Stream v-if="streams.remoteUserMediaStream && renderRemoteStream"
              @selectAsMainStream="selectAsMainStream"
              :isMainStream="false"
              :voiceCall="true"
              :srcObject="streams.remoteUserMediaStream"/>
    </v-sheet>

  </div>
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
      peerConnection         : null,
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
    };
  },
  computed: {
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    },
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
    this.socket         = this.$websocket.getSocket();
    this.peerConnection = this.$peer.getPeer();

    if (!this.roomId) {
      this.destroyStreams();
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
          this.destroyStreams();
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
          this.socket.emit('acceptCall', this.peerUser, this.roomInfo._id, this.$peer.getPeerId());
        }


      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 403:
              this.$notifier.showMessage({
                content: this.$t(`PERMISSION_DENIED`),
                color  : 'error'
              });
              this.destroyStreams();
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

    // Create call
    this.socket.on('callAccepted', (peerId) => {
      this.loadingText = this.$t(`CONNECTING`);
      this.getUserMediaAccess(() => {
        let call        = this.peerConnection.call(peerId, this.streams.localUserMediaStream);
        this.connection = call.peerConnection;
        this.loading    = false;
        call.on('stream', (remoteStream) => {
          remoteStream.name                  = 'remote';
          remoteStream.user                  = this.roomInfo.user;
          this.streams.remoteUserMediaStream = remoteStream;
          this.reRenderStreams('remote');
          this.mainStream = 'remote';
        });
      });
    });

    // Receive Call
    this.peerConnection.on('call', (call) => {
      this.getUserMediaAccess(() => {
        this.loadingText = this.$t(`CONNECTING`);
        call.answer(this.streams.localUserMediaStream);
        this.connection = call.peerConnection;
        this.loading    = false;
        call.on('stream', (remoteStream) => {
          remoteStream.name                  = 'remote';
          remoteStream.user                  = this.roomInfo.user;
          this.streams.remoteUserMediaStream = remoteStream;
          this.reRenderStreams('remote');
          this.mainStream = 'remote';
        });
      });
    });


    this.socket.on('callRejected', () => {
      this.loadingText = this.$t(`CALL_REJECTED`);
      this.destroyStreams();

      // redirect to contact page
      location.href = '/contacts';
    });

    this.socket.on('prepareCall', (response) => {
      if (response.status === true) {
        this.loadingText = this.$t(`CALLING`);
      } else {
        if (response.message === 'offline') {
          this.loadingText = this.$t(`USER_IS_OFFLINE`);
          this.destroyStreams();

          // redirect to contact page
          location.href = '/contacts';
        } else if (response.message === 'user is busy') {
          this.loadingText = 'the user is busy';
          this.destroyStreams();

          // redirect to contact page
          location.href = '/contacts';
        }
      }
    });

    this.socket.on('endCall', () => {
      this.loading     = true;
      this.loadingText = this.$t(`CALL_ENDED`);
      this.destroyStreams();

      // redirect to contact page
      location.href = '/contacts';
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
          frameRate  : 10,
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
        if (this.mainStream === 'localScreenShare') {
          this.mainStream = 'remote';
        }
        this.streamsTracks.localTracks.screenShareTracks.screenShareVideo.stop();
        if (this.streamsTracks.localTracks.screenShareTracks.screenShareAudio) {
          this.streamsTracks.localTracks.screenShareTracks.screenShareAudio.stop();
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
      this.destroyStreams();

      // redirect to contact page
      location.href = '/contacts';
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
    destroyStreams() {

      // destroy userMediaStream
      if (this.streamsTracks.localTracks.userMediaTracks.camera) {
        this.streamsTracks.localTracks.userMediaTracks.camera.stop();
      }
      if (this.streamsTracks.localTracks.userMediaTracks.microphone) {
        this.streamsTracks.localTracks.userMediaTracks.microphone.stop();
      }

      // destroy screenShareStream
      if (this.streamsTracks.localTracks.screenShareTracks.screenShareVideo) {
        this.streamsTracks.localTracks.screenShareTracks.screenShareVideo.stop();
      }
      if (this.streamsTracks.localTracks.screenShareTracks.screenShareAudio) {
        this.streamsTracks.localTracks.screenShareTracks.screenShareAudio.stop();
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

.toggles {
  position: absolute !important;
  margin-top: -70px;
  z-index: 1;
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
