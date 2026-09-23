import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { translate } from '../../shared/i18n';
import { storedLanguage } from './LocaleStore';

type Props = {
  /** Что изолируем: имя категории или подкатегории — попадёт в текст для пользователя. */
  scopeName: string;
  /** Уровень изоляции влияет на текст и на кнопку возврата. */
  level: 'category' | 'subcategory';
  /** Куда вернуться. Для подкатегории — в свою же категорию. */
  fallbackTo?: string;
  /** Смена ключа (обычно адреса) взводит предохранитель заново. */
  resetKey?: string;
  children: ReactNode;
};

type State = { hasError: boolean };

/**
 * Один и тот же предохранитель ставится на двух уровнях:
 * вокруг категории и вокруг конкретной подкатегории.
 *
 * Сбой в «Земельных участках» гасит только этот экран — остальная
 * «Недвижимость» и другие категории продолжают работать.
 */
export class CategoryBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prev: Props) {
    // Ушли с упавшего экрана внутри категории — следующий экран отрисуется
    // нормально. Раньше ошибка «залипала» до перезагрузки страницы.
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Nova/${this.props.level}] изолированный сбой: ${this.props.scopeName}`, error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isSub = this.props.level === 'subcategory';
    const language = storedLanguage();
    return (
      <main className="feature-page">
        <section className="work-panel work-error">
          <h1>
            {translate(language, isSub ? 'category.subUnavailableTitle' : 'category.categoryUnavailableTitle', {
              name: this.props.scopeName,
            })}
          </h1>
          <p>{translate(language, isSub ? 'category.subUnavailableText' : 'category.categoryUnavailableText')}</p>
          <Link className="primary-action" to={this.props.fallbackTo ?? '/'}>
            {translate(language, isSub ? 'list.otherSections' : 'app.toHome')}
          </Link>
        </section>
      </main>
    );
  }
}
