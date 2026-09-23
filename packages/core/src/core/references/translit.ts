/**
 * Транслитерация для идентификаторов.
 *
 * Идентификатор — это ключ, по которому значение хранится в базе, ездит
 * в API и попадает в ссылки. Кириллица там ненадёжна: в URL она кодируется
 * в нечитаемую последовательность, а при смене кодировки где-нибудь по пути
 * ключ перестаёт совпадать сам с собой.
 *
 * Правило: идентификаторы всегда латиницей, человеческие названия — на любом
 * языке. Название и ключ живут отдельно, поэтому переименование не ломает
 * сохранённые данные.
 */

const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/**
 * Название → идентификатор.
 *
 * «Метис или беспородная» → «metis-ili-besporodnaya»
 * «Land Cruiser Prado» → «land-cruiser-prado»
 * «Tiggo 7 Pro» → «tiggo-7-pro»
 */
export function toId(value: string): string {
  // Диакритику снимаем ПЕРВОЙ: Škoda → Skoda, Citroën → Citroen.
  // Если сделать это после замены символов, буква с диакритикой уже
  // превратится в дефис, и получится «koda» вместо «skoda».
  const lower = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  // Отдельные буквы, которые NFD не раскладывает.
  const expanded = lower
    .replace(/ß/g, 'ss')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ł/g, 'l')
    .replace(/đ/g, 'd');

  let out = '';
  for (const ch of expanded) {
    if (MAP[ch] !== undefined) out += MAP[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += '-';
  }

  return out.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/** Идентификатор потомка внутри родителя: марка + модель. */
export function toChildId(parentId: string, name: string): string {
  return `${parentId}-${toId(name)}`;
}

/** Проверка: годится ли строка как идентификатор. */
export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}
