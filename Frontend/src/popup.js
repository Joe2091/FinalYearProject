import { createApp } from 'vue';
import Popup from './Popup.vue';
import './style.css';
import vuetify from './plugins/vuetify';
import 'vuetify/styles';
import router from './router';

import '@mdi/font/css/materialdesignicons.css';

createApp(Popup).use(vuetify).use(router).mount('#app');
