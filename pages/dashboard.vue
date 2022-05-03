<template>
  <v-container>
    <v-sheet class="pa-5 rounded-lg" >
      <h1>{{ $t(`DASHBOARD`) }}</h1>

      <v-row class="mt-3">
        <v-col cols="3" class="d-flex justify-center">
          <ContactAvatar class="mx-2 my-3 my-md-1"
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

      <v-divider class="my-5"></v-divider>

      <v-row class="pa-3">
        <h2>Statics</h2>
      </v-row>

    </v-sheet>
  </v-container>
</template>

<script>
export default {
  name: "dashboard",
  auth: false,
  data: () => {
    return {
      selectedContactId : '',
      loadingContactList: false,
      contacts          : [
        {
          name  : 'AliAkbar Naderian',
          color : 'green',
          avatar: '',
          email : 'naderianaliakbar@gmail.com'
        },
        {
          name  : 'AliAkbar Naderian',
          color : 'green',
          avatar: '',
          email : 'naderianaliakbar@gmail.com'
        },
        {
          name  : 'AliAkbar Naderian',
          color : 'green',
          avatar: '',
          email : 'naderianaliakbar@gmail.com'
        },
        {
          name  : 'AliAkbar Naderian',
          color : 'green',
          avatar: '',
          email : 'naderianaliakbar@gmail.com'
        },
        {
          name  : 'AliAkbar Naderian',
          color : 'green',
          avatar: '',
          email : 'naderianaliakbar@gmail.com'
        },
        {
          name  : 'AliAkbar Naderian',
          color : 'green',
          avatar: '',
          email : 'naderianaliakbar@gmail.com'
        },
      ]
    };
  },
  mounted() {

  }
}
</script>

<style scoped>

</style>
