/**
 * Sistema de Notificaciones Toast en Tiempo Real (Loading, Success, Error, Info)
 */
import { writable } from 'svelte/store';

export type ToastType = 'loading' | 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

export const toasts = writable<ToastItem[]>([]);

export const toast = {
  loading(title: string, message?: string): string {
    const id = Math.random().toString(36).substring(2, 9);
    toasts.update((items) => [
      ...items,
      { id, type: 'loading', title, message, durationMs: 0 },
    ]);
    return id;
  },

  success(title: string, message?: string, durationMs = 3500) {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: 'success', title, message, durationMs };
    toasts.update((items) => [...items, item]);

    if (durationMs > 0) {
      setTimeout(() => toast.dismiss(id), durationMs);
    }
    return id;
  },

  error(title: string, message?: string, durationMs = 5000) {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: 'error', title, message, durationMs };
    toasts.update((items) => [...items, item]);

    if (durationMs > 0) {
      setTimeout(() => toast.dismiss(id), durationMs);
    }
    return id;
  },

  info(title: string, message?: string, durationMs = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type: 'info', title, message, durationMs };
    toasts.update((items) => [...items, item]);

    if (durationMs > 0) {
      setTimeout(() => toast.dismiss(id), durationMs);
    }
    return id;
  },

  update(id: string, updateData: { type: ToastType; title: string; message?: string; durationMs?: number }) {
    toasts.update((items) =>
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updateData };
          const dur = updateData.durationMs ?? (updateData.type === 'error' ? 5000 : 3500);
          if (dur > 0) {
            setTimeout(() => toast.dismiss(id), dur);
          }
          return updated;
        }
        return item;
      }),
    );
  },

  dismiss(id: string) {
    toasts.update((items) => items.filter((item) => item.id !== id));
  },

  clear() {
    toasts.set([]);
  },
};
