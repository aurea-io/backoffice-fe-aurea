import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Users,
  MailPlus,
  Settings,
  LogOut,
  User as UserIcon,
  CalendarDays,
  Package,
  Armchair,
  Banknote,
  ChefHat,
  Contact,
  BadgePercent,
  CalendarClock,
  Gift,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { Logo } from '../ui/Logo';
import { authService } from '../../services/auth.service';
import { useCapability } from '../../hooks/useCapability';
import { useDomainPermissions } from '../../hooks/useDomainPermissions';

export function Sidebar() {
  const navigate = useNavigate();
  const { user, clearAuth, isSuperadmin } = useAuthStore();
  const { currentTenant, clearTenant } = useTenantStore();
  const { hasCapability, hasPermission } = useCapability();

  const catalog = useDomainPermissions('catalog');
  const appointments = useDomainPermissions('bookings');
  const inventory = useDomainPermissions('inventory');
  const tables = useDomainPermissions('tables');
  const kitchen = useDomainPermissions('kitchen');
  const clients = useDomainPermissions('clients');
  const marketing = useDomainPermissions('marketing');
  const pos = useDomainPermissions('pos_cashier');

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

  const navItems = [
    {
      label: 'Resumen',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Tenants & Comercios',
      path: '/tenants',
      icon: Store,
      show: isSuperadmin,
    },
    {
      label: 'Planes',
      path: '/superadmin/plans',
      icon: Store,
      show: isSuperadmin,
    },
    {
      label: 'Catálogo',
      path: '/catalog',
      icon: ShoppingBag,
      show: !isSuperadmin && catalog.canRead,
    },
    { label: 'Agenda', path: '/appointments', icon: CalendarDays, show: !isSuperadmin && appointments.canRead },
    { label: 'Reservas de mesa', path: '/table-bookings', icon: CalendarClock, show: !isSuperadmin && appointments.canRead },
    { label: 'Inventario', path: '/inventory', icon: Package, show: !isSuperadmin && inventory.canRead },
    { label: 'Salón', path: '/restaurant', icon: Armchair, show: !isSuperadmin && tables.canRead },
    { label: 'Cocina', path: '/kitchen', icon: ChefHat, show: !isSuperadmin && kitchen.canRead },
    { label: 'Clientes', path: '/clients', icon: Contact, show: !isSuperadmin && clients.canRead },
    { label: 'Cupones', path: '/coupons', icon: BadgePercent, show: !isSuperadmin && marketing.canRead },
    { label: 'Fidelización', path: '/loyalty', icon: Gift, show: !isSuperadmin && marketing.canRead },
    { label: 'Caja', path: '/pos', icon: Banknote, show: !isSuperadmin && pos.canRead },

    {
      label: 'Equipo',
      path: '/members',
      icon: Users,
      show: !isSuperadmin && hasCapability('tenant:employees:read'),
    },
    {
      label: 'Invitaciones',
      path: '/invitations',
      icon: MailPlus,
      show: !isSuperadmin && hasCapability('tenant:employees:manage'),
    },
    {
      label: 'Configuración',
      path: '/settings',
      icon: Settings,
      show: !isSuperadmin && Boolean(currentTenant),
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0e0f17] border-r border-zinc-200/80 dark:border-zinc-800/80 z-40 justify-between">
      <div className="flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-5 pb-3">
          <Logo size="md" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-5">
          <div>
            <p className="px-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
              Principal
            </p>
            <ul className="space-y-0.5">
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                          isActive
                            ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold shadow-2xs border border-violet-200/60 dark:border-violet-800/30'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100',
                        )
                      }
                    >
                      <item.icon size={16} className="shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
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
