<template>
  <div class="container-fluid my-3">
    <div class="table-responsive border-secondary border m-0 p-0">
      <table class="table table-bordered m-0">
        <thead>
        <tr style="visibility: collapse">
          <th style="width: 25%"></th>
          <th></th>
        </tr>
        <tr rowspan="2">
          <th class="text-end bg-light" colspan="2">
            <div class="btn-group btn-group-sm">
              <button type="button" :disabled="isUpdating" class="btn btn-primary me-2" @click="updateInfo" :class="{'blink btn-danger': isUpdating}">
                <span class="me-2">Update video metadata</span>
                <i class="bi bi-arrow-clockwise"></i>
              </button>
              <button class="btn btn-primary me-2" @click="posters">
                <span class="me-2">Regenerate posters</span>
                <i class="bi bi-card-image"></i>
              </button>

              <button :disabled="importing" class="btn btn-primary" @click="startImport">
                <span class="me-2">Start Import</span>
                <i class="bi bi-disc"></i>
              </button>
            </div>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td class="bg-light-subtle align-middle">
            CPU Load
          </td>
          <td class="align-middle pt-3 ps-3">
            <CPUChart :series="cpuLoadSeries"/>
            <!--
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: mainCpuLoad + '%' }" aria-valuenow="0"
                   aria-valuemin="0"
                   aria-valuemax="100"></div>
            </div>
            -->
          </td>
        </tr>
        <tr>
          <td colspan="2" class="p-0 ">
          </td>
        </tr>
        <tr>
          <td class="bg-light-subtle align-middle">Network-Traffic</td>
          <td class="pt-3 ps-3">
            <TrafficChart :series="trafficSeries"/>
          </td>
        </tr>
        <tr>
          <td class="bg-light-subtle align-middle">Disk usage ({{ diskInfo?.pcent || 0 }})</td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: diskInfo?.pcent}" aria-valuenow="0"
                   aria-valuemin="0"
                   aria-valuemax="100"></div>
            </div>
          </td>
        </tr>
        <tr v-if="importing">
          <td class="align-middle" :class="{'blink bg-danger-subtle': importing}">
            Importing ({{ importProgress }}/{{ importSize }})
          </td>
          <td class="align-middle">
            <div class="progress">
              <div class="progress-bar" role="progressbar" :style="{width: (importProgress/importSize*100) + '%'}" aria-valuenow="{{importProgress}}"
                   aria-valuemin="0"
                   aria-valuemax="{{importSize}}"></div>
            </div>

          </td>
        </tr>
        <tr>
          <td colspan="2" class="p-0">
          </td>
        </tr>
        <tr v-for="version in versions">
          <td class="bg-light-subtle align-middle">
            {{ version[0] }}
          </td>
          <td class="align-middle">{{ version[1] }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  HelpersCPUInfo,
  HelpersDiskInfo,
  HelpersNetInfo,
  ResponsesServerInfoResponse
} from '~/services/api/v1/StreamSinkClient';
import TrafficChart from '~/components/charts/TrafficChart.vue';
import CPUChart from '~/components/charts/CPUChart.vue';
import { ref, onBeforeRouteLeave, computed, onMounted } from '#imports';
import { useNuxtApp } from '#app/nuxt';
import { useAsyncData, useHead } from '#app';

useHead({
  title: 'Administration'
});

const build = import.meta.env.VITE_BUILD;
const version = import.meta.env.VITE_VERSION;

const versions = computed(() => [
  ['Client-Version', version],
  ['Client-Revision', build],
  ['Server-Version', serverInfo.value?.version],
  ['Server-Revision', serverInfo.value?.commit],
]);

const importing = ref(false);
const importProgress = ref(0);
const importSize = ref(0);

const trafficSeries = ref<{ in: number, out: number, time: number }[]>([]);
const cpuLoadSeries = ref<{ load: number, time: number }[]>([]);

const isUpdating = ref(false);

const serverInfo = ref<ResponsesServerInfoResponse | null>(null);

const cpuInfo = ref<HelpersCPUInfo | undefined>(undefined);
const diskInfo = ref<HelpersDiskInfo | undefined>(undefined);
const netInfo = ref<HelpersNetInfo | undefined>(undefined);

const id = ref<number | NodeJS.Timeout>(0);

//const receivedMb = computed(() => ((netInfo.value?.receiveBytes || 0) / 1024 / 1024).toFixed(2));
//const transmittedMb = computed(() => ((netInfo.value?.transmitBytes || 0) / 1024 / 1024).toFixed(2));

const startImport = async () => {
  if (window.confirm('Start Import?')) {
    const { $client } = useNuxtApp();
    await $client.admin.importCreate();
    importing.value = true;
  }
};

const posters = async () => {
  if (window.confirm('Regenerate all posters?')) {
    const { $client } = useNuxtApp();
    await $client.recordings.generatePostersCreate();
  }
};

const updateInfo = () => {
  if (window.confirm('Check all durations and update in database?')) {
    const { $client } = useNuxtApp();
    $client.recordings.updateinfoCreate()
        .then(() => isUpdating.value = true)
        .catch(res => console.error(res.error));
  }
};

const fetch = async () => {
  try {
    const { $client } = useNuxtApp();
    const { data } = await useAsyncData('infos', () => Promise.all([$client.info.infoDetail(1), $client.admin.importList()]));

    netInfo.value = data.value![0].data.netInfo;
    cpuInfo.value = data.value![0].data.cpuInfo;
    diskInfo.value = data.value![0].data.diskInfo;

    trafficSeries.value = trafficSeries.value.concat({
      in: netInfo.value.receiveBytes / 1024 / 1024,
      out: netInfo.value.transmitBytes / 1024 / 1024,
      time: Date.now()
    });
    cpuLoadSeries.value = cpuLoadSeries.value.concat({
      load: data.value![0].data.cpuInfo.loadCpu[0].load * 100,
      time: Date.now()
    });

    importing.value = data.value![1].data.isImporting || false;
    importProgress.value = data.value![1].data.progress || 0;
    importSize.value = data.value![1].data.size || 0;
  } catch (err) {
    alert(err);
  }
};

onBeforeRouteLeave(() => {
  if (import.meta.browser) {
    clearInterval(id.value);
  }
});

await fetch();
const { $client } = useNuxtApp();
const { data } = await useAsyncData('versions', () => $client.admin.versionList());
serverInfo.value = data.value!.data;

onMounted(async () => {
  if (import.meta.browser) {
    id.value = setInterval(fetch, 2500);
  }
});
</script>

<style scoped>
</style>
