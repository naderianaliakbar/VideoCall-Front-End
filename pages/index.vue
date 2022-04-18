<template>
  <v-row>
    <v-col cols="12">
      <!--   Logo   -->
      <v-img width="350px"
             class="d-block my-5"
             src="mainLogo.svg"></v-img>
    </v-col>
    <v-col cols="12">
      <span class="text-h5 d-block mb-6">
        The Best Video Chat For ever
      </span>
      <v-btn to="/login" nuxt>Login</v-btn>
    </v-col>

  </v-row>
</template>

<script>
export default {
  name: "Home",
  head: {
    title: "Home"
  }
}
</script>

<style scoped>

</style>
