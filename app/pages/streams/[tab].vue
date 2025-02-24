<template>
  <div>
    <ChannelModal
        @save="save"
        @close="showModal=false"
        title="Edit Stream"
        :saving="saving"
        :is-paused="isPaused"
        :channel-disabled="true"
        :clear="false"
        :channel-id="channelId"
        :show="showModal"
        :channel-name="channelName"
        :display-name="displayName"
        :url="url"
        :min-duration="minDuration"
        :skip-start="skipStart"/>

    <!-- Search bar -->
    <div class="row">
      <div class="col">
        <!--<div class="d-flex rounded-2 border mb-3 p-0 bg-light border-info p-1">-->
        <div class="input-group mb-3 align-middle">
          <input autocapitalize="off" autocomplete="off" class="form-control border-secondary" type="text" name="search" placeholder="search ... #tag" v-model="searchVal">
          <span class="input-group-text bg-danger-subtle" v-if="searchVal!=''">
            <i class="bi bi-x-lg text-danger fs-4" @click="searchVal=''"/>
          </span>
          <span class="input-group-text">
            <i v-if="favs" class="bi bi-star-fill text-warning fs-4" @click="favs=false"/>
            <i v-else class="bi bi-star text-warning fs-4" @click="favs=true"/>
          </span>
        </div>
      </div>
    </div>
    <!-- Search bar -->

    <!-- Body -->
    <div class="row">
      <!-- Search -->
      <div v-if="searchVal !== '' || favs" class="col">
        <div class="row">
          <div v-if="searchResults.length===0" class="justify-content-center d-flex">
            <h5 class="m-5">No results...</h5>
          </div>
          <div v-else v-for="channel in searchResults" :key="channel.channelId" :class="channelItemClass">
            <ChannelItem :channel="channel"/>
          </div>
        </div>
      </div>
      <!-- No search -->
      <div v-else class="col">
        <ul class="nav nav-tabs border-primary" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" @click="() => show('live')" :class="{'active': tab === 'live'}" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
              <span class="d-none d-lg-inline">Recording</span>
              <span class="d-flex justify-content-between">
                  <span class="d-lg-none">Rec</span>
                  <span class="recording-number">{{ recordingStreams.length }}</span>
                </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" @click="() => show('offline')" :class="{'active': tab === 'offline'}" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">
              <span class="d-none d-lg-inline">Offline</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Off</span><span class="recording-number">{{ notRecordingStreams.length }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between"
                    @click="() => show('disabled')"
                    :class="{'active': tab === 'disabled'}"
                    id="disabled-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#disabled"
                    type="button"
                    role="tab"
                    aria-controls="disabled"
                    aria-selected="false">
              <span class="d-none d-lg-inline">Disabled</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Disabled</span><span class="recording-number">{{ disabledStreams.length }}</span>
            </span>
            </button>
          </li>
        </ul>

        <div class="tab-content py-2" id="myTabContent">
          <div class="tab-pane fade" :class="{'active show': tab === 'live'}" id="home" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
              <div v-for="channel in recordingStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
              <h1 v-if="recordingStreams.length === 0" class="d-flex align-items-center justify-content-center w-100 m-0 p-0" style="height: 65vh">
                No disabled streams
              </h1>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': tab === 'offline'}" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <div class="row">
              <div v-for="channel in notRecordingStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
              <h1 v-if="notRecordingStreams.length === 0" class="d-flex align-items-center justify-content-center w-100 m-0 p-0" style="height: 65vh">
                No disabled streams
              </h1>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': tab === 'disabled'}" id="disabled" role="tabpanel" aria-labelledby="disabled-tab">
            <div class="row">
              <div v-for="channel in disabledStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
              <h1 v-if="disabledStreams.length === 0" class="d-flex align-items-center justify-content-center w-100 m-0 p-0" style="height: 65vh">
                No disabled streams
              </h1>
            </div>
          </div>
        </div>
      </div>

    </div>
    <!-- Body end -->
  </div>
</template>

<script setup lang="ts">
import type { DatabaseChannel, DatabaseChannel as ChannelResponse } from '~/services/api/v1/StreamSinkClient';
import ChannelItem from '~/components/ChannelItem.vue';
import ChannelModal from '~/components/modals/ChannelModal.client.vue';
import { useChannelStore } from '~~/stores/channel';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNuxtApp } from '#app/nuxt';
import type { ChannelUpdate } from '~/types';
import { useAsyncData } from '#app';
import { definePageMeta, useHead } from '#imports';

