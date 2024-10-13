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
  persist: false,
  state: (): ToastState => ({
    toasts: [],
  }),
  actions: {
    add(info: { title: string, message: string }) {
      // The animation can also be implemented with pure CSS, but that free us from this state update logic.
      const toast: Toast = { ...info, hide: false, created: new Date(), countdown: 100 };
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
