<template>
  <div>
    <NavTop :routes="routes" :title="title" @add="showModal=true" :show-logout="true" @logout="logout"/>

    <main class="container-fluid" style="margin-top: 4rem">
      <nuxt-loading-indicator/>
      <NuxtPage :keepalive="{include: 'SteamView,ChannelsView,JobView'}"/>

      <ChannelModal
          :clear="showModal"
          :show="showModal"
          :is-paused="false"
          title="Add Stream"
          @save="save"
          @close="showModal=false"/>

      <Toaster :toasts="toasts"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseJob, RequestsChannelRequest as ChannelRequest } from '@/services/api/v1/StreamSinkClient';
import { createSocket, MessageType, SocketManager } from '@/utils/socket';
import ChannelModal from '~/components/modals/ChannelModal.vue';
import NavTop from '@/components/navs/NavTop.vue';
import Toaster from '@/components/Toaster.vue';
import { useChannelStore } from '@/stores/channel';
import { type TaskProgress, useJobStore } from '@/stores/job';
import type { TaskInfo } from '@/stores/job';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { useRuntimeConfig, useRouter } from 'nuxt/app';
import { computed, onMounted, watch, useI18n, ref } from '#imports';
import { useNuxtApp } from '#app/nuxt';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const config = useRuntimeConfig();

let socket: SocketManager | null = null;

const channelStore = useChannelStore();
const toastStore = useToastStore();
const authStore = useAuthStore();
const jobStore = useJobStore();

const { t } = useI18n();

const router = useRouter();

const title = config.public.appName;
const showModal = ref(false);

const toasts = computed(() => toastStore.getToast);

const routes = [
  { icon: 'bi-water', url: '/streams/live', title: t('menu.streams') },
  { icon: 'bi-list', url: '/channels', title: t('menu.channels') },
  { icon: 'bi-stopwatch', url: '/filter', title: t('menu.latest') },
  { icon: 'bi-hypnotize', url: '/random', title: t('menu.random') },
  { icon: 'bi-star-fill', url: '/bookmarks', title: t('menu.favs') },
  { icon: 'bi-eye-fill', url: '/admin', title: t('menu.admin') }
];

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const save = (data: ChannelRequest) => channelStore.save(data)
    .catch(err => alert(err))
    .finally(() => showModal.value = false);

const logout = () => {
  const { $auth } = useNuxtApp();
  $auth.logout();
  router.push('/login');
};

const loginHandler = async (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    socket = createSocket();

    socket.connect();

    socket.on(MessageType.JobStart, data => {
      const job = data as TaskInfo;
      jobStore.start(job);
    });
    // Dispatch
    socket.on(MessageType.JobCreate, data => {
      const job = data as DatabaseJob;
      jobStore.create(job);
      toastStore.add({ title: 'Job created', message: `File ${job.filename} in ${job.channelName}` });
    });

    socket.on(MessageType.JobDestroy, data => {
      const d = data as TaskInfo;
      const job = d.job;
      jobStore.destroy(job.jobId);
      toastStore.add({
        title: 'Job destroyed',
        message: `File ${job.filename} in ${job.channelName}`
      });
    });

    socket.on(MessageType.JobPreviewDone, data => {
      const d = data as TaskInfo;
      const job = d.job;
      jobStore.done(job);
      toastStore.add({ title: 'Job done', message: `File ${job.filename} in ${job.channelName}` });
    });

    socket.on(MessageType.JobDeleted, data => jobStore.destroy(data as number));
    socket.on(MessageType.JobProgress, data => jobStore.progress(data as TaskProgress));
    socket.on(MessageType.JobPreviewProgress, data => jobStore.progress(data as TaskProgress));

    socket.on(MessageType.ChannelOnline, data => channelStore.online(data as number));
    socket.on(MessageType.ChannelOffline, data => channelStore.offline(data as number));
    socket.on(MessageType.ChannelThumbnail, data => channelStore.thumbnail(data as number));

    socket.on(MessageType.ChannelStart, data => {
      const id = data as number;
      channelStore.start(id);
      toastStore.add({ title: 'Channel recording', message: `Channel id ${id}` });
    });

    await jobStore.load();
  } else {
    socket?.close();
  }
};

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const loggedIn = computed(() => authStore.isLoggedIn);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(loggedIn, isLoggedIn => loginHandler(isLoggedIn));

onMounted(() => {
  loginHandler(loggedIn.value);
});
</script>
