export const state = () => ({
  email   : '',
  name    : '',
  language: 'fa',
})

export const mutations = {
  changeLanguage(state, lang) {
    state.language = lang;
  },
}
