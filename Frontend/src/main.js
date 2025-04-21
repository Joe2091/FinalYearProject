import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import 'vuetify/styles';
import router from './router';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);
app.use(router);

import { useAuthStore } from './stores/authStore';
const authStore = useAuthStore();
authStore.initAuth();

app.mount('#app');
