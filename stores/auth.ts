import AuthService from '~/services/auth.service.js';
import type { RequestsAuthenticationRequest } from '~/services/api/v1/StreamSinkClient.js';
import { defineStore } from 'pinia';

export interface AuthState {
  loggedIn: boolean;
}

const token = AuthService.getToken();

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    loggedIn: token !== null,
  }),
  actions: {
    login(user: RequestsAuthenticationRequest) {
      return new Promise(async (resolve, reject) => {
        AuthService.login(user).then((token: string) => {
          this.loggedIn = true;
          resolve(token);
        }).catch(error => {
          this.loggedIn = false;
          reject(error);
        });
      });
    },
    logout() {
      AuthService.logout();
      this.loggedIn = false;
    },
    register(user: RequestsAuthenticationRequest) {
      return new Promise((resolve, reject) => {
        AuthService.signup(user)
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