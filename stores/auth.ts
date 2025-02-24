import { defineStore } from 'pinia';
import type { AuthState } from '~/types';

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    loggedIn: false,
    token: null
  }),
  actions: {
    login() {
      this.loggedIn = true;
    },
    logout() {
      this.token = null;
      this.loggedIn = false;
    },
    setToken(token: string | null) {
      this.token = token;
    }
  },
  getters: {
    isLoggedIn(): boolean {
      return this.token != null;
    },
    getToken(): string | null | undefined {
      return this.token;
    }
  }
});
