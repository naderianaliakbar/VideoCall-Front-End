<template>
  <v-card class="pa-0 cardObject pointerCursor"
          dark
          width="100%"
          height="100%"
          @click="selectAsMainStream"
          tile>
    <video ref="videoObject" class="videoObject" autoplay>
    </video>
    <v-system-bar
      class="ma-0"
      height="30"
      lights-out
      absolute
      dark>
      <ContactAvatar :avatar="srcObject.user.avatar"
                     :name="srcObject.user.firstName"
                     :color="srcObject.user.color" size="50"/>
      <h5 class="caption white--text mx-2">{{ streamName }}</h5>
    </v-system-bar>
  </v-card>
</template>

<script>
export default {
  name   : "StreamObject",
  data   : () => {
    return {
      streamName: '',
      cameraOff : false,
      audioOff  : false
    }
  },
  methods: {
    selectAsMainStream() {
      if (!this.isMainStream) {
        this.$emit('selectAsMainStream', this.srcObject);
      }
    }
  },
  props  : ['srcObject', 'isMainStream'],
  mounted() {
    this.$refs.videoObject.srcObject = this.srcObject;
    if ((this.srcObject.user._id === this.$auth.user.id) || this.srcObject.user.id === this.$auth.user.id) {
      this.$refs.videoObject.muted = true;
      this.streamName              = 'Me';
    } else {
      this.streamName = this.srcObject.user.firstName;
    }
  }
}
</script>

<style scoped>

.pointerCursor {
  cursor: pointer !important;
}

.cardObject {
  min-width: 100% !important;
  min-height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  border: white 1px solid;
}

.videoObject {
  width: 100% !important;
  height: 100% !important;
}

.menuToggle {
  margin-right: -5px !important;
}

</style>
