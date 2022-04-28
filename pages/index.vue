<template>
  <v-row>
   <v-container>
     <v-btn to="/login" nuxt>{{ this.$t(`LOGIN`) }}</v-btn>
   </v-container>
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
