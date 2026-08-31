import { useLocation, Link } from 'react-router-dom';
import { ExternalLink, Sparkles, Bell, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';

const routeNames: Record<string, string> = {
  '/dashboard': 'Resumen',
  '/catalog': 'Catálogo & Menú',
  '/members': 'Equipo y Roles',
  '/invitations': 'Invitaciones',
  '/settings': 'Ajustes',
  '/profile': 'Mi Perfil',
  '/superadmin': 'Superadmin',
  '/superadmin/tenants': 'Tenants',
  '/superadmin/features': 'Módulos',
};

export function Topbar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();

  const currentTitle = routeNames[location.pathname]
    || (location.pathname.startsWith('/superadmin/tenants/') ? 'Detalle Tenant' : 'Panel');

  return (
    <header className="sticky top-0 right-0 left-0 lg:left-64 h-16 bg-white/85 dark:bg-[#0c0d12]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 lg:px-8 flex items-center justify-between z-30 transition-all">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="lg:hidden flex items-center gap-2 mr-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-sm shadow-xs">
            a
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 truncate">
          <span className="hidden sm:inline font-medium">
            {currentTenant ? currentTenant.name : 'Aurea Pages'}
          </span>
          <span className="hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Public Tenant Preview Link */}
        {currentTenant?.slug && (
          <a
            href={`http://localhost:5173/preview/${currentTenant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 border border-violet-200/80 dark:border-violet-800/40 transition-colors"
          >
            <Globe size={13} />
            <span>Ver Frontend</span>
            <ExternalLink size={11} className="opacity-70" />
          </a>
        )}

        <Badge variant="emerald" size="sm" dot className="hidden xl:inline-flex">
          En línea
        </Badge>

        <ThemeToggle />

        {/* User Pill */}
        {user && (
          <Link
            to="/settings"
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hidden md:inline truncate max-w-[120px]">
              {user.name}
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
