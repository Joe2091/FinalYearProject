import { defineStore } from 'pinia';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/plugins/firebase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async initAuth() {
      if (this.initialized) return;

      this.initialized = true;

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await this.setUser(user);
        } else {
          this.clearAuth();
        }
      });

      const existingToken = localStorage.getItem('token');
      const existingUser = localStorage.getItem('user');

      if (!this.token && existingToken) {
        this.token = existingToken;
        if (existingUser) {
          this.user = JSON.parse(existingUser);
        }
      }
    },

    async setUser(user) {
      this.user = user;
      const token = await user.getIdToken();
      this.token = token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    async logout() {
      await signOut(auth);
      this.clearAuth();
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
