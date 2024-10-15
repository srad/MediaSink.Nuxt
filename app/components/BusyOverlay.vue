<template>
  <div v-if="props.visible" class="position-absolute d-flex align-items-center justify-content-center vh-100" style="top: 0; bottom: 0; left: 0; right: 0; background: grey; opacity: 0.6; z-index: 10000000">
    <div class="fs-1 spinner-border text-primary" role="status" style="width: 5rem; height: 5rem;">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  visible: boolean
}>();

</script>

<style scoped>

</style>
