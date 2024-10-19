<template>
  <div>
    <ModalConfirmDialog :show="showConfirmRecording" @cancel="showConfirmRecording=false" @confirm="record">
      <template v-slot:header>
        <span v-if="isRecording">Stop Recording</span>
        <span v-else>Resume Recording</span>
      </template>
      <template v-slot:body>
        <div v-if="isRecording">
          Do you want to stop recording?
        </div>
        <div v-else>
          Do you want to continue recording?
        </div>
      </template>
    </ModalConfirmDialog>

    <nav class="navbar navbar-dark navbar-expand-lg fixed-top shadow-sm border-bottom border-primary-subtle m-0 d-flex bg-primary">
      <div class="container-fluid">
        <AppBrand class="mr-auto" :title="title"/>

        <span class="text-danger fw-bold d-none d-sm-inline">
          <i v-if="heartBeatNextUpdate>=0" class="bi blink bi-heart-pulse-fill"/>
          <i v-else class="bi bi-heart-pulse"></i>
        </span>

        <div class="offcanvas offcanvas-end bg-dark" :class="{'show': showNav}" data-bs-backdrop="static" tabindex="-1" aria-labelledby="collapsibleNavbarLabel" id="collapsibleNavbar">
          <div class="offcanvas-header bg-primary text-white">
            <AppBrand class="mr-auto" :title="title"/>
            <button type="button" class="btn-close btn-close-white" @click="showNav = !showNav"></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1">
              <li class="nav-item" style="cursor: pointer" v-for="link in props.routes" :key="link.url" @click="() => {showNav=false; router.push(link.url);}">
                <a :class="{active: route.path === link.url}" @click="collapseNav=true" class="nav-link">
                  <span data-bs-dismiss="offcanvas" data-bs-target="#collapsibleNavbar">{{ link.title }}</span>
                </a>
              </li>
              <li class="nav-item d-flex align-items-center">
                <DiskStatus :pcent="diskAvailablePercentage"/>
              </li>
              <li class="nav-item d-none d-lg-block">
                <RecordingControls :jobs="jobs" :total-count="jobsCount" :is-recording="isRecording" @add="emit('add')" @record="showConfirmRecording=true" :show-logout="showLogout" @logout="emit('logout')"/>
              </li>
            </ul>
          </div>
        </div>

        <div class="d-lg-none">
          <RecordingControls :jobs="jobs" :total-count="jobsCount" :is-recording="isRecording" @add="emit('add')" @record="showConfirmRecording=true" :show-logout="showLogout" @logout="emit('logout')"/>
        </div>

        <button class="navbar-toggler d-l-none" type="button" @click="showNav = !showNav">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { MessageType, socketOn, connectSocket, closeSocket } from '~/utils/socket';
import { useChannelStore } from '~~/stores/channel';
import { useJobStore } from '~~/stores/job';
import { computed, onMounted, watch, useRoute, useRouter, ref, onUnmounted, useAsyncData } from '#imports';

import DiskStatus from '../DiskStatus.vue';
import RecordingControls from '../RecordingControls.vue';
import AppBrand from '../AppBrand.vue';
import ModalConfirmDialog from '../modals/ModalConfirmDialog.vue';
import { useNuxtApp } from '#app/nuxt';
import type { HelpersDiskInfo } from '~/services/api/v1/StreamSinkClient';

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  routes: { icon: string, url: string, title: string }[]
  title: string
  showLogout: boolean
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'logout'): void
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const { $client } = useNuxtApp();
const { data } = await useAsyncData('info', () => Promise.all<[Promise<boolean>, Promise<HelpersDiskInfo>]>([$client.isRecording(), $client.info.diskList()]), {
  lazy: true
});
const [recRes, diskRes] = data.value!;

const channelStore = useChannelStore();
const jobStore = useJobStore();

const diskAvailablePercentage = ref(diskRes.pcent);
const collapseNav = ref(true);
const isRecording = ref(recRes);
const heartBeatNextUpdate = ref<number>(-1);
const route = useRoute();
const showNav = ref(false);
const showConfirmRecording = ref(false);

const router = useRouter();

let thread: undefined | ReturnType<typeof setInterval> = undefined;

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const jobs = computed(() => jobStore.getOpen);
const jobsCount = computed(() => jobStore.jobsCount);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const query = async () => {
  const { $client } = useNuxtApp();
  const [recRes, diskRes] = await Promise.all<[Promise<boolean>, Promise<HelpersDiskInfo>]>([$client.isRecording(), $client.info.diskList()]);
  isRecording.value = recRes;
  diskAvailablePercentage.value = diskRes.pcent;
};

const record = async () => {
  try {
    const { $client } = useNuxtApp();
    if (isRecording.value) {
      await $client.recorder.pauseCreate();
      channelStore.stop();
      isRecording.value = false;
    } else {
      await $client.recorder.resumeCreate();
      isRecording.value = true;
    }
  } catch (err) {
    console.error(err);
  } finally {
    showConfirmRecording.value = false;
  }
};

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(route, () => collapseNav.value = true);

onMounted(async () => {
  if (!import.meta.browser) {
    return;
  }
  await connectSocket();

  socketOn(MessageType.HeartBeat, nextUpdate => {
    heartBeatNextUpdate.value = nextUpdate as number;
    const id = setInterval(() => {
      heartBeatNextUpdate.value -= 1;
      if (heartBeatNextUpdate.value <= 0) {
        clearInterval(id);
      }
    }, 1000);
  });

  thread = setInterval(query, 1000 * 10);
});

onUnmounted(() => {
  closeSocket();
  clearInterval(thread);
});
</script>
