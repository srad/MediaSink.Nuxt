<template>
  <div>
    <BusyOverlay :visible="busyOverlay"/>
    <div ref="upload" style="display: none" class="modal modal-dialog modal-dialog-centered" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Uploading Video</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <h5>
              Progress: {{ (uploadProgress * 100).toFixed(0) }}%
            </h5>
            <div class="progress">
              <div class="progress-bar progress-bar-animated progress-bar-striped bg-warning" role="progressbar" :style="{width: `${uploadProgress*100}%`}" aria-valuemax="1" aria-valuemin="0" aria-valuenow="0.4"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-warning" @click="cancelUpload">Cancel Upload</button>
          </div>
        </div>
      </div>
    </div>

    <nav class="navbar fixed-bottom navbar-light bg-light border-info border-top">
      <div class="container-fluid justify-content-between">
        <div class="btn-group dropup" v-if="!areItemsSelected">
          <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            Options
          </button>
          <ul class="dropdown-menu">
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between" @click="clickFile">
                <input ref="file" name="file" v-show="false" accept="video/mp4" @change="submit" type="file">
                <span>Upload video</span>
                <i class="bi text-primary bi-upload"/>
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between">
                <span>Edit channel</span>
                <i class="bi bi-pencil text-info"/>
              </button>
            </li>
            <li>
              <button type="button" class="dropdown-item d-flex justify-content-between" @click="deleteChannel">
                <span class="me-2">Delete channel</span>
                <i class="bi text-danger bi-trash3-fill"/>
              </button>
            </li>
            <li>
              <div class="dropdown-item form-check form-switch d-flex justify-content-between" v-if="selectedRecordings.length === 0">
                <label class="form-check-label m-0 p-0 me-2" for="flexSwitchCheckDefault">Enabled?</label>
                <input class="form-check-input m-0 my-1 p-0" type="checkbox" role="switch" id="flexSwitchCheckDefault" :checked="!channel?.isPaused" @change="pauseChannel($event.target as HTMLInputElement)">
              </div>
            </li>
          </ul>
        </div>

        <div class="btn-group">
          <button type="button" v-if="areItemsSelected" class="btn btn-danger justify-content-between me-2" @click="destroySelection">
            <span class="me-2">Delete selection</span>
            <i class="bi bi-trash3-fill"/>
          </button>
          <button type="button" v-if="areItemsSelected" class="btn btn-primary justify-content-between me-2" @click="cancelSelection">
            <span class="me-2">Cancel</span>
            <i class="bi bi-stop-fill"/>
          </button>
          <button v-if="selectedRecordings.length === 0" type="button" class="btn d-flex justify-content-between" :class="{'btn-warning' : channel?.fav, 'btn-secondary' : !channel?.fav}" @click="bookmark">
            <span class="me-2">Bookmark</span>
            <i style="color: black" class="bi" :class="{'bi-star-fill' : channel?.fav, 'bi-star' : !channel?.fav}"/>
          </button>
        </div>
      </div>
    </nav>

    <div class="d-flex align-items-center mb-3 justify-content-between pb-2 border-bottom">
      <div class="text-primary  fs-5 fw-bolder">{{ channel?.displayName }}</div>
      <div class="d-flex align-items-center fs-5">
        <button type="button" class="btn btn-secondary" disabled>Count: {{ channel?.recordingsCount }}</button>
        <button type="button" class="btn btn-secondary ms-2" disabled>
          Size: {{ (channel?.recordingsSize! / 1024 / 1024 / 1024).toFixed(1) }}GB
        </button>
      </div>
    </div>

    <div class="row mb-5">
      <div v-for="recording in channel?.recordings" :key="recording.filename" class="mb-3 col-lg-5 col-xl-4 col-xxl-4 col-md-10">
        <RecordingItem
            @destroyed="destroyRecording"
            @checked="selectRecording"
            :select="selectedRecordings.some(x => x.recordingId === recording.recordingId)"
            :show-selection="true"
            :recording="recording"
            :show-title="false"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecordingItem from '~/components/RecordingItem.vue';
import type {
  DatabaseChannel as ChannelResponse,
  DatabaseRecording as RecordingResponse
} from '~/services/api/v1/StreamSinkClient';
import { onBeforeRouteLeave, useRoute, useRouter, onMounted, computed, useState } from '#imports';
import { createSocket, MessageType, SocketManager } from '~/utils/socket';
import BusyOverlay from '~/components/BusyOverlay.vue';
import { useToastStore } from '~/stores/toast';
import { useChannelStore } from '~/stores/channel';
import { useJobStore } from '~/stores/job';
import { useNuxtApp } from '#app/nuxt';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const route = useRoute();
const router = useRouter();

const jobStore = useJobStore();
const toastSTore = useToastStore();
const channelStore = useChannelStore();

