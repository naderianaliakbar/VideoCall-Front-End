export const state = () => ({
  email : '',
  counter : 0
})

export const mutations = {
  add(state, text) {
    state.counter++;
  }
}
