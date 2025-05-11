import { defineStore } from 'pinia';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/plugins/firebase';

//Store defined for managing auth state
export const useAuthStore = defineStore('auth', {
  //Store state
  state: () => ({
    user: null,
    token: null,
    initialized: false,
  }),

  //Getters
  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  //Actions
  actions: {
    //Firebase auth listener initialized and restore token/user from localStorage
    async initAuth() {
      if (this.initialized) return;

      this.initialized = true;

      //Firebase listener for user state change
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await this.setUser(user); //set new user and token
        } else {
          this.clearAuth(); //clear store on sign out
        }
      });

      //Restore ftoken and user from localStorage if logged in
      const existingToken = localStorage.getItem('token');
      const existingUser = localStorage.getItem('user');

      if (!this.token && existingToken) {
        this.token = existingToken;
        if (existingUser) {
          this.user = JSON.parse(existingUser);
        }
      }
    },

    //Current user and token in store and localStorage
    async setUser(user) {
      this.user = user;
      const token = await user.getIdToken();
      this.token = token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    //Firebase signout and clear auth state
    async logout() {
      await signOut(auth);
      this.clearAuth();
    },

    //Clear auth state and remove from localStorage
    clearAuth() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
