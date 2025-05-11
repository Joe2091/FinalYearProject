import { useAuthStore } from '@/stores/authStore';

//Function attaching Firebase auth token to fetch
export const authFetch = async (url, options = {}) => {
  const authStore = useAuthStore();

  //Get  token from Pinia store or local storage
  const token = authStore.token || localStorage.getItem('token');

  if (!token) {
    throw new Error('No token found');
  }

  //fetch request with auth header containing Bearer token
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
