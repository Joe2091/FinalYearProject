import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const routes = [
  { path: '/register', component: () => import('@/pages/auth/Register.vue') },
  { path: '/login', component: () => import('@/pages/auth/Login.vue') },
  { path: '/', component: () => import('@/pages/NotesPage.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('@/pages/SettingsPage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = !!authStore.user;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
