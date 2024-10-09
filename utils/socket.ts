import { useAuthStore } from '#imports';
import { useNuxtApp } from '#imports';

let connection: WebSocket | null = null;
const listeners: { [key: string]: ((data: Object) => void)[] } = {};

const notify = (event: string, data: object) => {
  if (!connection) {
    return;
  }

  if (listeners[event]) {
    listeners[event].forEach(fn => fn(data));
  }
};

// This function is only called globally once to connect to the server.
export const connectSocket = () => {
  if (!import.meta.browser) {
    return;
  }
  // Already connected
  if (connection !== null) {
    return;
  }

  const authStore = useAuthStore();
  if (!authStore.getToken) {
    throw { error: 'WebSocket missing authorization token' };
  }

  const { $config } = useNuxtApp();
  connection = new WebSocket($config.public.socketUrl + '?Authorization=' + authStore.getToken);

  connection.addEventListener('message', (msg: any) => {
    const json = JSON.parse(msg.data) as { name: string, data: Object };
    notify(json.name, json.data);
  });

  connection.addEventListener('open', () => {
    console.log('open ws');
  });

  connection.addEventListener('close', () => {
    console.log('close ws');
  });

  connection.addEventListener('error', (ev: Event) => {
    console.error(ev);
  });
};

// Do not close the socket, since also other clients might use the connection.
// The more reasonable action is to remove all the client's function from the listeners array.
export const closeSocket = () => {
  /*
  this.connection?.close();
  this.connection = null;
  this.listeners = {};
   */
};

export const socketOn = (event: string, fn: (data: Object) => void) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event].push(fn);
};

export const MessageType = {
  HeartBeat: 'heartbeat',

  ChannelOnline: 'channel:online',
  ChannelOffline: 'channel:offline',
  ChannelThumbnail: 'channel:thumbnail',
  ChannelStart: 'channel:start',

  RecordingAdd: 'recording:add',

  JobActivate: 'job:activate',
  JobDone: 'job:done',
  JobDeactivate: 'job:deactivate',
  JobStart: 'job:start',
  JobCreate: 'job:create',
  JobDelete: 'job:delete',
  JobPreviewDone: 'job:preview:done',
  JobProgress: 'job:progress',
  JobDeleted: 'job:deleted',
  JobPreviewProgress: 'job:preview:progress'
};
