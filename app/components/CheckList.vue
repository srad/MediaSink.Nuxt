<template>
  <ol class="m-0 p-0 ps-3">
    <li v-for="item in props.items">
      <div class="d-flex justify-content-between align-items-center">
        <span>{{ item.message }}</span>
        <i class="bi bi-check fs-5 fw-bold text-success p-0" v-if="item.checked"></i>
        <i class="bi bi-x fs-5 fw-bold text-danger p-0" v-else></i>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
const props = defineProps<{ items: { message: string, checked: boolean }[] }>();
</script>

<style scoped>

</style>
