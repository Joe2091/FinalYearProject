import { render, fireEvent } from '@testing-library/vue';
import { createVuetify } from 'vuetify';
import Login from '@/pages/auth/Login.vue';
import { vi } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import flushPromises from 'flush-promises';

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { getIdToken: () => Promise.resolve('mockToken') } })
  ),
}));

const setUserMock = vi.fn();
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    setUser: setUserMock,
    logout: vi.fn(),
  }),
}));

const showMock = vi.fn();
vi.mock('@/stores/toastStore', () => ({
  useToastStore: () => ({
    show: showMock,
  }),
}));

test('logs in user with correct credentials and navigates to /', async () => {
  const vuetify = createVuetify();
  const routes = [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: Login },
    { path: '/register', component: { template: '<div>Register</div>' } },
  ];
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });

  router.push('/login');
  await router.isReady();

  const { getByLabelText, getByRole } = render(Login, {
    global: {
      plugins: [vuetify, router, createTestingPinia({ stubActions: false })],
    },
  });

  await fireEvent.update(getByLabelText('Email'), 'test@example.com');
  await fireEvent.update(getByLabelText('Password'), 'password111');
  await fireEvent.click(getByRole('button', { name: /login/i }));

  await flushPromises();

  expect(router.currentRoute.value.fullPath).toBe('/');
  expect(setUserMock).toHaveBeenCalled();
  expect(showMock).toHaveBeenCalledWith('Logged in successfully!', 'success');
});
