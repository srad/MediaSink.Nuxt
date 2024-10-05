const silenceSomeSassDeprecationWarnings = {
  verbose: true,
  logger: {
    warn(message: any, options: any) {
      const { stderr } = process;
      const span = options.span ?? undefined;
      const stack = (options.stack === 'null' ? undefined : options.stack) ?? undefined;

      if (options.deprecation) {
        return;
        if (message.startsWith('Using / for division outside of calc() is deprecated')) {
          // silences above deprecation warning
          return;
        }
        stderr.write('DEPRECATION ');
      }
      stderr.write(`WARNING: ${message}\n`);

      if (span !== undefined) {
        // output the snippet that is causing this warning
        stderr.write(`\n"${span.text}"\n`);
      }

      if (stack !== undefined) {
        // indent each line of the stack
        stderr.write(`    ${stack.toString().trimEnd().replace(/\n/gm, '\n    ')}\n`);
      }

      stderr.write('\n');
    }
  }
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  experimental: {
    renderJsonPayloads: false
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
      baseUrl: process.env.BASE_URL,
      appName: process.env.APP_NAME,
      socketUrl: process.env.APP_SOCKET_URL,
      fileUrl: process.env.APP_FILE_URL,
    },
    apiUrl: process.env.API_URL,
    baseUrl: process.env.BASE_URL,
    appName: process.env.APP_NAME,
    socketUrl: process.env.APP_SOCKET_URL,
    fileUrl: process.env.APP_FILE_URL,
  },
  css: [
    // SCSS file in the project
    './assets/main.scss', // you should add main.scss somewhere in your app
  ],
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  i18n: {
    vueI18n: './i18n/i18n'
  },
  imports: {
    autoImport: false,
  },
  // or sourcemap: true
  sourcemap: {
    server: true,
    client: true
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          ...silenceSomeSassDeprecationWarnings,
        },
        sass: {
          ...silenceSomeSassDeprecationWarnings,
        },
      },
    },
  },
});
