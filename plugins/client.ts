import { defineNuxtPlugin } from '#app/nuxt';
import { createClient } from '~/services/api/v1/ClientFactory';
import AuthService, { TOKEN_NAME } from '~/services/auth.service';
import { useCookie, useRuntimeConfig } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const tokenCookie = useCookie<string>(TOKEN_NAME);
  const auth = new AuthService(tokenCookie);
  const client = createClient(auth.getAuthHeader(), config.public.apiUrl);

  return {
    provide: {
      client
    }
  };
});
