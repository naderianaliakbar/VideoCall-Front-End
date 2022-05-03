<template>
  <v-avatar :size="size" :color="color">
    <v-img v-if="avatar" :src="avatar"></v-img>
    <span class="white--text"
          :class="classes"
          :style="'font-size:'+(size/2)+'px'"
          v-if="!avatar"
          v-text="name.substr(0, 1)"></span>
  </v-avatar>
</template>

<script>
export default {
  name : "ContactAvatar",
  props: ['name', 'color', 'avatar', 'size', 'classes']
}
</script>

<style scoped>

</style>
