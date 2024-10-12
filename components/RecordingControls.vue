<template>
  <div class="justify-content-between d-flex">
    <JobStatus :jobs="jobs" :total-count="totalCount"/>
    <button v-if="!props.recording" class="btn btn-info d-flex" @click="emit('record', true)">
      <i class="bi bi-play-fill"></i>
      <span class="ms-1 d-none d-sm-inline">{{ t('navtop.startRecording') }}</span>
    </button>
    <button v-else class="btn btn-danger blink d-flex" @click="emit('record', false)">
      <i class="bi bi-stop-fill"></i>
      <span class="d-none ms-2 d-xl-inline d-flex justify-content-between ms-1">{{ t('navtop.stopRecording') }}</span>
    </button>
    <button class="btn btn-success ms-2 d-flex d-none d-sm-none d-md-block" @click="emit('add')">
      <i class="bi bi-plus"></i>
      <span class="ms-1">
        {{ t('navtop.addStream') }}
      </span>
    </button>

    <button v-if="route.path.startsWith('/streams')" class="btn btn-lg btn-success shadow-sm border-success-subtle d-md-none position-fixed d-flex justify-content-center align-items-center" style="bottom: 5%; right: 10%; border-radius: 50%; width: 3.5rem; height: 3.5rem;" @click="emit('add')">
      <i class="bi bi-plus-lg fw-bold"></i>
    </button>

    <button v-if="showLogout" type="button" class="ms-2 btn btn-warning" @click="emit('logout')">
      <i class="bi bi-box-arrow-right"></i>
      <span class="d-none d-xl-inline d-flex justify-content-between ms-1">Logout</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import JobStatus from './JobStatus.vue';
import type { DatabaseJob } from '~/services/api/v1/StreamSinkClient';
import { useI18n, useRoute } from '#imports';

const { t } = useI18n();
const route = useRoute();

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'logout'): void
  (e: 'record', value: boolean): void
}>();

const props = defineProps<{
  jobs: DatabaseJob[],
  recording: boolean
  showLogout: boolean
  totalCount: number;
}>();
</script>

<style scoped>

</style>
