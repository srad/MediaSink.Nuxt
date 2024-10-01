<template>
  <ul class="list-group list-group-flush">
    <li class="list-group-item d-flex justify-content-between bg-info-light bg-gradient">
      <div>
        <span class="badge me-2 user-select-none" :class="{'bg-danger text-white border border-danger blink': channel.isRecording, 'bg-light text-primary border-info border': !channel.isRecording}">Recording</span>
        <span class="badge user-select-none" :class="{'bg-success text-white border border-success': channel.isOnline, 'bg-light text-primary border-info border': !channel.isOnline}">Online</span>
      </div>
    </li>
    <li class="list-group-item d-flex justify-content-between bg-info-light-2">
      <span v-if="channel.isRecording">
        <i class="bi bi-stopwatch me-1"></i>
        <span>{{ minutes }}:{{ seconds }}min</span>
      </span>
      <span v-else>&nbsp;</span>
      <div>
        <span><i class="bi bi-device-hdd"></i> {{
            (channel.recordingsSize / 1000 / 1000 / 1000).toFixed(1)
          }}GB ({{ channel.recordingsCount }})</span>
      </div>
    </li>
    <li class="list-group-item bg-info-light-2">
      <template v-if="!showTagInput && tagArray">
        <span v-for="tag in tagArray" @click="router.push({query: {tag}})" class="badge bg-secondary text-dark me-1 user-select-none" :key="tag">{{
            tag
          }}
          <span @click="destroyTag(tag)" class="bi bi-x" style="z-index: 1"></span>
        </span>
      </template>
      <div v-show="showTagInput" class="input-group input-group-sm">
        <input class="form-control form-control-sm" ref="tagInput" v-model.lazy="tagVal" type="text" :name="`${channel.channelId}_tag`" autocapitalize="off" autocomplete="off">
        <button class="btn btn-sm btn-success" @click="addTag">save</button>
      </div>
      <span v-show="!showTagInput" class="badge bg-success" @click="showTagInput=true">
          <span class="bi bi-plus"></span>
      </span>
    </li>
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
import { watch, computed, onMounted, onUnmounted, useState, useRouter } from '#imports';
import { ServicesChannelInfo as ChannelResponse } from '../services/api/v1/StreamSinkClient';
import { createClient } from '../services/api/v1/ClientFactory';
import { validTag } from '../utils/parser';
import FavButton from "./controls/FavButton.vue";

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

const tagArray = useState<string[]>('tagArray', () => props.channel.tags || []);
const tagVal = useState('tagVal', () => '');
const showTagInput = useState('showTagInput', () => false);
const thread = useState<NodeJS.Timeout | number | null>('thread', () => null);
const secRecording = useState('secRecording', () => props.channel.minRecording * 60);
const tagInput = useState<HTMLInputElement | null>('tagInput', () => null);

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
  const api = createClient();
  await api.channels.tagsPartialUpdate(props.channel.channelId!, { tags: removeTag });
  tagArray.value = removeTag;
};

const addTag = () => {
  const tag = tagVal.value.trim().toLowerCase();

  // No value, cancel
  if (tag === '') {
    showTagInput.value = false;
    return;
  }

  if (!validTag(tag)) {
    alert("Illegal tag: " + tag);
  }

  // Optimistic add.
  tagArray.value.push(tag);

  const api = createClient();
  api.channels.tagsPartialUpdate(props.channel.channelId!, { tags: tagArray.value })
      .then(() => {
        showTagInput.value = false;
        tagVal.value = '';
      })
      .catch(e => {
        alert(e.message);
        // Fail, remove again.
        tagArray.value.pop();
      })
      .finally(() => tagVal.value = '');
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
