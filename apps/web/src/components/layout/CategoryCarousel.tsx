import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { NovaIcon, type NovaIconName } from '../ui/NovaIcon';
import type { ResolvedTile } from '../../categories/core/homeGrid';
import { translateLabel } from '@nova/core';
import { useLocale } from '../../categories/core/LocaleStore';
import { safe } from '../safety/safeAction';
import { useT } from '../../shared/i18n/useT';

/**
 * Карусель категорий.
 *
 * Главный риск горизонтальной прокрутки — люди не догадываются листать вбок
 * и не видят половину категорий. Против этого работают три вещи:
 *
 * 1. Край следующей плитки всегда виден. Обрезанная плитка — самый понятный
 *    сигнал «здесь есть продолжение», сильнее любой стрелки.
 * 2. Затемнение у правого края, пока прокрутка не дошла до конца.
 * 3. Стрелки на широком экране, где нет привычки листать пальцем.
 *
 * Прокрутка идёт с прилипанием: плитка не останавливается наполовину
 * за краем экрана.
 */
export function CategoryCarousel({ tiles }: { tiles: ResolvedTile[] }) {
  const t = useT();
  const { language } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    // Запас в два пикселя: дробное масштабирование браузера мешает
    // точному сравнению.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener('scroll', update, { passive: true });
    // Поворот экрана и изменение окна меняют, сколько плиток помещается.
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, tiles.length]);

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // Листаем почти на экран, оставляя одну плитку для связи с предыдущим
    // положением — так человек не теряет место.
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: 'smooth' });
  }

  return (
    <div className={`nova-carousel${atStart ? ' at-start' : ''}${atEnd ? ' at-end' : ''}`}>
      <button
        className="nova-carousel-arrow left"
        onClick={safe(t('nav.prevCategories'), () => scrollBy(-1))}
        disabled={atStart}
        aria-label={t('nav.prevCategories')}
        type="button"
      >
        ‹
      </button>

      <div className="nova-carousel-track" ref={trackRef} role="list">
        {tiles.map(({ icon, label, to, available, categoryId }) => (
          <Link
            to={to}
            className={`nova-category${available ? '' : ' nova-category-soon'}`}
            key={label}
            role="listitem"
          >
            <span className={`category-icon category-${icon}`}>
              <NovaIcon name={icon as NovaIconName} size={25} />
            </span>
            <b>{categoryId ? translateLabel(label, language) : t('app.allCategories')}</b>
            {available ? null : <small>{t('app.soon')}</small>}
          </Link>
        ))}
      </div>

      <button
        className="nova-carousel-arrow right"
        onClick={safe(t('nav.nextCategories'), () => scrollBy(1))}
        disabled={atEnd}
        aria-label={t('nav.nextCategories')}
        type="button"
      >
        ›
      </button>
    </div>
  );
}
