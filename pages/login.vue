<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card shadow-sm border border-primary" style="width: 400px" v-if="!loggedIn">
      <h5 class="card-header p-3 bg-primary text-white">Login</h5>
      <div class="card-body px-4 py-3">
        <form @submit.prevent="login">
          <div class="row mb-3" v-if="message!==null">
            <div class="alert alert-danger m-0 p-2">
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
            <RouterLink to="/register">Register</RouterLink>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useState, useRouter, computed} from "#imports";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const authStore = useAuthStore();
const router = useRouter();

const message = useState<string | null>('message', () => null);
const loading = useState(false);

const email = useState('email', () => '');
const password = useState('password', () => '');

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const loggedIn = computed(() => authStore.isLoggedIn);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const login = async () => {
  try {
    loading.value = true;
    await authStore.login({ username: email.value, password: password.value });
    await router.replace('/');
  } catch (error: any) {
    message.value = error.response.data;
  } finally {
    loading.value = false;
  }
};
</script>
