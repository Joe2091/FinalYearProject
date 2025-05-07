import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@/plugins/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
    currentUser: {
      uid: 'test-user',
      email: 'test@example.com',
    },
  },
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

//mock auth store for guarded routes
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { uid: 'test-user' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

// Console errors suppression
vi.spyOn(console, 'error').mockImplementation(() => {});
