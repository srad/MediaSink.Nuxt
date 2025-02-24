<template>
  <div class="w-100 h-100" style="min-height: 200px;" ref="container"></div>
</template>

<script setup lang="ts">
import { useTemplateRef, computed, onMounted, onUnmounted, watch } from 'vue';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useNuxtApp } from '#app/nuxt';

const props = defineProps<{
  series: { load: number, time: number }[]
}>();

const container = useTemplateRef<HTMLDivElement>('container');
let chart: IChartApi | null = null;
let cpuSeries: ISeriesApi<any> | null = null;

const getIn = computed(() => (props.series || []).map(((x, i) => ({ time: i, value: x.load }))).slice(-30));

watch(() => props.series, () => {
  cpuSeries?.setData(getIn.value.sort((a, b) => a.time - b.time));
  chart?.timeScale().fitContent();
});

onMounted(() => {
  const { $createChart, $LineSeries } = useNuxtApp();

  chart = $createChart(container.value!, {
    autoSize: true,
    layout: { attributionLogo: false, fontSize: 11 },
    localization: {
      priceFormatter: (value: number) => {
        return value.toFixed(1) + '%';
      },
    },
  });
  cpuSeries = chart?.addSeries($LineSeries, {
    pointMarkersVisible: true,
    lineWidth: 2,
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
