<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { createPinia } from 'pinia';
import { useRouter } from "#imports";
import state from 'pinia-plugin-persistedstate';
import AuthService from './services/auth.service';

const router = useRouter();
createPinia().use(state);

router.beforeEach((to, from, next) => {
  const publicPages = [ '/login', '/register' ];
  const authRequired = !publicPages.includes(to.path);
  const hasAuthHeader = AuthService.getAuthHeader();
  const isLoggedIn = AuthService.isLoggedIn();

  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/streams');
    return;
  }

  if (isLoggedIn && !authRequired) {
    next();
    return
  }

  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !hasAuthHeader) {
    next('/login');
  } else {
    next();
  }
});
</script>