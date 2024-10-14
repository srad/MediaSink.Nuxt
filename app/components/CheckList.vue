<template>
  <ol class="m-0 px-4 py-0">
    <li v-for="(item, index) in props.items">
      <div class="d-flex justify-content-between align-items-center">
        <span>{{ item.message }}</span>
        <i class="bi bi-check fs-5 fw-bold text-success" v-if="item.checked"></i>
        <i class="bi bi-x fs-5 fw-bold text-danger" v-else></i>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
const props = defineProps<{ items: { message: string, checked: boolean }[] }>();
</script>

<style scoped>

</style>