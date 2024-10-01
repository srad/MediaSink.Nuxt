<template>
  <a>
    <i class="bi bi-star-fill text-warning" @click="emit('fav', props.data)" v-if="faved"></i>
    <i v-else class="bi bi-star text-warning" @click="emit('unfav', props.data)"></i>
  </a>
</template>

<script setup lang="ts" generic="T">
const emit = defineEmits<{
  (e: 'fav', data: T): void
  (e: 'unfav', data: T): void
}>();

const props = defineProps<{
  faved: boolean
  data: T
}>();
</script>

<style scoped>
</style>