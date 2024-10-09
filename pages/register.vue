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
import { useAuthStore } from '~/stores/auth';
import { createLog, definePageMeta, ref, useRouter } from '#imports';
import { useNuxtApp } from '#app/nuxt';
import { reloadNuxtApp } from '#app/composables/chunk';

definePageMeta({
  layout: 'auth'
});

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const authStore = useAuthStore();
const router = useRouter();

const message = ref<string | null>(null);
const successful = ref(false);
const loading = ref(false);
const email = ref('');
const password = ref('');

const logger = createLog('register');

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const register = async () => {
  try {
    message.value = null;
    successful.value = false;
    logger.info(`Registering ${email.value}`);
    const { $auth } = useNuxtApp();
    await $auth.signup({ username: email.value, password: password.value });
    await router.push('/login');
  } catch (error: any) {
    logger.error(error);
    message.value = JSON.stringify(error);
    successful.value = false;
  } finally {
    loading.value = false;
  }
};
</script>
