import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSnackbarStore = defineStore('snackbar', () => {
  const visible = ref(false);
  const text = ref('');
  const color = ref('success');

  function show(message, status = 'success') {
    text.value = message;
    color.value = status;
    visible.value = true;
  }

  function hide() {
    visible.value = false;
  }

  return { visible, text, color, show, hide };
});