// Elements
const file = useState<HTMLInputElement | null>('file', () => null);
const upload = useState<HTMLDivElement | null>('upload', () => null);

const selectedRecordings = useState<RecordingResponse[]>('selectedRecordings', () => []);
const uploadProgress = useState('uploadProgress', () => 0);
const busyOverlay = useState('busyOverlay', () => false);
const channel = useState<ChannelResponse | null>('channel', () => null);
const channelId = (+route.params.id) as unknown as number;
let uploadAbortController: AbortController | null = null;
const showModal = useState('showModal', () => false);

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const areItemsSelected = computed(() => selectedRecordings.value.length > 0);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const pauseChannel = (element: HTMLInputElement): void => {
  const { $client } = useNuxtApp();
  const fn = element.checked ? $client.channels.resumeCreate : $client.channels.pauseCreate;
  fn(channel.value!.channelId).then(() => {
    if (element.checked) {
      channelStore.resume(channel.value!.channelId);
    } else {
      channelStore.pause(channel.value!.channelId);
    }
    toastSTore.add({
      title: element.checked ? 'Channel resume' : 'Channel pause',
      message: `Channel ${channel.value?.displayName}`
    });
  }).catch(err => alert(err));
};

const clickFile = () => file.value?.click();

const cancelSelection = () => selectedRecordings.value = [];

const destroySelection = async () => {
  if (!window.confirm('Delete selection?')) {
    return;
  }

  const { $client } = useNuxtApp();

  for (let i = 0; i < selectedRecordings.value.length; i++) {
    const rec = selectedRecordings.value[i];
    await $client.recordings.recordingsDelete(rec.recordingId);
    const j = channel.value?.recordings?.findIndex(r => r.filename === rec.filename);
    if (j && j !== -1) {
      channel.value?.recordings?.splice(j, 1);
    }
  }
  selectedRecordings.value = [];
};

const selectRecording = (data: { checked: boolean, recording: RecordingResponse }) => {
  if (data.checked) {
    selectedRecordings.value.push(data.recording);
  } else {
    selectedRecordings.value = selectedRecordings.value.filter(x => x.recordingId !== data.recording.recordingId);
  }
};

const deleteChannel = () => {
  if (window.confirm(`Delete channel "${channelId}"?`)) {
    busyOverlay.value = true;

    const { $client } = useNuxtApp();

    $client.channels.channelsDelete(channelId)
        .then(() => channelStore.destroy(channelId))
        .catch(err => alert(err))
        .finally(() => {
          busyOverlay.value = false;
          toastSTore.add({
            title: 'Channel deleted',
            message: `Channel ${channel.value?.displayName}`
          });
          router.replace('/');
        });
  }
};

const cancelUpload = () => {
  if (uploadAbortController) {
    uploadAbortController.abort();
  }
  showModal.value = false;
};

const submit = () => {
  const el = file as unknown as HTMLInputElement;
  if (el.files && el.files!.length > 0) {
    uploadProgress.value = 0;
    showModal.value = true;

    const { $client } = useNuxtApp();

    const [req, cancelToken] = $client.channelUpload(channelId, el.files![0], pcent => uploadProgress.value = pcent);
    req.then(res => {
      uploadProgress.value = 0;
      channel.value?.recordings?.unshift(res.data);
      uploadAbortController = null;
      showModal.value = false;
      // clear old file
      el.value = '';
    }).catch(res => {
      alert(res.error);
      showModal.value = false;
    });
    uploadAbortController = cancelToken;
  }
};

const destroyRecording = (recording: RecordingResponse) => {
  if (channel.value?.recordings) {
    for (let i = 0; i < channel.value?.recordings?.length; i += 1) {
      if (channel.value?.recordings && channel.value?.recordings[i].recordingId === recording.recordingId) {
        jobStore.deleteRecording(recording.recordingId);
        channel.value?.recordings?.splice(i, 1);
        break;
      }
    }
  }
};

const bookmark = () => {
  const { $client } = useNuxtApp();
  const fn = channel.value!.fav ? $client.channels.unfavPartialUpdate : $client.channels.favPartialUpdate;

  fn(channel.value!.channelId)
      .then(() => channel.value!.fav = !channel.value!.fav)
      .catch(err => alert(err));
};

let socket: SocketManager | null = null;

// --------------------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------------------

onBeforeRouteLeave((to, from) => {
  socket?.close();
});

const { $client } = useNuxtApp();
const res = await $client.channels.channelsDetail(channelId);
channel.value = res.data;

onMounted(async () => {
  try {
    socket = createSocket();
    socket?.connect();

    socket.on(MessageType.RecordingAdd, recording => {
      const r = recording as RecordingResponse;
      console.log(r);
    });

    window.scrollTo(0, 0);
  } catch (error: any) {
    alert(error.error);
    router.back();
  }
});
</script>
