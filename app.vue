<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { createPinia } from 'pinia';
import state from 'pinia-plugin-persistedstate';
createPinia().use(state);
</script>