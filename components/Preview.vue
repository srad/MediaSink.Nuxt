<template>
  <div class="d-flex position-relative justify-content-center align-items-center">
    <span v-if="previewMissing" class="position-absolute text-warning" style="z-index: 1;text-shadow: -1px 0 black, 0 2px black, 2px 0 black, 0 -1px black;">
      Preview not generated ...
    </span>
    <video ref="video" loop muted playsinline
           class="w-100 h-auto"
           :class="{missing: previewMissing}"
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
  </div>
</template>

<script setup lang="ts">
import { useState } from "#imports";

const emit = defineEmits<{ (e: 'selected', value: string | number): void }>();

const video = useState<HTMLVideoElement | null>('video', () => null);

const errorLoad = useState('errorLoad', () => false);

const props = defineProps<{
  data: string | number
  previewImage?: string
  previewMissing?: boolean
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
  filter: blur(4px);clip-path: inset(0);
}
</style>