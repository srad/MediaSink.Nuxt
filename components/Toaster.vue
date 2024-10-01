<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div v-for="toast in props.toasts" class="toast border-dark" :class="{'show': toast.hide !== true}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header bg-info-light">
        <strong class="me-auto">{{ toast.title }}</strong>
        <button type="button" class="btn-close" @click="() => store.commit(ToastMutation.Hide, toast)" aria-label="Close"></button>
      </div>
      <div class="toast-body bg-secondary-subtle text-dark">
        <div>
          {{ toast.message }}
        </div>
        <div style="height: 3px;" :style="{'width': toast.countdown + '%'}" class="mt-2 bg-warning"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Toast, useToastStore } from "../stores/toast";

const store = useToastStore();
const props = defineProps<{ toasts: Toast[] }>();
</script>
