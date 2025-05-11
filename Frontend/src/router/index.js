import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { auth } from '../plugins/firebase';

//determine if extension or not
const isExtension =
  typeof chrome !== 'undefined' && chrome.runtime?.id !== undefined;

//router instance and correct history set up
const router = createRouter({
  history: isExtension ? createWebHashHistory() : createWebHistory(),
  routes: [
    //public routes
    { path: '/register', component: () => import('@/pages/auth/Register.vue') }, //Firebase Registration
    { path: '/login', component: () => import('@/pages/auth/Login.vue') }, //Firebase Login

    //protected routes (require login)
    {
      path: '/account',
      component: () => import('@/pages/AccountPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/chat',
      component: () => import('@/pages/ChatPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      component: () => import('@/pages/NotesPage.vue'), //Default page after login and Notes
      meta: { requiresAuth: true },
    },
    {
      path: '/reminder',
      component: () => import('@/pages/RemindersPage.vue'),
      meta: { requiresAuth: true },
    },

    //redirect unknown paths to main notes page
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

//Firebase auth state must be resolved before handling route changes
let isAuthResolved = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Wait for Firebase auth state to resolve current user status
  if (!isAuthResolved) {
    await new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          await authStore.setUser(user); //store user info and token
        } else {
          authStore.logout(); // clear auth when no user
        }
        isAuthResolved = true;
        unsubscribe();
        resolve();
      });
    });
  }

  const isLoggedIn = !!authStore.user;

  //routes that require authentication protected
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isLoggedIn) {
    next('/'); // Redirect logged-in users away from login/register
  } else {
    next();
  }
});

export default router;
