<template>
  <div class="text-white d-flex justify-content-between align-middle me-3">
          <span class="fw-bold me-2 ">
            {{ props.pcent }}
            <i class="bi bi-hdd"></i>
          </span>
    <span class="progress m-1" style="min-width: 120px">
            <span class="progress-bar bg-info progress-bar-striped"
                  role="progressbar"
                  :style="{width: props.pcent}"
                  :aria-valuenow="parseInt(props.pcent)"
                  aria-valuemin="0"
                  aria-valuemax="100">
            </span>
          </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ pcent: string }>();
</script>

<style scoped>
</style>