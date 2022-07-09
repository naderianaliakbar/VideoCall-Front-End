<template>
  <v-app v-if="render">
    <!-- Toast  -->
    <Snackbar/>


    <v-overlay class="pa-9" :value="overlay" opacity="1">

      <!-- Network identifier  -->
      <div v-if="!connected">
        <div v-if="!connected">
          <v-row class="d-flex justify-center my-3">
            <v-icon class="d-block" color="red" size="100">mdi-network-off-outline</v-icon>
          </v-row>
          <h3>{{ $t(`NETWORK_OFF`) }}</h3>
          <h3>{{ $t(`RECONNECTING`) }}...</h3>
        </div>
        <div v-if="connected">
          <v-row class="d-flex justify-center my-3">
            <v-icon class="d-block" color="green" size="100">mdi-network-outline</v-icon>
          </v-row>
          <h3>{{ $t(`CONNECTED`) }}</h3>
        </div>
      </div>

      <!-- Call Notifier  -->
      <div v-if="callNotify && !userMediaReq">
        <!--   Avatar   -->
        <v-row class="d-flex justify-center my-3">
          <ContactAvatar :avatar="callInfo.user.avatar"
                         :name="callInfo.user.firstName"
                         :color="callInfo.user.color" :size="180"/>
        </v-row>
        <!--   Name   -->
        <v-row class="d-flex justify-center my-3">
          <p class="mt-12 text-h4">{{ callInfo.user.firstName + ' ' + callInfo.user.lastName }}</p>
        </v-row>
        <!--   Action Buttons   -->
        <v-row class="d-flex justify-center my-5">
          <v-btn class="red mx-10" width="70" height="70" @click="rejectCall" icon>
            <v-icon>mdi-phone-hangup-outline</v-icon>
          </v-btn>
          <v-btn class="green mx-10" width="70" height="70" @click="acceptCall" icon>
            <v-icon>mdi-phone-outline</v-icon>
          </v-btn>
        </v-row>
      </div>

      <!-- Socket Connect  -->
      <div v-if="socketConnectError">
        <v-row class="d-flex justify-center my-3">
          <v-icon class="d-block" color="red" size="100">mdi-connection</v-icon>
        </v-row>
        <h3>{{ $t(`USER_CONNECT_ERROR`) }}</h3>
      </div>

      <!-- User Media Request -->
      <div v-if="userMediaReq">
        <v-row class="d-flex justify-center my-3">
          <v-icon v-if="userMediaReqType === 1" class="mx-2" size="100">mdi-camera-off-outline</v-icon>
          <v-icon class="mx-2" size="100">mdi-microphone-off</v-icon>
        </v-row>
        <v-row class="d-flex justify-center my-3">
          <h3 class="text-justify" v-if="userMediaReqType === 0">{{ $t(`MICROPHONE_REQUEST`) }}</h3>
          <h3 class="text-justify" v-if="userMediaReqType === 1">{{ $t(`MEDIA_REQUEST`) }}</h3>
        </v-row>
        <v-row class="d-flex justify-center my-3">
          <h3
            v-if="(userMediaAccess === 0 && userMediaReqType === 1) || (microphoneAccess === 0 && userMediaReqType === 0)">
            {{ $t(`CLICK_ALLOW`) }}</h3>
          <h3 class="red--text text-justify"
              v-if="(userMediaAccess === -1 && userMediaReqType === 1) || (microphoneAccess === -1 && userMediaReqType === 0)">
            {{ $t(`ACCESS_PROBLEM`) }}</h3>
        </v-row>

      </div>

      <v-row class="d-flex justify-center mt-5" no-gutters>
        <label style="position: fixed; bottom: 10px" class="overline">EXOROYA</label>
      </v-row>

    </v-overlay>


    <!--  Navigation drawer  -->
    <v-navigation-drawer
      :right="$nuxt.$i18n.localeProperties.dir === 'rtl'"
      v-model="drawerMenu"
      temporary
      fixed>
      <template v-slot:prepend>
        <v-divider></v-divider>
        <v-list-item class="my-1" v-if="$auth.loggedIn" two-line>
          <v-list-item-avatar>
            <ContactAvatar :avatar="$auth.user.avatar"
                           :name="$auth.user.firstName"
                           :color="$auth.user.color"/>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ $auth.user.firstName + ' ' + $auth.user.lastName }}</v-list-item-title>
            <v-list-item-subtitle></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider></v-divider>

      <v-list>
        <!--   Dashboard     -->
        <v-list-item v-for="item in menuItems"
                     v-if="item.needAuth === $auth.loggedIn"
                     :to="item.to" nuxt link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <!--  Toolbar  -->
    <v-app-bar height="65px" rounded absolute app>
      <!--   Menu Icon   -->
      <v-btn @click="drawerMenu = true"
             :class="directionOfLanguage === 'rtl' ? 'mr-1 ml-2' : 'ml-1 mr-2'"
             icon>
        <v-icon size="27">mdi-menu</v-icon>
      </v-btn>

      <!--   Logo   -->
      <label class="overline text-h5 mt-1">EXOROYA</label>

      <v-spacer></v-spacer>

      <!--   Dashboard mobile LINK BUTTON  -->
      <!--      <v-tooltip v-if="!$auth.loggedIn" bottom>-->
      <!--        <template v-slot:activator="{ on, attrs }">-->
      <!--          <v-btn to="/login"-->
      <!--                 class="mx-1"-->
      <!--                 v-bind="attrs"-->
      <!--                 v-on="on"-->
      <!--                 outlined-->
      <!--                 nuxt-->
      <!--                 icon>-->
      <!--            <v-icon>mdi-account</v-icon>-->
      <!--          </v-btn>-->
      <!--        </template>-->
      <!--        <span>{{ $t(`LOGIN`) }}</span>-->
      <!--      </v-tooltip>-->

      <!--   DASHBOARD LINK BUTTON  -->
      <!--      <nuxt-link v-if="$auth.loggedIn" to="/dashboard">-->
      <!--        <ContactAvatar :avatar="$auth.user.avatar"-->
      <!--                       :name="$auth.user.firstName"-->
      <!--                       :color="$auth.user.color"/>-->
      <!--      </nuxt-link>-->

    </v-app-bar>

    <!--  MAIN  -->
    <v-main>
      <v-container>
        <Nuxt/>
      </v-container>
    </v-main>

    <!--  FOOTER  -->
    <v-footer class="mx-1">
      <label @click="changeLanguage('en')" class="v-card--link">English</label>
      &nbsp; | &nbsp;
      <label @click="changeLanguage('fa')" class="v-card--link">فارسی</label>
      <v-spacer></v-spacer>
      <label class="overline">EXOROYA</label>
    </v-footer>
  </v-app>
