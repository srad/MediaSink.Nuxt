<template>
  <div class="w-100 h-100" style="min-height: 300px;" ref="container"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, onUnmounted, ref } from 'vue';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import { useNuxtApp } from '#app/nuxt';

const props = defineProps<{
  series: { in: number, out: number, time: number }[]
}>();

const container = ref<HTMLDivElement | null>();
let chart: IChartApi | null = null;
let inSeries: ISeriesApi<any> | null = null;
let outSeries: ISeriesApi<any> | null = null;

const getIn = computed(() => (props.series || []).map(((x) => ({ time: x.time, value: x.in }))).slice(-30));
const getOut = computed(() => (props.series || []).map(((x) => ({ time: x.time, value: x.out }))).slice(-30));

watch(() => props.series, () => {
  inSeries?.setData(getIn.value.sort((a, b) => a.time - b.time));
  outSeries?.setData(getOut.value.sort((a, b) => a.time - b.time));
  chart?.timeScale().fitContent();
});

onMounted(() => {
  const { $createChart, $LineSeries } = useNuxtApp();
  chart = $createChart(container.value!, {
    autoSize: true,
    layout: { attributionLogo: false, fontSize: 11 },
    localization: {
      priceFormatter: (value: number) => {
        return value.toFixed(1) + 'MB';
      },
    },
  });

  inSeries = chart?.addSeries($LineSeries, {
    pointMarkersVisible: true,
    lineWidth: 2,
    color: '#19785f',
    title: 'incoming'
  });

  outSeries = chart?.addSeries($LineSeries, {
    pointMarkersVisible: true,
    lineWidth: 2,
    color: '#990d37',
    title: 'outgoing  ',
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
