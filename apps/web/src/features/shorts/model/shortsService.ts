import type { NovaShort } from './shortsData';
import { shortsDemo } from './shortsData';

export async function getShorts(): Promise<NovaShort[]> {
  // Позже здесь будет запрос к /api/shorts. Пока модуль автономен и работает на демо-данных.
  return shortsDemo;
}
