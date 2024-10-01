import { DatabaseJobOrder, DatabaseJobStatus } from '~/services/api/v1/StreamSinkClient';
import type { DatabaseJob as JobData } from '~/services/api/v1/StreamSinkClient';
import { createClient } from '~/services/api/v1/ClientFactory';
import { defineStore } from 'pinia';

export interface TaskInfo {
  job: JobData;
  data: {
    steps: number
    step: number
    pid: number
    command: string
    message: string
  };
}

export interface TaskProgress {
  job: JobData;
  data: { current: number, total: number, steps: number, step: number, message: string };
}

export interface JobState {
  jobs: JobData[];
  jobsCount: number;
}

export const useJobStore = defineStore('job', {
  persist: true,
  state(): JobState {
    return {
      jobs: [],
      jobsCount: 0,
    };
  },
  getters: {
    getJobs(): JobData[] {
      return this.jobs || [];
    },
    getOpen(): JobData[] {
      return (this.jobs || []).filter(x => x.status === DatabaseJobStatus.StatusJobOpen);
    }
  },
  actions: {
    create(job: JobData) {
      this.jobs.push(job);
      this.jobsCount += 1;
    },
    done(job: JobData) {
      this.destroy(job.jobId);
      this.dec();
    },
    // Just load 100 jobs for the initial state.
    async load() {
      const api = createClient();
      const res = await api.jobs.listCreate({ skip: 0, take: 100, states: [DatabaseJobStatus.StatusJobOpen], sortOrder: DatabaseJobOrder.JobOrderASC });
      this.update({ jobs: res.data.jobs || [], totalCount: res.data.totalCount });
    },
    dec() {
      this.jobsCount = Math.max(this.jobsCount - 1, 0);
    },
    update(data: { jobs: JobData[], totalCount: number }) {
      this.jobs = data.jobs;
      this.jobsCount = data.totalCount;
    },
    inactive(progress: TaskProgress) {
      const i = this.jobs.findIndex((j: JobData) => j.recordingId === progress.job.recordingId);
      if (i !== -1) {
        this.jobs[i].status = progress.job.status;
        this.jobs[i].active = false;
      }
    },
    start(info: TaskInfo) {
      let i = this.jobs.findIndex((j: JobData) => j.jobId === info.job.jobId);
      if (i === -1) {
        this.jobs.unshift(info.job);
        i = 0;
      }
      this.jobs[i].active = true;
      this.jobs[i].pid = info.data.pid;
      this.jobs[i].command = info.data.command;
    },
    progress(info: TaskProgress) {
      const i = this.jobs.findIndex(j => j.jobId === info.job.jobId);
      const progress = String((info.data.step / info.data.steps) * info.data.current / info.data.total * 100);
      if (i !== -1) {
        this.jobs[i].progress = progress;
        this.jobs[i].info = info.data.message;
      } else {
        this.jobs.unshift(info.job);
        this.jobs[0].progress = progress;
        this.jobs[0].info = info.data.message;
      }
    },
    refresh(data: { jobs: JobData[], totalCount: number }) {
      this.jobs = data.jobs;
      this.jobsCount = data.totalCount;
    },
    destroy(jobId: number) {
      this.jobs = this.jobs.filter((x: JobData) => x.jobId !== jobId);
    },
    deleteChannel(channelId: number) {
      this.jobs = this.jobs.filter((x: JobData) => x.channelId !== channelId);
    },
    deleteRecording(recordingId: number) {
      this.jobs = this.jobs.filter((x: JobData) => x.recordingId !== recordingId);
    }
  }
});