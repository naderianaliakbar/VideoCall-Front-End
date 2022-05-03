<template>
  <v-app dark>
    <v-row>
      <v-col cols="12"
             sm="12"
             md="8"
             offset-md="2"
             class="pt-16">
        <!--   Error 404 Not Found     -->
        <h1 v-if="error.statusCode === 404">
          <span class="red--text text-h2">404 | </span>
          &nbsp; {{ $t(`NOT_FOUND`) }}
        </h1>
        <h1 v-else>
          <span class="red--text text--accent-1 text-h2">Error | </span>
          {{ otherError }}
        </h1>

        <!--    Home Button    -->
        <v-btn to="/"
               class="mt-16"
               x-large
               outlined
               nuxt>
          {{ $t(`HOME`) }}
        </v-btn>

      </v-col>
    </v-row>
  </v-app>
</template>

<script>
export default {
  name  : 'EmptyLayout',
  layout: 'empty',
  props : {
    error: {
      type   : Object,
      default: null
    }
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError  : 'An error occurred'
    }
  },
  head() {
    const title =
            this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>

<style scoped>


</style>
