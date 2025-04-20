import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    isDark: false,
    useTipTap: false,
    lastView: 'notes',
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
    },

    toggleEditor() {
      this.useTipTap = !this.useTipTap;
    },

    setLastView(view) {
      this.lastView = view;
    },
  },
});
