import AuthService from '~/services/auth.service';
import { defineNuxtPlugin } from '#app/nuxt';

export default defineNuxtPlugin((nuxtApp) => {
  const auth = new AuthService();

  return {
    provide: {
      auth
    }
  };
});
