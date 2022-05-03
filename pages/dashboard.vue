<template>
  <v-container>
    <v-sheet class="pa-5 rounded-lg">
      <h1>{{ $t(`DASHBOARD`) }}</h1>

      <v-row class="mt-3">
        <v-col cols="3" class="d-flex justify-center">
          <ContactAvatar class="mx-2 my-3 my-md-1"
                         :edit="1"
                         :size="$vuetify.breakpoint.smAndDown ? 80 : 200"
                         :avatar="$auth.user.avatar"
                         :name="$auth.user.firstName"
                         :color="$auth.user.color"/>
        </v-col>
        <v-col cols="9" class="mt-md-6 justify-center">
          <h2 class="mt-7">{{ $auth.user.firstName + ' ' + $auth.user.lastName }}</h2>
          <h2 class="caption">{{ $auth.user.email }}</h2>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <h2>{{ $t(`STATISTICS`) }}</h2>
      <!--   Statistics Loading   -->
      <v-row class="mt-2" v-if="statisticsLoading">
        <!--    All Calls      -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-5" type="avatar"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-9" min-width="150px" type="text"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-13 mb-7" min-width="50px" type="text"></v-skeleton-loader>
            </v-row>
          </v-alert>
        </v-col>
        <!--    Calls  made     -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-5" type="avatar"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-9" min-width="120px" type="text"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-13 mb-7" min-width="50px" type="text"></v-skeleton-loader>
            </v-row>
          </v-alert>
        </v-col>
        <!--    Calls received      -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-5" type="avatar"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-9" min-width="120px" type="text"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-13 mb-7" min-width="50px" type="text"></v-skeleton-loader>
            </v-row>
          </v-alert>
        </v-col>
        <!--    Total time of calls      -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-5" type="avatar"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-9" min-width="120px" type="text"></v-skeleton-loader>
            </v-row>
            <v-row class="d-flex justify-center">
              <v-skeleton-loader class="mt-13 mb-7" min-width="50px" type="text"></v-skeleton-loader>
            </v-row>
          </v-alert>
        </v-col>
      </v-row>
      <!--   Statistics cards   -->
      <v-row class="mt-2" v-if="!statisticsLoading">
        <!--    All Calls      -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-avatar class="mt-8">
                <v-icon size="40" :class="directionOfLanguage === 'rtl' ? 'ml-n4' : 'mr-n3'"
                        color="green">
                  mdi-call-made
                </v-icon>
                <v-icon size="40" color="red">mdi-call-received</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="d-flex justify-center">
              <h3 class="d-block mt-5 mb-3">{{ $t(`ALL_CALLS`) }}</h3>
            </v-row>
            <v-row class="d-flex justify-center">
              <h2 class="d-block mt-5 mb-6">50</h2>
            </v-row>
          </v-alert>
        </v-col>
        <!--    Calls  made     -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-avatar class="mt-8">
                <v-icon size="50" color="green">mdi-call-made</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="d-flex justify-center">
              <h3 class="d-block mt-5 mb-3">{{ $t(`CALLS_MADE`) }}</h3>
            </v-row>
            <v-row class="d-flex justify-center">
              <h2 class="d-block mt-5 mb-6">152</h2>
            </v-row>
          </v-alert>
        </v-col>
        <!--    Calls received      -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-avatar class="mt-8">
                <v-icon size="50" color="red">mdi-call-received</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="d-flex justify-center">
              <h3 class="d-block mt-5 mb-3">{{ $t(`CALLS_RECEIVED`) }}</h3>
            </v-row>
            <v-row class="d-flex justify-center">
              <h2 class="d-block mt-5 mb-6">50</h2>
            </v-row>
          </v-alert>
        </v-col>
        <!--    Total time of calls      -->
        <v-col cols="12" md="3">
          <v-alert outlined>
            <v-row class="d-flex justify-center">
              <v-avatar class="mt-8">
                <v-icon size="50">mdi-clock</v-icon>
              </v-avatar>
            </v-row>
            <v-row class="d-flex justify-center">
              <h3 class="d-block mt-5 mb-3">{{ $t(`TOTAL_TIME_OF_CALLS`) }}</h3>
            </v-row>
            <v-row class="d-flex justify-center">
              <h2 class="d-block mt-5 mb-6">50:15</h2>
            </v-row>
          </v-alert>
        </v-col>
      </v-row>

    </v-sheet>
  </v-container>
</template>

<script>
export default {
  name: "dashboard",
  auth: true,
  data: () => {
    return {
      statisticsLoading: false
    };
  },
  mounted() {

  },
  computed: {
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    }
  }
}
</script>

<style scoped>

</style>
