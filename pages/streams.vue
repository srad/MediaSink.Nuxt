<template>
  <LoadIndicator :busy="busy">
    <ChannelModal
        @save="save"
        @close="showModal=false"
        title="Edit Stream"
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
            <button class="nav-link d-flex justify-content-between" :class="{'active': route.params.tab === 'live'}" @click="tab('live')" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
              <span class="d-none d-lg-inline">Recording</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Rec</span>
              <span class="recording-number">{{ recordingStreams.length }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between" :class="{'active': route.params.tab === 'offline'}"
                    @click="tab('offline')" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile"
                    type="button" role="tab" aria-controls="profile" aria-selected="false">
              <span class="d-none d-lg-inline">Offline</span>
              <span class="d-flex justify-content-between">
              <span class="d-lg-none">Off</span><span class="recording-number">{{ notRecordingStreams.length }}</span>
            </span>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link d-flex justify-content-between"
                    :class="{'active': route.params.tab === 'disabled'}"
                    @click="tab('disabled')"
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
          <div class="tab-pane fade" :class="{'active show': route.params.tab === 'live'}" id="home" role="tabpanel" aria-labelledby="home-tab">
            <div class="row">
              <div v-for="channel in recordingStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': route.params.tab === 'offline'}" id="profile" role="tabpanel" aria-labelledby="profile-tab">
            <div class="row">
              <div v-for="channel in notRecordingStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
            </div>
          </div>

          <div class="tab-pane fade" :class="{'active show': route.params.tab === 'disabled'}" id="disabled" role="tabpanel" aria-labelledby="disabled-tab">
            <div class="row">
              <div v-for="channel in disabledStreams" :key="channel.channelId" :class="channelItemClass">
                <ChannelItem :channel="channel" @edit="editChannel"/>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <!-- Body end -->
  </LoadIndicator>
</template>

<script setup lang="ts">
import { createClient } from '../services/api/v1/ClientFactory';
import ChannelItem from '../components/ChannelItem.vue';
import ChannelModal, { ChannelUpdate } from '../components/modals/ChannelModal.vue';
import { useChannelStore } from "~/stores/channel";
import { useAuthStore } from "~/stores/auth";
import LoadIndicator from "../components/LoadIndicator.vue";
import { useState, useRoute, useRouter, watch, computed, onMounted} from '#imports'

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const channelStore = useChannelStore();
const authStore = useAuthStore();
const route = useRoute();

const channelItemClass = 'col-lg-6 col-xl-6 col-xxl-4 col-md-6';
const channelId = useState('channelId', () => 0);
const showModal = useState('showModal', () => false);
const channelName = useState('channelName', () => '');
const displayName = useState('displayName', () => '');
const isPaused = useState('isPaused', () => false);
const url = useState('url', () => '');
const busy = useState('busy', () => true);

const minDuration = useState('minDuration', () => 0);
const skipStart = useState('skipStart', () => 0);
const favs = useState('favs', () => false);

const searchVal = useState<string>('searchVal', () => (route.query.search || route.query.tag || route.params.tag || '') as string);
const tagFilter = useState<string>('tagFilter', () => (route.params.tag || route.query.tag || '') as string);

const router = useRouter();

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

const loggedIn = computed(() => authStore.isLoggedIn);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const searchFilter = (channel: ChannelResponse, search: string, tag: string): boolean => {

  const matches = ((search && search.length > 0) ? channel.channelName!.indexOf(search) !== -1 : true) &&
      ((tag && tag.length > 0 && channel.tags) ? channel.tags.some(t => t === tag) : true);

  return matches;
};

const sort = (a: ChannelResponse, b: ChannelResponse) => a.channelName!.localeCompare(b.channelName!);

const save = async (data: ChannelUpdate) => {
  try {
    const api = createClient();
    const res = await api.channels.channelsPartialUpdate(data.channelId, data);
    channelStore.update(res.data);
    showModal.value = false;
  } catch (e) {
    alert(e);
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

const tab = (tab: string) => router.push({ name: 'Stream', params: { tag: tagFilter.value, tab } });

const loginHandler = async (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    const api = createClient();
    const res = await api.channels.channelsList();
    res.data.forEach(channel => channelStore.add(channel));
    busy.value = false;
  }
};

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(loggedIn, value => loginHandler(value));

watch(searchVal, (search) => router.replace({ query: { search } }));

watch(() => route.query, params => {
  if (params.tag && params.tag !== '') {
    searchVal.value = `#${params.tag}`;
  } else {
    searchVal.value = (params.search || '') as string;
  }
});

watch(tagFilter, val => {
  router.replace({ params: { tag: val } });
});

onMounted(() => {
  loginHandler(loggedIn.value);
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