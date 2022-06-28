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
      <v-icon color="white" v-if="cameraOff" class="mx-1">mdi-camera-off-outline</v-icon>
      <v-icon color="white" v-if="audioOff" class="mx-1">mdi-microphone-off</v-icon>
      <v-avatar v-if="streamName != 'Me'"
                class="ml-1 mr-1"
                color="black"
                size="20">
        {{ streamName.substr(0, 1) }}
      </v-avatar>
      <h5 class="font-weight-bold white--text">{{ streamName }}</h5>
    </v-system-bar>
  </v-card>
</template>

<script>
export default {
  name : "StreamObject",
  data : () => {
    return {
      cameraOff: false,
      audioOff : false
    }
  },
  methods:{
    selectAsMainStream(){
      if(!this.isMainStream){
        this.$emit('selectAsMainStream',this.srcObject);
      }
    }
  },
  props: ['srcObject', 'streamName', 'isMainStream'],
  created() {
  },
  mounted() {
    this.$refs.videoObject.srcObject = this.srcObject;
    if (this.streamName == 'Me') {
      this.$refs.videoObject.muted = true;
    }

    let videoTrack = (this.srcObject.getTracks().find(stream => stream.kind === 'video'));
    let audioTrack = (this.srcObject.getTracks().find(stream => stream.kind === 'audio'));


    if (videoTrack !== undefined && videoTrack.enabled === true) {
      this.cameraOff = false;
    } else {
      this.cameraOff = true;
    }

    if (audioTrack !== undefined && audioTrack.enabled === true) {
      this.audioOff = false;
    } else {
      this.audioOff = true;
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
}

.videoObject {
  width: 100% !important;
  height: 100% !important;
}

.menuToggle {
  margin-right: -5px !important;
}

</style>
