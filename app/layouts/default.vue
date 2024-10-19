<template>
  <div>
    <NavTop :routes="routes" :title="title" @add="showModal=true" :show-logout="true" @logout="logout"/>

    <main class="container-fluid" style="margin-top: 4rem">
      <NuxtLoadingIndicator/>
      <NuxtPage/>

      <ChannelModal
          :clear="showModal"
          :is-paused="false"
          :saving="saving"
          :show="route.query?.channel ==='add'"
          title="Add Stream"
          @close="hideModal"
          @save="save"/>

      <Toaster :toasts="toasts"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  type DatabaseJob,
  DatabaseJobOrder,
  DatabaseJobStatus,
  type RequestsChannelRequest as ChannelRequest
} from '~/services/api/v1/StreamSinkClient';
import { connectSocket, socketOn, MessageType, closeSocket } from '@/utils/socket';
import ChannelModal from '~/components/modals/ChannelModal.client.vue';
import NavTop from '~/components/navs/NavTop.vue';
import Toaster from '~/components/Toaster.vue';
import { useChannelStore } from '~~/stores/channel';
import { useJobStore } from '~~/stores/job';
import { useToastStore } from '~~/stores/toast';
import { useRuntimeConfig, useRouter, onBeforeRouteUpdate } from 'nuxt/app';
import { computed, onMounted, ref, onUnmounted, watch } from 'vue';
import { useNuxtApp } from '#app/nuxt';
import type { JobMessage, TaskComplete, TaskInfo, TaskProgress } from '~/types';
import { reloadNuxtApp } from '#app/composables/chunk';
import { useAsyncData } from '#app';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const config = useRuntimeConfig();

const channelStore = useChannelStore();
const toastStore = useToastStore();
const jobStore = useJobStore();

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const title = config.public.appName;
const showModal = ref(false);
const saving = ref(false);

watch(() => route.query, newQuery => {
  showModal.value = 'channel' in newQuery;
});

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

const save = async (data: ChannelRequest) => {
  try {
    saving.value = true;
    await channelStore.save(data);
    hideModal();
  } catch (e: any) {
    toastStore.error(e);
  } finally {
    saving.value = false;
  }
};

const hideModal = () => {
  const query = { ...route.query };
  delete query.channel;
  router.replace({ path: route.path, query });
};

const logout = () => {
  const { $auth } = useNuxtApp();
  $auth.logout();
  reloadNuxtApp({
    path: '/login',
  });
};

const { $client } = useNuxtApp();
const { data } = await useAsyncData('jobs', () => $client.jobs.listCreate({
  skip: 0,
  take: 100,
  states: [DatabaseJobStatus.StatusJobOpen],
  sortOrder: DatabaseJobOrder.JobOrderASC
}));
if (data.value) {
  jobStore.jobs = data.value.jobs!;
  jobStore.jobsCount = data.value.totalCount;
}

onMounted(async () => {
  if (!import.meta.browser) {
    return;
  }

  await connectSocket();

  socketOn(MessageType.JobStart, message => {
    const data = message as JobMessage<TaskInfo>;
    jobStore.start(data);
  });

  socketOn(MessageType.JobCreate, data => {
    const job = data as DatabaseJob;
    jobStore.create(job);
    toastStore.success({ title: 'Job created', message: `File ${job.filename} in ${job.channelName}` });
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
    toastStore.success({
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
    toastStore.info({ title: 'Channel recording', message: `Channel id ${id}` });
  });
});

watch(showModal, val => {
  if (val) {
    router.push({ query: { channel: 'add' } });
  } else {
    hideModal();
  }
});

onUnmounted(() => {
  closeSocket();
});
</script>
