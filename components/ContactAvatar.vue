<template>
  <div>
    <!--  Can Edit  -->
    <v-hover v-if="edit" v-slot="{ hover }">
      <v-avatar :size="size" :color="(color && !avatar) ? color : ''">
        <v-img v-if="avatar" :src="SITE_URL + '/avatars/' + avatar"></v-img>
        <span class="white--text"
              :class="classes"
              :style="'font-size:'+(size/2)+'px'"
              v-if="!avatar"
              v-text="name ? name.substr(0, 1) : ''"></span>
        <v-expand-transition>
          <v-overlay :value="hover" opacity="0.7" absolute>
            <div class="d-flex transition-fast-in-fast-out darken-2 v-card--reveal text-h2 white--text"
                 style="cursor: pointer">
              <v-file-input
                class="mt-n3"
                :class="directionOfLanguage === 'rtl' ? 'ml-n2' : 'mr-n2'"
                accept="image/png, image/jpeg, image/gif"
                prepend-icon="mdi-image-edit-outline"
                @change="uploadAvatar"
                hide-details
                hide-input>
              </v-file-input>
              <v-icon v-if="avatar" @click="deleteAvatar" class="mx-1 mx-md-2">mdi-close-outline</v-icon>
            </div>
          </v-overlay>
        </v-expand-transition>
      </v-avatar>
    </v-hover>

    <!--  Can't Edit  -->
    <v-avatar v-if="!edit" :size="size" :color="(color && !avatar) ? color : ''">
      <v-img v-if="avatar" :src="SITE_URL + '/avatars/' + avatar"></v-img>
      <span class="white--text"
            :class="classes"
            :style="'font-size:'+(size/2)+'px'"
            v-if="!avatar"
            v-text="name ? name.substr(0, 1) : ''"></span>
    </v-avatar>
  </div>
</template>

<script>
let mime;
export default {
  name   : "ContactAvatar",
  props  : ['name', 'color', 'avatar', 'size', 'classes', 'edit'],
  data   : () => {
    return {
      avatarFile: '',
    };
  },
  mounted() {
    mime = this.$global.getMime();
  },
  methods: {
    async uploadAvatar(file) {
      let validExt = ['jpg', 'png', 'gif', 'jpeg'];

      // check maximum size for upload
      if (!validExt.includes(mime.getExtension(file.type))) {
        this.$notifier.showMessage({
          content: this.$t(`INVALID_EXT`),
          color  : 'error'
        });
      } else if (file.size > 200000) {
        this.$notifier.showMessage({
          content: this.$t(`MAXIMUM_UPLOAD`),
          color  : 'error'
        });
      } else {
        let fileReader    = new FileReader();
        fileReader.onload = async () => {
          let result = await this.$axios.put('users/me/avatar', {avatar: fileReader.result}).then(async response => {
            await this.$auth.fetchUser();
            this.$notifier.showMessage({
              content: this.$t(`UPLOADED`),
              color  : 'success'
            });
          });
        };
        fileReader.readAsDataURL(file);
      }

    },
    async deleteAvatar() {
      let result = await this.$axios.delete('users/me/avatar', {}).then(async response => {
        await this.$auth.fetchUser();
        this.$notifier.showMessage({
          content: this.$t(`DELETED`),
          color  : 'success'
        });
      });
    },
  },
  created() {

  },
  computed: {
    directionOfLanguage() {
      return this.$nuxt.$i18n.localeProperties.dir;
    },
    SITE_URL() {
      return process.env.SITE_URL;
    }
  }
}
</script>

<style scoped>

</style>
