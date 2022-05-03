export const state = () => ({
  email    : '',
  firstName: '',
  lastName : '',
  language : 'fa',
  color    : '',
})

export const mutations = {
  changeLanguage(state, lang) {
    state.language = lang;
  },
  setUserInformation(state, payload) {
    state.firstName = payload.firstName;
    state.lastName  = payload.lastName;
    state.email     = payload.email;
  },
  setUserColor(state, color) {
    state.color = color;
  }
}
