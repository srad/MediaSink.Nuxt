import { defineNuxtRouteMiddleware, navigateTo } from '#app';
import { useAuthStore } from '~~/stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);

  const authStore = useAuthStore();

  if (authStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    navigateTo('/streams/live');
    return;
  }

  console.log(1);

  if (authStore.isLoggedIn && !authRequired) {
    return;
  }

  console.log(2);

  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !authStore.isLoggedIn) {
    return navigateTo('/login');
  }

  console.log(3);
});
