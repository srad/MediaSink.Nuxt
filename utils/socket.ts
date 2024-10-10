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

// The callee can optionally wait for the promise.
// Either, the socket is already open and the promise is resolved.
// Or the connection is created and resolved, once the websocket is open.
export const connectSocket = () => {
  return new Promise<void>((resolve, reject) => {
    // Ignore on server.
    if (!import.meta.browser) {
      resolve();
      return;
    }
    // Already connected
    if (connection !== null) {
      resolve();
      return;
    }

    // Not logged-in.
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn) {
      reject('WebSocket missing authorization token');
    }

    const { $config } = useNuxtApp();
    connection = new WebSocket($config.public.socketUrl + '?Authorization=' + authStore.getToken);

    connection.addEventListener('message', (msg: any) => {
      const json = JSON.parse(msg.data) as { name: string, data: Object };
      notify(json.name, json.data);
    });

    connection.addEventListener('open', () => {
      resolve();
      console.log('open ws');
    });

    connection.addEventListener('close', () => {
      console.log('close ws');
    });

    connection.addEventListener('error', (ev: Event) => {
      console.error(ev);
      reject(ev);
    });
  });
};

// Do not close the socket, since multiple callers might use the connection still, even one does not.
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
