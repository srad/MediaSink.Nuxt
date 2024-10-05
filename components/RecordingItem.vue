<template>
  <div style="z-index: 10"
       class="card bg-light border position-relative shadow-sm bg-light mark p-0"
       :class="{'border-info': !checked, 'animate__animated animate__zoomOut': destroyed, 'border-2 border-danger': checked}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>
    <div class="position-relative">
      <div @click="checked=!checked" class="position-absolute" style="padding: 10px; right: 0; top: 0; z-index: 10;">
        <input v-if="props.showSelection" type="checkbox" :checked="checked" style="width: 20px; height: 20px">
      </div>
      <span class="badge bg-success position-absolute" style="user-select: none; z-index: 10; top: 10px; left: 10px">
        <span v-if="props.recording.width===1920">1080p</span>
        <span v-else-if="props.recording.width===2560">1440p</span>
        <span v-else-if="props.recording.width===1280">720p</span>
        <span v-else-if="props.recording.width===3840">4k</span>
        <span v-else>{{ props.recording.width }}x{{ props.recording.height }}</span>
      </span>
      <span v-if="props.recording.videoType==='cut'" class="badge bg-warning position-absolute" style="user-select: none; z-index: 10; bottom: 10px; right: 10px">cut</span>
      <RouterLink :to="link">
        <Preview class="card-img-top" :data="recording.recordingId" :preview-video="previewVideoUrl" :preview-image="previewPosterUrl" :preview-missing="!props.recording.previewCover"/>
      </RouterLink>
    </div>
    <div v-if="props.showTitle" class="card-body">
      <div class="card-title p-1 m-0 bg-primary" style="cursor:pointer;" @click="router.push(`/channel/${props.recording.channelId}/${props.recording.channelName}`)">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank">
            {{ props.recording.channelName }}
          </a>
        </h6>
      </div>
    </div>
    <RecordInfo
        :url="recordingUrl"
        :duration="props.recording.duration"
        :size="props.recording.size"
        :bit-rate="props.recording.bitRate"
        :bookmark="props.recording.bookmark"
        :created-at="props.recording.createdAt"
        :data="recording"
        :width="props.recording.width"
        :height="props.recording.height"
        @convert="convert"
        @bookmarked="bookmark"
        @preview="generatePreview"
        @destroy="destroyRecording"/>
  </div>
</template>

<script setup lang="ts">
import RecordInfo from './RecordInfo.vue';
import Preview from './Preview.vue';
import type { DatabaseRecording as RecordingResponse } from '../services/api/v1/StreamSinkClient';
import { useI18n, useState, watch, useRouter, useCookie } from '#imports'
import { useRuntimeConfig } from "nuxt/app";
import { useNuxtApp } from '#app/nuxt';

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'destroyed', value: RecordingResponse): void
  (e: 'checked', value: { checked: boolean, recording: RecordingResponse }): void
  (e: 'bookmark', value: RecordingResponse): void
}>();

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  select?: boolean
  showSelection: boolean
  showTitle: boolean
  recording: RecordingResponse
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const checked = useState('checked', () => props.select || false);
const busy = useState('busy', () => false);
const destroyed = useState('destroyed', () => false);

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const fileUrl = config.public.fileUrl;

const previewVideoUrl = `${fileUrl}/${props.recording.previewVideo}`;
// TODO: Pass a default image from the server, if the preview image is missing.
const previewPosterUrl = `${fileUrl}/${(props.recording.previewCover || (props.recording.channelName + '/.previews/live.jpg'))}`;
const recordingUrl = `${apiUrl + props.recording.channelName}/${props.recording.filename}`;

const { t } = useI18n();

const link = `/recordings/${props.recording.recordingId}`;

const router = useRouter();

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(checked, val => {
  emit('checked', { checked: val, recording: props.recording });
});

watch(() => props.select, val => {
  checked.value = val;
  emit('checked', { checked: val, recording: props.recording });
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const bookmark = async (recording: RecordingResponse, yesNo: boolean) => {
  try {
    busy.value = true;
    const { $client } = useNuxtApp();
    const method = yesNo ? $client.recordings.favPartialUpdate : $client.recordings.unfavPartialUpdate;
    await method(recording.recordingId);
    recording.bookmark = yesNo;
    emit('bookmark', recording);
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};

const generatePreview = async (recording: RecordingResponse) => {
  if (window.confirm('Generate new preview?')) {
    try {
      busy.value = true;
      const { $client } = useNuxtApp();
      await $client.recordings.previewCreate(recording.recordingId);
    } catch (ex) {
      alert(ex);
    } finally {
      busy.value = false;
    }
  }
};

const convert = async ({ recording, mediaType }: { recording: RecordingResponse, mediaType: string }) => {
  if (!window.confirm(`Convert '${recording.filename}' video to type '${mediaType}'?`)) {
    return;
  }

  try {
    busy.value = true;
    const { $client } = useNuxtApp();
    await $client.recordings.convertCreate(recording.recordingId, mediaType);
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};

const destroyRecording = async (recording: RecordingResponse) => {
  if (!window.confirm(t('crud.destroy', [ recording.filename ]))) {
    return;
  }

  try {
    busy.value = true;
    const { $client } = useNuxtApp();
    await $client.recordings.recordingsDelete(recording.recordingId);
    destroyed.value = true;
    setTimeout(() => emit('destroyed', recording), 1000);
  } catch (ex) {
    alert(ex);
  } finally {
    busy.value = false;
  }
};
</script>

<style scoped>
.mark:hover {
  outline: #da420d 2px solid;
}
</style>
