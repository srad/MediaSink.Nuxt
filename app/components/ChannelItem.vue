<template>
  <div class="card bg-light mb-3 border shadow-sm position-relative border-primary" :class="{'animate__animated animate__zoomOut': destroyed, 'opacity-50': props.channel.isPaused, 'border-primary': !props.channel.isRecording}">
    <div v-if="busy" class="bg-dark opacity-50 position-absolute w-100 h-100 d-flex align-items-center justify-content-center" style="z-index: 100">
      <div class="loader"></div>
    </div>

    <NuxtLink class="text-decoration-none" :to="`/channel/${props.channel.channelId}/${props.channel.channelName}`">
      <Preview :data="props.channel.channelId!"
               :preview-image="previewImage"
               class="card-img-top"
               @selected="viewFolder(props.channel.channelId!, props.channel.channelName)"/>
    </NuxtLink>
    <div class="card-body">
      <div class="card-title p-1 m-0" :class="{'bg-primary' : !props.channel.isRecording && !props.channel.isOnline, 'bg-danger': props.channel.isRecording, 'bg-success': props.channel.isOnline && !props.channel.isRecording}">
        <h6 class="p-2 m-0 text-white">
          <a class="text-white" target="_blank" :href="props.channel.url">
            {{ props.channel.displayName }}
            <i class="bi bi-link"/>
          </a>
        </h6>
      </div>
    </div>
    <StreamInfo :channel="props.channel" :fav="props.channel.fav" @edit="data => emit('edit', data)" @fav="fav" @unfav="unfav" @pause="pause" @destroy="destroyChannel"/>
  </div>
</template>

<script setup lang="ts">
import StreamInfo from './StreamInfo.vue';
import Preview from './Preview.vue';
import type { ServicesChannelInfo as ChannelInfo } from '~/services/api/v1/StreamSinkClient';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useChannelStore } from '~~/stores/channel';
import { useNuxtApp } from '#app/nuxt';
import { useRuntimeConfig } from 'nuxt/app';
import { useI18n } from 'vue-i18n';

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{ (e: 'edit', value: ChannelInfo): void }>();

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{ channel: ChannelInfo }>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const channelStore = useChannelStore();
const { t } = useI18n();

const router = useRouter();

const config = useRuntimeConfig();
const fileUrl = config.public.fileUrl;

const destroyed = ref(false);
const busy = ref(false);

const previewImage = computed(() => fileUrl + '/' + props.channel.preview);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const fav = async (channel: ChannelInfo) => {
  const { $client } = useNuxtApp();
  await $client.channels.favPartialUpdate(channel.channelId!);
  channelStore.fav(channel.channelId);
};

const unfav = async (channel: ChannelInfo) => {
  const { $client } = useNuxtApp();
  await $client.channels.unfavPartialUpdate(channel.channelId!);
  channelStore.unfav(channel.channelId);
};

const destroyChannel = async (channel: ChannelInfo) => {
  if (window.confirm(t('crud.destroy', [channel.channelName]))) {
    try {
      const { $client } = useNuxtApp();
      busy.value = true;
      await $client.channels.channelsDelete(channel.channelId!);
      destroyed.value = true;
      setTimeout(() => {
        channelStore.destroy(channel.channelId);
      }, 1000);
    } catch (ex) {
      alert(ex);
    } finally {
      busy.value = false;
    }
  }
};

const pause = async (channel: ChannelInfo) => {
  try {
    const { $client } = useNuxtApp();
    busy.value = true;
    const method = channel.isPaused ? $client.channels.resumeCreate : $client.channels.pauseCreate;
    await method(channel.channelId!);

    // Invert current paused mode.
    channelStore[(channel.isPaused ? 'resume' : 'pause')](channel.channelId);
  } catch (err) {
    console.log(err);
  } finally {
    busy.value = false;
  }
};

const viewFolder = (id: number, name: string) => router.push(`/channel/${id}/${name}`);
</script>
