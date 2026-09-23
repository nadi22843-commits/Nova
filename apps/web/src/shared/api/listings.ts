import { apiRequest, ApiError, API_BASE, readToken } from './client';
import type { CatalogItem } from '../../categories/core/catalogData';
import type { DealType } from '../../categories/core/types';

/**
 * Объявления с сервера.
 *
 * Сервер отдаёт объявление в том же виде, что и демокаталог (CatalogItem),
 * поэтому списки, карточка и фильтры работают без переделки. Здесь остаётся
 * только защита от неполных записей: одно кривое объявление не должно
 * ломать список.
 */

const DEALS: readonly string[] = ['sale', 'rent', 'vacancy', 'resume', 'service'];
const SELLER_KINDS: readonly string[] = ['owner', 'agent', 'company'];

export type ServerListing = CatalogItem & { status?: string };

/** Приводит запись сервера к CatalogItem. null — запись непригодна. */
export function normalizeServerItem(raw: unknown): ServerListing | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, any>;
  if (typeof r.id !== 'string' || !r.id) return null;
  if (typeof r.categoryId !== 'string' || typeof r.subcategoryId !== 'string') return null;
  if (typeof r.title !== 'string' || !r.title) return null;

  const price = Number(r.price);
  const seller = (r.seller ?? {}) as Record<string, any>;
  const kind = SELLER_KINDS.includes(seller.kind) ? seller.kind : 'owner';

  const attrs: Record<string, string> = {};
  if (r.attrs && typeof r.attrs === 'object') {
    for (const [key, value] of Object.entries(r.attrs as Record<string, unknown>)) {
      if (typeof value === 'string') attrs[key] = value;
      else if (typeof value === 'number' || typeof value === 'boolean') attrs[key] = String(value);
    }
  }

  return {
    id: r.id,
    categoryId: r.categoryId,
    subcategoryId: r.subcategoryId,
    deal: (DEALS.includes(r.deal) ? r.deal : 'sale') as DealType,
    title: r.title,
    price: Number.isFinite(price) && price >= 0 ? price : 0,
    currency: typeof r.currency === 'string' && r.currency.length === 3 ? r.currency : 'RUB',
    countryCode: typeof r.countryCode === 'string' ? r.countryCode.toUpperCase() : 'RU',
    placeId: typeof r.placeId === 'string' ? r.placeId : '',
    lat: typeof r.lat === 'number' ? r.lat : undefined,
    lon: typeof r.lon === 'number' ? r.lon : undefined,
    image: typeof r.image === 'string' && r.image ? r.image : '/assets/placeholder.jpg',
    publishedAt: typeof r.publishedAt === 'string' ? r.publishedAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    seller: {
      name: typeof seller.name === 'string' && seller.name ? seller.name : 'Пользователь Nova',
      kind: kind as CatalogItem['seller']['kind'],
      verified: Boolean(seller.verified),
    },
    attrs,
    status: typeof r.status === 'string' ? r.status : undefined,
  };
}

function normalizeList(payload: unknown): { items: ServerListing[]; nextCursor: string | null } {
  const data = (payload ?? {}) as { items?: unknown; nextCursor?: unknown };
  const list = Array.isArray(data.items) ? data.items : [];
  return {
    items: list.map(normalizeServerItem).filter((x): x is ServerListing => x !== null),
    nextCursor: typeof data.nextCursor === 'string' ? data.nextCursor : null,
  };
}

export type ListParams = {
  country: string;
  category?: string;
  subcategory?: string;
  deal?: string;
  q?: string;
  limit?: number;
  cursor?: string;
};

export async function fetchListings(params: ListParams) {
  return normalizeList(
    await apiRequest('/listings', {
      query: {
        country: params.country,
        category: params.category,
        subcategory: params.subcategory,
        deal: params.deal,
        q: params.q,
        limit: params.limit ?? 100,
        cursor: params.cursor,
      },
    }),
  );
}

export async function fetchListing(id: string): Promise<ServerListing | null> {
  try {
    return normalizeServerItem(await apiRequest(`/listings/${encodeURIComponent(id)}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type CreateListingInput = {
  categoryId: string;
  subcategoryId: string;
  deal: DealType;
  title: string;
  price?: number;
  currency: string;
  countryCode: string;
  placeId: string;
  lat?: number;
  lon?: number;
  attrs: Record<string, string>;
  photoKeys?: string[];
};

/** Публикация. Сервер отвечает id и статусом, под которым объявление ушло в выдачу. */
export async function createListing(input: CreateListingInput): Promise<{ id: string; status: string }> {
  return apiRequest<{ id: string; status: string }>('/listings', { method: 'POST', body: input, auth: true });
}

/**
 * Загрузка фото объявления. Отдельно от `apiRequest`: тот всегда шлёт JSON,
 * а файл идёт как multipart/form-data — так его принимает multer на сервере.
 *
 * `photo` — data URL из `FileReader.readAsDataURL` (см. `choosePhoto` в
 * WizardPage): тот же выбор, что уходит в base64 для автономного режима,
 * здесь превращается в файл и грузится на сервер, а в объявление уходит
 * только ключ.
 */
export async function uploadPhoto(photo: string): Promise<string> {
  const blob = await fetch(photo).then((r) => r.blob());
  const form = new FormData();
  form.append('file', blob, 'photo.jpg');

  const token = readToken();
  const response = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError((payload as { error?: string } | null)?.error ?? 'upload_failed', response.status);
  }
  return (payload as { key: string }).key;
}

export async function fetchMyListings(): Promise<ServerListing[]> {
  return normalizeList(await apiRequest('/listings/my/list', { auth: true })).items;
}

export async function closeListing(id: string): Promise<void> {
  await apiRequest(`/listings/${encodeURIComponent(id)}/close`, { method: 'POST', auth: true });
}
