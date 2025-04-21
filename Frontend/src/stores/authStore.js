import { defineStore } from 'pinia';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/plugins/firebase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    async initAuth() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const token = await user.getIdToken();
          this.user = user;
          this.token = token;
          localStorage.setItem('token', token);
        } else {
          this.user = null;
          this.token = null;
          localStorage.removeItem('token');
        }
      });

      // Restore token on refresh if available
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        this.token = existingToken;
      }
    },

    async logout() {
      await signOut(auth);
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    },

    async setUser(user) {
      this.user = user;
      const token = await user.getIdToken();
      this.token = token;
      localStorage.setItem('token', token);
    },
  },
});
