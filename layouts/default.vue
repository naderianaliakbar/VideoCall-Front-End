<template>
  <v-app v-if="render">
    <!-- Toast  -->
    <Snackbar/>

    <!-- Network identifier  -->
    <v-overlay :value="!connected" opacity="1">
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
    </v-overlay>

    <!-- Call Notifier  -->
    <v-overlay :value="(callNotify && callInfo.user.length)" opacity="1">
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
        <v-btn class="red mx-10" width="70" height="70" icon>
          <v-icon>mdi-phone-hangup-outline</v-icon>
        </v-btn>
        <v-btn class="green mx-10" width="70" height="70" icon>
          <v-icon>mdi-phone-outline</v-icon>
        </v-btn>
      </v-row>
    </v-overlay>

    <!-- socket Connect Overlay  -->
    <v-overlay :value="socketConnectError" opacity="1">
      <div>
        <v-row class="d-flex justify-center my-3">
          <v-icon class="d-block" color="red" size="100">mdi-connection</v-icon>
        </v-row>
        <h3>{{ $t(`USER_CONNECT_ERROR`) }}</h3>
      </div>
    </v-overlay>

    <!--  Navigation drawer  -->
    <v-navigation-drawer
      :right="$nuxt.$i18n.localeProperties.dir === 'rtl'"
      v-model="drawerMenu"
      temporary
      fixed>
      <template v-slot:prepend>
        <!--    logo    -->
        <v-col cols="12" class="d-flex justify-center">
          <nuxt-link to="/">
            <v-img class="justify-center my-2"
                   max-width="150px"
                   src="mainLogo.svg"
                   sizes="10">
            </v-img>
          </nuxt-link>
        </v-col>
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
      <nuxt-link to="/">
        <v-img class=""
               max-width="150px"
               src="mainLogo.svg" sizes="10">
        </v-img>
      </nuxt-link>

      <v-spacer></v-spacer>

      <!--   Dashboard mobile LINK BUTTON  -->
      <v-tooltip v-if="!$auth.loggedIn" bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn to="/login"
                 class="mx-1"
                 v-bind="attrs"
                 v-on="on"
                 outlined
                 nuxt
                 icon>
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <span>{{ $t(`LOGIN`) }}</span>
      </v-tooltip>

      <!--   DASHBOARD LINK BUTTON  -->
      <nuxt-link v-if="$auth.loggedIn" to="/dashboard">
        <ContactAvatar :avatar="$auth.user.avatar"
                       :name="$auth.user.firstName"
                       :color="$auth.user.color"/>
      </nuxt-link>

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
    </v-footer>
  </v-app>
</template>

<script>
import {localize} from "vee-validate";


export default {
  name: 'DefaultLayout',
  data() {
    return {
      title     : 'Exoroya',
      render    : false,
      userMenu  : false,
      drawerMenu: false,
      connected : true,
      callNotify: true,
      socket    : '',
      callInfo  : {
        _id : '',
        user: []
      }
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
    }
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

  },
  created() {
    this.setLayoutLanguage();
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
        if(this.callInfo._id === roomId) {
          this.callNotify = false;
        }
      });
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
    }
  }
}
</script>
