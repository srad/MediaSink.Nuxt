<template>
  <div class="w-100 h-100" style="min-height: 200px;" ref="container"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from '#imports';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { ref } from '#imports';
import { useNuxtApp } from '#app/nuxt';

const props = defineProps<{
  series: { load: number, time: number }[]
}>();

const container = ref<HTMLDivElement | null>(null);
let chart: IChartApi | null = null;
let cpuSeries: ISeriesApi<any> | null = null;

const getIn = computed(() => (props.series || []).map(((x, i) => ({ time: i, value: x.load }))));

watch(() => props.series, () => {
  cpuSeries?.setData(getIn.value.sort((a, b) => a.time - b.time));
  chart?.timeScale().fitContent();
});

onMounted(() => {
  const { $createChart } = useNuxtApp();
  chart = $createChart(container.value!, {
    autoSize: true,
    layout: { attributionLogo: false, fontSize: 11 },
    localization: {
      priceFormatter: (value: number) => {
        return value.toFixed(1) + '%';
      },
    },
  });
  cpuSeries = chart.addLineSeries({
    pointMarkersVisible: true,
    lineWidth: 2,
    color: '#990d37',
    title: 'Load  ',
  });
});

onUnmounted(() => {
  if (chart) {
    chart.remove();
    chart = null;
  }
});
</script>

<style scoped>
</style>
