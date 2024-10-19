<template>
  <table class="table table-sm bg-white table-bordered">
    <thead>
    <tr>
      <th class="bg-light px-3">{{ t('videoView.segment.start') }}</th>
      <th class="bg-light px-3">{{ t('videoView.segment.end') }}</th>
      <th class="bg-light px-3">{{ t('videoView.segment.duration') }}</th>
      <th class="bg-light px-3 text-center" v-if="showDestroy">
        <i class="bi bi-trash text-danger px-3"></i>
      </th>
    </tr>
    </thead>
    <tbody>
    <tr class="align-middle" :class="{'bg-secondary': overview.marking.selected}" @click="emit('selected', overview.marking)" :key="String(overview.marking.timestart)+String(overview.marking.timeend)" v-for="overview in markingsOverview">
      <td class="px-3">{{ overview.start }}min</td>
      <td class=" px-3">{{ overview.end }}min</td>
      <td class=" px-3">{{ overview.duration }}min</td>
      <td class="px-3 text-center" v-if="showDestroy">
        <button @click="emit('destroy', overview.marking)" class="btn btn-sm bg-transparent">
          <i class="bi bi-trash text-danger"></i>
        </button>
      </td>
    </tr>
    <tr>
      <td colspan="2" class="px-3 fw-bold bg-warning-subtle">Total</td>
      <td class="px-3 fw-bold bg-warning-subtle">{{ markingsDuration }}min</td>
      <td class="px-3 fw-bold bg-warning-subtle" v-if="showDestroy"></td>
    </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import type { Marking } from '~/types';
import { useI18n } from 'vue-i18n';

// --------------------------------------------------------------------------------------
// Declarations
// --------------------------------------------------------------------------------------

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'selected', value: Marking): void
  (e: 'destroy', value: Marking): void
}>();

const props = defineProps<{ markings: Marking[], showDestroy: boolean }>();

// --------------------------------------------------------------------------------------
// Methods
// --------------------------------------------------------------------------------------

const secondsToTimeCode = (seconds: number) => {
  const date = new Date(0);
  date.setSeconds(seconds);

  const s = date.toISOString().substring(11, 19);

  if (s.startsWith('00:0')) {
    return s.substring(4);
  }

  if (s.startsWith('00:')) {
    return s.substring(3);
  }

  return s;
};

const markingsOverview = computed(() => {
  return props.markings.sort((a, b) => a.timestart - b.timestart).map(x => {
    return {
      marking: x,
      start: secondsToTimeCode(x.timestart),
      end: secondsToTimeCode(x.timeend),
      duration: secondsToTimeCode(x.timeend - x.timestart),
    };
  });
});

const markingsDuration = computed(() => {
  const totalSeconds = props.markings.reduce((acc, current) => acc + (current.timeend - current.timestart), 0);

  return secondsToTimeCode(totalSeconds);
});

</script>
