<template>
  <video ref="video" loop muted playsinline
         class="w-100 h-auto"
         style="user-select: none; z-index: 0;"
         :poster="previewImage"
         @click="emit('selected', props.data)"
         @contextmenu="context($event)"
         @error="errorLoadImage"
         @mouseleave="leaveVideo($event)"
         @mouseover="hoverVideo($event)"
         @touchend="leaveVideo($event)"
         @touchstart="hoverVideo($event)">
    <source :src="previewVideo">
  </video>
</template>

<script setup lang="ts">
import { ref } from '#imports';

const emit = defineEmits<{ (e: 'selected', value: string | number): void }>();

const video = ref<HTMLVideoElement | null>(null);

const errorLoad = ref(false);

const props = defineProps<{
  data: string | number
  previewImage?: string
  previewVideo?: string
}>();

const context = (e: any) => e.preventDefault();

const hoverVideo = async (event: any) => {
  if (video.value) {
    video.value.playbackRate = 16;
    await video.value.play();
    video.value?.removeAttribute('poster');
  }
};

const leaveVideo = (event: any) => video.value?.pause();

const errorLoadImage = (event: Event) => errorLoad.value = true;
</script>

<style scoped>
.preview-container img, .preview-container video {
  width: 100%;
  height: auto;
  vertical-align: middle;
  z-index: -1;
}

video.missing {
  filter: blur(4px);
  clip-path: inset(0);
}
</style>
