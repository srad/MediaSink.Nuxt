import { defineStore } from 'pinia';

export interface ToastState {
  toasts: Toast[];
}

export interface Toast {
  title: string;
  message: string;
  hide: boolean;
  created: Date;
  countdown: number;
}

export const useToastStore = defineStore('toast', {
  persist: true,
  state: (): ToastState => ({
    toasts: [],
  }),
  actions: {
    add(info: { title: string, message: string }) {
      const toast: Toast = { ...info, hide: false, created: new Date(), countdown: 100 };
      this.toasts.push(toast);

      // The animation can also be implemented with pure CSS, but that free us from this state update logic.
      if (import.meta.client) {
        const toastDisplayDurationMs = 3000;
        const id = setInterval(() => {
          const dtMS = ((new Date()).getTime() - toast.created.getTime());
          toast.countdown = 100 - (dtMS / toastDisplayDurationMs * 100);
          if (toast.countdown <= 0) {
            clearInterval(id);
            toast.hide = true;
          }
        }, toastDisplayDurationMs / 10);
      }
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
