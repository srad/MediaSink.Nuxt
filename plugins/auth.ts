import { defineNuxtPlugin } from '#app/nuxt';
import AuthService, { TOKEN_NAME } from '~/services/auth.service';
import { useCookie } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp) => {
  const tokenCookie = useCookie<string>(TOKEN_NAME);
  const auth = new AuthService(tokenCookie);

  return {
    provide: {
      auth
    }
  };
});
