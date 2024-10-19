import { defineStore } from 'pinia';
import type { Toast, ToastKind, ToastState } from '~/types';

export const useToastStore = defineStore('toast', {
  persist: false,
  state: (): ToastState => ({
    toasts: [],
  }),
  actions: {
    info({ title, message }: { title: string, message: string }) {
      this.add({ title, message, kind: 'info' });
    },
    error({ title, message }: { title: string, message: string }) {
      this.add({ title, message, kind: 'error' });
    },
    warn({ title, message }: { title: string, message: string }) {
      this.add({ title, message, kind: 'warning' });
    },
    success({ title, message }: { title: string, message: string }) {
      this.add({ title, message, kind: 'success' });
    },
    add({ title, message, kind }: { title: string, message: string, kind?: ToastKind }) {
      // The animation can also be implemented with pure CSS, but that free us from this state update logic.
      const toast: Toast = { title, message, kind: kind || 'info', hide: false, created: new Date(), countdown: 100 };
      const i = this.toasts.push(toast) - 1;

      const toastDisplayDurationMs = 3000;
      const id = setInterval(() => {
        const dtMS = ((new Date()).getTime() - toast.created.getTime());
        this.toasts[i]!.countdown = 100 - (dtMS / toastDisplayDurationMs * 100);
        if (this.toasts[i]!.countdown <= 0) {
          clearInterval(id);
          this.toasts[i]!.hide = true;
        }
      }, toastDisplayDurationMs / 10);
    },
    destroy(toast: Toast) {
      const i = this.toasts.findIndex(x => x === toast);
      if (i !== -1) {
        this.toasts.splice(i, 1);
      }
    },
    hide(toast: Toast) {
      const foundToast = this.toasts.find(x => x === toast);
      if (foundToast) {
        foundToast.hide = true;
      }
    },
  },
  getters: {
    getToast(): Toast[] {
      return this.toasts;
    },
  }
});
