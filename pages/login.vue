<template>
  <div class="d-flex align-items-center justify-content-center vh-100">
    <div class="card shadow-sm border border-primary" style="width: 400px">
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
            <NuxtPage to="/register">Register</NuxtPage>
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
import { ref, definePageMeta } from '#imports';
import { createLog } from '~/utils/log';
import { useNuxtApp } from '#app/nuxt';
import { reloadNuxtApp } from '#app/composables/chunk';
import { useHead } from '#app';

useHead({
  title: 'Login'
})

definePageMeta({
  layout: 'auth'
});

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const message = ref<string | null>(null);
const loading = ref(false);

const email = ref('');
const password = ref('');

const logger = createLog('login');

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const login = async () => {
  try {
    loading.value = true;
    const { $auth } = useNuxtApp();
    await $auth.login({ username: email.value, password: password.value });
    reloadNuxtApp({
      path: '/streams/live',
    });
  } catch (res: any) {
    message.value = res.error;
    logger.error(message.value);
    loading.value = false;
  }
};
</script>