useHead({
  title: 'Streams'
});

definePageMeta({
  name: 'Streams',
  keepalive: true,
});

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const channelStore = useChannelStore();
const route = useRoute();

const channelItemClass = 'col-lg-6 col-xl-6 col-xxl-4 col-md-6';
const channelId = ref<number>();
const showModal = ref(false);
const channelName = ref('');
const displayName = ref('');
const isPaused = ref(false);
const url = ref('');
const minDuration = ref(20);
const skipStart = ref(0);
const favs = ref(route.query.fav === '1');

const saving = ref(false);

const searchVal = ref<string>((route.query.search || route.query.tag || route.params.tag || '') as string);
const tagFilter = ref<string>((route.params.tag || route.query.tag || '') as string);

const router = useRouter();

await channelStore.load();

const tab = ref(route.params.tab);

// --------------------------------------------------------------------------------------
// Computes
// --------------------------------------------------------------------------------------

const search = computed(() => searchVal.value.trim().toLowerCase());

const searchTerms = computed(() => search.value.split(' ').filter(s => s[0] !== '#').join(' '));

const tagTerms = computed(() => search.value.split(' ').filter(s => s[0] === '#').map(s => s.slice(1, s.length)).join(' '));

const notRecordingStreams = computed(() => channelStore.channels.slice()
    .filter(row => !row.isRecording && !row.isPaused)
    .sort(sort));

const disabledStreams = computed(() => channelStore.channels.slice()
    .filter(row => row.isPaused)
    .sort(sort));

const recordingStreams = computed(() => channelStore.channels.slice()
    .filter(row => row.isRecording && !row.isTerminating)
    .sort(sort));

const favStreams = computed(() => channelStore.channels.slice()
    .filter(row => row.fav)
    .filter(row => favs.value ? row.fav : true)
    .sort(sort));

const searchResults = computed(() => channelStore.channels.slice()
    .filter(channel => searchFilter(channel, searchTerms.value, tagTerms.value))
    .filter(channel => favs.value ? channel.fav : true) // Only use, if defined.
    .sort(sort));

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const searchFilter = (channel: ChannelResponse, search: string, tag: string): boolean => {
  return ((search && search.length > 0) ? channel.channelName!.indexOf(search) !== -1 : true) &&
      ((tag && tag.length > 0 && channel.tags) ? channel.tags.some(t => t === tag) : true);
};

const sort = (a: ChannelResponse, b: ChannelResponse) => a.channelName!.localeCompare(b.channelName!);

const save = async (channel: ChannelUpdate) => {
  try {
    saving.value = true;
    const { $client } = useNuxtApp();
    const { data } = await useAsyncData<DatabaseChannel>('save', () => $client.channels.channelsPartialUpdate(channel.channelId, channel));
    channelStore.update(data.value!);
    showModal.value = false;
  } catch (e) {
    alert(e);
  } finally {
    saving.value = false;
  }
};

const editChannel = (channel: ChannelResponse) => {
  channelId.value = channel.channelId!;
  channelName.value = channel.channelName;
  displayName.value = channel.displayName;
  isPaused.value = channel.isPaused;
  url.value = channel.url;
  skipStart.value = channel.skipStart;
  minDuration.value = channel.minDuration;
  showModal.value = true;
};

const show = (tabName: string) => {
  router.push({ params: { tab: tabName } });
};
// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(favs, (val) => router.push({ query: { fav: val ? '1' : '0' } }));

watch(searchVal, (search) => router.replace({ query: { search } }));

watch(() => route.query, params => {
  if (params.tag && params.tag !== '') {
    searchVal.value = `#${params.tag}`;
  } else {
    searchVal.value = (params.search || '') as string;
  }
  favs.value = params.fav === '1';
});

watch(() => route.params.tab, tabName => {
  tab.value = tabName;
});

watch(tagFilter, val => {
  router.replace({ params: { tag: val } });
});
</script>

<style lang="scss" scoped>
.nav-item .active {
  background-color: #4b4e6d;
  color: white;
  border: 1px solid #4b4e6d;
}

.recording-number {
  font-size: 0.8em;
}
</style>
