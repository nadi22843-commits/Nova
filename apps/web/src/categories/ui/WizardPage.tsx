import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsForStep } from '../core/filtering';

import { currencySymbol, useLocale } from '../core/LocaleStore';
import { resolveOptions, loadReference, isReferenceField, translateLabel } from '@nova/core';
import { loadDraft, saveDraft, clearDraft } from '../core/draftStore';
import { useAuth } from '../core/AuthGate';
import { usePlace } from '../core/places/PlaceStore';
import type { CategoryModule, DealType, FieldDef, Subcategory } from '../core/types';
import { createUserListing } from '../../features/listings/model/UserListingsStore';
import { createListing, uploadPhoto } from '../../shared/api/listings';
import { loadServerCatalog } from '../../shared/api/ServerCatalog';
import { ApiError, apiErrorText } from '../../shared/api/client';
import { safe } from '../../components/safety/safeAction';
import { BlockGuard } from '../../components/safety/SafeBoundary';
import { useT } from '../../shared/i18n/useT';

/**
 * Мастер публикации.
 *
 * Шаги и поля берутся из конфигурации подкатегории. Прогресс виден,
 * черновик сохраняется после каждого шага, последний шаг — предпросмотр.
 */
export function WizardPage({
  category,
  sub,
  deal,
}: {
  category: CategoryModule;
  sub: Subcategory;
  deal?: DealType;
}) {
  const t = useT();
  const navigate = useNavigate();
  const { isSignedIn, isServerSession, requireAuth } = useAuth();
  const { country, formatMoney, language } = useLocale();
  const { selection } = usePlace();

  const total = sub.steps.length;
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [photo, setPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');

  // Публикация закрыта входом уже на входе в мастер, как и /publish:
  // сюда можно попасть напрямую из категории («Продать», «Сдать»),
  // и без проверки человек заполнил бы все шаги впустую.
  useEffect(() => {
    if (!isSignedIn) requireAuth('publish', { replace: true });
  }, [isSignedIn, requireAuth]);

  // Восстановление черновика — один раз при входе.
  useEffect(() => {
    const draft = loadDraft(category.id, sub.id);
    if (draft) {
      setValues(draft.values);
      setStep(Math.min(draft.step, total));
      setRestored(true);
    }
  }, [category.id, sub.id, total]);

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function persist(nextStep: number) {
    saveDraft({ categoryId: category.id, subcategoryId: sub.id, step: nextStep, values, updatedAt: Date.now() });
  }

  function missingIn(fields: FieldDef[]): string[] {
    return fields
      .filter((f) => {
        const raw = values[f.key]?.trim() ?? '';
        if (f.required && !raw) return true;
        // Числовое поле с буквами ломало фильтры «от–до» и цену объявления (0).
        if (raw && (f.type === 'number' || f.type === 'money') && parseAmount(raw) === null) return true;
        return false;
      })
      .map((f) => {
        const label = translateLabel(f.label, language);
        return values[f.key]?.trim() && (f.type === 'number' || f.type === 'money')
          ? t('wizard.numberOnly', { field: label })
          : label;
      });
  }

  function validateStep(): boolean {
    const missing = missingIn(fieldsForStep(sub, step, deal));
    setErrors(missing);
    return missing.length === 0;
  }

  /**
   * Перед публикацией проверяем ВСЕ шаги, а не только последний.
   * Восстановленный черновик открывается сразу на предпросмотре, поэтому
   * обязательные поля ранних шагов могли остаться пустыми.
   */
  function firstIncompleteStep(): { step: number; missing: string[] } | null {
    for (let i = 1; i < total; i += 1) {
      const missing = missingIn(fieldsForStep(sub, i, deal));
      if (missing.length > 0) return { step: i, missing };
    }
    return null;
  }

  function next() {
    if (!validateStep()) return;
    const nextStep = Math.min(step + 1, total);
    setStep(nextStep);
    persist(nextStep);
  }

  function back() {
    if (step === 1) {
      persist(step);
      navigate(-1);
      return;
    }
    setStep(step - 1);
    setErrors([]);
  }

  function choosePhoto(file?: File) {
    setPhotoError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setPhotoError(t('wizard.photoPick')); return; }
    if (file.size > 900 * 1024) { setPhotoError(t('wizard.photoSize')); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setPhotoError(t('wizard.photoFailed'));
    reader.readAsDataURL(file);
  }

  async function publish() {
    const incomplete = firstIncompleteStep();
    if (incomplete) {
      // Возвращаем на первый незаполненный шаг и показываем, чего не хватает.
      setStep(incomplete.step);
      setErrors(incomplete.missing);
      persist(incomplete.step);
      return;
    }
    // Черновик сохраняем до проверки входа: уход на экран входа размонтирует мастер.
    persist(step);
    if (!requireAuth('publish')) return;
    // Числа в атрибутах храним нормализованными («1 200» → «1200»), иначе
    // фильтры «от–до» не находят объявление.
    const attrs: Record<string, string> = { ...values };
    for (const f of sub.fields) {
      if ((f.type === 'number' || f.type === 'money') && attrs[f.key]) {
        const n = parseAmount(attrs[f.key]);
        if (n !== null) attrs[f.key] = String(n);
      }
    }
    // Место объявления — выбранное в Nova место (если есть), а не
    // несуществующий id вида «ru-all», который не находился ни в фильтре, ни в карточке.
    const draftItem = {
      categoryId: category.id,
      subcategoryId: sub.id,
      deal: deal ?? ('sale' as const),
      title: values.title || sub.title,
      price: parseAmount(values.price ?? values.salary ?? values.cost ?? '') ?? 0,
      currency: country?.currency ?? 'RUB',
      countryCode: country?.code ?? 'RU',
      placeId: values.placeId || selection.placeId || `${(country?.code ?? 'RU').toLowerCase()}-all`,
      lat: selection.placeId ? selection.lat : undefined,
      lon: selection.placeId ? selection.lon : undefined,
      attrs,
    };

    // Вход подтверждён сервером — публикуем на сервере. Объявление уходит
    // на модерацию, поэтому в общих списках появится не сразу.
    if (isServerSession) {
      setPublishing(true);
      try {
        // Фото — тот же data URL, что и для автономного режима, но здесь
        // сначала грузим файл на сервер и передаём только его ключ:
        // без этого выбранное фото в серверном режиме терялось молча.
        let photoKeys: string[] = [];
        if (photo) {
          try {
            photoKeys = [await uploadPhoto(photo)];
          } catch {
            // Фото не загрузилось — публикуем без него, а не рушим публикацию.
          }
        }
        const created = await createListing({ ...draftItem, photoKeys });
        clearDraft(category.id, sub.id);
        void loadServerCatalog(draftItem.countryCode, { force: true });
        navigate(`${category.path}/published`, {
          state: { title: draftItem.title, id: created.id, moderation: created.status === 'moderation' },
        });
        return;
      } catch (error) {
        if (!(error instanceof ApiError && error.isOffline)) {
          // Ошибка сервера — показываем причину и не теряем заполненное.
          setErrors([apiErrorText(error)]);
          return;
        }
        // Сервер недоступен — сохраняем объявление автономно, как раньше.
      } finally {
        setPublishing(false);
      }
    }

    const item = createUserListing({ ...draftItem, image: photo || undefined });
    clearDraft(category.id, sub.id);
    navigate(`${category.path}/published`, { state: { title: item.title, id: item.id, offline: true } });
  }

  const isPreview = step === total;
  // Поля шага зависят и от вида сделки: у аренды свои, у продажи свои.
  const stepFields = fieldsForStep(sub, step, deal);
  const money = country ? currencySymbol(country.currency, country.locale) : '';

  if (!isSignedIn) {
    return (
      <main className="feature-page">
        <section className="work-panel">
          <p className="nova-muted">{t('chat.opening')}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="feature-page">
      <section className="work-panel">
        <button className="nova-back" onClick={safe(t('app.back'), back)} type="button">
          ‹ {t('app.back')}
        </button>

        <div className="nova-progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
          <i style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <p className="nova-counter">
          {t('wizard.step', { current: step, total })} · {translateLabel(sub.steps[step - 1], language)}
        </p>

        {restored && step > 1 && <p className="nova-note">{t('wizard.draftRestored')}</p>}

        <h1>{translateLabel(sub.title, language)}</h1>

        {isPreview ? (
          <>
            <h2>{values.title || translateLabel(sub.title, language)}</h2>
            {values.price && <h2>{formatMoney(parseAmount(values.price) ?? 0)}</h2>}
            <p className="nova-muted">{country?.nativeName}</p>
            <label className="nova-field">
              <span>{t('wizard.photoTitle')}</span>
              <input type="file" accept="image/*" onChange={(e) => safe(t('wizard.photoTitle'), choosePhoto)(e.target.files?.[0])} />
              <small className="nova-hint">{t('wizard.photoSize')}</small>
            </label>
            {photo && <img src={photo} alt={t('wizard.photoTitle')} style={{width:'100%',maxHeight:280,objectFit:'cover',borderRadius:12,marginBottom:12}} />}
            {photoError && <p className="nova-error">{photoError}</p>}
            <dl className="nova-specs">
              {sub.fields
                .filter((f) => f.showInCard && values[f.key])
                .map((f) => (
                  <div key={f.key}>
                    <dt>{translateLabel(f.label, language)}</dt>
                    <dd>
                      {translateLabel(values[f.key], language)}
                      {f.type === 'money' && money ? ` ${money}` : f.unit ? ` ${translateLabel(f.unit, language)}` : ''}
                    </dd>
                  </div>
                ))}
            </dl>
            <div className="nova-actions-row">
              <button
                className="secondary-action"
                onClick={safe(t('app.edit'), () => {
                  setStep(1);
                  persist(1);
                })}
                type="button"
              >
                {t('app.edit')}
              </button>
              <button className="primary-action" onClick={safe(t('account.publish'), publish)} type="button" disabled={publishing}>
                {publishing ? t('login.sending') : t('account.publish')}
              </button>
            </div>
          </>
        ) : (
          <>
            {stepFields.map((f) => (
              // Каждое поле под своим предохранителем: сбой справочника одного поля
              // не ломает форму — остальные поля и «Далее» работают.
              <BlockGuard key={f.key} name={translateLabel(f.label, language)}>
              <WizardField
                key={f.key}
                field={f}
                value={values[f.key] ?? ''}
                values={values}
                subcategoryId={sub.id}
                currency={money}
                onChange={(v) => set(f.key, v)}
              />
              </BlockGuard>
            ))}

            {errors.length > 0 && (
              <p className="nova-error">{t('wizard.required', { fields: errors.join(', ') })}</p>
            )}

            <button className="primary-action nova-sticky-action" onClick={safe(t('wizard.next'), next)} type="button">
              {t('wizard.next')}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

/** «1 200 000», «1200,5» → число. Пустое или нечисловое → null. */
function parseAmount(raw: string): number | null {
  const cleaned = String(raw).replace(/[\s\u00a0\u202f]/g, '').replace(',', '.');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function WizardField({
  field, value, values, subcategoryId, currency, onChange,
}: {
  field: FieldDef;
  value: string;
  values: Record<string, string>;
  subcategoryId: string;
  /** Символ валюты страны — для денежных полей вместо жёсткого «₽» из конфигурации. */
  currency?: string;
  onChange: (v: string) => void;
}) {
  const t = useT();
  const { language } = useLocale();
  const [, forceUpdate] = useState(0);
  // Справочник грузим при показе поля, а не при старте приложения.
  // Загрузка асинхронная: без принудительной перерисовки после её конца поле
  // навсегда остаётся на состоянии «справочник недоступен», даже когда
  // данные уже загружены (счётчик — синтетическая зависимость).
  useEffect(() => {
    if (!isReferenceField(field)) return;
    let cancelled = false;
    loadReference(field.reference!).finally(() => {
      if (!cancelled) forceUpdate((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [field]);

  const label = (
    <span>
      {translateLabel(field.label, language)}
      {field.type === 'money' && currency ? `, ${currency}` : field.unit ? `, ${translateLabel(field.unit, language)}` : ''}
      {field.required ? ' *' : ''}
    </span>
  );

  if (field.type === 'select') {
    const resolved = resolveOptions(field, values, subcategoryId);

    // Справочник недоступен или родительское поле не заполнено — показываем
    // обычный ввод: человек впишет значение руками, форма продолжит работать.
    if (resolved.kind === 'free-text') {
      return (
        <label className="nova-field">
          {label}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={resolved.reason === 'no-parent'}
          />
          <small className="nova-hint">
            {resolved.reason === 'no-parent'
              ? t('wizard.fillAbove')
              : t('wizard.referenceOff')}
          </small>
        </label>
      );
    }

    return (
      <label className="nova-field">
        {label}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{t('app.notSelected')}</option>
          {resolved.values.map((o) => (
            <option key={o} value={o}>{translateLabel(o, language)}</option>
          ))}
        </select>
        {field.hint && <small className="nova-hint">{translateLabel(field.hint, language)}</small>}
      </label>
    );
  }

  if (field.type === 'toggle') {
    // Хранимое значение — стабильный код 'да', а не переведённое слово:
    // объявление, опубликованное на любом языке, одинаково находится фильтром.
    return (
      <label className="nova-field nova-toggle">
        {label}
        <input type="checkbox" checked={value === 'да'} onChange={(e) => onChange(e.target.checked ? 'да' : '')} />
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="nova-field">
        {label}
        <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
        {field.hint && <small className="nova-hint">{translateLabel(field.hint, language)}</small>}
      </label>
    );
  }

  return (
    <label className="nova-field">
      {label}
      <input
        inputMode={field.type === 'number' || field.type === 'money' ? 'numeric' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.hint && <small className="nova-hint">{translateLabel(field.hint, language)}</small>}
    </label>
  );
}
