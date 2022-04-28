<template>
  <v-app v-if="render">
    <v-app-bar app>
      <v-row class="d-flex justify-lg-space-around mx-1">
        <!--   Logo   -->
        <nuxt-link to="/">
          <v-img class=""
                 max-width="150px"
                 src="mainLogo.svg" sizes="10">
          </v-img>
        </nuxt-link>
        <v-spacer></v-spacer>
      </v-row>
    </v-app-bar>
    <v-main class="mt-1">
      <Nuxt/>
    </v-main>
    <v-footer class="mx-1">
      <label @click="changeLanguage('en')" class="v-card--link">English</label>
      &nbsp; | &nbsp;
      <label @click="changeLanguage('fa')" class="v-card--link">فارسی</label>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      title : 'Exoroya',
      render: false,
    }
  },
  watch   : {
    page(val) {
      this.$nuxt.$i18n.setLocale(this.$store.state.user.language);
    }
  },
  computed: {
    page() {
      return this.$nuxt.$route.name;
    },
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    }
  },
  mounted() {

  },
  created() {
    this.setLayoutLanguage();
  },
  methods: {
    setLayoutLanguage() {
      this.$nuxt.$i18n.setLocale(this.$store.state.user.language);
      setTimeout(() => {
        this.$vuetify.rtl = (this.directionOfLanguage === 'rtl');
        this.render       = true;
      }, 50);
    },
    changeLanguage(lange) {
      this.$store.commit('user/changeLanguage', lange)
      this.setLayoutLanguage();
    }
  }
}
</script>
