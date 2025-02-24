<template>
  <div>
    <ModalConfirmDialog :show="showConfirmToggleWorkerDialog" @cancel="showConfirmToggleWorkerDialog=false" @confirm="toggleWorker">
      <template v-slot:header>
        <div class="d-flex justify-content-between">
          <h5 class="modal-title">
            <span v-if="processingJobs">Pause job worker?</span>
            <span v-else>Resume job worker?</span>
          </h5>
        </div>
      </template>
      <template v-slot:body>
        <span v-if="processingJobs">
          Do you want to pause the job worker?
        </span>
        <span v-else>
          Do you want to resume the job worker?
        </span>
      </template>
    </ModalConfirmDialog>
    <div class="row mb-2">
      <div class="col">
        <div class="d-flex justify-content-end">
          <div class="d-flex justify-content-center">
            <div class="col-auto">
              <button type="button" class="btn me-2" :class="{'btn-success': !processingJobs, 'btn-danger': processingJobs}" @click="showConfirmToggleWorkerDialog=true">
                <span v-if="processingJobs"><i class="bi bi-pause-fill blink"/> <span class="ms-1 d-none d-sm-inline-flex">Pause</span></span>
                <span v-else><i class="bi bi-play-fill"/> <span class="ms-1 d-none d-sm-inline-flex">Resume</span></span>
              </button>
            </div>
            <!-- filter row -->
            <div class="row align-items-center">
              <div class="col-auto">
                <select id="limit" class="form-select" v-model="take">
                  <option value="" style="font-weight: bold" disabled>{{ t('filter.limit') }}</option>
                  <option v-for="limit in limits" :key="limit" :value="limit">{{ limit }}</option>
                </select>
              </div>

              <div class="col-auto">
                <button type="button" class="btn btn-primary" @click="resetFilters">{{ t('filter.reset') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ul class="nav nav-tabs my-2" id="pills-tab" role="tablist">
      <li class="nav-item" role="presentation">
        <NuxtLink class="text-decoration-none" to="/jobs/general">
          <button data-tab="general" class="nav-link" :class="{active: route.params.tab === 'general'}" id="pills-open-tab" data-bs-toggle="pill" data-bs-target="#pills-open" type="button" role="tab" aria-controls="pills-open" aria-selected="true">
            {{ t('general.open') }} <i class="bi bi-arrow-clockwise"/>
          </button>
        </NuxtLink>
      </li>
      <li class="nav-item" role="presentation">
        <NuxtLink to="/jobs/completed" class="text-decoration-none">
          <button data-tab="completed" class="nav-link" :class="{active: route.params.tab === 'completed'}" id="pills-completed-tab" data-bs-toggle="pill" data-bs-target="#pills-completed" type="button" role="tab" aria-controls="pills-completed" aria-selected="false">
            {{ t('general.completed') }} <i class="bi bi-check2-all"/>
          </button>
        </NuxtLink>
      </li>
      <li class="nav-item" role="presentation">
        <NuxtLink to="/jobs/other" class="text-decoration-none">
          <button data-tab="other" class="nav-link" :class="{active: route.params.tab === 'other'}" id="pills-other-tab" data-bs-toggle="pill" data-bs-target="#pills-other" type="button" role="tab" aria-controls="pills-other" aria-selected="false">
            {{ t('general.other') }}
            <i class="bi bi-question"/>
          </button>
        </NuxtLink>
      </li>
      <li class="nav-item" role="presentation">
        <NuxtLink to="/jobs/processes" class="text-decoration-none">
          <button data-tab="streams" class="nav-link" :class="{active: route.params.tab === 'processes'}" id="pills-processes-tab" data-bs-toggle="pill" data-bs-target="#pills-processes" type="button" role="tab" aria-controls="pills-processes" aria-selected="false">
            {{ t('general.streams') }} <i class="bi bi-camera-video"/>
          </button>
        </NuxtLink>
      </li>
    </ul>
    <div class="tab-content" id="pills-tabContent">
      <div data-tab="general" class="tab-pane fade" :class="{'show active':  route.params.tab === 'general'}" id="pills-open" role="tabpanel" aria-labelledby="pills-open-tab">
        <JobTable :jobs="itemsOpen" @destroy="destroy" :total-count="itemsCount" :show-progress="true"/>
      </div>

      <div data-tab="completed" class="tab-pane fade" :class="{'show active':  route.params.tab === 'completed'}" id="pills-completed" role="tabpanel" aria-labelledby="pills-completed-tab">
        <JobTable :jobs="itemsCompleted" @destroy="destroy" :total-count="itemsCompletedCount" :show-progress="false"/>
      </div>

      <div data-tab="other" class="tab-pane fade" :class="{'show active':  route.params.tab === 'other'}" id="pills-other" role="tabpanel" aria-labelledby="pills-other-tab">
        <JobTable :jobs="itemsOther" @destroy="destroy" :total-count="itemsCompletedCount" :show-progress="false" :show-info="true"/>
      </div>

      <div data-tab="streams" class="tab-pane fade" :class="{'show active':  route.params.tab === 'processes'}" id="pills-processes" role="tabpanel" aria-labelledby="pills-processes-tab">
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
            <tr>
              <th class="bg-light" style="width: 10%">Channel-Id</th>
              <th class="bg-light" style="width: 10%">Pid</th>
              <th class="bg-light" style="width: 10%">Path</th>
              <th class="bg-light">Args</th>
              <th class="bg-light">Output</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="processes.length===0">
              <td colspan="5">
                None
              </td>
            </tr>
            <tr v-else v-for="p in processes">
              <td>{{ p.id }}</td>
              <td>{{ p.pid }}</td>
              <td>{{ p.path }}</td>
              <td>
                <textarea disabled class="form-control" rows="5">{{ p.args }}</textarea>
              </td>
              <td>
                <textarea disabled class="form-control" rows="5">{{ p.output }}</textarea>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatabaseJob, ResponsesJobsResponse, ServicesProcessInfo as ProcessInfo } from '~/services/api/v1/StreamSinkClient';
import type { JobTableItem } from '~/types';
import { DatabaseJobOrder, DatabaseJobStatus } from '~/services/api/v1/StreamSinkClient';
import { fromNow } from '~/utils/datetime';
import { useJobStore } from '~~/stores/job';
import ModalConfirmDialog from '~/components/modals/ModalConfirmDialog.client.vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNuxtApp } from '#app/nuxt';
import { useAsyncData } from '#app';
import JobTable from '~/components/JobTable.vue';
import { useRoute } from 'vue-router';
import { definePageMeta, useHead } from '#imports';

useHead({
  title: 'Jobs'
});

definePageMeta({
  keepalive: true
});

const { t } = useI18n();

const jobStore = useJobStore();
const route = useRoute();
const processes = ref<ProcessInfo[]>([]);
const processingJobs = ref(true);
const showConfirmToggleWorkerDialog = ref(false);

const skip = ref(0);
const take = ref(50);
const limits = [
  25,
  50,
  100,
  200,
];

const resetFilters = () => {
  skip.value = 0;
  take.value = 50;
};

const jobsCompleted = ref<ResponsesJobsResponse | null>(null);
const jobsOther = ref<ResponsesJobsResponse | null>(null);

const { $client } = useNuxtApp();

const { data } = await useAsyncData('jobsdata', () => Promise.all([
  $client.jobs.listCreate({
    skip: skip.value,
    take: take.value,
    states: [DatabaseJobStatus.StatusJobOpen],
    sortOrder: DatabaseJobOrder.JobOrderASC
  }),
  $client.jobs.listCreate({
    skip: skip.value,
    take: take.value,
    states: [DatabaseJobStatus.StatusJobCompleted],
    sortOrder: DatabaseJobOrder.JobOrderDESC
  }),
  $client.jobs.listCreate({
    skip: skip.value,
    take: take.value,
    states: [DatabaseJobStatus.StatusJobCanceled, DatabaseJobStatus.StatusJobCanceled, DatabaseJobStatus.StatusJobError],
    sortOrder: DatabaseJobOrder.JobOrderDESC
  }),
  $client.processes.processesList(),
  $client.jobs.workerList(),
]));

if (data.value) {
  const open = data.value[0];
  const completed = data.value[1];
  const others = data.value[2];
  const process = data.value[3];
  const jobWorker = data.value[4];

  if (open.jobs) {
    jobStore.refresh({ jobs: open.jobs, totalCount: open.totalCount });
  }

  if (completed.jobs) {
    jobsCompleted.value = completed;
  }

  if (others.jobs) {
    jobsOther.value = others;
  }

  processes.value = process || [];
  processingJobs.value = jobWorker.isProcessing;
}

const addFromNowToJob = (job: DatabaseJob): JobTableItem => {
  const newJob: JobTableItem = {
    createdAtFromNow: fromNow(Date.parse(job.createdAt)),
    startedFromNow: job.startedAt ? fromNow(Date.parse(job.startedAt)) : '-',
    completedAtFromNow: job.completedAt ? fromNow(Date.parse(job.completedAt)) : '-',
    ...job
  };

  if (job.completedAt && job.startedAt) {
    const end = Date.parse(job.completedAt);
    const start = Date.parse(job.startedAt);
    const diffMS = end - start;
    newJob.jobDuration = `${(diffMS / 1000 / 60).toFixed(1)}min`;
  }
  return newJob;
};

const itemsOpen = computed(() => jobStore.getOpen.map(addFromNowToJob));
const itemsCount = computed(() => jobStore.jobsCount);

const itemsCompleted = computed(() => (jobsCompleted.value?.jobs || []).map(addFromNowToJob));
const itemsCompletedCount = computed(() => jobsCompleted.value?.totalCount || 0);

const itemsOther = computed(() => (jobsOther.value?.jobs || []).map(addFromNowToJob));
//const itemsOtherCount = computed(() => jobsOther.value?.totalCount || 0);

const destroy = (id: number) => {
  if (window.confirm('Delete?')) {
    const { $client } = useNuxtApp();
    $client.jobs.jobsDelete(id)
        .then(() => jobStore.destroy(id))
        .catch((res: any) => alert(res));
  }
};

const toggleWorker = () => {
  const { $client } = useNuxtApp();
  const fn = processingJobs.value ? $client.jobs.pauseCreate : $client.jobs.resumeCreate;

  fn().then(() => {
    processingJobs.value = !processingJobs.value;
  }).catch((res: any) => alert(res.error))
      .finally(() => showConfirmToggleWorkerDialog.value = false);
};
</script>
