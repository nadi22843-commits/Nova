import { FormEvent, useEffect, useRef, useState } from 'react';
import { shortsDemo } from '../model/shortsData';
import { addShort, getVideoUrl, loadLocalShorts, type LocalShort } from '../../media/model/ShortsStore';
import { useAuth } from '../../../categories/core/AuthGate';
import { useLocale } from '../../../categories/core/LocaleStore';
import { useT } from '../../../shared/i18n/useT';
import type { TranslationKey } from '../../../shared/i18n';

type ViewShort = LocalShort & { videoUrl?: string };

const ERROR_CODES = new Set(['video-read-failed', 'video-duration-unknown', 'video-too-long', 'video-too-large']);

export function ShortsPage() {
  const t = useT();
  const { isSignedIn, requireAuth } = useAuth();
  const { formatMoney } = useLocale();
  const [mine, setMine] = useState<ViewShort[]>(() => loadLocalShorts());
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  // Все созданные object URL — чтобы освободить память при уходе со страницы.
  const urls = useRef<string[]>([]);

  useEffect(() => {
    let live = true;
    Promise.all(
      loadLocalShorts().map(async (x) => {
        const videoUrl = await getVideoUrl(x.id).catch(() => '');
        if (videoUrl) urls.current!.push(videoUrl);
        return { ...x, videoUrl };
      }),
    )
      .then((x) => live && setMine(x))
      .catch(() => {});
    return () => {
      live = false;
      urls.current!.forEach((u) => URL.revokeObjectURL(u));
      urls.current = [];
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    // Правило доступа: смотреть Shorts может гость, добавлять — только после входа.
    if (!requireAuth('shorts')) return;
    if (!file) {
      setError(t('shorts.pickFile'));
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const item = await addShort(file, title, '@nova_user');
      const videoUrl = await getVideoUrl(item.id);
      if (videoUrl) urls.current!.push(videoUrl);
      setMine((x) => [{ ...item, videoUrl }, ...x]);
      setFile(null);
      setTitle('');
      // Сбрасываем и само поле выбора файла, иначе в нём остаётся старое имя.
      if (fileInput.current) fileInput.current.value = '';
    } catch (err) {
      // ShortsStore бросает стабильный код ошибки (не готовый текст),
      // поэтому сообщение показывается на языке интерфейса.
      const code = err instanceof Error ? err.message : '';
      const key = `shorts.error.${code}` as TranslationKey;
      setError(ERROR_CODES.has(code) ? t(key) : t('shorts.failed'));
    } finally {
      setBusy(false);
    }
  }

  return <main className="feature-page"><div className="page-heading"><span className="eyebrow">Nova Shorts</span><h1>{t('nav.shorts')}</h1><p>{t('shorts.subtitle')}</p></div><form className="panel nova-short-upload" onSubmit={submit}><strong>{t('shorts.add')}</strong><input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('shorts.name')} maxLength={80} /><input ref={fileInput} type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} /><small className="nova-muted">{isSignedIn ? t('shorts.limits') : t('shorts.limitsGuest')}</small>{error && <p className="nova-error">{error}</p>}<button className="primary-action" type="submit" disabled={busy}>{busy ? t('shorts.adding') : t('shorts.add.short')}</button></form><div className="shorts-feed">{mine.map(s => <article className="short-card" key={s.id}><div className="short-preview">{s.videoUrl ? <video src={s.videoUrl} controls playsInline preload="metadata" /> : <span className="short-play">▶</span>}</div><div className="short-copy"><strong>{s.title}</strong><span>0:{String(s.duration).padStart(2, '0')}</span><p>{s.seller}</p></div></article>)}{shortsDemo.map(s => <article className="short-card" key={s.id}><div className="short-preview" style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.75),transparent),url(${s.image})` }}><span className="short-play">▶</span></div><div className="short-copy"><strong>{s.title}</strong><span>{s.priceFrom ? `${t('listing.priceFrom')} ` : ''}{formatMoney(s.price)} · {s.duration}</span><p>{s.seller}</p></div></article>)}</div></main>;
}
