<template>
  <div class="time-marker">
    <div class="progress m-0" v-for="(seg, i) in props.segments" :key="i" style="height: 0.2rem">
      <div class="progress-bar bg-danger" role="progressbar" @click="() => seek(seg)"
           :style="`width: ${(seg.end/props.duration*100)-(seg.start/props.duration*100)}%;margin-left: ${(seg.start/props.duration*100)}%`">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  duration: number
  segments: Timestamp[]
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

interface Timestamp {
  id: number;
  start: number;
  end: number;
}

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{ (e: 'seek', value: Timestamp): void }>();

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const seek = (seg: Timestamp) => emit('seek', seg);
</script>

<style scoped>
.time-marker {
  width: 100%;
}
</style>
