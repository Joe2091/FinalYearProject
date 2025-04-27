import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import Popup from './Popup.vue';
import vuetify from './plugins/vuetify';
import 'vuetify/styles';
import router from './router';
import '@mdi/font/css/materialdesignicons.css';

import { auth } from './plugins/firebase';
import { useAuthStore } from './stores/authStore';

const pinia = createPinia();
const app = createApp(Popup);
app.use(pinia);
app.use(vuetify);
app.use(router);

let appHasMounted = false;

auth.onAuthStateChanged(async (user) => {
  const authStore = useAuthStore();

  if (user) {
    await authStore.setUser(user);
  } else {
    authStore.logout();
  }

  if (!appHasMounted) {
    app.mount('#app');
    appHasMounted = true;
  }
});
