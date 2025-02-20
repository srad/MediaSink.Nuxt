<template>
  <div>
    <ModalConfirmDialog :show="showConfirmDialog" @cancel="showConfirmDialog=false" @confirm="cutVideo">
      <template v-slot:header>
        <span class="fs-5">Confirm your video cut</span>
      </template>
      <template v-slot:body>
        <MarkingsTable
            v-if="showConfirmDialog"
            :show-destroy="false"
            :markings="markings"
            @destroy="(marking: Marking) => destroyMarking(marking)"
            @selected="(marking: Marking) => selectMarking(marking)"/>

        <hr/>

        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" v-model="deleteFileAfterCut">
          <label class="form-check-label" for="flexSwitchCheckDefault">Delete file after cut?</label>
        </div>
      </template>
    </ModalConfirmDialog>

    <BusyOverlay :visible="busy"></BusyOverlay>
    <div class="modal show m-0 p-0m position-absolute" tabindex="-1" style="display: block !important;">
      <div class="modal-dialog modal-fullscreen p-0">
        <div class="modal-content">
          <template v-if="recording">
            <div class="modal-body bg-light p-0 m-0" style="overflow: hidden">

              <div class="d-flex flex-row" style="height: 90%;">

                <div class="d-flex flex-column m-0" :class="{'w-80': markings.length > 0, 'w-100': markings.length===0}">
                  <ClientOnly>
                    <video class="view h-100" controls
                           ref="video"
                           @volumechange="event => {muted = (event.target as HTMLVideoElement).muted; volume = (event.target as HTMLVideoElement).volume; }"
                           @loadeddata="loadData"
                           @timeupdate="timeupdate" :muted="muted" autoplay>
                      <source :src="videoUrl" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  </ClientOnly>
                </div>

                <div v-if="markings.length > 0" class="d-flex flex-column m-0 p-2" :class="{'w-20': markings.length > 0}">
                  <MarkingsTable
                      :show-destroy="true"
                      :markings="markings"
                      @destroy="(marking: Marking) => destroyMarking(marking)"
                      @selected="(marking: Marking) => selectMarking(marking)"/>

                  <button class="btn btn-primary" @click="playCut" v-if="!cutInterval">
                    Play Cut <i class="bi bi-play-fill"></i>
                  </button>
                  <button v-else class="btn btn-primary" @click="stopCut">
                    <span>Stop cut</span> <i class="bi bi-stop-fill"></i>
                  </button>
                  <button v-if="markings.length > 0" class="btn my-2 btn-warning" type="button" @click="showConfirmDialog=true">
                    {{ t('videoView.button.cut') }} <i class="bi bi-scissors"></i>
                  </button>
                </div>

              </div>

              <div ref="stripeContainer" class="d-flex flex-row w-100 position-relative overflow-y-scroll" style="height: 10%;">
                <ClientOnly><!-- calling the file .client.vue didnt make it client only??? -->
                  <Stripe :src="stripeUrl"
                          :disabled="cutInterval != undefined"
                          :paused="isPaused"
                          :timecode="timeCode"
                          :duration="duration"
                          :markings="markings"
                          @selecting="() => pause()"
                          @marking="(m) => markings=m"
                          @seek="seek"/>
                </ClientOnly>
              </div>
            </div>

            <div class="modal-footer p-1 d-flex justify-content-between" v-if="stripeUrl">
              <button style="max-width: 35%; text-overflow: ellipsis; text-wrap: nowrap;" type="button" class="overflow-hidden btn btn-sm btn-secondary" @click="router.push(`/channel/${recording.channelId}/${recording.channelName}`)">
                {{ recording.channelName }}
              </button>
              <div class="d-flex justify-content-end overflow-y-scroll" style="max-width: 50%">
                <button class="btn btn-danger btn-sm me-2" @click="destroy">
                  <i class="bi bi-trash3-fill"/>
                </button>

                <button class="btn btn-sm border-warning">
                  <RecordingFavButton :bookmarked="recording.bookmark" :recording-id="recording.recordingId"/>
                </button>

                <span class="mx-2 text-secondary">|</span>

                <button class="btn btn-primary btn-sm me-2" @click="back">
                  <i class="bi bi-chevron-left"/>
                </button>

                <button class="btn btn-primary btn-sm me-2" @click="forward">
                  <i class="bi bi-chevron-right"/>
                </button>

                <!--
                              <div class="fw-6 me-2">
                  {{ durationMin }}/{{ (timecode / 60).toFixed(2) }}min
                </div>

                <button v-if="!muted" class="btn btn-primary btn-sm me-2" type="button" @click="muted=true">
                  <i class="bi bi-volume-up"/>
                </button>

                <button v-else class="btn btn-outline-primary btn-sm me-2" type="button" @click="muted=false">
                  <i class="bi bi-volume-mute"/>
                </button>

                <button v-if="paused" class="btn btn-warning btn-sm" type="button" @click="play()">
                  <i class="bi bi-play"></i>
                </button>
                <button v-else class="btn btn-success btn-sm" type="button" @click="pause()">
                  <i class="bi bi-pause"></i>
                </button>
                -->
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseRecording } from '~/services/api/v1/StreamSinkClient.ts';
import Stripe from '~/components/Stripe.vue';
import RecordingFavButton from '~/components/controls/RecordingFavButton.vue';
import BusyOverlay from '~/components/BusyOverlay.vue';
import { ref, watch, onUnmounted, onMounted } from 'vue';
import { useRouter, onBeforeRouteLeave, useRoute } from 'vue-router';
import { useCookie } from '#app/composables/cookie';
import { useI18n } from 'vue-i18n';
import ModalConfirmDialog from '~/components/modals/ModalConfirmDialog.client.vue';
import MarkingsTable from '~/components/MarkingsTable.vue';
import { useToastStore } from '~~/stores/toast';
import { useJobStore } from '~~/stores/job';
import { useAsyncData, useRuntimeConfig } from 'nuxt/app';
import { useNuxtApp } from '#app/nuxt';
import { useHead } from '#app';
import type { Marking } from '~/types';
import { useTemplateRef } from 'vue';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const jobStore = useJobStore();
const toastStore = useToastStore();

