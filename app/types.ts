import type { DatabaseJob, DatabaseJob as Job, ServicesChannelInfo as ChannelInfo } from '~/services/api/v1/StreamSinkClient';

export enum AlertType {
  Default,
  Info,
  Warn,
  Error,
  Success,
  Secondary,
  Light,
  Dark,
}

export interface TaskInfo {
  steps: number;
  step: number;
  pid: number;
  command: string;
  message: string;
}

export interface JobMessage<T> {
  data: T,
  job: Job
}

export interface TaskComplete {
  steps: number;
  step: number;
  message: string;
}

export interface TaskProgress {
  current: number;
  total: number;
  steps: number;
  step: number;
  message: string;
}

export interface JobState {
  jobs: Job[];
  jobsCount: number;
}

export interface ToastState {
  toasts: Toast[];
}

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  title: string;
  message: string;
  hide: boolean;
  created: Date;
  countdown: number;
  kind: ToastKind;
}

export interface AuthState {
  loggedIn: boolean;
  token: string | null;
}

export interface ChannelState {
  channels: ChannelInfo[];
}

export interface Marking {
  selected?: boolean;
  start: number;
  end: number;
  timestart: number;
  timeend: number;
}

export interface AuthHeader {
  Authorization: string;
}

export interface ChannelUpdate {
  isPaused: boolean,
  channelId: number,
  channelName: string,
  url: string,
  displayName: string,
  skipStart: number
  minDuration: number
}

export interface JobTableItem extends DatabaseJob {
  createdAtFromNow: string;
  startedFromNow?: string;
  completedAtFromNow?: string;
  jobDuration?: string;
}
