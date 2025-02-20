const silenceSomeSassDeprecationWarnings = {
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
  future: {
    compatibilityVersion: 4,
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' }
      ],
    }
  },
  //ssr: true,
  // build: {
  //   analyze: {}
  // },
  experimental: {
    //renderJsonPayloads: false,
    //inlineSSRStyles: false,
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiUrl: '',
      baseUrl: '',
      appName: '',
      socketUrl: '',
      fileUrl: '',
    },
    apiUrl: '',
    baseUrl: '',
    appName: '',
    socketUrl: '',
    fileUrl: '',
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
    vueI18n: './i18n/i18n.ts'
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