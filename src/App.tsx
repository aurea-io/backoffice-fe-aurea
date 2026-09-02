import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useTenantStore } from './store/tenantStore';
import { authService } from './services/auth.service';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SuperadminRoute } from './components/auth/SuperadminRoute';
import { CapabilityRoute } from './components/auth/CapabilityRoute';

import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import GoogleCallbackPage from './features/auth/GoogleCallbackPage';
import MagicLinkPage from './features/auth/MagicLinkPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import { DashboardPage } from './tenant/pages/DashboardPage';
import { SuperadminTenantsPage } from './platform/superadmin/SuperadminTenantsPage';
import CatalogPage from './tenant/sections/commerce/catalog/CatalogPage';
import KitchenPage from './tenant/pages/KitchenPage';
import ClientsPage from './tenant/pages/ClientsPage';
import CouponsPage from './tenant/pages/CouponsPage';
import MembersPage from './tenant/pages/members/MembersPage';
import InvitationsPage from './tenant/pages/invitations/InvitationsPage';
import BillingPage from './tenant/pages/BillingPage';
import SuperadminPlansPage from './platform/superadmin/SuperadminPlansPage';
import AppointmentsPage from './tenant/pages/AppointmentsPage';
import InventoryPage from './tenant/pages/InventoryPage';
import RestaurantPage from './tenant/pages/RestaurantPage';
import PosPage from './tenant/pages/PosPage';
import SettingsPage from './tenant/pages/SettingsPage';
import PublicTenantPreviewPage from './platform/preview/PublicTenantPreviewPage';
import { SuperadminFeaturesPage } from './platform/superadmin/SuperadminFeaturesPage';
import { TenantDetailPage } from './platform/superadmin/TenantDetailPage';

function App() {
  const { setAuth, clearAuth, setInitializing, isAuthenticated } = useAuthStore();
  const { activeTenantId, setActiveTenantId, setCurrentTenant, setCapabilities } = useTenantStore();

  // 1. Silent token refresh on initial startup
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await authService.refresh();
        if (isMounted) {
          setAuth(res.user, res.accessToken, res.tenants);

          // If session is valid, also fetch complete context and superadmin status
          try {
            const meData = await authService.getMe(activeTenantId || undefined);
            if (isMounted) {
              setAuth(
                meData.user,
                res.accessToken,
                meData.allTenants,
                meData.user.isAureaSuperadmin,
              );
              if (meData.currentContext) {
                setCurrentTenant(meData.currentContext);
                try {
                  const capabilities = await authService.getCapabilities(meData.currentContext.tenantId);
                  if (isMounted) setCapabilities(capabilities.map);
                } catch (capabilityErr) {
                  console.error('Error fetching capabilities:', capabilityErr);
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
  }, [setAuth, clearAuth, setInitializing, activeTenantId, setCurrentTenant, setCapabilities]);

  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route path="/auth/magic" element={<MagicLinkPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route element={<CapabilityRoute capability="catalog" permission={['catalog:read', 'catalog.view', 'catalog:write']} />}>
            <Route path="catalog" element={<CatalogPage />} />
          </Route>
          <Route element={<CapabilityRoute capability="bookings" permission={['appointments:read', 'bookings.view']} />}><Route path="appointments" element={<AppointmentsPage />} /></Route>
          <Route element={<CapabilityRoute capability="inventory" permission={['inventory:read', 'inventory.manage']} />}><Route path="inventory" element={<InventoryPage />} /></Route>
          <Route element={<CapabilityRoute capability="tables" permission={['tables.view', 'tables:read', 'orders:create']} />}><Route path="restaurant" element={<RestaurantPage />} /></Route>
          <Route element={<CapabilityRoute capability="kitchen" permission={['kitchen.view', 'kitchen:read']} />}><Route path="kitchen" element={<KitchenPage />} /></Route>
          <Route element={<CapabilityRoute capability="clients" permission={['clients:read', 'clients.view']} />}><Route path="clients" element={<ClientsPage />} /></Route>
          <Route element={<CapabilityRoute capability="marketing" permission="marketing:read" />}><Route path="coupons" element={<CouponsPage />} /></Route>
          <Route element={<CapabilityRoute capability="pos_cashier" permission={['pos.cashier', 'pos:read']} />}><Route path="pos" element={<PosPage />} /></Route>
          <Route element={<CapabilityRoute capability="tenant:employees:read" />}>
            <Route path="members" element={<MembersPage />} />
          </Route>
          <Route element={<CapabilityRoute capability="tenant:employees:manage" />}>
            <Route path="invitations" element={<InvitationsPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/billing" element={<BillingPage />} />

          {/* Superadmin Only Routes */}
          <Route element={<SuperadminRoute />}>
            <Route path="tenants" element={<SuperadminTenantsPage />} />
            <Route path="tenants/:id" element={<TenantDetailPage />} />
            <Route path="superadmin/features" element={<SuperadminFeaturesPage />} />
            <Route path="superadmin/plans" element={<SuperadminPlansPage />} />
            <Route path="preview/:tenantId" element={<PublicTenantPreviewPage />} />
            <Route path="superadmin/tenants" element={<Navigate to="/tenants" replace />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
