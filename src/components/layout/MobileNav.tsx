import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, ShoppingBag, Users, Settings } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useCapability } from '../../hooks/useCapability';

export function MobileNav() {
  const { isSuperadmin } = useAuthStore();
  const { hasCapability } = useCapability();

  const navItems = [
    { label: 'Resumen', path: '/dashboard', icon: LayoutDashboard, show: true },
    { label: 'Tenants', path: '/tenants', icon: Store, show: isSuperadmin },
    { label: 'Catálogo', path: '/catalog', icon: ShoppingBag, show: !isSuperadmin && hasCapability('catalog') },
    { label: 'Equipo', path: '/members', icon: Users, show: !isSuperadmin && hasCapability('tenant:employees:read') },
    { label: 'Ajustes', path: '/settings', icon: Settings, show: !isSuperadmin },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0e0f17]/90 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 pb-safe z-40">
      <ul className="flex justify-around items-center h-14">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors',
                    isActive
                      ? 'text-violet-600 dark:text-violet-400 font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
                  )
                }
              >
                <item.icon size={17} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
      </ul>
    </nav>
  );
}
