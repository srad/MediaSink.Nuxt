import AuthService, { TOKEN_NAME } from '~/services/auth.service';
import { defineNuxtPlugin } from "#app/nuxt";
import { useCookie } from "nuxt/app";

export default defineNuxtPlugin((nuxtApp) => {
  const tokenCookie = useCookie<string>(TOKEN_NAME);
  const auth = new AuthService(tokenCookie);

  return {
    provide: {
      auth
    }
  };
});
