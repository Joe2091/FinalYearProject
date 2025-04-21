import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { auth } from '../plugins/firebase';

const routes = [
  { path: '/register', component: () => import('@/pages/auth/Register.vue') },
  { path: '/login', component: () => import('@/pages/auth/Login.vue') },
  { path: '/account', component: () => import('@/pages/AccountPage.vue'), meta: { requiresAuth: true } },
  { path: '/', component: () => import('@/pages/NotesPage.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('@/pages/SettingsPage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let isAuthResolved = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for Firebase auth state to resolve
  if (!isAuthResolved) {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          await authStore.setUser(user);
        } else {
          authStore.logout();
        }
        isAuthResolved = true;
        unsubscribe();
        resolve();
      });
    });
  }

  const isLoggedIn = !!authStore.user;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    next('/'); // Redirect logged-in users away from login/register
  } else {
    next();
  }
});

export default router;
