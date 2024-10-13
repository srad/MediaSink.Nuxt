<template>
  <NuxtLink class="navbar-brand text-white fw-bold d-flex" to="/streams/live">
    <img alt="icon" class="px-2" style="height: 28px; width: auto" src="/icon.png"/>
    <span class="d-none d-sm-block">{{ props.title }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps<{ title: string }>();
</script>
