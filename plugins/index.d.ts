import type { MyClient } from '~/services/api/v1/ClientFactory';
import type AuthService from '~/services/auth.service';
import { createChart } from 'lightweight-charts';

declare module '#app' {
  interface NuxtApp {
    $client: MyClient;
    $auth: AuthService;
    $createChart: typeof createChart;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $client: MyClient;
    $auth: AuthService;
    $createChart: typeof createChart;
  }
}

export {};
