<script setup>
import { ref } from 'vue';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/plugins/firebase';
import { useRouter } from 'vue-router';
import { useToastStore } from '../../stores/toastStore';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const toast = useToastStore();

const registerUser = async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    router.push('/login');
    toast.show('Created an Account Successfully!', 'success');
  } catch (err) {
    error.value = err.message;
    toast.show(err.message, 'error');
  }
};
</script>
<template>
  <v-container class="d-flex justify-center">
    <v-card width="400" class="pa-4">
      <v-card-title class="text-h6">Create Account</v-card-title>
      <v-text-field v-model="email" label="Email" type="email" outlined dense />
      <v-text-field v-model="password" label="Password" type="password" outlined dense />
      <div class="d-flex justify-center mt-1">
        <v-btn color="primary" class="mt-3" @click="registerUser">Register</v-btn>
      </div>
      <p class="mt-2 text-caption">
        Already have an account?
        <router-link to="/login" aria-label="Go to Register Page">Login here</router-link>
      </p>
      <v-alert v-if="error" type="error" dense class="mt-2">{{ error }}</v-alert>
    </v-card>
  </v-container>
</template>

<style scoped>
.text-caption {
  margin-top: 16px;
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
