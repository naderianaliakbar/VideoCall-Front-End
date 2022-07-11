<template>
  <v-sheet class="pa-5 rounded-lg" min-height="81vh">
    <h1>
      {{ $t(`SETTINGS`) }}
    </h1>
    <v-list v-if="microphoneAccess" class="mt-3 pa-0">
      <v-list-item v-if="cameraAccess">
        <v-select v-model="selectedCameraIdSet"
                  class="d-flex"
                  :items="userVideoDevices"
                  item-text="label"
                  item-value="deviceId"
                  :label="$t(`CAMERA`)"
                  outlined>
        </v-select>
      </v-list-item>
      <v-list-item>
        <v-select v-model="selectedMicrophoneIdSet"
                  class="d-flex"
                  :items="userAudioDevices"
                  item-text="label"
                  item-value="deviceId"
                  :label="$t(`MICROPHONE`)"
                  outlined>
        </v-select>
      </v-list-item>
      <v-list-item>
        <v-checkbox v-model="echoCancellationSet"
                    label="Echo Cancellation">
        </v-checkbox>
      </v-list-item>
      <v-list-item>
        <v-checkbox v-model="noiseSuppressionSet"
                    label="Noise Suppression">
        </v-checkbox>
      </v-list-item>
    </v-list>
    <div v-else>
      <v-row class="d-flex justify-center">
        <h2 class="mt-16">{{ $t(`SETTING_REQUEST`) }}</h2>
      </v-row>

      <v-row class="d-flex justify-center my-7">
        <v-btn color="primary" @click="getUserMediaAccess">
          {{ $t(`GET_ACCESS`) }}
        </v-btn>
      </v-row>
    </div>
  </v-sheet>
</template>

<script>
export default {
  auth: true,
  name: "settings",
  data() {
    return {
      selectedMicrophoneIdSet: '',
      selectedCameraIdSet    : '',
      noiseSuppressionSet    : false,
      echoCancellationSet    : false,
    }
  },
  mounted() {
    this.selectedMicrophoneIdSet = this.selectedMicrophoneId;
    this.selectedCameraIdSet     = this.selectedCameraId;
    this.noiseSuppressionSet     = this.noiseSuppression;
    this.echoCancellationSet     = this.echoCancellation;
  },
  watch   : {
    selectedMicrophoneIdSet(val) {
      this.$store.commit('call/saveSelectedMicrophoneId', val);
    },
    selectedCameraIdSet(val) {
      this.$store.commit('call/saveSelectedCameraId', val);
    },
    noiseSuppressionSet(val) {
      this.$store.commit('call/saveNoiseSuppression', val);
    },
    echoCancellationSet(val) {
      this.$store.commit('call/saveEchoCancellation', val);
    },
  },
  computed: {
    selectedMicrophoneId() {
      return this.$store.state.call.selectedMicrophoneId;
    },
    selectedCameraId() {
      return this.$store.state.call.selectedCameraId;
    },
    noiseSuppression() {
      return this.$store.state.call.noiseSuppression;
    },
    echoCancellation() {
      return this.$store.state.call.echoCancellation;
    },
    userVideoDevices() {
      return this.$store.state.call.devices.video;
    },
    userAudioDevices() {
      return this.$store.state.call.devices.audio;
    },
    microphoneAccess() {
      return this.$store.state.call.microphoneAccess;
    },
    cameraAccess() {
      return this.$store.state.call.cameraAccess;
    },
  },
  methods : {
    getUserMediaAccess() {
      this.$root.$emit('getUserMediaAccess', 1, () => {
        location.reload();
      });
    }
  }
}
</script>

<style scoped>

</style>
