<template>
  <div>
    <ModalConfirmDialog :show="showConfirmToggleWorkerDialog" @cancel="showConfirmToggleWorkerDialog=false" @confirm="toggleWorker">
      <template #header>
        <div class="d-flex justify-content-between">
          <h5 class="modal-title">
            <span v-if="processingJobs">Pause job worker?</span>
            <span v-else>Resume job worker?</span>
          </h5>
        </div>
      </template>
      <template #body>
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
                <select ref="filterLimitSelect" id="limit" class="form-select" v-model="take" @change="getData">
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
        <button data-tab="general" class="nav-link" id="pills-open-tab" data-bs-toggle="pill" data-bs-target="#pills-open" type="button" role="tab" aria-controls="pills-open" aria-selected="true">
          {{ t('general.open') }} <i class="bi bi-arrow-clockwise"/>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button data-tab="completed" class="nav-link" id="pills-completed-tab" data-bs-toggle="pill" data-bs-target="#pills-completed" type="button" role="tab" aria-controls="pills-completed" aria-selected="false">
          {{ t('general.completed') }} <i class="bi bi-check2-all"/>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button data-tab="other" class="nav-link" id="pills-other-tab" data-bs-toggle="pill" data-bs-target="#pills-other" type="button" role="tab" aria-controls="pills-other" aria-selected="false">
          {{ t('general.other') }}
          <i class="bi bi-question"/>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button data-tab="streams" class="nav-link" id="pills-processes-tab" data-bs-toggle="pill" data-bs-target="#pills-processes" type="button" role="tab" aria-controls="pills-processes" aria-selected="false">
          {{ t('general.streams') }} <i class="bi bi-camera-video"/>
        </button>
      </li>
    </ul>
    <div class="tab-content" id="pills-tabContent">
      <div data-tab="general" class="tab-pane fade" id="pills-open" role="tabpanel" aria-labelledby="pills-open-tab">
        <JobTable :jobs="itemsOpen" @destroy="destroy" :total-count="itemsCount" :show-progress="true"/>
      </div>

      <div data-tab="completed" class="tab-pane fade" id="pills-completed" role="tabpanel" aria-labelledby="pills-completed-tab">
        <JobTable :jobs="itemsCompleted" @destroy="destroy" :total-count="itemsCompletedCount" :show-progress="false"/>
      </div>

      <div data-tab="other" class="tab-pane fade" id="pills-other" role="tabpanel" aria-labelledby="pills-other-tab">
        <JobTable :jobs="itemsOther" @destroy="destroy" :total-count="itemsCompletedCount" :show-progress="false"/>
      </div>

      <div data-tab="streams" class="tab-pane fade" id="pills-processes" role="tabpanel" aria-labelledby="pills-processes-tab">
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
import JobTable from '../../components/JobTable.vue';
import type { DatabaseJob, ResponsesJobsResponse, ServicesProcessInfo as ProcessInfo } from '../../services/api/v1/StreamSinkClient';
import { DatabaseJobOrder, DatabaseJobStatus } from '../../services/api/v1/StreamSinkClient';
import { fromNow } from '~/utils/datetime';
//import { Tab } from 'bootstrap';
import { useJobStore } from '~/stores/job';
import ModalConfirmDialog from '../../components/modals/ModalConfirmDialog.vue';
import { useI18n, useRoute, useRouter, computed, onMounted, watch, ref } from '#imports';
import { useNuxtApp } from '#app/nuxt';

const { t } = useI18n();

const jobStore = useJobStore();
const route = useRoute();
const router = useRouter();
const processes = ref<ProcessInfo[]>([]);
const processingJobs = ref(true);
const showConfirmToggleWorkerDialog = ref(false);

export interface JobTableItem extends DatabaseJob {
  createdAtFromNow: string;
  startedFromNow?: string;
  completedAtFromNow?: string;
  jobDuration?: string;
}

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

const getData = async () => {
  const { $client } = useNuxtApp();

  const promise = Promise.all([
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
  ]);

  promise.then(res => {
    const open = res[0];
    const completed = res[1];
    const others = res[2];
    const process = res[3];
    const jobWorker = res[4];

    if (open.data.jobs) {
      jobStore.refresh({ jobs: open.data.jobs, totalCount: open.data.totalCount });
    }

    if (completed.data.jobs) {
      jobsCompleted.value = completed.data;
    }

    if (others.data.jobs) {
      jobsOther.value = others.data;
    }

    processes.value = process.data || [];
    processingJobs.value = jobWorker.data.isProcessing;
  });
};

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

const itemsOpen = computed(() => (jobStore.jobs || []).map(addFromNowToJob));
const itemsCount = computed(() => jobStore.jobsCount);

const itemsCompleted = computed(() => (jobsCompleted.value?.jobs || []).map(addFromNowToJob));
const itemsCompletedCount = computed(() => jobsCompleted.value?.totalCount || 0);

const itemsOther = computed(() => (jobsOther.value?.jobs || []).map(addFromNowToJob));
const itemsOtherCount = computed(() => jobsOther.value?.totalCount || 0);

const destroy = (id: number) => {
  if (window.confirm('Delete?')) {
    const { $client } = useNuxtApp();
    $client.jobs.jobsDelete(id)
        .then(() => jobStore.destroy(id))
        .catch(res => alert(res));
  }
};

const selectTab = () => {
  const tab = route.params.tab === '' ? 'general' : route.params.tab;
  document.querySelectorAll(`#pills-tab button[data-tab]`)?.forEach(x => x.classList.remove('active'));
  const button = document.querySelector(`#pills-tab button[data-tab="${tab}"]`);
  if (button) {
    button.classList.add('active');
  }
  const tabItem = document.querySelector(`#pills-tabContent div[data-tab="${tab}"]`);
  if (tabItem) {
    tabItem.classList.add('show');
    tabItem.classList.add('active');
  }
};

const toggleWorker = () => {
  const { $client } = useNuxtApp();
  const fn = processingJobs.value ? $client.jobs.pauseCreate : $client.jobs.resumeCreate;

  fn().then(() => {
    processingJobs.value = !processingJobs.value;
  }).catch(res => alert(res.error))
      .finally(() => showConfirmToggleWorkerDialog.value = false);
};

watch(route, selectTab);

onMounted(() => {
  if (window) {
    selectTab();
    // Bootstrap tab events
    const triggerTabList = document.querySelectorAll('#pills-tab button');
    triggerTabList.forEach(triggerEl => {
      //const tabTrigger = new Tab(triggerEl);

      triggerEl.addEventListener('click', event => {
        event.preventDefault();
        //tabTrigger.show();
        const dataTab = (event.target as HTMLElement).dataset.tab;
        router.push('/jobs' + (dataTab ? '/' + dataTab : ''));
      });
    });
  } else {
    getData();
  }
});
</script>
