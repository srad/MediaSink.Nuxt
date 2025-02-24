<template>
  <div>
    <div class="mb-2">
      <div class="d-flex justify-content-end">
        <button @click="() => downloadChannelsAsJson()" type="button" class="btn btn-sm btn-primary me-2">
          Export channels
        </button>
        <button @click="inputFileClick" type="button" class="btn btn-sm btn-primary">Import channels</button>
        <input ref="channelsFile" accept="application/json" type="file" name="importChannels" hidden @change="inputFileChanged"/>
      </div>
      <div v-if="isImporting">
        <h6>Importing ...</h6>
        <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 75%"></div>
        </div>
        <hr/>
      </div>
    </div>
    <div class="table-responsive border p-0 mb-2">
      <table class="table table-bordered table-hover table-sm m-0">
        <thead>
        <tr class="align-middle text-center">
          <th rowspan="2" style="width: 1%" class="bg-light p-2">Preview</th>
          <th rowspan="2" style="width: 10%" class="bg-light p-2">Name</th>
          <th rowspan="2" style="width: 20%" class="bg-light p-2">Link</th>
          <th rowspan="2" style="width: 5%" class="bg-light p-2">Favourite?</th>
          <th rowspan="2" style="width: 5%" class="bg-light p-2">Recording?</th>
          <th style="width: 5%" class="bg-light text-center p-2">Count ({{ totalCount }})</th>
          <th style="width: 5%" class="bg-light text-center p-2">Size ({{ totalSize.toFixed(1) }}GB)</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="channel in channels" class="align-middle">
          <td class="text-center p-0">
            <img alt="preview" :src="`${fileUrl}/${channel.preview}`" class="rounded" style="height: 50px; width: auto"/>
          </td>
          <td class="px-2">
            <NuxtLink class="text-decoration-none" :to="`/channel/${channel.channelId}/${channel.channelName}`">
              <h6 class="m-0">{{ channel.channelName }}</h6>
            </NuxtLink>
          </td>
          <td>
            <a :href="channel.url" target="_blank">{{ channel.url }}</a>
          </td>
          <td class="px-2 text-center">
            <ChannelFavButton :bookmarked="channel.fav" :channel-id="channel.channelId"/>
          </td>
          <td class="px-2 text-center">
            <div v-if="channel.isRecording">
              <i class="bi text-danger blink bi-record-fill pulse"></i> Recording
            </div>
          </td>
          <td class="px-2 text-center">{{ channel.recordingsCount }}</td>
          <td class="px-2 text-center">{{ (channel.recordingsSize / 1024 / 1024 / 1024).toFixed(2) }} GB</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, } from 'vue';
import ChannelFavButton from '~/components/controls/ChannelFavButton.vue';
import type { DatabaseChannel, ServicesChannelInfo } from '~/services/api/v1/StreamSinkClient';
import { useNuxtApp } from '#app/nuxt';
import { useAsyncData, useRuntimeConfig } from '#app';
import { useHead } from '#imports';
import { useTemplateRef } from 'vue';
import { downloadObjectAsJson } from '#imports';

useHead({
  title: 'Channels'
});

const config = useRuntimeConfig();
const isImporting = ref(false);
const fileUrl = config.public.fileUrl;
const channelsFile = useTemplateRef<HTMLInputElement>('channelsFile');

const { $client } = useNuxtApp();
const { data } = await useAsyncData<ServicesChannelInfo[]>('channels', () => $client.channels.channelsList());
const sortedChannels = (data.value || []).sort((a: ServicesChannelInfo, b: ServicesChannelInfo) => a.channelName.localeCompare(b.channelName));
const channels = ref(sortedChannels);

const totalSize = computed(() => channels.value.map(x => x.recordingsSize).reduce((a, b) => a + b, 0) / 1024 / 1024 / 1024);
const totalCount = computed(() => channels.value.map(x => x.recordingsCount).reduce((a, b) => a + b, 0));

const downloadChannelsAsJson = async () => {
  try {
    const { $client } = useNuxtApp();
    const channels = await $client.channels.channelsList();
    downloadObjectAsJson(channels, 'channels', document.body);
  } catch (error) {
    alert(error);
  }
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

  file?.text()
      .then(JSON.parse)
      .then(channels => importChannels(channels));
};

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

      channels.value.push(response);
    } catch (err) {
      alert(err);
    }
  });
  isImporting.value = false;
};
</script>
