import AuthService from '../services/auth.service.ts';

export class SocketManager {
  private connection: WebSocket | null = null;
  private listeners: { [key: string]: ((data: Object) => void)[] } = {};
  private static readonly socketUrl: string = import.meta.env.SSR ? import.meta.env.VITE_VUE_APP_SOCKETURL : window.VUE_APP_SOCKETURL;

  connect() {
    if (this.connection !== null) {
      return;
    }

    const header = AuthService.getAuthHeader();
    const token = header?.Authorization;
    if (!header || !token) {
      throw { error: "WebSocket missing authorization token" };
    }

    this.connection = new WebSocket(SocketManager.socketUrl + '?Authorization=' + token);

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