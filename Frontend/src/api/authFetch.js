import { useAuthStore } from '@/stores/authStore';

export const authFetch = async (url, options = {}) => {
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token');

  if (!token) {
    throw new Error('No token found');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
