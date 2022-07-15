<template>
  <v-sheet class="pa-5 rounded-lg" min-height="80vh">
    <v-col cols="12" md="6" offset-md="3">
      <v-row justify="center">
        <v-col v-for="item in menuItems"
               v-if="item.needAuth === $auth.loggedIn"
               cols="12"
               md="6"
               style="text-align: center">
          <nuxt-link :to="item.to">
            <v-sheet color="red" class="rounded-lg pa-5">
              <v-avatar class="mx-3 my-3"
                        tile>
                <v-icon size="50">{{ item.icon }}</v-icon>
              </v-avatar>
              <h3 class="my-3">{{ item.title }}</h3>
            </v-sheet>
          </nuxt-link>
        </v-col>
      </v-row>
    </v-col>
  </v-sheet>
</template>

<script>
export default {
  name    : "Home",
  auth    : 'guest',
  head    : {
    title: "Home"
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
  }
}
</script>

<style scoped>

</style>