</template>

<script>
import {localize} from "vee-validate";

let DetectRTC = require('detectrtc');

export default {
  name: 'DefaultLayout',
  data() {
    return {
      title               : 'Exoroya',
      render              : false,
      overlay             : false,
      userMenu            : false,
      drawerMenu          : false,
      connected           : true,
      callNotify          : false,
      userMediaReq        : false,
      userMediaReqType    : 0,
      userMediaReqCallBack: null,
      socket              : '',
      callInfo            : {
        _id : '',
        user: []
      },
      microphoneAccess    : '',
      cameraAccess        : '',
      userMediaAccess     : '',
      userBrowser         : undefined,
    }
  },
  watch   : {
    page(val) {
      this.$nuxt.$i18n.setLocale(this.$store.state.user.language);
    },
    loggedIn(val) {
      // check for create socket
      if (val) {
        this.$websocket.createConnection();
        this.setActiveReceiveCalls();
      } else {
        // check if is connected destroy connection
        if (this.$websocket.getSocket() !== undefined) {
          this.$websocket.destroyConnection();
        }
      }
    },
    userMediaAccess(val) {
      this.$store.commit('call/saveUserMediaAccess', this.userMediaAccess);
      if (val === 1) {
        this.getUserDevices();
        if (this.userMediaReqType === 1) {
          this.userMediaReq = false;
          if (this.userMediaReqCallBack) {
            this.userMediaReqCallBack();
          }
        }
      }
    },
    cameraAccess(val) {
      this.$store.commit('call/saveCameraAccess', val);
    },
    microphoneAccess(val) {
      this.$store.commit('call/saveMicrophoneAccess', val);
      if (val === 1 && this.userMediaReqType === 0) {
        this.userMediaReq = false;
        if (this.userMediaReqCallBack) {
          this.userMediaReqCallBack();
        }
      }
    },
    connected(val) {
      this.overlay = (!val || this.callNotify || this.socketConnectError || this.userMediaReq);
    },
    callNotify(val) {
      this.overlay = (val || !this.connected || this.socketConnectError || this.userMediaReq);
    },
    socketConnectError(val) {
      this.overlay = (val || this.callNotify || !this.connected || this.userMediaReq);
    },
    userMediaReq(val) {
      if (val) {
        this.getUserMediaAccess();
      }

      this.overlay = (val || this.callNotify || !this.connected || this.socketConnectError);
    },
  },
  computed: {
    menuItems() {
      return [
        {title: this.$t(`DASHBOARD`), to: "/dashboard", icon: "mdi-account-outline", needAuth: true},
        {title: this.$t(`CONTACTS`), to: "/contacts", icon: "mdi-contacts-outline", needAuth: true},
        {title: this.$t(`SETTINGS`), to: "/settings", icon: "mdi-cog-outline", needAuth: true},
        {title: this.$t(`LOGIN`), to: "/login", icon: "mdi-login", needAuth: false},
        {title: this.$t(`REGISTER`), to: "/register", icon: "mdi-clipboard-edit-outline", needAuth: false},
      ];
    },
    page() {
      return this.$nuxt.$route.name;
    },
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    },
    loggedIn() {
      return this.$auth.loggedIn;
    },
    socketConnectError() {
      return this.$store.state.system.socketConnectError;
    }
  },
  mounted() {
    window.addEventListener("load", (event) => {
      this.connected = navigator.onLine;
    });

    window.addEventListener("offline", (event) => {
      this.connected = false;
    });

    window.addEventListener("online", (event) => {
      this.connected = true;
    });

    // check for create socket
    if (this.loggedIn) {
      this.$websocket.createConnection();
      this.setActiveReceiveCalls();
    } else {
      // check if is connected destroy connection
      if (this.$websocket.getSocket() !== undefined) {
        this.$websocket.destroyConnection();
      }
    }

    // check UserMediaAccess Permissions
    this.checkUserMediaPermissions();

    // listen to userMediaAccess Request
    this.$root.$on('getUserMediaAccess', (reqType, callback) => {
      this.userMediaReqType = reqType;
      this.userMediaReq     = true;
      if (callback && typeof callback === 'function') {
        this.userMediaReqCallBack = callback;
      }
    });

  },
  created() {
    this.setLayoutLanguage();

    // Set UserMediaAccess Permissions
    this.cameraAccess     = this.$store.state.call.cameraAccess;
    this.microphoneAccess = this.$store.state.call.microphoneAccess;
    this.userMediaAccess  = this.$store.state.call.userMediaAccess;
  },
  methods: {
    setLayoutLanguage() {
      this.$nuxt.$i18n.setLocale(this.$store.state.user.language);
      localize(this.$store.state.user.language);
      setTimeout(() => {
        this.$vuetify.rtl = (this.directionOfLanguage === 'rtl');
        this.render       = true;
      }, 50);
    },
    changeLanguage(lange) {
      this.$store.commit('user/changeLanguage', lange);
      this.setLayoutLanguage();
    },
    setActiveReceiveCalls() {
      // set socket object
      this.socket = this.$websocket.getSocket();
      this.socket.on('notifyCall', (roomId) => {
        this.callInfo._id = roomId;
        this.getCallInfo();
      });
      this.socket.on('endCall', (roomId) => {
        if (this.callInfo._id === roomId) {
          this.callNotify = false;
        }
      });
    },
    acceptCall() {
      if (
        (this.callInfo.type === 0 && this.$store.state.call.microphoneAccess === 1) ||
        (this.callInfo.type === 1 && this.$store.state.call.userMediaAccess === 1)
      ) {
        // set room id
        this.$store.commit('user/setUserRoom', this.callInfo._id);

        this.callNotify = false;

        // redirect to call page
        this.$router.push({
          path: "/call"
        });
      } else {
        this.$root.$emit('getUserMediaAccess', this.callInfo.type, () => {
          // set room id
          this.$store.commit('user/setUserRoom', this.callInfo._id);

          this.callNotify = false;

          // redirect to call page
          this.$router.push({
            path: "/call"
          });
        });
      }
    },
    rejectCall() {
      this.socket.emit('rejectCall', this.callInfo.user._id, this.callInfo._id);
      this.callNotify = false;
    },
    getCallInfo() {
      this.$axios.get('calls/' + this.callInfo._id).then(response => {
        this.callInfo   = response.data;
        this.callNotify = true;
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
    },
    checkUserMediaPermissions(callback) {
      DetectRTC.load(() => {

        this.userBrowser = DetectRTC.browser;

        if (this.userBrowser.name === 'Chrome') {
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
                this.checkUserMediaPermissions(callback);
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
                this.checkUserMediaPermissions(callback);
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

        if (callback && typeof callback === 'function') {
          callback();
        }
      });
    },
    getUserDevices() {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.$store.commit('call/saveUserDevices', devices);
      });
    },
    getUserMediaAccess(callback) {
      navigator.getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
      );

      navigator.getUserMedia({audio: true, video: (this.userMediaReqType === 1)}, (userMediaStream) => {
        this.checkUserMediaPermissions(() => {
          this.checkUserMediaAccess();
          userMediaStream.getTracks().forEach(function (track) {
            track.stop();
          });
        });
      }, (e) => {
        this.checkUserMediaPermissions(() => {
          this.checkUserMediaAccess();
        });
        console.log(e, 'ERROR MEDIA ACCESS');
      });
    },
    checkUserMediaAccess() {
      if (this.cameraAccess === -1 || this.microphoneAccess === -1) {
        this.userMediaAccess = -1;
      }

      if (this.cameraAccess === 0 && this.microphoneAccess === 0) {
        this.userMediaAccess = 0;
      }

      if (this.cameraAccess === 1 && this.microphoneAccess === 1) {
        this.userMediaAccess = 1;
      }
    }
  }
}
</script>
