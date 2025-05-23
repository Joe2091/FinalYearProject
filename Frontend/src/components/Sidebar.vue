<!--Extension Sidebar-->
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark'); // Detect current theme

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  theme.global.name.value = savedTheme;
}

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark';
  theme.global.name.value = newTheme;
  localStorage.setItem('theme', newTheme);
  toast.show(`Switched to ${newTheme} mode`, 'info');
};
const toast = useToastStore();

const drawer = ref(true);
const authStore = useAuthStore();
const router = useRouter();
const isCollapsed = ref(false);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const webAppUrl = 'https://www.notemax.site/'; // Link from Extension Sidebar to Web Application

function openWebApp() {
  window.open(webAppUrl, '_blank');
}
const logout = async () => {
  await authStore.logout();
  toast.show('Signed out successfully!', 'success');
  router.push('/login');
};
</script>
<template>
  <v-snackbar
    v-model="toast.visible"
    :color="toast.color"
    timeout="1700"
    location="top center"
    class="elevation-10 rounded-lg px-4"
  >
    <v-icon class="mr-2">
      {{ toast.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}
    </v-icon>
    {{ toast.message }}
  </v-snackbar>
  <v-navigation-drawer
    app
    v-model="drawer"
    permanent
    :rail="isCollapsed"
    :width="130"
    :rail-width="56"
    :color="isDark ? 'grey-darken-4' : 'primary'"
  >
    <v-list>
      <v-list-item class="d-flex justify-end">
        <v-btn icon @click="toggleCollapse" variant="text" size="small">
          <v-icon>{{
            isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'
          }}</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item
        link
        to="/"
        :class="[
          $route.path === '/'
            ? isDark
              ? 'active-item-dark'
              : 'active-item-light'
            : '',
          $route.path === '/' ? 'no-hover' : '',
        ]"
      >
        <v-icon start>mdi-note</v-icon>
        <v-list-item-title v-if="!isCollapsed">Notes</v-list-item-title>
      </v-list-item>

      <v-list-item
        link
        to="/reminder"
        :class="[
          $route.path === '/reminder'
            ? isDark
              ? 'active-item-dark'
              : 'active-item-light'
            : '',
          $route.path === '/reminder' ? 'no-hover' : '',
        ]"
      >
        <v-icon start>mdi-bell</v-icon>
        <v-list-item-title v-if="!isCollapsed">Reminders</v-list-item-title>
      </v-list-item>

      <v-list-item
        link
        to="/chat"
        :class="[
          $route.path === '/chat'
            ? isDark
              ? 'active-item-dark'
              : 'active-item-light'
            : '',
          $route.path === '/chat' ? 'no-hover' : '',
        ]"
      >
        <v-icon start>mdi-message-text</v-icon>
        <v-list-item-title v-if="!isCollapsed">Chatbot</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2" />

      <template v-if="!authStore.user">
        <v-list-item
          link
          to="/login"
          :class="[
            $route.path === '/login'
              ? isDark
                ? 'active-item-dark'
                : 'active-item-light'
              : '',
            $route.path === '/login' ? 'no-hover' : '',
          ]"
        >
          <v-icon start>mdi-login</v-icon>
          <v-list-item-title v-if="!isCollapsed">Login</v-list-item-title>
        </v-list-item>

        <v-list-item
          link
          to="/register"
          :class="[
            $route.path === '/register'
              ? isDark
                ? 'active-item-dark'
                : 'active-item-light'
              : '',
            $route.path === '/register' ? 'no-hover' : '',
          ]"
        >
          <v-icon start>mdi-account-plus</v-icon>
          <v-list-item-title v-if="!isCollapsed">Register</v-list-item-title>
        </v-list-item>
      </template>

      <template v-else>
        <v-list-item
          link
          to="/account"
          :class="[
            $route.path === '/account'
              ? isDark
                ? 'active-item-dark'
                : 'active-item-light'
              : '',
            $route.path === '/account' ? 'no-hover' : '',
          ]"
        >
          <v-icon start>mdi-account</v-icon>
          <v-list-item-title v-if="!isCollapsed">Account</v-list-item-title>
        </v-list-item>

        <v-list-item @click="toggleTheme" link>
          <v-icon start>
            {{
              isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'
            }}
          </v-icon>
          <v-list-item-title v-if="!isCollapsed">
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </v-list-item-title>
        </v-list-item>

        <v-list-item @click="openWebApp" class="mt-4">
          <v-icon start>mdi-open-in-new</v-icon>
          <v-list-item-title v-if="!isCollapsed"> Web App</v-list-item-title>
        </v-list-item>

        <v-list-item @click="logout">
          <v-icon start>mdi-logout</v-icon>
          <v-list-item-title v-if="!isCollapsed">Sign Out</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar-dark {
  background-color: #121212 !important;
}

.sidebar-light {
  background-color: #1976d2 !important;
}

.sidebar-light .v-list-item-title,
.sidebar-light .v-icon {
  color: white !important;
}

.active-item-dark {
  background-color: #4a02b0 !important;
}

.active-item-light {
  background-color: #1565c0 !important;
}

.active-item-dark .v-list-item-title,
.active-item-dark .v-icon,
.active-item-light .v-list-item-title,
.active-item-light .v-icon {
  color: white !important;
}

.no-hover:hover {
  background-color: inherit !important;
}
.v-btn:focus,
.v-btn:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}
</style>
