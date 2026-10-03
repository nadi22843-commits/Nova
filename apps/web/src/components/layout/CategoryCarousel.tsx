import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ResolvedTile } from '../../categories/core/homeGrid';
import { translateLabel } from '@nova/core';
import { useLocale } from '../../categories/core/LocaleStore';
import { safe } from '../safety/safeAction';
import { useT } from '../../shared/i18n/useT';

const categoryImages: Record<string, string> = {
  auto: '/assets/car.jpg',
  realty: '/assets/house.jpg',
  work: '/assets/apartment.jpg',
  electronics: '/assets/laptop.jpg',
  home: '/assets/category-homegoods.svg',
  services: '/assets/category-services.svg',
  personal: '/assets/category-beauty.svg',
  hobby: '/assets/category-sport.svg',
  pets: '/assets/category-pets.svg',
  travel: '/assets/category-travel.svg',
  kids: '/assets/category-kids.svg',
};

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
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [update, tiles.length]);

  function scrollBy(direction: 1 | -1) {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: 'smooth' });
  }

  return <div className={`nova-carousel${atStart ? ' at-start' : ''}${atEnd ? ' at-end' : ''}`}>
    <button className="nova-carousel-arrow left" onClick={safe(t('nav.prevCategories'), () => scrollBy(-1))} disabled={atStart} aria-label={t('nav.prevCategories')} type="button">‹</button>
    <div className="nova-carousel-track" ref={trackRef} role="list">
      <Link to="/rental" className="nova-category nova-category-circle rental-category-tile" role="listitem">
        <span className="category-circle-image rental-circle-image" style={{ backgroundImage: 'url(/assets/rental-lux-tile.jpg)' }}>
          <span className="rental-tile-badge">НОВИНКА</span>
        </span>
        <b>Аренда люкс</b>
      </Link>
      {tiles.map(({ label, to, available, categoryId }) => {
        const image = categoryImages[categoryId ?? ''] ?? '/assets/hero.jpg';
        return <Link to={to} className={`nova-category nova-category-circle${available ? '' : ' nova-category-soon'}`} key={label} role="listitem">
          <span className="category-circle-image" style={{ backgroundImage: `url(${image})` }} />
          <b>{categoryId ? translateLabel(label, language) : t('app.allCategories')}</b>
          {available ? null : <small>{t('app.soon')}</small>}
        </Link>;
      })}
    </div>
    <button className="nova-carousel-arrow right" onClick={safe(t('nav.nextCategories'), () => scrollBy(1))} disabled={atEnd} aria-label={t('nav.nextCategories')} type="button">›</button>
  </div>;
}
