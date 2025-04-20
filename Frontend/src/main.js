import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import 'vuetify/styles';
import router from './router';

import '@mdi/font/css/materialdesignicons.css';

createApp(App).use(vuetify).use(router).use(createPinia).mount('#app');
