<template>
  <v-overlay :value="loading" opacity="1" z-index="6">
    <v-progress-circular indeterminate></v-progress-circular>
  </v-overlay>
</template>

<script>
export default {
  data   : () => ({
    loading: false
  }),
  methods: {
    start() {
      this.loading = true
    },
    finish() {
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
