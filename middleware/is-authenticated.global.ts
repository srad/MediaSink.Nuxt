import AuthService, { TOKEN_NAME } from "@/services/auth.service";
import { defineNuxtRouteMiddleware, navigateTo, useCookie } from "#imports";
import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware((to, from) => {
  const publicPages = [ '/login', '/register' ];
  const authRequired = !publicPages.includes(to.path);

  const authStore = useAuthStore();

  const tokenCookie = useCookie(TOKEN_NAME);
  const auth = new AuthService(tokenCookie);
  authStore.checkLogin(tokenCookie);
  const isLoggedIn = auth.isLoggedIn();

  if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    navigateTo('/streams');
    return;
  }

  if (isLoggedIn && !authRequired) {
    return
  }

  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !isLoggedIn) {
    return navigateTo('/login');
  }
});
