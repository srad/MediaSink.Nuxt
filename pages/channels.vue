<template>
  <div class="table-responsive">
    <table class="table table-bordered table-hover table-sm">
      <thead>
      <tr v-if="isImporting">
        <th colspan="6" class="bg-light border border-primary">
          <h6>Importing ...</h6>
          <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 75%"></div>
          </div>
        </th>
      </tr>
      <tr>
        <th colspan="6" class="bg-light border border-primary bg-primary-subtle">
          <button @click="() => downloadChannelsAsJson()" type="button" class="btn btn-primary btn-sm me-2">
            Export channels
          </button>
          <button @click="inputFileClick" type="button" class="btn btn-primary btn-sm">Import channels</button>
          <input ref="channelsFile" accept="application/json" type="file" name="importChannels" hidden @change="inputFileChanged"/>
        </th>
      </tr>
      <tr>
        <th rowspan="2" style="width: 1%" class="bg-light">Preview</th>
        <th rowspan="2" style="width: 30%" class="bg-light">Name</th>
        <th rowspan="2" style="width: 5%" class="bg-light">Favourite?</th>
        <th rowspan="2" style="width: 4%" class="bg-light">Recording?</th>
        <th style="width: 5%" class="bg-light; text-center">Count</th>
        <th style="width: 5%" class="bg-light; text-center">Size</th>
      </tr>
      <tr>
        <th class="text-center">{{ totalCount }}</th>
        <th class="text-center">{{ totalSize.toFixed(1) }}GB</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="channel in channels" class="align-middle">
        <td class="text-center p-0">
          <img alt="preview" :src="fileUrl + '/' + channel.preview" class="rounded" style="height: 50px; width: auto"/>
        </td>
        <td class="px-2">
          <RouterLink class="text-decoration-none" :to="`/channel/${channel.channelId}/${channel.channelName}`">
            <h6 class="m-0">{{ channel.channelName }}</h6>
          </RouterLink>
          <a :href="channel.url" target="_blank">{{ channel.url }}</a>
        </td>
        <td class="px-2">
          <ChannelFavButton :bookmarked="channel.fav" :channel-id="channel.channelId"/>
        </td>
        <td class="px-2">
          <button class="btn w-100 btn-danger" v-if="channel.isRecording">
            <i class="bi bi-record-fill pulse"></i> Recording
          </button>
        </td>
        <td class="px-2 text-center">{{ channel.recordingsCount }}</td>
        <td class="px-2 text-end">{{ (channel.recordingsSize / 1024 / 1024 / 1024).toFixed(2) }} GB</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig, computed, ref, downloadObjectAsJson } from '#imports';
import ChannelFavButton from '~/components/controls/ChannelFavButton.vue';
import type { DatabaseChannel, ServicesChannelInfo } from '~/services/api/v1/StreamSinkClient';
import { useNuxtApp } from '#app/nuxt';
import { useAsyncData } from '#app';

const config = useRuntimeConfig();
const isImporting = ref(false);
const fileUrl = config.public.fileUrl;
const channelsFile = ref<HTMLInputElement | null>(null);

const channels = ref<ServicesChannelInfo[]>([]);

const totalSize = computed(() => channels.value.map(x => x.recordingsSize).reduce((a, b) => a + b, 0) / 1024 / 1024 / 1024);
const totalCount = computed(() => channels.value.map(x => x.recordingsCount).reduce((a, b) => a + b, 0));

/**
 * All client side, creates a JSON file of all channel data.
 * @param client
 */
const downloadChannelsAsJson = () => {
  const { $client } = useNuxtApp();
  $client.channels.channelsList()
      .then(res => {
        downloadObjectAsJson(res.data, 'channels', document.body);
      })
      .catch(res => {
        alert(res.error);
      });
};

const inputFileClick = () => channelsFile.value?.click();

/**
 * File input event listener.
 * @param event
 */
const inputFileChanged = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (!target.files?.length) {
    return;
  }

  const file = target.files[0];

  file.text()
      .then(JSON.parse)
      .then(channels => importChannels(channels));
};

/**
 * Creates for all channels a client side POST create request.
 * @param client
 * @param channelsResponse
 */
const importChannels = (channelsResponse: DatabaseChannel[]) => {
  isImporting.value = true;
  const { $client } = useNuxtApp();

  channelsResponse.forEach(async channel => {
    try {
      const response = await $client.channels.channelsCreate({
        minDuration: channel.minDuration,
        channelName: channel.channelName,
        displayName: channel.displayName,
        isPaused: channel.isPaused,
        skipStart: channel.skipStart,
        tags: channel.tags,
        url: channel.url
      });

      channels.value.push(response.data);
    } catch (err) {
      alert(err);
    }
  });
  isImporting.value = false;
};

const { $client } = useNuxtApp();
const response = await useAsyncData('channels', () => $client.channels.channelsList());
if (response.data.value) {
  channels.value = response.data.value.data.sort((a, b) => a.channelName.localeCompare(b.channelName));
}
</script>
