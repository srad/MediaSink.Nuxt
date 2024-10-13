<template>
  <div class="d-flex p-0 monitor">
    <h5>
    <span class="badge">
      <i class="bi bi-smartwatch"></i>
      {{ uptimeHours }}h
    </span>
    </h5>
    |
    <h5>
    <span class="badge">
      <i class="bi bi-cpu"></i> {{ cpuFormatted }}%
    </span>
    </h5>
    |
    <h5>
      <span class="badge ">Mem {{ usedMem }}GB/ {{ totalMem }}GB</span>
    </h5>
    |
    <h5>
    <span class="badge">
      <i class="bi bi-hdd"></i>
      {{ diskUsed }}/ {{ diskTotal }} ({{ diskPercent }}%)
    </span>
    </h5>
    |
    <h5>
    <span class="badge ">
      <i class="bi bi-hdd-network"></i>
      {{ netInputMB }}MB (in) {{ netOutputMB }}MB (out)
    </span>
    </h5>
    |
    <h5>
    <span class="badge ">
      <i class="bi bi-hdd-network"></i>
      {{ (netInTraffic / 1024 / 1024 / 1024).toFixed(1) }}GB (in) {{
        (netOutTraffic / 1024 / 1024 / 1024).toFixed(1)
      }}GB (out)
    </span>
    </h5>
  </div>
</template>

<script setup lang="ts">
// function pad(num, size) {
//   const s = "000000000" + num;
//   return s.substr(s.length - size);
// }

import { computed, defineProps } from "vue";

const props = defineProps<{
  cpu: number
  uptime: number
  memTotal: number
  memUsed: number
  netInput: number
  netOutput: number
  netInTraffic: number
  netOutTraffic: number
  diskUsed: string
  diskTotal: string
}>();

const uptimeHours = computed(() => (props.uptime / 60 / 60).toFixed(2));
const cpuFormatted = computed(() => (props.cpu /*pad(this.cpu, 6)*/));
const usedMem = computed(() => (props.memUsed / 1024).toFixed(2));
const totalMem = computed(() => (props.memTotal / 1024).toFixed(2));
const diskPercent = computed(() => {
  const u = parseInt(props.diskUsed, 10);
  const t = parseInt(props.diskTotal, 10);
  return (u / t * 100).toFixed(2);
});

const netInputMB = computed(() => (props.netInput / 1024 / 1024).toFixed(1));
const netOutputMB = computed(() => (props.netOutput / 1024 / 1024).toFixed(1));
</script>

<style scoped>
.monitor > * {
  margin-right: 0.3rem;
}

.monitor h5 {
  margin: 0;
}
</style>
