<template>
  <modal :show="showModal" @close="cancel">
    <template #header>
      <slot name="header"/>
    </template>
    <template #body>
      <slot name="body"/>
    </template>
    <template #footer>
      <div class="modal-footer w-100 bg-light d-flex justify-content-between">
        <button class="btn btn-danger" @click="cancel">Cancel</button>
        <button class="btn btn-primary" @click="ok" :disabled="working">
            <span class="spinner-border spinner-border-sm text-light" role="status" v-show="working">
              <span class="visually-hidden">Loading...</span>
            </span>
          Ok
        </button>
      </div>
    </template>
  </modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';
import { ref, useState, watch } from '#imports';
// --------------------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------------------

const props = defineProps<{
  show: boolean
}>();

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const working = ref(false);
const showModal = ref(false);

// --------------------------------------------------------------------------------------
// Emits
// --------------------------------------------------------------------------------------

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>();

// --------------------------------------------------------------------------------------
// Watchers
// --------------------------------------------------------------------------------------

watch(() => props.show, (val) => {
  working.value = false;
  showModal.value = val;
});

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const ok = () => {
  working.value = true;
  emit('confirm');
};

const cancel = () => {
  working.value = false;
  showModal.value = false;
  emit('cancel');
};
</script>

<style scoped>

</style>
