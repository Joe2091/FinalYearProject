<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const drawer = ref(true);
const authStore = useAuthStore();
const router = useRouter();

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

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

        <v-divider class="my-2" />

        <template v-if="!authStore.user">
          <v-list-item to="/login" link>
            <v-icon start>mdi-login</v-icon>
            <v-list-item-title>Login</v-list-item-title>
          </v-list-item>

          <v-list-item to="/register" link>
            <v-icon start>mdi-account-plus</v-icon>
            <v-list-item-title>Register</v-list-item-title>
          </v-list-item>
        </template>

        <template v-else>
          <v-list-item to="/account" link>
            <v-icon start>mdi-account</v-icon>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>

          <v-list-item @click="logout">
            <v-icon start>mdi-logout</v-icon>
            <v-list-item-title>Sign Out</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
