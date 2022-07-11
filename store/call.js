export const state = () => ({
  selectedMicrophoneId: '',
  selectedCameraId    : '',
  noiseSuppression    : true,
  echoCancellation    : true,
  userMediaAccess     : 0,
  cameraAccess        : 0,
  microphoneAccess    : 0,
  devices             : []
})

export const mutations = {
  saveSelectedMicrophoneId(state, microphoneId) {
    state.selectedMicrophoneId = microphoneId;
  },
  saveSelectedCameraId(state, cameraId) {
    state.selectedCameraId = cameraId;
  },
  saveUserDevices(state, devices) {
    state.devices = devices;
  },
  saveUserMediaAccess(state, accessState) {
    state.userMediaAccess = accessState;
  },
  saveCameraAccess(state, accessState) {
    state.cameraAccess = accessState;
  },
  saveMicrophoneAccess(state, accessState) {
    state.microphoneAccess = accessState;
  },
  saveNoiseSuppression(state, val) {
    state.noiseSuppression = val;
  },
  saveEchoCancellation(state, val) {
    state.echoCancellation = val;
  }
}
