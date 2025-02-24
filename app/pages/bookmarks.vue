<template>
  <div class="row my-2">
    <div v-for="recording in recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
      <RecordingItem
          :recording="recording"
          @destroyed="destroyRecording"
          @bookmark="bookmark"
          :show-selection="false"
          :show-title="false"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseRecording } from '~/services/api/v1/StreamSinkClient';
import RecordingItem from '../components/RecordingItem.vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNuxtApp } from '#app/nuxt';
import { useAsyncData } from '#app';
import { useHead } from '#imports';

useHead({
  title: 'Bookmarks'
});

const { t } = useI18n();
const recordings = ref<DatabaseRecording[]>([]);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const removeItem = (recording: DatabaseRecording) => {
  const i = recordings.value.findIndex(r => r.filename === recording.filename);
  if (i !== -1) {
    recordings.value.splice(i, 1);
  }
};

const bookmark = (recording: DatabaseRecording) => {
  if (!recording.bookmark) {
    removeItem(recording);
  }
};

const destroyRecording = async (recording: DatabaseRecording) => {
  if (!window.confirm(t('crud.destroy', [recording.filename]))) {
    return;
  }

  try {
    const { $client } = useNuxtApp();
    await $client.recordings.recordingsDelete(recording.recordingId);
    removeItem(recording);
  } catch (ex) {
    alert(ex);
  }
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

const { $client } = useNuxtApp();
const { data } = await useAsyncData('bookmarkedRecordings', () => $client.recordings.bookmarksList());
recordings.value = (data.value || []) as DatabaseRecording[];
</script>
