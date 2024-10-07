import { useAuthStore } from '#imports';
import { useNuxtApp } from '#imports';

export class SocketManager {
  private connection: WebSocket | null = null;
  private listeners: { [key: string]: ((data: Object) => void)[] } = {};

  connect() {
    if (!import.meta.browser) {
      return;
    }
    if (this.connection !== null) {
      return;
    }

    const authStore = useAuthStore();
    if (!authStore.getToken) {
      throw { error: 'WebSocket missing authorization token' };
    }

    const { $config } = useNuxtApp();
    this.connection = new WebSocket($config.public.socketUrl + '?Authorization=' + authStore.getToken);

    this.connection.addEventListener('message', (msg: any) => {
      const json = JSON.parse(msg.data) as { name: string, data: Object };
      this.notify(json.name, json.data);
    });

    this.connection.addEventListener('open', () => {
      console.log('open ws');
    });

    this.connection.addEventListener('close', () => {
      console.log('close ws');
    });

    this.connection.addEventListener('error', (ev: Event) => {
      console.error(ev);
    });
  }

  close() {
    this.connection?.close();
    this.connection = null;
    this.listeners = {};
  }

  on(event: string, fn: (data: Object) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(fn);
  }

  notify(event: string, data: object) {
    if (!this.connection) {
      return;
    }

    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
}

export const createSocket = () => {
  return new SocketManager();
};

export const MessageType = {
  HeartBeat: 'heartbeat',

  ChannelOnline: 'channel:online',
  ChannelOffline: 'channel:offline',
  ChannelThumbnail: 'channel:thumbnail',
  ChannelStart: 'channel:start',

  RecordingAdd: 'recording:add',

  JobStart: 'job:start',
  JobCreate: 'job:create',
  JobDestroy: 'job:destroy',
  JobPreviewDone: 'job:preview:done',
  JobProgress: 'job:progress',
  JobDeleted: 'job:deleted',
  JobPreviewProgress: 'job:preview:progress'
};
