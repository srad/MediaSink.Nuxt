<template>
  <Transition name="modal">
    <div v-if="props.show" ref="container" class="modal-mask d-flex align-items-center">
      <div class="modal-container border border-dark">
        <div class="modal-header d-flex justify-content-between px-4 py-2 bg-primary-subtle">
          <slot name="header">default header</slot>
          <button type="button" class="m-0 p-0 btn" @click="emit('close')">
            <i class="bi bi-x-lg text-dark"/>
          </button>
        </div>

        <div class="modal-body px-4">
          <slot name="body">default body</slot>
        </div>

        <div class="modal-footer bg-light p-3">
          <slot name="footer">
            <button class="modal-default-button" @click="emit('close')">OK</button>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean,
  scrollTop?: boolean
}>();

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{ (e: 'close'): void }>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const container = ref<HTMLDivElement | null>(null);

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(() => props.scrollTop, (val) => {
  if (val === true) {
    container.value?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
});

</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
  overflow: auto;
}

.modal-container {
  width: 600px;
  margin: auto;
  height: fit-content;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
