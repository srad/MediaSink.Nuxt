<template>
  <div class="btn-group dropup">
    <button id="optionsButton" type="button" class="btn btn-primary dropdown-toggle" :class="{'show': show}" data-bs-toggle="dropdown" :aria-expanded="String(show)" @click="show=!show">
      Options
    </button>
    <ul class="dropdown-menu" :class="{'show': show}" data-bs-popper="static">
      <li>
        <button type="button" class="dropdown-item d-flex justify-content-between" @click="clickFile">
          <input ref="file" name="file" v-show="false" accept="video/mp4" @change="fileChanged" type="file">
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
        <button type="button" class="dropdown-item d-flex justify-content-between" @click="emit('delete')">
          <span class="me-2">Delete channel</span>
          <i class="bi text-danger bi-trash3-fill"/>
        </button>
      </li>
      <li>
        <div class="dropdown-item form-check form-switch d-flex justify-content-between" v-if="multiSelect">
          <label class="form-check-label m-0 p-0 me-2" for="flexSwitchCheckDefault">Enabled?</label>
          <input class="form-check-input m-0 my-1 p-0" type="checkbox" role="switch" id="flexSwitchCheckDefault" :checked="!props.channelPaused" @change="emit('pause', $event.target as HTMLInputElement)">
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

const props = defineProps<{
  channelPaused: boolean;
  multiSelect: boolean;
}>();

const show = ref(false);

const emit = defineEmits<{
  (e: 'file', value: File): void;
  (e: 'pause', value: HTMLInputElement): void;
  (e: 'delete', value: void): void;
}>();

const file = useTemplateRef<HTMLInputElement>('file');

const clickFile = () => file.value?.click();

const fileChanged = () => {
  const el = file as unknown as HTMLInputElement;

  if (el.files && el.files.length > 0) {
    const firstFile = el.files[0];
    if (firstFile) {
      emit('file', firstFile!);
      // clear old file
      el.value = '';
    }
  }
};

</script>

<style scoped>

</style>
