import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  KeyRound,
  Settings,
  LogOut,
  Layers,
  Store,
  ArrowLeft,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { TenantSwitcher } from '../common/TenantSwitcher';
import { Logo } from '../ui/Logo';
import { authService } from '../../services/auth.service';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, clearAuth, isSuperadmin } = useAuthStore();
  const { currentTenant, hasFeature, clearTenant, platformMode, returnToPlatform } = useTenantStore();

  const isOperationMode = platformMode === 'operation';
  const isSuperadminMode = isSuperadmin && !isOperationMode;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      clearTenant();
      navigate('/login', { replace: true });
    }
  };

  const handleReturnToPlatform = () => {
    returnToPlatform();
    navigate('/superadmin/tenants', { replace: true });
  };

  // ── SuperAdmin Mode: Platform-level navigation ────────────────────────
  const superadminNavItems = [
    {
      label: 'Resumen',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Tenants',
      path: '/superadmin/tenants',
      icon: Store,
    },
    {
      label: 'Módulos',
      path: '/superadmin/features',
      icon: Layers,
    },
  ];

  // ── Operation Mode: Tenant-specific navigation ────────────────────────
  const operationNavItems = [
    {
      label: 'Resumen',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: currentTenant?.vertical === 'beauty' ? 'Servicios' : 'Catálogo / Menú',
      path: '/catalog',
      icon: UtensilsCrossed,
      show: hasFeature('catalog') || isSuperadmin,
    },
    {
      label: 'Equipo y Roles',
      path: '/members',
      icon: Users,
      show: currentTenant?.role === 'OWNER' || currentTenant?.role === 'MANAGER' || isSuperadmin,
    },
    {
      label: 'Invitaciones',
      path: '/invitations',
      icon: KeyRound,
      show: currentTenant?.role === 'OWNER' || currentTenant?.role === 'MANAGER' || isSuperadmin,
    },
    {
      label: 'Ajustes',
      path: '/settings',
      icon: Settings,
      show: currentTenant?.role === 'OWNER' || currentTenant?.role === 'MANAGER' || isSuperadmin,
    },
  ];

  const renderNavLink = (item: { label: string; path: string; icon: React.ComponentType<{ size?: number; className?: string }> }, isSuperadminStyle = false) => (
    <li key={item.path}>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          clsx(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
            isActive
              ? isSuperadminStyle
                ? 'bg-violet-600 text-white font-semibold shadow-xs violet-glow-subtle'
                : 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold shadow-2xs border border-violet-200/60 dark:border-violet-800/30'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100',
          )
        }
      >
        <item.icon size={16} className="shrink-0" />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0e0f17] border-r border-zinc-200/80 dark:border-zinc-800/80 z-40 justify-between">
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-5 pb-3">
          <Logo size="md" />
        </div>

        {/* Context: Back to Platform OR Tenant Switcher */}
        <div className="px-3 pb-3">
          {isOperationMode && isSuperadmin ? (
            <button
              type="button"
              onClick={handleReturnToPlatform}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 border border-violet-200/80 dark:border-violet-800/40 transition-colors"
            >
              <ArrowLeft size={14} className="shrink-0" />
              <span>Volver a Plataforma</span>
            </button>
          ) : isOperationMode ? (
            <TenantSwitcher />
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-5">
          {isSuperadminMode ? (
            /* ── SuperAdmin Platform View ── */
            <div>
              <p className="px-3 text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <ShieldAlert size={11} />
                <span>Plataforma Aurea</span>
              </p>
              <ul className="space-y-0.5">
                {superadminNavItems.map((item) => renderNavLink(item, true))}
              </ul>
            </div>
          ) : (
            /* ── Operation View (inside a tenant) ── */
            <div>
              {currentTenant && (
                <div className="px-3 mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Operando en</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate mt-0.5">{currentTenant.name}</p>
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold capitalize">{currentTenant.vertical}</p>
                </div>
              )}
              <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                Operación
              </p>
              <ul className="space-y-0.5">
                {operationNavItems
                  .filter((item) => item.show)
                  .map((item) => renderNavLink(item))}
              </ul>
            </div>
          )}
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
        {/* User Card */}
        {user && (
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : user.name ? (
                  user.name.slice(0, 2).toUpperCase()
                ) : (
                  <UserIcon size={14} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.name}
                </p>
                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 capitalize truncate">
                  {isSuperadmin ? 'Superadmin' : currentTenant?.role ? currentTenant.role.toLowerCase() : 'Usuario'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-2 text-[10px] text-zinc-400 dark:text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Operativo</span>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
