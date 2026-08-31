import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Badge } from '../ui/Badge';

export function Topbar() {
  const location = useLocation();
  const { user, isSuperadmin } = useAuthStore();

  const title = location.pathname.includes('/tenants') ? 'Tenants & Comercios' : 'Resumen';

  return (
    <header className="sticky top-0 right-0 left-0 lg:left-64 h-16 bg-white/85 dark:bg-[#0c0d12]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 lg:px-8 flex items-center justify-between z-30 transition-all">
      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="lg:hidden flex items-center gap-2 mr-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-sm shadow-xs">
            a
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 truncate">
          <span className="hidden sm:inline font-medium">Aurea Backoffice</span>
          <span className="hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge variant="emerald" size="sm" dot className="hidden sm:inline-flex">
          En línea
        </Badge>

        <ThemeToggle />

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left pr-2">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 uppercase">
                {isSuperadmin ? 'Superadmin' : 'Usuario'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
