<template>
  <v-card class="pa-4">
    <v-card-title>Settings</v-card-title>
    <v-divider class="mb-4"></v-divider>

    <v-switch v-model="darkMode" label="Dark Mode" @change="toggleDarkMode" />

    <v-select v-model="editorChoice" :items="['Simple Textarea', 'TipTap Editor']" label="Preferred Editor" />
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const darkMode = ref(false);
const editorChoice = ref('Simple Textarea');

const toggleDarkMode = () => {
  console.log('Dark mode toggled:', darkMode.value);
};
</script>
