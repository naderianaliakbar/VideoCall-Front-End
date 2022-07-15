module.exports = {
  apps: [
    {
      name: 'Exoroya',
      instances: 'max', // Or a number of instances
      script: './node_modules/nuxt/bin/nuxt.js',
      args: 'start'
    }
  ]
}
