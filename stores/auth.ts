import { defineStore } from 'pinia';

export interface AuthState {
  loggedIn: boolean;
  token: string | null;
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    loggedIn: import.meta.client ? localStorage.getItem('token') !== null : false,
    token: import.meta.client ? localStorage.getItem('token') : null,
  }),
  actions: {
    login() {
      this.loggedIn = true;
    },
    logout() {
      this.loggedIn = false;
      localStorage.removeItem('token');
    },
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  },
  getters: {
    isLoggedIn(): boolean {
      return this.getToken !== null;
    },
    getToken(): string | null {
      return this.token;
    }
  }
});
