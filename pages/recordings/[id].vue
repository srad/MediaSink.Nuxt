<template>
  <div>
    <ModalConfirmDialog :show="showConfirmDialog" @cancel="showConfirmDialog=false" @confirm="cutVideo">
      <template #header>
        <span class="fs-5">Confirm your video cut</span>
      </template>
      <template #body>
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
    <div class="modal show m-0 p-0m position-absolute" tabindex="-1" ref="modalVideo" style="display: block !important;">
      <div class="modal-dialog modal-fullscreen p-0">
        <div class="modal-content">
          <template v-if="recording">
            <div class="modal-body bg-light p-0" style="overflow: hidden">

              <div class="d-flex flex-row" style="height: 90%;">

                <div class="d-flex flex-column m-0" :class="{'w-80': markings.length > 0, 'w-100': markings.length===0}">
                  <video class="view h-100" controls
                         ref="video"
                         @volumechange="event => {muted = (event.target as HTMLVideoElement).muted; volume = (event.target as HTMLVideoElement).volume; }"
                         @loadeddata="loadData"
                         @timeupdate="timeupdate" :muted="muted" autoplay>
                    <source :src="videoUrl" type="video/mp4">
                    Your browser does not support the video tag.
                  </video>
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
                <Stripe :src="stripeUrl"
                        :disabled="cutInterval != undefined"
                        :paused="isPaused"
                        :timecode="timeCode"
                        :duration="duration"
                        :markings="markings"
                        @selecting="() => pause()"
                        @marking="(m) => markings=m"
                        @seek="seek"/>
              </div>
            </div>

            <div class="modal-footer p-1 d-flex justify-content-between" v-if="stripeUrl">
              <div>
                <button type="button" class="btn btn-sm btn-secondary" @click="router.push(`/channel/${recording.channelId}/${recording.channelName}`)">
                  {{ recording.channelName }}
                </button>
              </div>
              <div class="d-flex justify-content-end">
                <button class="btn btn-danger btn-sm me-2" @click="destroy">
                  <i class="bi bi-trash3-fill"/>
                </button>

                <button class="btn btn-sm border-warning">
                  <RecordingFavButton :bookmarked="recording.bookmark" :recording-id="recording.recordingId"/>
                </button>

                <span class="mx-2 text-secondary">|</span>

                <button class="btn btn-info text-white btn-sm me-2" @click="back">
                  <i class="bi bi-chevron-double-left"/>
                </button>

                <button class="btn btn-info text-white btn-sm me-2" @click="forward">
                  <i class="bi bi-chevron-double-right"/>
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
import type { Marking } from "~/components/Stripe.vue";
import type { DatabaseRecording } from '~/services/api/v1/StreamSinkClient.ts';
import { createClient } from "~/services/api/v1/ClientFactory";
import Stripe from "~/components/Stripe.vue";
import RecordingFavButton from "~/components/controls/RecordingFavButton.vue";
import BusyOverlay from "~/components/BusyOverlay.vue";
import {
  useI18n,
  useCookie,
  useState,
  useRouter,
  onBeforeRouteLeave,
  useRoute,
  computed,
  watch,
  onMounted,
  onUnmounted
} from '#imports'
import ModalConfirmDialog from "~/components/modals/ModalConfirmDialog.vue";
import MarkingsTable from "~/components/MarkingsTable.vue";
import { useToastStore } from "~/stores/toast";
import { useJobStore } from "~/stores/job";
import { TOKEN_NAME } from "~/services/auth.service";
import { useRuntimeConfig } from "nuxt/app";

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const jobStore = useJobStore();
const toastStore = useToastStore();

const volume = useCookie('volume');
const muted = useCookie('muted');

const stripeContainer = useState('stripeContainer', () => null);

const video = useState<HTMLVideoElement | null>('video', () => null);

const config = useRuntimeConfig();
const fileUrl = config.public.fileUrl;

