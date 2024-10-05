import AuthService, { TOKEN_NAME } from '@/services/auth.service';
import { defineStore } from 'pinia';
import { useCookie } from '~/.nuxt/imports';
import { useNuxtApp } from '#app/nuxt';
import type { CookieRef } from '#app';
import type { RequestsAuthenticationRequest } from '@/services/api/v1/StreamSinkClient';

export interface AuthState {
  loggedIn: boolean;
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    loggedIn: false,
  }),
  actions: {
    checkLogin(tokenCookie: CookieRef<string | null>) {
      const auth = new AuthService(tokenCookie);
      this.loggedIn = auth.isLoggedIn();
    },
    login(user: RequestsAuthenticationRequest) {
      return new Promise(async (resolve, reject) => {
        const { $client, $auth } = useNuxtApp();

        $auth.login(user, $client).then((token: string) => {
          this.loggedIn = true;
          resolve(token);
        }).catch(error => {
          this.loggedIn = false;
          reject(error);
        });
      });
    },
    logout() {
      const tokenCookie = useCookie<string | null>(TOKEN_NAME);
      const auth = new AuthService(tokenCookie);
      auth.logout();
      this.loggedIn = false;
    },
    register({ user }: { user: RequestsAuthenticationRequest }) {
      return new Promise((resolve, reject) => {
        const { $client, $auth } = useNuxtApp();
        $auth.signup(user, $client)
          .then(response => resolve(response.data))
          .catch(reject);
      });
    },
  },
  getters: {
    isLoggedIn(): boolean {
      return this.loggedIn;
    }
  }
});
