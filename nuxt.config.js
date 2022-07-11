import colors from 'vuetify/es5/util/colors'

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: 'Exoroya',
    title        : 'Exoroya',
    htmlAttrs    : {
      lang: 'en'
    },
    meta         : [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: ''},
      {name: 'format-detection', content: 'telephone=no'}
    ],
    link         : [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.png'},
      {rel: 'stylesheet', href: '/IRANSans/css/fontiran.css'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/persistedState.client.js',
    '~/plugins/vee-validate.js',
    '~/plugins/notifier.js',
    '~/plugins/global.js',
    '~/plugins/websocket.js',
    '~/plugins/peer.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // custom loader
  loading: '~/components/Loading.vue',

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],
  // auth
  auth: {
    strategies: {
      local: {
        token       : {
          property: 'token',
          global  : true
        },
        refreshToken: {
          property: 'refreshToken',
          data    : 'refreshToken',
          maxAge  : 60 * 60 * 24 * 30
        },
        user        : {
          property : 'user',
          autoFetch: true
        },
        endpoints   : {
          login  : {url: 'auth/login', method: 'post'},
          user   : {url: 'auth/me'},
          refresh: {url: 'auth/refreshToken'},
          logout : {url: 'auth/logout', method: 'post'}
        }
      }
    }
  },

  // i18n
  i18n: {
    locales      : [
      {code: 'en', file: 'en.js', dir: 'ltr'},
      {code: 'fa', file: 'fa.js', dir: 'rtl'},
    ],
    lazy         : true,
    langDir      : 'lang/',
    defaultLocale: 'en',
    strategy     : 'no_prefix'
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n',
  ],

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake      : true,
    defaultAssets  : {
      font: {
        family: 'IRANSans'
      }
    },
    theme          : {
      dark  : true,
      themes: {
        dark: {
          primary  : '#F44336',
          accent   : colors.grey.darken3,
          secondary: colors.amber.darken3,
          info     : colors.teal.lighten1,
          warning  : colors.amber.base,
          error    : colors.deepOrange.accent4,
          success  : colors.green.accent3
        },
      }
    }
  },

  router: {
    middleware: ['auth']
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['vee-validate/dist/rules']
  },

  axios: {
    baseUrl: process.env.SITE_URL + '/api/v1/',
  },

  env: {
    SITE_URL: process.env.SITE_URL
  },

  publicRuntimeConfig: {
    SOCKET_URL: process.env.SOCKET_URL,
    PEER_URL  : process.env.PEER_URL,
    PEER_PORT : process.env.PEER_PORT
  },

  server: {
    host: '0.0.0.0',
    port: 3000
  }


}
