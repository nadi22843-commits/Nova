import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../features/search/pages/SearchPage';
import { ShortsPage } from '../features/shorts/pages/ShortsPage';
import { FavoritesPage } from '../features/favorites/pages/FavoritesPage';
import { CartPage } from '../features/cart/pages/CartPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { AccountPage } from '../features/auth/pages/AccountPage';
import { PublishPage } from '../features/publish/pages/PublishPage';
import { SupportPage } from '../features/support/pages/SupportPage';
import { ListingPage } from '../features/listings/pages/ListingPage';
import { FavoritesProvider } from '../features/favorites/model/FavoritesStore';
import { CartProvider } from '../features/cart/model/CartStore';
import { AuthProvider } from '../categories/core/AuthGate';
import { LocaleProvider, useLocale } from '../categories/core/LocaleStore';
import { WelcomePage } from '../categories/ui/WelcomePage';
import { SystemPage } from '../categories/ui/SystemPage';
import { initCountries } from '../categories/core/countryRegistry';
import { PlaceProvider } from '../categories/core/places/PlaceStore';
import { initPlaceLoaders } from '../categories/core/places/data';
import { CategoryRoutes } from '../categories/core/CategoryRoutes';
import { initCategories, getCategories } from '../categories';
import { initUserListings } from '../features/listings/model/UserListingsStore';
import { ChatPage } from '../features/chat/ChatPage';
import { NotificationsPage } from '../features/notifications/pages/NotificationsPage';
import { AppErrorBoundary } from './AppErrorBoundary';
import { PageGuard } from '../components/safety/SafeBoundary';
import { ActionErrorNotice } from '../components/safety/ActionErrorNotice';
import { useServerCatalog } from '../shared/api/useServerCatalog';

// Реестры поднимаются один раз до отрисовки маршрутов.
initCategories();
initCountries();
initPlaceLoaders();
initUserListings();

/**
 * Пока страна не выбрана, приложение показывает только экран приветствия.
 * Валюта и язык всего интерфейса зависят от этого выбора, поэтому без него
 * ни один экран не может отрисоваться корректно.
 */
function CountryGate({ children }: { children: React.ReactNode }) {
  const { country, loading } = useLocale();
  // Объявления сервера подгружаются для выбранной страны; если сервер
  // выключен, остаются демоданные и локальные объявления.
  useServerCatalog();
  if (loading) return null;
  if (!country) return <WelcomePage />;
  // Справочник мест привязан к стране: смена страны пересоздаёт провайдер
  // и сбрасывает выбранное место, которое в новой стране не существует.
  return <PlaceProvider countryCode={country.code}>{children}</PlaceProvider>;
}

export function App() {
  const categories = getCategories();

  return (
    <AppErrorBoundary>
    <LocaleProvider>
      {/* Уведомление использует переводы через useLocale, поэтому оно должно
          находиться внутри LocaleProvider. Иначе приложение падает ещё до
          отрисовки первого экрана с ошибкой «useLocale вызван вне LocaleProvider». */}
      <ActionErrorNotice />
      <CountryGate>
    <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<PageGuard nameKey="nav.home"><HomePage /></PageGuard>} />
                <Route path="/search" element={<PageGuard nameKey="search.title"><SearchPage /></PageGuard>} />
                <Route path="/shorts" element={<PageGuard nameKey="nav.shorts"><ShortsPage /></PageGuard>} />
                <Route path="/favorites" element={<PageGuard nameKey="nav.favorites"><FavoritesPage /></PageGuard>} />
                <Route path="/cart" element={<PageGuard nameKey="nav.cart"><CartPage /></PageGuard>} />
                <Route path="/login" element={<PageGuard nameKey="nav.login"><LoginPage /></PageGuard>} />
                <Route path="/account" element={<PageGuard nameKey="nav.account"><AccountPage /></PageGuard>} />
                <Route path="/publish" element={<PageGuard nameKey="nav.publishPage"><PublishPage /></PageGuard>} />
                <Route path="/support" element={<PageGuard nameKey="nav.support"><SupportPage /></PageGuard>} />
                <Route path="/chat/:listingId" element={<PageGuard nameKey="chat.title"><ChatPage /></PageGuard>} />
                <Route path="/notifications" element={<PageGuard nameKey="nav.notifications"><NotificationsPage /></PageGuard>} />
                <Route path="/listing/:id" element={<PageGuard nameKey="nav.listing"><ListingPage /></PageGuard>} />
                {/* Состояние реестров: что поднялось, что деградировало, что отключено. */}
                <Route path="/system" element={<PageGuard nameKey="nav.system"><SystemPage /></PageGuard>} />

                {/* Маршруты категорий строятся из реестра, а не перечисляются руками. */}
                {categories.map((c) => (
                  <Route key={c.id} path={`${c.path}/*`} element={<CategoryRoutes category={c} />} />
                ))}

                {/* Неизвестный адрес: раньше под шапкой был пустой экран без выхода. */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </CartProvider>
        </FavoritesProvider>
    </AuthProvider>
      </CountryGate>
    </LocaleProvider>
    </AppErrorBoundary>
  );
}
