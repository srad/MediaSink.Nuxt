<template>
  <div>
    <div class="row mb-2">
      <div class="col">
        <div class="d-flex justify-content-end">
          <div class="d-flex justify-content-center me-2">
            <!-- filter row -->
            <div class="row align-items-center">
              <div class="col-auto">
                <select ref="filterColumnSelect" class="form-select form-select-sm" v-model="filterColumn" @change="routeFilter">
                  <option value="" style="font-weight: bold" disabled>{{ t('filter.orderBy') }}</option>
                  <option v-for="col in columns" :key="col[1]" :value="col[1]">{{ col[0] }}</option>
                </select>
              </div>
              <div class="col-auto">
                <select ref="sortOrderSelect" class="form-select form-select-sm text-capitalize" v-model="filterOrder" @input="routeFilter">
                  <option value="" style="font-weight: bold" disabled>{{ t('filter.order') }}</option>
                  <option v-for="o in order" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
              <div class="col-auto">
                <select ref="filterLimitSelect" id="limit" class="form-select form-select-sm" v-model="filterLimit" @change="routeFilter">
                  <option value="" style="font-weight: bold" disabled>{{ t('filter.limit') }}</option>
                  <option v-for="limit in limits" :key="limit" :value="limit">{{ limit }}</option>
                </select>
              </div>

              <div class="col-auto">
                <button type="button" class="btn btn-primary" @click="resetFilters">{{ t('filter.reset') }}</button>
              </div>
            </div>
            <!-- filter row -->
          </div>
          <button class="btn btn-primary btn-sm" @click="routeFilter" v-if="route.params.type==='random'">
            Refresh
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="row">
    <div v-for="recording in recordings" :key="recording.recordingId" class="mb-3 col-lg-6 col-xl-4 col-xxl-4 col-md-8 col-sm-8">
      <RecordingItem :show-title="true" :recording="recording" @destroyed="destroyRecording" :show-selection="false"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseRecording, DatabaseRecording as RecordingResponse } from '~/services/api/v1/StreamSinkClient';
import RecordingItem from '../components/RecordingItem.vue';
import { ref, watch, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNuxtApp } from '#app/nuxt';
import { useAsyncData } from '#app';
import { useHead } from '#imports';
import { useI18n } from 'vue-i18n';

useHead({
  title: 'Latest Recordings'
});

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

watch(() => route.query, () => fetch());

const sortOrderSelect = useTemplateRef<HTMLSelectElement>('sortOrderSelect');
const filterColumnSelect = useTemplateRef<HTMLSelectElement>('filterColumnSelect');
const filterLimitSelect = useTemplateRef<HTMLSelectElement>('filterLimitSelect');

let filterOrder: string = route.query.order as string || 'desc';
let filterColumn: string = route.query.column as string || 'created_at';
let filterLimit: string = route.query.limit as string || '25';

const limits = [
  25,
  50,
  100,
  200,
];

const columns = [['Created at', 'created_at'], ['Filesize', 'size'], ['Video duration', 'duration']];

const order: string[] = ['asc', 'desc'];

const recordings = ref<RecordingResponse[]>([]);

const routeFilter = () => {
  router.replace({
    path: route.path,
    query: {
      order: sortOrderSelect.value?.value,
      column: filterColumnSelect.value?.value,
      limit: filterLimitSelect.value?.value,
    },
    force: true
  });
};

const resetFilters = () => {
  filterOrder = order[1]!;
  filterColumn = columns[0]![1]!;
  filterLimit = '25';
  routeFilter();
};

const destroyRecording = (recording: RecordingResponse) => {
  for (let i = 0; i < recordings.value.length; i += 1) {
    if (recordings.value[i]!.filename === recording.filename) {
      recordings.value.splice(i, 1);
      break;
    }
  }
};

const fetch = async () => {
  const { $client } = useNuxtApp();
  const { data } = await useAsyncData<DatabaseRecording[]>('recordings', () => $client.recordings.filterDetail(route.query.column as string || 'created_at', route.query.order as string || 'desc', route.query.limit as string || '25'));
  recordings.value = data.value || [];
};

await fetch();
</script>
