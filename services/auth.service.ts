import type { MyClient } from './api/v1/ClientFactory';
import type { RequestsAuthenticationRequest } from './api/v1/StreamSinkClient';
import { useAuthStore } from '~/stores/auth';
import { useNuxtApp } from '#app/nuxt';

export interface AuthInfo {
  token: string;
}

export interface AuthHeader {
  Authorization: string;
}

export default class AuthService {
  async login(user: RequestsAuthenticationRequest) {
    const authStore = useAuthStore();
    const { $client } = useNuxtApp();
    const { data } = await $client.auth.loginCreate(user);
    const r = data as unknown as AuthInfo;
    if (r.token) {
      authStore.setToken(r.token);
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

  signup(user: RequestsAuthenticationRequest, client: MyClient) {
    const { $client } = useNuxtApp();
    return $client.auth.signupCreate(user);
  }

  getAuthHeader(): AuthHeader | null {
    const authStore = useAuthStore();
    if (!authStore.getToken) {
      return null;
    }

    return { Authorization: 'Bearer ' + authStore.getToken };
  }
}
