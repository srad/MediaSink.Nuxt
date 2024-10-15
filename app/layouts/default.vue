<template>
  <div>
    <NavTop :routes="routes" :title="title" @add="showModal=true" :show-logout="true" @logout="logout"/>

    <main class="container-fluid" style="margin-top: 4rem">
      <NuxtLoadingIndicator/>
      <NuxtPage/>

      <ClientOnly>
        <ChannelModal
            :clear="showModal"
            :is-paused="false"
            :saving="saving"
            :show="showModal"
            title="Add Stream"
            @close="showModal=false"
            @save="save"/>
      </ClientOnly>
      <Toaster :toasts="toasts"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseJob, RequestsChannelRequest as ChannelRequest } from '~/services/api/v1/StreamSinkClient';
import { connectSocket, socketOn, MessageType, closeSocket } from '@/utils/socket';
import ChannelModal from '~/components/modals/ChannelModal.vue';
import NavTop from '~/components/navs/NavTop.vue';
import Toaster from '~/components/Toaster.vue';
import { useChannelStore } from '~~/stores/channel';
import { useJobStore } from '~~/stores/job';
import { useToastStore } from '~~/stores/toast';
import { useRuntimeConfig, useRouter } from 'nuxt/app';
import { computed, onMounted, useI18n, ref, onUnmounted } from '#imports';
import { useNuxtApp } from '#app/nuxt';
import type { JobMessage, TaskComplete, TaskInfo, TaskProgress } from '~/types';
import { reloadNuxtApp } from '#app/composables/chunk';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const config = useRuntimeConfig();

const channelStore = useChannelStore();
const toastStore = useToastStore();
const jobStore = useJobStore();

const { t } = useI18n();

const router = useRouter();

const title = config.public.appName;
const showModal = ref(false);
const saving = ref(false);

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

const save = (data: ChannelRequest) => {
  saving.value = true;
  channelStore.save(data)
      .then(() => showModal.value = false)
      .catch(err => alert(err))
      .finally(() => {
        saving.value = false;
      });
};

const logout = () => {
  const { $auth } = useNuxtApp();
  $auth.logout();
  reloadNuxtApp({
    path: '/login',
  });
};

onMounted(async () => {
  await connectSocket();

  socketOn(MessageType.JobStart, message => {
    const data = message as JobMessage<TaskInfo>;
    jobStore.start(data);
  });

  socketOn(MessageType.JobCreate, data => {
    const job = data as DatabaseJob;
    jobStore.create(job);
    toastStore.add({ title: 'Job created', message: `File ${job.filename} in ${job.channelName}` });
  });

  // Dispatch
  socketOn(MessageType.JobDone, message => {
    jobStore.done(message as JobMessage<TaskComplete>);
  });

  // Dispatch
  socketOn(MessageType.JobDeactivate, message => {
    jobStore.done(message as JobMessage<TaskComplete>);
  });

  socketOn(MessageType.JobDelete, jobId => {
    const id = jobId as number;
    jobStore.destroy(id);
    toastStore.add({
      title: 'Job destroyed',
      message: `Job id ${id} removed`
    });
  });

  socketOn(MessageType.JobDeleted, data => jobStore.destroy(data as number));
  socketOn(MessageType.JobProgress, data => jobStore.progress(data as JobMessage<TaskProgress>));

  socketOn(MessageType.ChannelOnline, data => channelStore.online(data as number));
  socketOn(MessageType.ChannelOffline, data => channelStore.offline(data as number));
  socketOn(MessageType.ChannelThumbnail, data => channelStore.thumbnail(data as number));

  socketOn(MessageType.ChannelStart, data => {
    const id = data as number;
    channelStore.start(id);
    toastStore.add({ title: 'Channel recording', message: `Channel id ${id}` });
  });

  await jobStore.load();
});

onUnmounted(() => {
  closeSocket();
});
</script>
