import { useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useTenantStore } from './store/tenantStore';
import { authService } from './services/auth.service';
import { tenantService } from './services/tenant.service';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { CapabilityRoute } from './components/auth/CapabilityRoute';

import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import GoogleCallbackPage from './features/auth/GoogleCallbackPage';
import MagicLinkPage from './features/auth/MagicLinkPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import { DashboardPage } from './tenant/core/dashboard/DashboardPage';
import CatalogPage from './tenant/sections/commerce/catalog/CatalogPage';
import OrdersPage from './tenant/sections/commerce/orders/OrdersPage';
import InventoryPage from './tenant/sections/commerce/inventory/InventoryPage';
import PosPage from './tenant/sections/commerce/pos/PosPage';
import TablesPage from './tenant/sections/gastronomy/tables/TablesPage';
import TableBookingsPage from './tenant/sections/gastronomy/tables/TableBookingsPage';
import KitchenPage from './tenant/sections/gastronomy/kitchen/KitchenPage';
import ClientsPage from './tenant/sections/crm/clients/ClientsPage';
import CouponsPage from './tenant/sections/marketing/coupons/CouponsPage';
import LoyaltyPage from './tenant/sections/marketing/loyalty/LoyaltyPage';
import MembersPage from './tenant/core/members/MembersPage';
import InvitationsPage from './tenant/core/members/invitations/InvitationsPage';
import BillingPage from './tenant/core/billing/BillingPage';
import SettingsPage from './tenant/core/theme/SettingsPage';
import ModulesPage from './tenant/core/modules/ModulesPage';
import BookingsPage from './tenant/sections/services/bookings/BookingsPage';
import PublicTenantPreviewPage from './platform/preview/PublicTenantPreviewPage';

const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  catalog: CatalogPage,
  bookings: BookingsPage,
  tables: TablesPage,
  'table-bookings': TableBookingsPage,
  orders: OrdersPage,
  kitchen: KitchenPage,
  inventory: InventoryPage,
  pos: PosPage,
  clients: ClientsPage,
  coupons: CouponsPage,
  loyalty: LoyaltyPage,
  members: MembersPage,
  invitations: InvitationsPage,
  theme: SettingsPage,
  settings: SettingsPage,
  billing: BillingPage,
  modules: ModulesPage,
};

function App() {
  const { setAuth, clearAuth, setInitializing, isAuthenticated } = useAuthStore();
  const { activeTenantId, setCurrentTenant, setCapabilities, navigation, setNavigation } = useTenantStore();

  const dynamicRoutes = useMemo(() => {
    const pages: Array<{
      id: string;
      path: string;
      sectionId: string;
      feature?: string;
      permissions?: string[];
      modules?: Array<{ key: string; name: string; description?: string }>;
    }> = [];

    for (const section of navigation) {
      for (const page of section.pages) {
        pages.push({ ...page, sectionId: section.id });
      }
    }
    return pages;
  }, [navigation]);

  // 1. Silent token refresh on initial startup
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await authService.refresh();
        if (isMounted) {
          setAuth(res.user, res.accessToken, res.tenants);

          // If session is valid, fetch the complete tenant context
          try {
            const meData = await authService.getMe(activeTenantId || undefined);
            if (isMounted) {
              setAuth(
                meData.user,
                res.accessToken,
                meData.allTenants,
              );
              if (meData.currentContext) {
                setCurrentTenant(meData.currentContext);
                try {
                  const [capabilities, navData] = await Promise.all([
                    authService.getCapabilities(meData.currentContext.tenantId),
                    tenantService.getNavigation(),
                  ]);
                  if (isMounted) {
                    setCapabilities(capabilities.map);
                    if (navData?.sections) {
                      setNavigation(navData.sections);
                    }
                  }
                } catch (capabilityErr) {
                  console.error('Error fetching capabilities or navigation:', capabilityErr);
                }
              }
            }
          } catch (ctxErr) {
            console.error('Error fetching context:', ctxErr);
          }
        }
      } catch {
        if (isMounted) {
          clearAuth();
        }
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [setAuth, clearAuth, setInitializing, activeTenantId, setCurrentTenant, setCapabilities, setNavigation]);

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/core/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/core/dashboard" replace /> : <RegisterPage />}
      />
      <Route path="/auth/magic" element={<MagicLinkPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/public/:slug" element={<PublicTenantPreviewPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/core/dashboard" replace />} />
          <Route path="core/dashboard" element={<DashboardPage />} />

          {/* Rutas generadas automáticamente desde la Base de Datos (MongoDB) */}
          {dynamicRoutes.map((page) => {
            const Component = PAGE_COMPONENTS[page.id];
            if (!Component) return null;

            const routePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
            const canonicalPath = `${page.sectionId}/${page.id}`;
            if (routePath === 'core/dashboard') return null;

            if (page.feature) {
              return (
                <Route
                  key={`${page.id}-${routePath}`}
                  element={<CapabilityRoute capability={page.feature} permission={page.permissions} />}
                >
                  <Route path={routePath} element={<Component />} />
                  {canonicalPath !== routePath && <Route path={canonicalPath} element={<Component />} />}
                </Route>
              );
            }

            return (
              <Route
                key={`${page.id}-${routePath}`}
                path={routePath}
                element={<Component />}
              />
            );
          })}

          {/* Subrutas dinámicas para submódulos jerárquicos (ej: core/members/invitations) */}
          {dynamicRoutes.flatMap((page) =>
            (page.modules || []).map((m) => {
              const SubComponent = PAGE_COMPONENTS[m.key];
              if (!SubComponent) return null;
              const routePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
              return (
                <Route
                  key={`${page.id}-${m.key}`}
                  path={`${routePath}/${m.key}`}
                  element={<SubComponent />}
                />
              );
            })
          )}

        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/core/dashboard" replace />} />
    </Routes>
  );
}

export default App;
