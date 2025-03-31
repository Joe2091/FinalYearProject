<template>
  <v-app>
    <v-navigation-drawer app v-model="drawer" permanent>
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">NoteMax</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item link to="/">
          <v-icon start>mdi-note</v-icon>
          <v-list-item-title>Notes</v-list-item-title>
        </v-list-item>

        <v-list-item link to="/settings">
          <v-icon start>mdi-cog</v-icon>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";

const drawer = ref(true);
</script>
