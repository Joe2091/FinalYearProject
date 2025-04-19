<template>
  <v-app>
    <Sidebar :is-dark="isDark" @navigate="currentView = $event" @toggle-theme="toggleTheme" />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="1500"
      location="top"
      transition="slide-y-transition"
      class="mx-auto mt-2 elevation-6"
    >
      <v-icon start class="me-2">
        {{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}
      </v-icon>
      {{ snackbar.text }}
      <template #actions>
        <v-btn icon @click="snackbar.show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>

    <v-main>
      <v-container>
        <component :is="getCurrentComponent" @toast="showToast" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed } from 'vue';
import { useTheme } from 'vuetify';
import Sidebar from '@/components/Sidebar.vue';
import NotesView from '@/components/NotesView.vue';
import SettingsView from '@/components/SettingsView.vue';

export default {
  components: {
    Sidebar,
    NotesView,
    SettingsView,
  },
  setup() {
    const currentView = ref('notes');

    const snackbar = ref({
      show: false,
      text: '',
      color: 'success',
    });

    const showToast = (message, color = 'success') => {
      snackbar.value.text = message;
      snackbar.value.color = color;
      snackbar.value.show = true;
    };

    const theme = useTheme();
    const isDark = computed(() => theme.global.name.value === 'dark');
    const toggleTheme = () => {
      theme.global.name.value = isDark.value ? 'light' : 'dark';
    };

    const getCurrentComponent = computed(() => {
      const views = {
        notes: NotesView,
        settings: SettingsView,
      };
      return views[currentView.value] || NotesView;
    });

    return {
      currentView,
      snackbar,
      showToast,
      getCurrentComponent,
      toggleTheme,
      isDark,
    };
  },
};
</script>
