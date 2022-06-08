<template>
  <v-sheet>
    <!--  loading overlay  -->
    <v-overlay :value="loading" opacity="1">
      <v-row no-gutters>
        <h2>{{ loadingText }}</h2>
      </v-row>
      <v-row class="d-flex justify-center mt-5" no-gutters>
        <v-progress-circular indeterminate></v-progress-circular>
      </v-row>
    </v-overlay>

    <!--   Call Page     -->
    <div class="gridVideos pt-0 pl-3 pr-3" v-if="userOnCall">
      <v-row>
        <v-col class="mainStream pa-0 pt-3" cols="12" sm="12" md="9" lg="9" xl="9">
          <StreamObject v-if="renderStreams"
                        :isMainStream="true"
                        :srcObject="getStream(mainStream)"
                        :streamName="getStreamName(getStream(mainStream))"/>
        </v-col>
        <v-col class="listOfStreams pr-0 pl-2 pb-0 pt-4" cols="12" sm="12" md="3" lg="3" xl="3">
          <v-list subheader>
            <v-list-item v-for="(stream,index) in streams"
                         :key="index"
                         class="streamItem pr-0 pl-0 pt-1 pb-1"
                         v-if="stream != null && renderStreams">
              <StreamObject @selectAsMainStream="selectAsMainStream"
                            :isMainStream="false"
                            :srcObject="getStream(stream.name)"
                            :streamName="getStreamName(stream)"/>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </div>

    <!--   Main Page     -->
    <div class="mainPage pr-3 pb-3" v-if="!userOnCall">
      <v-row>
        <v-col cols="12" md="6" lg="6" xl="6">
          <v-card class="ma-5">

            <v-toolbar dark>
              <v-toolbar-title>
                Call
              </v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-list>
                <v-subheader>Enter a username to call</v-subheader>
                <v-list-item>
                  <v-text-field v-model="callUserName"
                                :disabled="checkCallLoader"
                                color="black"
                                label="username"
                                outlined>
                  </v-text-field>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn dark :loading="checkCallLoader" @click="startCall">
                <v-icon left>mdi-phone</v-icon>
                Call
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
        <v-col cols="12" md="6" lg="6" xl="6">
          <v-card class="ma-5">

            <v-toolbar dark>
              <v-toolbar-title>
                Your username
              </v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-list>
                <v-subheader>Copy username and send it to your friend</v-subheader>
                <v-list-item>
                  <v-alert
                    class="mb-7"
                    border="left"
                    icon="mdi-account"
                    width="100%"
                    outlined>
                    {{ this.$store.state.userName }}
                  </v-alert>
                </v-list-item>
              </v-list>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn dark @click="copyUserName">
                <v-icon left>mdi-content-copy</v-icon>
                Copy
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>
    </div>


  </v-sheet>
</template>

