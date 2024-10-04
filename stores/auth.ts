import type { RequestsAuthenticationRequest } from '@/services/api/v1/StreamSinkClient';
import type { CookieRef } from "#imports";
import type { MyClient } from "@/services/api/v1/ClientFactory";

import AuthService, { TOKEN_NAME } from '@/services/auth.service';
import { createClient } from "@/services/api/v1/ClientFactory";
import { defineStore } from 'pinia';
import { useCookie } from "~/.nuxt/imports";

export interface AuthState {
  loggedIn: boolean;
  service: AuthService;
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    loggedIn: false,
  }),
  actions: {
    checkLogin(tokenCookie: CookieRef<string>) {
      const auth = new AuthService(tokenCookie);
      this.loggedIn = auth.isLoggedIn();
    },
    login(user: RequestsAuthenticationRequest) {
      return new Promise(async (resolve, reject) => {
        const tokenCookie = useCookie(TOKEN_NAME);
        const auth = new AuthService(tokenCookie);
        auth.login(user, createClient(tokenCookie)).then((token: string) => {
          this.loggedIn = true;
          resolve(token);
        }).catch(error => {
          this.loggedIn = false;
          reject(error);
        });
      });
    },
    logout() {
      const tokenCookie = useCookie(TOKEN_NAME);
      const auth = new AuthService(tokenCookie);
      auth.logout();
      this.loggedIn = false;
    },
    register({ user, client }: { user: RequestsAuthenticationRequest, client: MyClient }) {
      return new Promise((resolve, reject) => {
        const auth = new AuthService(tokenCookie);
        auth.signup(user, client)
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