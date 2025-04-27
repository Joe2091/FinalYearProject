<script setup>
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import Sidebar from '@/components/Sidebar.vue';
import { useToastStore } from '@/stores/toastStore';
import { useSnackbarStore } from '@/stores/snackbarStore';
import { useRouter } from 'vue-router';

const snackbar = useSnackbarStore();
const showToast = snackbar.show;
const theme = useTheme();
const isDark = computed(() => theme.global.name.value === 'dark');
const toggleTheme = () => {
  theme.global.name.value = isDark.value ? 'light' : 'dark';
};

const toast = useToastStore();
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
