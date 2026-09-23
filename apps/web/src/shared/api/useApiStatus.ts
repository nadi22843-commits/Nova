import { useSyncExternalStore } from 'react';
import { getApiStatus, subscribeApiStatus, type ApiStatus } from './client';

/** Текущий статус сервера для подсказок в интерфейсе. */
export function useApiStatus(): ApiStatus {
  return useSyncExternalStore(subscribeApiStatus, getApiStatus, getApiStatus);
}
