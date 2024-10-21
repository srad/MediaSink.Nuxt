<template>
  <ul class="list-group list-group-flush">

    <li class="list-group-item d-flex justify-content-between bg-info-light bg-gradient">
      <div>
        <span class="badge me-2 user-select-none" :class="{'bg-danger text-white border border-danger blink': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
        <span class="badge user-select-none" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
      </div>
    </li>

    <li class="list-group-item d-flex justify-content-between py-1">
      <span v-if="channel.isRecording">
        <i class="bi bi-stopwatch me-1"></i>
        <span>{{ minutes }}:{{ seconds }}min</span>
      </span>
      <span v-else>&nbsp;</span>
      <div>
        <span><i class="bi bi-device-hdd"></i> {{
            (channel.recordingsSize / 1024 / 1024 / 1024).toFixed(1)
          }}GB ({{ channel.recordingsCount }})</span>
      </div>
    </li>

    <!-- tags -->
    <li class="list-group-item py-1">
      <div class="d-flex">
        <div v-if="!showTagInput && tagArray" v-for="tag in tagArray" class="d-flex badge bg-secondary text-dark me-1 user-select-none" :key="tag">
          <span @click="router.push({query: {tag}})">{{ tag }}</span>
          <i @click="destroyTag(tag)" class="bi bi-x ms-1" style="z-index: 1"></i>
        </div>
        <span v-show="!showTagInput" class="badge bg-primary" @click="showTagInput=true;tagInput?.focus()">
          Tag<span class="bi bi-plus"></span>
      </span>
      </div>

      <div v-show="showTagInput" class="input-group input-group-sm">
        <form @submit.prevent="addTag">
          <div class="input-group">
            <input :disabled="processingTag" ref="tagInput" class="form-control form-control-sm border-primary" v-model.lazy="tagVal" type="text" :name="`${channel.channelId}_tag`" autocapitalize="off" autocomplete="off">
            <button type="submit" class="btn btn-sm btn-primary" :disabled="processingTag">save</button>
          </div>
        </form>
      </div>
    </li>
    <!-- /tags -->

    <li class="list-group-item bg-info-light d-flex justify-content-between fs-6">
      <div class="d-flex w-75">
        <span class="form-check form-switch me-2">
          <input @click="emit('pause', channel)" class="form-check-input" type="checkbox" :checked="!channel.isPaused" :id="`${channel.channelId}_isPaused`" :name="`${channel.channelId}_isPaused`">
          <label class="form-check-label" :for="`${channel.channelId}_isPaused`">Record</label>
        </span>
        <FavButton :data="channel" :faved="fav" @fav="emit('unfav', channel)" @unfav="emit('fav', channel)"/>
      </div>

      <div class="d-flex justify-content-evenly w-25">
        <a @click="emit('edit', channel)" class="me-2">
          <i class="bi bi-pencil-square"></i>
        </a>
        <a class="text-danger" @click="emit('destroy', channel)">
          <i class="bi bi-trash3-fill"></i>
        </a>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { watch, computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { ServicesChannelInfo as ChannelResponse } from '~/services/api/v1/StreamSinkClient';
import { validTag } from '~/utils/parser';
import FavButton from './controls/FavButton.vue';
import { useNuxtApp } from '#app/nuxt';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  fav: boolean,
  channel: ChannelResponse,
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'unfav', value: ChannelResponse): void
  (e: 'fav', value: ChannelResponse): void
  (e: 'edit', value: ChannelResponse): void
  (e: 'destroy', value: ChannelResponse): void
  (e: 'pause', value: ChannelResponse): void
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const tagArray = ref<string[]>(props.channel.tags || []);
const tagVal = ref('');
const showTagInput = ref(false);
const thread = ref<NodeJS.Timeout | number | null>(null);
const secRecording = ref(props.channel.minRecording * 60);
const tagInput = ref<HTMLInputElement | null>(null);
const processingTag = ref(false);
const router = useRouter();

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(showTagInput, (val) => {
  if (val) {
    tagInput.value!.focus();
  }
});

const minutes = computed(() => (secRecording.value / 60).toFixed(0));
const seconds = computed(() => {
  let x = (secRecording.value % 60).toFixed(0);
  return (x.length < 2 ? '0' + String(x) : x);
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const destroyTag = async (tag: string) => {
  const removeTag = tagArray.value?.filter(t => t !== tag);
  const { $client } = useNuxtApp();
  await $client.channels.tagsPartialUpdate(props.channel.channelId!, { tags: removeTag });
  tagArray.value = removeTag;
};

const addTag = async () => {
  try {
    const tag = tagVal.value.trim().toLowerCase();

    // No value, cancel
    if (tag.trim() === '') {
      showTagInput.value = false;
      return;
    }

    if (!validTag(tag)) {
      throw new Error(`Illegal tag: ${tag}`);
    }

    processingTag.value = true;

    const { $client } = useNuxtApp();
    const res = await $client.channels.tagsPartialUpdate(props.channel.channelId!, { tags: tagArray.value.concat(tag) });
    tagArray.value.push(tag);
    showTagInput.value = false;
    tagVal.value = '';
  } catch (e: any) {
    alert(e);
  } finally {
    processingTag.value = false;
    tagVal.value = '';
  }
};

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onMounted(() => {
  if (props.channel.isRecording) {
    // Increase the seconds to indicate liveness.
    thread.value = setInterval(() => {
      secRecording.value += 1;
    }, 1000);
  }
});

onUnmounted(() => {
  if (props.channel.isRecording && thread.value) {
    clearInterval(thread.value);
  }
});
</script>

<style scoped>

</style>
