<template>
  <NuxtLink to="/jobs/general" class="text-decoration-none">
    <button type="button" class="d-flex position-relative me-2 btn btn-info">
      <span class="me-2">{{ props.totalCount }}</span> <span class="me-2">{{ t('menu.jobs') }}</span>
    </button>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { DatabaseJob } from '~/services/api/v1/StreamSinkClient';
import { useI18n } from '#imports';

const { t } = useI18n();
const props = defineProps<{ jobs: DatabaseJob[], totalCount: number }>();
</script>
