<template>
  <v-col cols="12" md="6" offset-md="3" class="d-flex flex-column justify-center align-center">
    <!--   Logo   -->
    <v-img width="200px"
           class="d-block my-5"
           src="mainLogo.svg"></v-img>

    <v-card width="100%" shaped>
      <v-card-title class="justify-center">
        <span class="text-h4 d-block">Register</span>
      </v-card-title>
      <v-card-text class="px-5 px-md-16">
        <!-- Email -->
        <v-text-field label="Email"
                      prepend-inner-icon="mdi-email">
        </v-text-field>

        <!-- Password -->
        <v-text-field label="Password"
                      prepend-inner-icon="mdi-lock"
                      type="password">
        </v-text-field>

        <!-- Password -->
        <v-text-field label="Confirm Password"
                      prepend-inner-icon="mdi-lock"
                      type="password">
        </v-text-field>

        {{ this.$store.state.user.counter }}

        <v-btn color="primary" class="float-left my-6 mx-5">Register</v-btn>
        <v-btn color="accent" class="float-left my-6" to="/login" nuxt>Login</v-btn>

      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
export default {
  name: "register",
  head:{
    title: 'Register'
  },
  mounted() {
    this.$store.commit('user/add');
  }
}
</script>

<style scoped>

</style>
