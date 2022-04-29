<template>
  <v-row>
    <v-snackbar v-for="(item,index) in list"
                :key="index"
                v-model="item.show"
                :color="item.color"
                class="mt-16"
                transition="scroll-x-transition"
                bottom>
      {{ item.message }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="item.show = false">
          {{ $t(`CLOSE`) }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      list: [],
    };
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === "snackbar/showMessage") {
        this.list.push(
          {
            color  : state.snackbar.color,
            message: state.snackbar.content,
            show   : true
          }
        );
      }
    });
  }
};
</script>

<style scoped>

</style>
