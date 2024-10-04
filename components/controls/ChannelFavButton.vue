<template>
  <FavButton v-if="!busy" :data="{}" :faved="fav" @fav="bookmark" @unfav="bookmark"/>
  <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
</template>

<script setup lang="ts">
import { createClient } from '../../services/api/v1/ClientFactory.ts';
import { useCookie, useState, watch } from '#imports'
import FavButton from './FavButton.vue';
import { TOKEN_NAME } from "~/services/auth.service";

// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  bookmarked: boolean
  channelId: number
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const busy = useState('busy', () => false);
const fav = useState('fav', () => props.bookmarked);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(() => props.bookmarked, val => fav.value = val);

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const bookmark = () => {
  busy.value = true;
  const tokenCookie = useCookie(TOKEN_NAME);
  const api = createClient(tokenCookie);
  const fn = fav.value ? api.channels.unfavPartialUpdate : api.channels.favPartialUpdate;

  fn(props.channelId)
      .then(() => fav.value = !fav.value)
      .catch(res => alert(res.error))
      .finally(() => busy.value = false);
};
</script>