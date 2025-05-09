<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from 'vuetify';
import Sidebar from '@/components/Sidebar.vue';
import { useRouter } from 'vue-router';

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');
const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark';
};

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initAuth();
  await router.isReady();

  const lastRoute = localStorage.getItem('lastRoute');
  const current = router.currentRoute.value.fullPath;

  if (current === '/' || current === '' || current === '/login') {
    if (authStore.isAuthenticated) {
      if (lastRoute && lastRoute !== '/login' && lastRoute !== '/register') {
        router.replace(lastRoute);
      } else {
        router.replace('/notes');
      }
    } else {
      router.replace('/login');
    }
  }
});
</script>

<template>
  <v-app>
    <Sidebar :is-dark="isDark" @toggle-theme="toggleTheme" />

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
