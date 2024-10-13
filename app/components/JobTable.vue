<template>
  <div class="table-responsive">
    <table class="table table-sm bg-white table-bordered job-table">
      <thead class="bg-light">
      <tr>
        <th class="bg-light p-2" style="width: 5%">#</th>
        <th class="bg-light p-2" style="width: 7%;min-width: 100px">{{ t('jobTable.col.pid') }}</th>
        <th class="bg-light p-2" style="width: 10%">{{ t('jobTable.col.channel') }}</th>
        <th class="bg-light p-2 align-bottom" style="width: 10%">{{ t('jobTable.col.file') }}</th>
        <th class="bg-light p-2 align-bottom d-none d-lg-table-cell" style="width: 5%">{{ t('jobTable.col.task') }}</th>
        <th class="bg-light p-2 align-bottom d-none d-lg-table-cell" style="width: 5%">{{
            t('jobTable.col.status')
          }}
        </th>
        <th class="bg-light p-2 align-bottom  d-none d-lg-table-cell" style="width:15%">Command</th>
        <th v-if="showProgress || showInfo" class="bg-light p-2 align-bottom" :style="{width:showInfo ? '30%' : '10%'}">
          <span v-if="showInfo">Info</span>
          <span v-else>{{ t('jobTable.col.progress') }}</span>
        </th>
        <th v-if="!showInfo" class="bg-light p-2 align-bottom" style="width:10%">{{ t('jobTable.col.createdAt') }}</th>
        <th v-if="!showInfo" class="bg-light p-2 align-bottom" style="width:10%">{{ t('jobTable.col.startedAt') }}</th>
        <th v-if="!showInfo" class="bg-light p-2 align-bottom" style="width:10%">{{ t('jobTable.col.completedAt') }}</th>
        <th v-if="!showInfo" class="bg-light p-2 align-bottom" style="width:5%">{{ t('jobTable.col.duration') }}</th>
        <th class="bg-light p-2 align-bottom" style="width:5%">{{ t('jobTable.col.destroy') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr class="align-middle" :key="i" v-for="(job, i) in props.jobs" :class="{'table-success': job.active}">
        <td class="text-end p-2">
          {{ i + 1 }}
        </td>
        <td class="text-end p-2">
          <div v-if="job.active" style="width: 1rem; height: 1rem" class="spinner-border text-success" role="status">
            <span class="visually-hidden">{{ t('jobTable.loading') }}</span>
          </div>
          {{ job.pid }}
        </td>
        <td class="p-2">
          <RouterLink :to="`/channel/${job.channelId}/${job.channelName}`">
            {{ job.channelName }}
          </RouterLink>
        </td>
        <td class="p-2">
          <RouterLink :to="'/recordings/' + job.recordingId">
            {{ job.filename }}
          </RouterLink>
        </td>

        <td class="p-1 d-none d-lg-table-cell">
          <span class="badge bg-info p-2 w-100 text-white">
            {{ job.task }}</span>
        </td>
        <td class="p-1 d-none d-lg-table-cell">
          <div class="badge p-2 w-100" :class="{'bg-primary': job.status===DatabaseJobStatus.StatusJobOpen, 'bg-danger blink': job.active, 'bg-success': job.status===DatabaseJobStatus.StatusJobCompleted, 'bg-warning': job.status===DatabaseJobStatus.StatusJobCanceled, 'bg-danger' : job.status===DatabaseJobStatus.StatusJobError}">
            <span v-if="job.status===DatabaseJobStatus.StatusJobOpen && job.active">working</span>
            <span v-else>{{ job.status }}</span>
          </div>
        </td>
        <td class="p-1 d-none d-lg-table-cell">
          <input type="text" class="form-control form-control-sm border-primary-subtle" style="font-size: 0.8rem; font-family: monospace" disabled :value="job.command"/>
        </td>
        <td v-if="showProgress || showInfo" class="p-1">
          <div v-if="job.active" class="progress">
            <div class="progress-bar progress-bar-striped bg-info progress-bar-animated" role="progressbar" :style="'width:'+ job.progress + '%'" :aria-valuenow="job.progress" aria-valuemin="0" :aria-valuemax="100"></div>
          </div>
          <div v-if="showInfo">
            <textarea class="form-control form-control-sm text-wrap" style="font-size: 0.8rem" rows="3">{{ job.info }}</textarea>
          </div>
        </td>
        <td v-if="!showInfo" class="p-1 f-sm f-sm">
          {{ job.createdAtFromNow }}
        </td>
        <td v-if="!showInfo" class="p-1 f-sm">
          {{ job.startedFromNow }}
        </td>
        <td v-if="!showInfo" class="p-1">
          {{ job.completedAtFromNow }}
        </td>
        <td v-if="!showInfo" class="p-1 f-sm">
          {{ job.jobDuration }}
        </td>
        <td class="p-1">
          <div class="btn-group-sm btn-group w-100">
            <button class="btn btn-outline-danger btn-sm" @click="emit('destroy', job.jobId)">Destroy</button>
          </div>
        </td>
      </tr>

      <tr v-if="jobs.length === 0">
        <td colspan="13" class="text-center">
          <p class="m-0">{{ t('jobTable.noJobs') }}</p>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { JobTableItem } from '~/pages/jobs/[tab].vue';
import { useI18n } from '#imports';
import { DatabaseJobStatus } from '~/services/api/v1/StreamSinkClient';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'destroy', value: number): void
  (e: 'info', value: number): void
}>();

const props = defineProps<{
  jobs: JobTableItem[];
  totalCount: number;
  showProgress: boolean;
  showInfo?: boolean;
}>();
</script>

<style scoped>
.job-table * {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.job-table .f-sm {
  font-size: 0.9rem;
}

.job-table th {
  font-size: 0.9rem;
}
</style>
