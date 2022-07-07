export const state = () => ({
  selectedMicrophoneId: '',
  selectedCameraId    : '',
  noiseSuppression    : true,
  echoCancellation    : true,
  userMediaAccess     : 0,
  hasCamera           : false,
  hasMicrophone       : false,
  cameraAccess        : '',
  microphoneAccess    : '',
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
  }
}
