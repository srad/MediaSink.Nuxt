<template>
  <div v-if="props.busy || props.empty" class="d-flex justify-content-center">
    <div v-if="props.busy" class="text-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <h3 v-if="props.empty && !props.busy" class="text-dark">
      {{ props.emptyText || '...' }}
    </h3>
  </div>
  <template v-else>
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  busy: boolean
  empty?: boolean
  emptyText?: string
}>();
</script>