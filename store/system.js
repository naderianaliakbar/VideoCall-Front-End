export const state = () => ({
  socketConnectError: false
})

export const mutations = {
  setSocketConnectError(state, status) {
    state.socketConnectError = status;
  }
}
