import { createRouter, createWebHistory } from 'vue-router';
import NotesPage from '../pages/NotesPage.vue';
import SettingsPage from '../pages/SettingsPage.vue';

const routes = [
  { path: '/', component: NotesPage },
  { path: '/settings', component: SettingsPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