const volume = useCookie<number>('volume', { readonly: false, default: () => 1, maxAge: 60 * 60 * 24 * 14 });
const muted = useCookie<boolean>('muted', { readonly: false, default: () => true, maxAge: 60 * 60 * 24 * 14 });

const stripeContainer = useTemplateRef<HTMLElement>('stripeContainer');
const video = useTemplateRef<HTMLVideoElement>('video');

const config = useRuntimeConfig();
const fileUrl = config.public.fileUrl;

const isMuted = ref(false);
const isMounted = ref(false);
const isPaused = ref(false);
const isLoaded = ref(false);
const isShown = ref(false);
const playbackSpeed = ref(1.0);
const markings = ref<Marking[]>([]);
const timeCode = ref<number>(0);
const duration = ref<number>(0);
const recording = ref<DatabaseRecording | undefined>(undefined);
const id = ref<number | null>(null);
const busy = ref(false);
const showConfirmDialog = ref(false);
const deleteFileAfterCut = ref(false);

let cutInterval: NodeJS.Timeout | number | undefined;

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onBeforeRouteLeave(() => {
  if (video.value) {
    const el = video.value;
    el.pause();
    el.removeAttribute('src');
    el.load();
  }
  isShown.value = false;
});

const rotate = () => {
  const mql = window.matchMedia('(orientation: portrait)');

  if (mql.matches) {
    video.value!.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

onUnmounted(() => {
  if (import.meta.browser) {
    window.removeEventListener('orientationchange', rotate);
  }
});

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(isMuted, function (val) {
  if (isMounted.value && video.value) {
    video.value.muted = val;
  }
});

watch(isPaused, async (val) => {
  if (isMounted.value && video.value) {
    const vid = video.value;

    if (val) {
      vid.pause();
    } else {
      await vid.play();
    }
  }
});

watch(playbackSpeed, function (val) {
  if (isMounted.value && video.value) {
    video.value.playbackRate = val;
  }
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const pause = () => {
  video.value?.pause();
  isPaused.value = true;
};

const play = async () => {
  await video.value?.play();
  isPaused.value = false;
};

const back = () => video.value!.currentTime = (video.value?.currentTime || 0) - 30;
const forward = () => video.value!.currentTime = (video.value?.currentTime || 0) + 30;

const stopCut = () => {
  pause();
  clearInterval(cutInterval);
};

const playCut = () => {
  if (markings.value.length == 0) {
    return;
  }

  let i = 0;

  const lastTime = markings.value[markings.value.length - 1]!.timeend;
  let marking = markings.value[i];

  (video as unknown as HTMLVideoElement).currentTime = marking!.timestart;
  play();

  cutInterval = setInterval(() => {
    requestAnimationFrame(() => {
      if (video.value!.currentTime >= lastTime) {
        stopCut();
      } else {
        marking = markings.value[i];
        if (video.value!.currentTime >= marking!.timeend) {
          marking = markings.value[++i];
          video.value!.currentTime = marking!.timestart;
        }
      }
    });
  }, 100);
};

const resetSelection = () => {
  for (let i = 0; i < markings.value.length; i++) {
    markings.value[i]!.selected = false;
  }
};

const selectMarking = (marking: Marking) => {
  resetSelection();
  video.value!.currentTime = marking.timestart;
  marking.selected = true;
};

const destroyMarking = (marking: Marking) => {
  for (let i = 0; i < markings.value.length; i++) {
    if (markings.value[i]!.timestart === marking.timestart && markings.value[i]!.timeend === marking.timeend) {
      markings.value.splice(i, 1);
      break;
    }
  }
};

const destroy = () => {
  if (!recording.value) {
    return;
  }

  if (!window.confirm(t('videoView.destroy', [recording.value.filename]))) {
    return;
  }

  busy.value = true;

  unloadVideo();

  const { $client } = useNuxtApp();
  $client.recordings.recordingsDelete(recording.value.recordingId)
      .then(() => {
        // Remove from Job list if existent.
        jobStore.deleteRecording(recording.value!.recordingId);
        toastStore.success({ title: 'Video deleted', message: recording.value!.filename });
        router.back();
      })
      .catch((err: any) => {
        alert(err);
      });
};

const cutVideo = () => {
  const { $client } = useNuxtApp();
  const starts = markings.value.map(m => String(m.timestart.toFixed(4)));
  const ends = markings.value.map(m => String(m.timeend.toFixed(4)));

  $client.recordings.cutCreate(id.value!, { starts, ends, deleteAfterCut: deleteFileAfterCut.value })
      .then(() => markings.value = [])
      .catch((err: any) => alert(err))
      .finally(() => showConfirmDialog.value = false);
};

const seek = ({ clientX, width }: { clientX: number, width: number }) => {
  if (!video.value?.duration) {
    return;
  }

  const offset = video.value!.duration * (clientX / width);

  if (isNaN(offset)) {
    return;
  }

  video.value!.currentTime = offset;
};

const loadData = () => {
  if (isMounted.value && video.value) {
    duration.value = video.value.duration;
    isLoaded.value = true;
    video.value.volume = volume.value || 0.0;
    play();
  }
};

const timeupdate = () => {
  if (isMounted.value && video.value) {
    timeCode.value = video.value.currentTime;
  }
};

const unloadVideo = () => {
  if (isMounted.value && video.value) {
    video.value.pause();
    video.value.firstElementChild!.removeAttribute('src');
    video.value.load();
  }
};

const { $client } = useNuxtApp();
id.value = Number(route.params.id);
const { data } = await useAsyncData<DatabaseRecording>('rec', () => $client.recordings.recordingsDetail(id.value!));
recording.value = data.value;
const stripeUrl = fileUrl + '/' + recording.value?.previewStripe;
const videoUrl = fileUrl + '/' + recording.value?.pathRelative;

useHead({
  title: recording.value?.filename
});

onMounted(() => {
  window.addEventListener('orientationchange', rotate);
  isMounted.value = true;
  isShown.value = true;
});
</script>
