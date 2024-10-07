import { defineNuxtPlugin } from '#app/nuxt';
import { createClient } from '~/services/api/v1/ClientFactory';
import { useRuntimeConfig } from 'nuxt/app';
import { useAuthStore } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const client = createClient(authStore.getToken, config.public.apiUrl);

  return {
    provide: {
      client
    }
  };
});
