<script setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/plugins/firebase';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const toast = useToastStore();

const loginUser = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    const token = await user.getIdToken();
    console.log('User ID token:', token); //Update this Later on for Security
    const authStore = useAuthStore();
    await authStore.setUser(user);
    toast.show('Logged in successfully!', 'success');
    router.push('/');
  } catch (err) {
    error.value = err.message;
    toast.show(err.message, 'error');
  }
};
</script>
<template>
  <v-container class="d-flex justify-center">
    <v-card width="400" class="pa-4">
      <v-card-title class="text-h6">Login</v-card-title>
      <v-text-field v-model="email" label="Email" type="email" outlined dense />
      <v-text-field v-model="password" label="Password" type="password" outlined dense />
      <div class="d-flex justify-center mt-1">
        <v-btn color="primary" class="mt-3" @click="loginUser">Login</v-btn>
      </div>
      <p class="mt-2 text-caption">
        Don't have an account?
        <router-link to="/register" aria-label="Go to Register Page">Register here</router-link>
      </p>
      <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
    </v-card>
  </v-container>
</template>

<style scoped>
.text-caption {
  margin-top: 12px;
  text-align: center;
  font-size: 0.875rem;
  color: #555;
}
a {
  color: #1976d2;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>