const stripeUrl = computed<string>(() => fileUrl + '/' + recording.value?.previewStripe + '?' + Date.now());
const videoUrl = computed<string>(() => fileUrl + '/' + recording.value?.pathRelative + '?' + Date.now());

const isMuted = useState('isMuted', () => false);
const isMounted = useState('isMounted', () => false);
const isPaused = useState('isPaused', () => false);
const isLoaded = useState('isLoaded', () => false);
const isShown = useState('isShown', () => false);
const playbackSpeed = useState('playbackSpeed', () => 1.0);
const markings = useState<Marking[]>('markings', () => []);
const timeCode = useState<number>('timeCode', () => 0);
const duration = useState<number>('dureation', () => 0);
const recording = useState<DatabaseRecording>('recording', () => null);
const id = useState<number>('id', () => null);
const busy = useState('busy', () => false);
const showConfirmDialog = useState('confirm', () => false);
const deleteFileAfterCut = useState('deleteFile', () => false);

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

onUnmounted(() => {
  window.removeEventListener('orientationchange', rotate);
});

onMounted(async () => {
  try {
    const tokenCookie = useCookie(TOKEN_NAME);
    const api = createClient(tokenCookie);

    id.value = Number(route.params.id);
    const rec = await api.recordings.recordingsDetail(id.value);
    recording.value = rec.data;
  } finally {
    window.addEventListener('orientationchange', rotate);
    isMounted.value = true;
    isShown.value = true;
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

  const lastTime = markings.value[markings.value.length - 1].timeend;
  let marking = markings.value[i];

  (video as unknown as HTMLVideoElement).currentTime = marking.timestart;
  play();

  cutInterval = setInterval(() => {
    requestAnimationFrame(() => {
      if (video.value!.currentTime >= lastTime) {
        stopCut();
      } else {
        marking = markings.value[i];
        if (video.value!.currentTime >= marking.timeend) {
          marking = markings.value[++i];
          video.value!.currentTime = marking.timestart;
        }
      }
    });
  }, 100);
};

const resetSelection = () => {
  for (let i = 0; i < markings.value.length; i++) {
    markings.value[i].selected = false;
  }
};

const selectMarking = (marking: Marking) => {
  resetSelection();
  video.value!.currentTime = marking.timestart;
  marking.selected = true;
};

const destroyMarking = (marking: Marking) => {
  for (let i = 0; i < markings.value.length; i++) {
    if (markings.value[i].timestart === marking.timestart && markings.value[i].timeend === marking.timeend) {
      markings.value.splice(i, 1);
      break;
    }
  }
};

const rotate = () => {
  const mql = window.matchMedia('(orientation: portrait)');

  if (mql.matches) {
    video.value!.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const destroy = () => {
  if (!recording.value) {
    return;
  }

  if (!window.confirm(t('videoView.destroy', [ recording.value.filename ]))) {
    return;
  }

  busy.value = true;

  unloadVideo();

  const tokenCookie = useCookie(TOKEN_NAME);
  const api = createClient(tokenCookie);

  api.recordings.recordingsDelete(recording.value.recordingId)
      .then(() => {
        // Remove from Job list if existent.
        jobStore.deleteRecording(recording.value!.recordingId);
        toastStore.add({ title: 'Video deleted', message: recording.value!.filename });
        router.back();
      })
      .catch((err: any) => {
        alert(err);
      });
};

const cutVideo = () => {
  const tokenCookie = useCookie(TOKEN_NAME);
  const api = createClient(tokenCookie);

  const starts = markings.value.map(m => String(m.timestart.toFixed(4)));
  const ends = markings.value.map(m => String(m.timeend.toFixed(4)));

  api.recordings.cutCreate(id.value!, { starts, ends, deleteAfterCut: deleteFileAfterCut.value })
      .then(() => markings.value = [])
      .catch((err) => alert(err))
      .finally(() => showConfirmDialog.value = false);
};

const seek = ({ clientX, width }: { clientX: number, width: number }) => {
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
</script>
