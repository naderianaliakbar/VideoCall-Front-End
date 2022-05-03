<template>
  <div>
    <!--  Can Edit  -->
    <v-hover v-if="edit" v-slot="{ hover }">
      <v-avatar :size="size" :color="color">
        <v-img v-if="avatar" :src="avatar"></v-img>
        <span class="white--text"
              :class="classes"
              :style="'font-size:'+(size/2)+'px'"
              v-if="!avatar"
              v-text="name.substr(0, 1)"></span>
        <v-expand-transition>
          <v-overlay :value="hover" opacity="0.7" absolute>
            <div class="d-flex transition-fast-in-fast-out darken-2 v-card--reveal text-h2 white--text"
                 style="cursor: pointer">
              <v-icon large>mdi-image-edit-outline</v-icon>
            </div>
          </v-overlay>
        </v-expand-transition>
      </v-avatar>
    </v-hover>

    <!--  Can't Edit  -->
    <v-avatar v-if="!edit" :size="size" :color="color">
      <v-img v-if="avatar" :src="avatar"></v-img>
      <span class="white--text"
            :class="classes"
            :style="'font-size:'+(size/2)+'px'"
            v-if="!avatar"
            v-text="name.substr(0, 1)"></span>
    </v-avatar>
  </div>
</template>

<script>
export default {
  name : "ContactAvatar",
  props: ['name', 'color', 'avatar', 'size', 'classes', 'edit']
}
</script>

<style scoped>

</style>
