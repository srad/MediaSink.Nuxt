<template>
  <div class="row my-2">
    <div class="col">
      <div class="d-flex justify-content-end">
        <div class="d-flex justify-content-center me-3">
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <label for="limit" class="col-form-label fw-bold">Limit</label>
            </div>
            <div class="col-auto">
              <select id="limit" class="form-select" v-model="filterLimit" @change="fetch">
                <option v-for="limit in limits" :key="limit" :value="limit">{{ limit }}</option>
              </select>
            </div>
            <div class="col-auto">
              <button class="btn btn-primary" @click="fetch">Refresh</button>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" @click="fetch" v-if="route.params.type==='random'">
          Refresh
        </button>
      </div>
      <hr/>
    </div>
  </div>
  <div class="row">
    <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
      <RecordingItem :show-title="true" :recording="recording" @destroyed="destroyRecording" :show-selection="false"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecordingItem from '@/components/RecordingItem.vue';
import type { DatabaseRecording, DatabaseRecording as RecordingResponse } from '~/services/api/v1/StreamSinkClient';
import { watch, ref } from 'vue';
import { useNuxtApp } from '#app/nuxt';
import { useRoute } from 'vue-router';
import { useAsyncData } from '#app';

const route = useRoute();

watch(route, () => {
  fetch();
});

const filterLimit = route.params.limit as string || '25';
const limits = ref([
  25,
  50,
  100,
  200,
  500,
  1000
]);

const recordings = ref<RecordingResponse[]>([]);

const fetch = async () => {
  const { $client } = useNuxtApp();
  const { data } = await useAsyncData<DatabaseRecording[]>('randomRecordings', () => $client.recordings.randomDetail(filterLimit));
  recordings.value = data.value || [];
};

const destroyRecording = (recording: RecordingResponse) => {
  for (let i = 0; i < recordings.value.length; i += 1) {
    if (recordings.value[i]!.filename === recording.filename) {
      recordings.value.splice(i, 1);
      break;
    }
  }
};

await fetch();
</script>
