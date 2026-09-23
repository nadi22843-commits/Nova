import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../../shared/i18n/useT';
import type { TranslationKey } from '../../shared/i18n';

const slides: { eyebrow: TranslationKey; title: TranslationKey; text: TranslationKey; image: string; position: string; to: string }[] = [
  { eyebrow: 'hero.slide1.eyebrow', title: 'hero.slide1.title', text: 'hero.slide1.text', image: '/assets/laptop.jpg', position: 'center 55%', to: '/electronics' },
  { eyebrow: 'hero.slide2.eyebrow', title: 'hero.slide2.title', text: 'hero.slide2.text', image: '/assets/car.jpg', position: 'center 58%', to: '/auto' },
  { eyebrow: 'hero.slide3.eyebrow', title: 'hero.slide3.title', text: 'hero.slide3.text', image: '/assets/house.jpg', position: 'center 52%', to: '/realty' },
];

export function HeroSlider() {
  const t = useT();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const go = (next: number) => setActive((next + slides.length) % slides.length);

  return (
    <section className="nova-hero-slider" aria-label={t('hero.section')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {slides.map((slide, index) => (
        <article className={`nova-hero-slide ${index === active ? 'is-active' : ''}`} key={slide.title} aria-hidden={index !== active}>
          <img className="nova-hero-image" src={slide.image} alt="" style={{ objectPosition: slide.position }} loading={index === 0 ? 'eager' : 'lazy'} />
          <div className="nova-hero-shade" />
          <div className="nova-hero-content">
            <span>{t(slide.eyebrow)}</span>
            <h1>{t(slide.title)}</h1>
            <p>{t(slide.text)}</p>
            <Link className="nova-hero-cta" to={slide.to}>{t('hero.cta')} <b>→</b></Link>
          </div>
        </article>
      ))}
      <button className="nova-hero-arrow is-left" type="button" aria-label={t('hero.prev')} onClick={() => go(active - 1)}>‹</button>
      <button className="nova-hero-arrow is-right" type="button" aria-label={t('hero.next')} onClick={() => go(active + 1)}>›</button>
      <div className="nova-hero-pagination" aria-label={t('hero.pagination')}>
        {slides.map((slide, index) => <button key={slide.title} type="button" className={index === active ? 'is-active' : ''} aria-label={t('hero.slideAria', { n: index + 1 })} onClick={() => setActive(index)} />)}
      </div>
    </section>
  );
}
