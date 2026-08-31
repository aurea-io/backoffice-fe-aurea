import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useTenantStore } from './store/tenantStore';
import { authService } from './services/auth.service';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import GoogleCallbackPage from './features/auth/GoogleCallbackPage';
import MagicLinkPage from './features/auth/MagicLinkPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/ResetPasswordPage';
import { DashboardPage } from './features/dashboard/DashboardPage';

function App() {
  const { setAuth, clearAuth, setInitializing, isAuthenticated } = useAuthStore();
  const { activeTenantId, setActiveTenantId, setCurrentTenant } = useTenantStore();

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
  }, [setAuth, clearAuth, setInitializing, activeTenantId, setCurrentTenant]);

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
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

