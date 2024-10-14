<template>
  <div class="alert shadow-sm rounded-2 border" :class="[alertClassName,borderClassName]">
    <slot/>
  </div>
</template>

<script setup lang="ts">
import { AlertType } from "~~/app/types";
import { computed } from "#imports";

const props = defineProps<{ alertType: AlertType }>();

const classes = {
  [AlertType.Info]: "alert-info",
  [AlertType.Warn]: "alert-warning",
  [AlertType.Error]: "alert-danger",
  [AlertType.Success]: "alert-success",
  [AlertType.Dark]: "alert-dark",
  [AlertType.Default]: "alert-primary",
  [AlertType.Light]: "alert-light",
  [AlertType.Secondary]: "alert-secondary",
};

const borderClasses = {
  [AlertType.Info]: "border-info",
  [AlertType.Warn]: "border-warning",
  [AlertType.Error]: "border-danger",
  [AlertType.Success]: "border-success",
  [AlertType.Dark]: "border-dark",
  [AlertType.Default]: "border-primary",
  [AlertType.Light]: "border-dark-subtle",
  [AlertType.Secondary]: "border-secondary",
};

const alertClassName = computed(() => classes[props.alertType]);
const borderClassName = computed(() => borderClasses[props.alertType]);
</script>

<style scoped>

</style>