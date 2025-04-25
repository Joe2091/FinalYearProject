import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    message: '',
    color: 'success',
    visible: false,
  }),
  actions: {
    show(msg, color = 'success') {
      this.message = msg;
      this.color = color;
      this.visible = true;

      setTimeout(() => {
        this.visible = false;
      }, 5000);
    },
    hide() {
      this.visible = false;
    },
  },
});
