import { useNuxtApp } from '#imports';
import { useAuthStore } from '~~/stores/auth';

type ListenerType = (data: Object) => void;

let connection: WebSocket | null = null;
const listeners: { [key: string]: ListenerType[] } = {};

const notify = (event: string, data: object) => {
  if (!connection) {
    return;
  }

  if (listeners[event]) {
    listeners[event]!.forEach(fn => fn(data));
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

export const socketOn = (event: string, fn: ListenerType) => {
  if (!listeners[event]) {
    listeners[event] = [];
  }
  listeners[event]!.push(fn);
};

/**
 * The benefit of this function is that is also allows to remove listeners from the open connection.
 * @example
 * const listeners = socketCreateListeners();
 *
 * // Subscribe.
 * listeners.on(JobCreate, () => {
 *     // ...
 * });
 *
 *
 * //Removes all added observers.
 * listeners.off();
 */
export const socketCreateListeners = function () {
  return (function () { // Immediately invoked to create separate scope where listeners are stored.
    const fns: ListenerType[] = [];

    return {
      on(event: string, fn: ListenerType) {
        if (!listeners[event]) {
          listeners[event] = [];
        }
        listeners[event]!.push(fn);
        fns.push(fn);
      },
      off() {
        // Remove all functions from the global "listeners" object.
        for (const name in listeners) {
          const listenerArray = listeners[name];
          if (listenerArray) {
            for (let i = 0; i < listenerArray.length; i++) {
              for (let j = 0; j < fns.length; j++) {
                if (listenerArray[i] === fns[j]) {
                  listenerArray.splice(i, 1);
                  fns.splice(j, 1);
                }
              }
            }
          }
        }
      }
    };
  }());
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
