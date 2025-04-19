<template>
  <v-navigation-drawer app permanent :rail="isCollapsed" color="primary" class="text-white" width="160">
    <v-list-item class="d-flex justify-end">
      <v-btn icon @click="toggleCollapse" variant="text" size="small" class="text-white">
        <v-icon>{{ isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
    </v-list-item>

    <!-- Navigation Items -->
    <v-list dense nav>
      <v-list-item v-for="(item, i) in navItems" :key="i" link @click="$emit('navigate', item.view)">
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-if="!isCollapsed">{{ item.title }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>
      <v-list-item @click="$emit('toggle-theme')" link>
        <v-list-item-icon>
          <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-if="!isCollapsed">
          {{ isDark ? 'Light Mode' : 'Dark Mode' }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item link @click="openWebApp">
        <v-list-item-icon>
          <v-icon>mdi-open-in-new</v-icon>
        </v-list-item-icon>
        <v-list-item-title v-if="!isCollapsed">Open Web App</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  isDark: Boolean,
});
const isCollapsed = ref(true);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const openWebApp = () => {
  window.open('http://localhost:5173', '_blank');
};

const navItems = [
  { title: 'Notes', icon: 'mdi-note-multiple', view: 'notes' },
  { title: 'Settings', icon: 'mdi-cog-outline', view: 'settings' },
];
</script>
<style scoped>
.v-btn:focus,
.v-btn:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}
</style>
