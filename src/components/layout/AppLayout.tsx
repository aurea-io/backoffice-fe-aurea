import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useTenantStore } from '../../store/tenantStore';
import { useAuthStore } from '../../store/authStore';
import { tenantService } from '../../services/tenant.service';

export function AppLayout() {
  const { activeTenantId, setActiveTenantId, setCurrentTenant, setLoadingTenant, platformMode } = useTenantStore();
  const { tenants, isSuperadmin } = useAuthStore();

  // If in operation mode and no activeTenantId is set, default to the first tenant
  useEffect(() => {
    if (platformMode === 'operation' && !activeTenantId && tenants.length > 0) {
      setActiveTenantId(tenants[0].tenantId);
    }
  }, [activeTenantId, tenants, setActiveTenantId, platformMode]);

  // Sync tenant context whenever activeTenantId changes (only in operation mode)
  useEffect(() => {
    let isMounted = true;

    // Don't load tenant context in superadmin platform mode
    if (platformMode === 'superadmin' && isSuperadmin) return;
    if (!activeTenantId) return;

    async function loadTenantContext() {
      setLoadingTenant(true);
      try {
        const ctx = await tenantService.getContext(activeTenantId || undefined);
        if (isMounted) {
          setCurrentTenant(ctx);
        }
      } catch (err) {
        console.error('Failed to load tenant context:', err);
      } finally {
        if (isMounted) {
          setLoadingTenant(false);
        }
      }
    }

    loadTenantContext();
    return () => {
      isMounted = false;
    };
  }, [activeTenantId, setCurrentTenant, setLoadingTenant, platformMode, isSuperadmin]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d12] text-zinc-900 dark:text-zinc-100 flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-12 animate-in fade-in-50 duration-200">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
