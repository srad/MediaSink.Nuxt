// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    apiUrl: process.env.API_URL,
    baseUrl: process.env.BASE_URL,
    appName: process.env.APP_NAME,
    socketUrl: process.env.APP_SOCKET_URL,
    fileUrl: process.env.FILE_URL,
  },
  css: [
    // SCSS file in the project
    "./assets/main.scss", // you should add main.scss somewhere in your app
  ],
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  pinia: {
    storesDirs: [ './stores/**' ],
  },
  i18n: {
    vueI18n: './i18n/i18n'
  },
  imports: {
    autoImport: false,
  },
});