<script>
export default {
  name    : "call",
  auth    : true,
  data    : () => {
    return {
      status           : -1,
      loading          : true,
      loadingText      : '',
      roomInfo         : {},
      socket           : '',
      creator          : false,
      peerUser         : '',
      connection       : null,
      microphone       : false,
      microphoneLoader : false,
      microphoneAccess : '',
      camera           : false,
      cameraLoader     : false,
      cameraAccess     : '',
      screenShare      : false,
      screenShareLoader: false,
      userMediaAccess  : '',
      userBrowser      : undefined,
      deviceWidth      : 0,
      deviceHeight     : 0,
      mainStream       : 'local',
      streams          : {
        localUserMediaStream  : null,
        localScreenShareStream: null,
        remoteUserMediaStream : null,
      },
      streamsTracks    : {
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
    selectedMicrophoneId: () => {
      return this.$store.state.call.selectedMicrophoneId;
    },
    selectedCameraId    : () => {
      return this.$store.state.call.selectedCameraId;
    },
    noiseSuppression    : () => {
      return this.$store.state.call.noiseSuppression;
    },
    echoCancellation    : () => {
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
          this.socket.emit('acceptCall', this.peerUser, this.roomInfo._id);
        }


      }).catch(({response}) => {
        if (response.status) {
          switch (response.status) {
            case 403:
              this.$notifier.showMessage({
                content: this.$t(`PERMISSION_DENIED`),
                color  : 'error'
              });
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


    // create call
    socketIO.on('callAccepted', (peerId) => {
      this.overlayMessage = 'Connecting...';
      this.userNameOnCall = this.callUserName;
      this.getUserMediaAccess(() => {
        var call        = this.$peer.call(peerId, this.streams.localUserMediaStream);
        this.connection = call.peerConnection;
        call.on('stream', (remoteStream) => {
          this.userOnCall                    = true;
          this.overlay                       = false;
          remoteStream.username              = this.userNameOnCall;
          remoteStream.name                  = 'remote';
          this.streams.remoteUserMediaStream = remoteStream;
          this.mainStream                    = 'remote';
          socketIO.emit('getRemoteStreamConfigs', this.userNameOnCall, {
            video: this.camera || this.screenShare,
            audio: this.microphone || this.screenShare
          });
        });
      });
    });

    // receive call
    this.$peer.on('call', (call) => {
      this.userNameOnCall = this.usernameCallMe;
      this.getUserMediaAccess(() => {
        call.answer(this.streams.localUserMediaStream);
        this.connection = call.peerConnection;
        call.on('stream', (remoteStream) => {
          this.userOnCall                    = true;
          this.overlay                       = false;
          remoteStream.username              = this.userNameOnCall;
          remoteStream.name                  = 'remote';
          this.streams.remoteUserMediaStream = remoteStream;
          this.mainStream                    = 'remote';
          setTimeout(() => {
            socketIO.emit('getRemoteStreamConfigs', this.userNameOnCall, {
              video: this.camera || this.screenShare,
              audio: this.microphone || this.screenShare
            });
          }, 1500);
        });
      });
    });

    socketIO.on('callDeclined', () => {
      this.overlayMessage  = 'Declined!';
      this.someOneCallMe   = false;
      this.checkCallLoader = false;
      setTimeout(() => {
        this.overlay = false;
      }, 3000);
    });

    socketIO.on("disconnect", () => {
      this.socketConnected = false;
    });

    socketIO.on('checkCall', (response) => {
      if (response.status === true) {
        this.overlayMessage = 'Calling ' + this.callUserName + '...';
      } else {
        if (response.message === 'offline') {
          this.overlayMessage = 'the user is offline';
          setTimeout(() => {
            this.checkCallLoader = false;
            this.overlay         = false;
          }, 3000);
        } else if (response.message === 'busy') {
          this.overlayMessage = 'the user is busy';
          setTimeout(() => {
            this.checkCallLoader = false;
            this.overlay         = false;
          }, 3000)
        }
      }
    });

    socketIO.on('someOneCallYou', (username) => {
      this.overlay        = true;
      this.overlayMessage = username + ' is Calling you now';
      this.someOneCallMe  = true;
      this.usernameCallMe = username;
    });

    socketIO.on('getRemoteStreamConfigs', (configs) => {
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

        if (audioTrack || videoTrack) {
          this.reRenderStreams();
        }
      }
    });

    socketIO.on('finishCall', () => {
      socketIO.destroy();
      this.overlay        = true;
      this.overlayMessage = 'Call Ended!';
      setTimeout(() => {
        location.reload();
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
            if (track.kind == 'audio') {
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
            if (track.kind == 'video') {
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
    checkUserMediaAccess() {

      DetectRTC.load(() => {

        this.userBrowser = DetectRTC.browser;

        if (this.userBrowser.name == 'Chrome') {
          // check camera access
          navigator.permissions.query({name: "camera"}).then((permissionStatus) => {
            switch (permissionStatus.state) {
              case "prompt":
                this.cameraAccess = 0;
                break;
              case "denied":
                this.cameraAccess = -1;
                break;
              case "granted":
                this.cameraAccess = 1;
                break;
            }

            if (!permissionStatus.onchange) {
              permissionStatus.onchange = () => {
                this.checkUserMediaAccess();
              }
            }
          });

          // check microphone access
          navigator.permissions.query({name: "microphone"}).then((permissionStatus) => {
            switch (permissionStatus.state) {
              case "prompt":
                this.microphoneAccess = 0;
                break;
              case "denied":
                this.microphoneAccess = -1;
                break;
              case "granted":
                this.microphoneAccess = 1;
                break;
            }

            if (!permissionStatus.onchange) {
              permissionStatus.onchange = () => {
                this.checkUserMediaAccess();
              }
            }
          });
        } else {
          if (DetectRTC.isWebsiteHasWebcamPermissions) {
            this.cameraAccess = 1;
          } else {
            this.cameraAccess = 0;
          }

          if (DetectRTC.isWebsiteHasMicrophonePermissions) {
            this.microphoneAccess = 1;
          } else {
            this.microphoneAccess = 0;
          }
        }

      });
    },
    startCall() {
      if (
        this.callUserName !== '' &&
        this.callUserName.length === 10 &&
        this.callUserName !== this.$store.state.userName
      ) {
        if (this.userMediaAccess === 1) {
          socketIO.emit('checkCall', this.callUserName);
          this.checkCallLoader = true;
          this.overlay         = true;
          this.overlayMessage  = 'Checking...';
        } else {
          this.overlay        = true;
          this.overlayMessage = 'Please config settings of microphone and camera access to start call';
          setTimeout(() => {
            location.reload();
          }, 3000);
        }

      } else {
        this.snakbarType = -1;
        this.snakbarText = 'username is wrong';
        this.showSnakbar = true;
      }
    },
    finishCall() {
      socketIO.emit('finishCall', this.userNameOnCall);
      socketIO.destroy();
      this.overlay        = true;
      this.overlayMessage = 'Call Ended!';
      setTimeout(() => {
        location.reload();
      }, 1500);
    },
    getStream(streamName) {
      if (streamName === 'local') {
        return this.streams.localUserMediaStream;
      } else if (streamName === 'remote') {
        return this.streams.remoteUserMediaStream;
      } else if (streamName === 'localScreenShare') {
        return this.streams.localScreenShareStream;
      }
    },
    getStreamName(stream) {
      if (stream.username === this.$store.state.userName) {
        return 'Me';
      } else {
        return stream.username;
      }
    },
    reRenderStreams() {
      this.renderStreams = false;
      this.$nextTick(() => {
        this.renderStreams = true;
      });
    },
    getUserMediaAccess(callback) {

      this.$nextTick(() => {
        this.userMediaAccessLoader = true;
      });

      let audioOptions = {
        echoCancellation: this.echoCancellation,
        noiseSuppression: this.noiseSuppression,
        sampleRate      : 48000
      };

      let videoOptions = {
        frameRate: {
          min  : 30,
          ideal: 60
        },
      };

      if (this.$store.state.selectedMicrophoneId != '') {
        audioOptions.deviceId = {exact: this.$store.state.selectedMicrophoneId};
      }

      if (this.$store.state.selectedCameraId != '') {
        videoOptions.deviceId = {exact: this.$store.state.selectedCameraId};
      }

      navigator.getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );

      navigator.getUserMedia({audio: audioOptions, video: videoOptions}, (userMediaStream) => {
        userMediaStream.getTracks().forEach((track) => {
          if (track.kind == 'audio') {
            if (this.$store.state.selectedMicrophoneId == '') {
              this.$store.commit('saveSelectedMicrophoneId', track.getSettings().deviceId);
            }
            track.name                                                = 'microphone';
            this.streamsTracks.localTracks.userMediaTracks.microphone = track;
          }
          if (track.kind == 'video') {
            if (this.$store.state.selectedCameraId == '') {
              this.$store.commit('saveSelectedCameraId', track.getSettings().deviceId);
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
        this.$nextTick(() => {
          this.userMediaAccessLoader = false;
        });
      }, (e) => {
        this.userMediaAccess = -1;
        this.$nextTick(() => {
          this.userMediaAccessLoader = false;
        });
        console.log(e);
      });
    },
    getUserDevices() {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.$store.commit('saveUserDevices', devices);
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
      localUserMediaStream.username     = this.$store.state.userName;
      localUserMediaStream.name         = 'local';
      this.streams.localUserMediaStream = localUserMediaStream;
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
      localScreenShareStream.username     = this.$store.state.userName;
      this.streams.localScreenShareStream = localScreenShareStream;
    },
    acceptCall() {
      if (this.userMediaAccess === 1) {
        this.overlayMessage = 'Connecting...';
        this.someOneCallMe  = false;
        socketIO.emit('acceptCall', this.usernameCallMe, this.$peer.id);
      } else {
        this.declineCall();
        this.overlayMessage = 'Please config settings of microphone and camera access to accept call';
        setTimeout(() => {
          location.reload();
        }, 3000);
        this.someOneCallMe = false;
      }
    },
    declineCall() {
      socketIO.emit('declineCall', this.usernameCallMe);
      this.overlayMessage = 'Declined!';
      this.someOneCallMe  = false;
      setTimeout(() => {
        this.overlay = false;
      }, 3000);
    },
    selectAsMainStream(streamObject) {
      this.mainStream = streamObject.name;
    },

  },
  watch: {
    userMediaAccess(val, oldval) {
      if (oldval === 0 && val === 1) {
        setTimeout(() => {
          this.streamsTracks.localTracks.userMediaTracks.microphone.stop();
          this.streamsTracks.localTracks.userMediaTracks.camera.stop();
        }, 2000);
      }
      if (val === 0) {
        this.settingDialog = true;
      } else {
        this.getUserDevices();
      }
    },
    cameraAccess(val) {

      if (val == -1 || this.microphoneAccess == -1) {
        this.userMediaAccess = -1;
      }

      if (val == 0 && this.microphoneAccess == 0) {
        this.userMediaAccess = 0;
      }

      if (val == 1 && this.microphoneAccess == 1) {
        this.userMediaAccess = 1;
      }

    },
    microphoneAccess(val) {

      if (val == -1 || this.cameraAccess == -1) {
        this.userMediaAccess = -1;
      }

      if (val == 0 && this.cameraAccess == 0) {
        this.userMediaAccess = 0;
      }

      if (val == 1 && this.cameraAccess == 1) {
        this.userMediaAccess = 1;
      }

    },
    streams() {
      this.reRenderStreams();
    },
    mainStream() {
      this.reRenderStreams();
    },
    remoteStream(val) {
      val.username                       = this.userNameOnCall;
      val.name                           = 'remote';
      this.streams.remoteUserMediaStream = val;
      this.mainStream                    = 'remote';
    },
    camera() {
      if (this.userOnCall) {
        this.reRenderStreams();
        socketIO.emit('getRemoteStreamConfigs', this.userNameOnCall, {
          video: this.camera || this.screenShare,
          audio: this.microphone || this.screenShare
        });
      }
    },
    microphone() {
      if (this.userOnCall) {
        this.reRenderStreams();
        socketIO.emit('getRemoteStreamConfigs', this.userNameOnCall, {
          video: this.camera || this.screenShare,
          audio: this.microphone || this.screenShare
        });
      }
    },
    screenShare() {
      if (this.userOnCall) {
        this.reRenderStreams();
        socketIO.emit('getRemoteStreamConfigs', this.userNameOnCall, {
          video: this.camera || this.screenShare,
          audio: this.microphone || this.screenShare
        });
      }
    }
  },
}
</script>

<style scoped>

</style>
