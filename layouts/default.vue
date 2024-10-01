<template>
  <div>
    <NavTop v-if="loggedIn" :routes="routes" :title="title" @add="showModal=true" :show-logout="loggedIn" @logout="logout"/>

    <main class="container-fluid" :data-logged-in="loggedIn">
      <RouterView v-slot="{ Component }">
        <KeepAlive include="SteamView,ChannelsView,JobView">
          <component :is="Component"></component>
        </KeepAlive>
      </RouterView>

      <ChannelModal
          v-if="loggedIn"
          :clear="showModal"
          :show="showModal"
          :is-paused="false"
          title="Add Stream"
          @save="save"
          @close="showModal=false"/>

      <Toaster v-if="loggedIn" :toasts="toasts"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseJob, RequestsChannelRequest as ChannelRequest } from '~/services/api/v1/StreamSinkClient';
import { createSocket, MessageType } from '~/utils/socket';
import ChannelModal from '../components/modals/ChannelModal';
import NavTop from '../components/navs/NavTop.vue';
import Toaster from '../components/Toaster.vue';
import { useChannelStore } from '~/stores/channel';
import { useJobStore } from '~/stores/job';
import type { TaskInfo } from '~/stores/job';
import { useToastStore } from '~/stores/toast';
import { useAuthStore } from '~/stores/auth';
import { useRuntimeConfig, computed, onMounted, watch, useI18n, useState } from "#imports";
// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const config = useRuntimeConfig();

const channelStore = useChannelStore();
const toastStore = useToastStore();
const authStore = useAuthStore();
const jobStore = useJobStore();

const { t } = useI18n();

const socket = createSocket();

const title = config.appName;
const showModal = useState('showModal', () => false);

const toasts = computed(() => toastStore.getToast);

const routes = [
  { icon: 'bi-water', url: '/streams', title: t('menu.streams') },
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
  auths
  router.push('/login');
};

const loginHandler = async (isLoggedIn: boolean) => {
  if (isLoggedIn) {
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

    socket.on(MessageType.JobDeleted, data => jobStore.destroy(data));
    socket.on(MessageType.JobProgress, data => jobStore.progress(data));
    socket.on(MessageType.JobPreviewProgress, data => jobStore.progress(data));

    socket.on(MessageType.ChannelOnline, data => channelStore.online(data));
    socket.on(MessageType.ChannelOffline, data => channelStore.offline(data));
    socket.on(MessageType.ChannelThumbnail, data => channelStore.thumbnail(data));

    socket.on(MessageType.ChannelStart, data => {
      const id = data as number;
      channelStore.start(id);
      toastStore.add({ title: 'Channel recording', message: `Channel id ${id}` });
    });

    await jobStore.load();
  } else {
    socket.close();
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