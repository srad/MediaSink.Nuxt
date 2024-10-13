import { createChart } from 'lightweight-charts';
import { defineNuxtPlugin } from '#app/nuxt';

export default defineNuxtPlugin(nuxtApp => {

  return {
    provide: {
      createChart
    }
  };
});
