<template>
  <FavButton v-if="!busy" :data="{}" :faved="fav" @fav="bookmark" @unfav="bookmark"/>
  <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { createClient } from '../../services/api/v1/ClientFactory';
import FavButton from './FavButton.vue';
import { useState } from '#imports'

const api = createClient();

const props = defineProps<{
  bookmarked: boolean
  recordingId: number
}>();

const busy = useState('busy', () => false);
const fav = useState('fav', () => props.bookmarked);

const bookmark = () => {
  busy.value = true;
  const fn = fav.value ? api.recordings.unfavPartialUpdate : api.recordings.favPartialUpdate;
  fn(props.recordingId)
      .then(() => fav.value = !fav.value)
      .catch(res => alert(res.error))
      .finally(() => busy.value = false);
};
</script>