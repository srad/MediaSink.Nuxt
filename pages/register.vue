<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card shadow-sm border border-primary" style="width: 400px">
      <h5 class="card-header p-3 bg-primary text-white">Register</h5>
      <div class="card-body px-4 py-3">
        <form @submit.prevent="register">
          <div class="row mb-3" v-if="message!==null">
            <div class="alert alert-danger px-3 py-2">
              {{ message }}
            </div>
          </div>
          <div class="mb-3 row">
            <label for="staticEmail" class="form-label">Email</label>
            <input type="email" name="email" required class="form-control" id="staticEmail" placeholder="email@example.com" v-model="email">
          </div>
          <div class="mb-3 row">
            <label for="inputPassword" class="form-label">Password</label>
            <input type="password" name="password" required class="form-control" id="inputPassword" v-model="password">
          </div>

          <div class="d-flex justify-content-between">
            <RouterLink to="/login">Login</RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
              Register
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useState, useRouter } from "#imports";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const authStore = useAuthStore();
const router = useRouter();

const message = useState<string | null>('message', () => null);
const successful = useState('successful', () => false);
const loading = useState('loading', () => false);
const email = useState('email', () => "");
const password = useState('password', () => "");

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const register = () => {
  message.value = null;
  successful.value = false;
  loading.value = true;

  authStore.register({ username: email.value, password: password.value }).then(data => {
    message.value = data.message;
    successful.value = true;
    loading.value = false;
    router.push('/login')
  }).catch(error => {
    loading.value = false;
    message.value = error.response.data;
    successful.value = false;
  });
};
</script>
