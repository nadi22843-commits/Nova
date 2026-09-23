import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../../categories/core/LocaleStore';
import { translate } from '../../shared/i18n';
import type { LanguageCode } from '../../categories/core/countries';
import type { TranslationKey } from '../../shared/i18n';

/**
 * Универсальный предохранитель интерфейса.
 *
 * Уровни:
 * - page   — целый экран (Поиск, Shorts, Кабинет…): падает экран, шапка и
 *            остальные разделы работают;
 * - block  — часть экрана (карусель, сетка, действия по вакансии);
 * - action — одна кнопка: вместо неё неактивная заглушка, соседние кнопки живут.
 *
 * resetKey — при его смене предохранитель «взводится» заново. Обычно это адрес:
 * ушёл с упавшего экрана — следующий экран отрисуется нормально, без перезагрузки.
 */

type Level = 'page' | 'block' | 'action';

type Props = {
  /** Название для заглушки. Либо готовая строка, либо ключ перевода (nameKey). */
  name?: string;
  nameKey?: TranslationKey;
  level: Level;
  children: ReactNode;
  /** Своя заглушка вместо стандартной. null — ничего не показывать. */
  fallback?: ReactNode;
  resetKey?: string;
  /** Язык заглушки: класс-компонент не может пользоваться хуками. */
  language?: LanguageCode;
};

/** Название заглушки: ключ перевода имеет приоритет над готовой строкой. */
function guardName(props: { name?: string; nameKey?: TranslationKey }, language: LanguageCode): string {
  return props.nameKey ? translate(language, props.nameKey) : (props.name ?? '');
}

type State = { hasError: boolean };

export class SafeBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Nova/${this.props.level}] изолированный сбой: ${this.props.name}`, error, info);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  private retry = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;

    const { level } = this.props;
    const language = this.props.language ?? 'ru';
    const name = guardName(this.props, language);

    if (level === 'action') {
      return (
        <button className="secondary-action" type="button" disabled title={`${name}: ${translate(language, 'error.block', { name })}`}>
          {name}
        </button>
      );
    }

    if (level === 'block') {
      return (
        <div className="nova-note" role="status">
          {translate(language, 'error.block', { name })}{' '}
          <button className="secondary-action" type="button" onClick={this.retry}>
            {translate(language, 'app.retry')}
          </button>
        </div>
      );
    }

    return (
      <main className="feature-page">
        <section className="work-panel work-error">
          <h1>{translate(language, 'error.page', { name })}</h1>
          <p>{translate(language, 'error.pageNote')}</p>
          <div className="nova-actions-row">
            <button className="primary-action" type="button" onClick={this.retry}>
              {translate(language, 'app.retry')}
            </button>
            <a className="secondary-action" href="/">
              {translate(language, 'app.toHome')}
            </a>
          </div>
        </section>
      </main>
    );
  }
}

/** Экран под предохранителем, который сбрасывается при смене адреса. */
export function PageGuard({ name, nameKey, children, fallback }: { name?: string; nameKey?: TranslationKey; children: ReactNode; fallback?: ReactNode }) {
  const { pathname } = useLocation();
  const { language } = useLocale();
  return (
    <SafeBoundary level="page" name={name} nameKey={nameKey} resetKey={pathname} language={language} fallback={fallback}>
      {children}
    </SafeBoundary>
  );
}

/** Блок страницы под предохранителем. */
export function BlockGuard({ name, nameKey, children, fallback }: { name?: string; nameKey?: TranslationKey; children: ReactNode; fallback?: ReactNode }) {
  const { pathname } = useLocation();
  const { language } = useLocale();
  return (
    <SafeBoundary level="block" name={name} nameKey={nameKey} resetKey={pathname} fallback={fallback} language={language}>
      {children}
    </SafeBoundary>
  );
}

/** Одна кнопка под предохранителем. */
export function ActionGuard({ name, nameKey, children, fallback }: { name?: string; nameKey?: TranslationKey; children: ReactNode; fallback?: ReactNode }) {
  const { pathname } = useLocation();
  const { language } = useLocale();
  return (
    <SafeBoundary level="action" name={name} nameKey={nameKey} resetKey={pathname} fallback={fallback} language={language}>
      {children}
    </SafeBoundary>
  );
}
