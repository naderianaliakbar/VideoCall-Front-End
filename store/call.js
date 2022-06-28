export const state = () => ({
  selectedMicrophoneId: '',
  selectedCameraId    : '',
  noiseSuppression    : true,
  echoCancellation    : true,
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
  }
}
