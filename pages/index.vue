<template>
  <v-row>
    <v-col cols="12">
      <span class="text-h5 d-block mb-6">
        The Best Video Chat For ever
      </span>
      <v-btn to="/login" nuxt>{{ this.$t(`LOGIN`) }}</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "Home",
  auth: 'guest',
  head: {
    title: "Home"
  }
}
</script>

<style scoped>

</style>
