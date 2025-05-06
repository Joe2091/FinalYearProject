<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const user = authStore.user;

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
<template>
  <v-container class="d-flex justify-center">
    <v-card width="500" class="pa-6">
      <v-card-title class="text-h5 mb-4">Account Info</v-card-title>

      <v-list lines="two">
        <v-list-item>
          <v-list-item-title>Email</v-list-item-title>
          <v-list-item-subtitle>{{ user?.email }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>User ID</v-list-item-title>
          <v-list-item-subtitle>{{ user?.uid }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider class="my-4" />

      <v-btn color="red" @click="logout" block>Sign Out</v-btn>
    </v-card>
  </v-container>
</template>
