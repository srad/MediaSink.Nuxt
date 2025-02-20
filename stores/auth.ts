import { defineStore } from 'pinia';
import type { AuthState } from '~/types';
import Cookies from 'js-cookie';

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    loggedIn: import.meta.client ? Cookies.get('token') !== undefined : false,
    token: import.meta.client ? Cookies.get('token') : null,
  }),
  actions: {
    login() {
      this.loggedIn = true;
    },
    logout() {
      this.loggedIn = false;
      Cookies.remove('token');
    },
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        Cookies.set('token', token, { expires: 14 });
      } else {
        Cookies.remove('token');
      }
    }
  },
  getters: {
    isLoggedIn(): boolean {
      return Cookies.get('token') !== undefined;
    },
    getToken(): string | undefined {
      return Cookies.get('token');
    }
  }
});
