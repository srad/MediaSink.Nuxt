<template>
  <button :type="props.buttonType" class="btn btn-primary" :disabled="props.busy">
    <span v-if="props.position==='right'" :class="{'me-2': props.busy}">{{ props.caption }}</span>
    <span v-if="props.busy" class="spinner-border spinner-border-sm" aria-hidden="true"></span>
    <i v-if="props.icon && !props.busy" class="bi" :class="'bi-'+props.icon"></i>
    <span v-if="props.position==='left'" :class="{'ms-2': props.busy}">{{ props.caption }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  caption: string;
  busy: boolean;
  buttonType: 'button' | 'submit';
  position: 'left' | 'right';
  icon?: string;
}>();

</script>

<style scoped>

</style>
