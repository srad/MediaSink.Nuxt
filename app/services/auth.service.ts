import type { RequestsAuthenticationRequest } from './api/v1/StreamSinkClient';
import { useAuthStore } from '~~/stores/auth';
import { useNuxtApp } from '#app/nuxt';

export interface AuthHeader {
  Authorization: string;
}

export default class AuthService {
  async login(user: RequestsAuthenticationRequest) {
    const authStore = useAuthStore();
    const { $client } = useNuxtApp();
    const { token } = await $client.auth.loginCreate(user);
    if (token) {
      authStore.setToken(token);
      authStore.login();
    }
  }

  logout() {
    const authStore = useAuthStore();
    authStore.setToken(null);
    authStore.logout();
  }

  getToken(): string | null {
    const authStore = useAuthStore();
    return authStore.getToken;
  }

  isLoggedIn(): boolean {
    const authStore = useAuthStore();
    return authStore.isLoggedIn;
  }

  async signup(user: RequestsAuthenticationRequest): Promise<any> {
    const { $client } = useNuxtApp();
    return await $client.auth.signupCreate(user);
  }

  getAuthHeader(): AuthHeader | null {
    const authStore = useAuthStore();
    if (!authStore.getToken) {
      return null;
    }

    return { Authorization: 'Bearer ' + authStore.getToken };
  }
}
