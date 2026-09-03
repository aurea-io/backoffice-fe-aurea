import { useState, useMemo, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { Logo } from '../ui/Logo';
import { authService } from '../../services/auth.service';
import { tenantService } from '../../services/tenant.service';
import { useCapability } from '../../hooks/useCapability';
import {
  SUPERADMIN_TAXONOMY,
  PAGE_ICONS,
  SECTION_ICONS,
  DEFAULT_PAGE_ICON,
  DEFAULT_SECTION_ICON,
  type SectionItem,
  type PageItem,
  type ModuleItem,
} from '../../config/taxonomy.config';
import type { NavigationSection } from '../../types/navigation.types';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth, isSuperadmin } = useAuthStore();
  const { currentTenant, clearTenant } = useTenantStore();
  const { hasCapability, hasPermission } = useCapability();

  // Navegación dinámica provista por la Base de Datos
  const [dynamicSections, setDynamicSections] = useState<NavigationSection[]>([]);
  const [isLoadingNav, setIsLoadingNav] = useState(false);

  useEffect(() => {
    if (!currentTenant || isSuperadmin) return;

    let isMounted = true;
    setIsLoadingNav(true);

    tenantService
      .getNavigation()
      .then((data) => {
        if (isMounted && data?.sections) {
          setDynamicSections(data.sections);
        }
      })
      .catch((err) => {
        console.error('Error fetching navigation taxonomy from database:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingNav(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTenant?.tenantId, isSuperadmin]);

  // Estados de expansión de secciones y páginas
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    services: true,
    commerce: true,
    gastronomy: true,
    crm: true,
    marketing: true,
    platform: true,
  });

  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({});

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

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const togglePage = (pageId: string) => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  // Secciones visibles calculadas (100% dinámicas desde la Base de Datos)
  const visibleSections = useMemo((): SectionItem[] => {
    if (isSuperadmin) {
      return [SUPERADMIN_TAXONOMY];
    }

    if (!currentTenant) {
      return [];
    }

    // Mapear la taxonomía recibida del servidor asignando iconos dinámicamente
    return dynamicSections.map((sec) => ({
      id: sec.id,
      name: sec.name,
      description: sec.description,
      icon: SECTION_ICONS[sec.id] ?? DEFAULT_SECTION_ICON,
      pages: sec.pages.map((p) => ({
        id: p.id,
        name: p.name,
        path: p.path,
        icon: PAGE_ICONS[p.id] ?? DEFAULT_PAGE_ICON,
        feature: p.feature,
        modules: p.modules.map((m) => ({
          key: m.key,
          name: m.name,
          description: m.description,
        })),
      })),
    }));
  }, [isSuperadmin, currentTenant, dynamicSections]);

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#0e0f17] border-r border-zinc-200/80 dark:border-zinc-800/80 z-40 justify-between select-none">
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand Header */}
        <div className="p-5 pb-3">
          <Logo size="md" />
        </div>

        {/* Navigation - Árbol Jerárquico: Sección -> Página -> Módulo */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-4 py-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
          {visibleSections.map((section: SectionItem) => {
            const isSectionOpen = expandedSections[section.id] !== false;
            const SectionIcon = section.icon;

            return (
              <div key={section.id} className="space-y-1">
                {/* Nivel 1: SECCIÓN */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {SectionIcon && <SectionIcon size={12} className="opacity-70" />}
                    <span>{section.name}</span>
                  </div>
                  <ChevronDown
                    size={13}
                    className={clsx(
                      'transition-transform duration-200 opacity-60',
                      !isSectionOpen && '-rotate-90',
                    )}
                  />
                </button>

                {/* Nivel 2: PÁGINAS dentro de la Sección */}
                {isSectionOpen && (
                  <ul className="space-y-0.5">
                    {section.pages.map((page: PageItem) => {
                      const PageIcon = page.icon ?? DEFAULT_PAGE_ICON;
                      const hasModules = Boolean(page.modules && page.modules.length > 0);
                      const isPageActive = location.pathname === page.path;
                      // Si no fue clickeado explícitamente, se auto-expande si la página está activa
                      const isPageOpen = expandedPages[page.id] ?? isPageActive;

                      return (
                        <li key={page.id} className="space-y-1">
                          <div className="flex items-center group">
                            <NavLink
                              to={page.path}
                              className={({ isActive }) =>
                                clsx(
                                  'flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 min-w-0',
                                  isActive
                                    ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold shadow-2xs border border-violet-200/60 dark:border-violet-800/30'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100',
                                )
                              }
                            >
                              <PageIcon size={15} className="shrink-0" />
                              <span className="truncate">{page.name}</span>
                            </NavLink>

                            {/* Botón toggle para desplegar/colapsar submódulos */}
                            {hasModules && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  togglePage(page.id);
                                }}
                                title={isPageOpen ? 'Ocultar módulos' : 'Ver módulos'}
                                className="p-1.5 mr-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors shrink-0"
                              >
                                <ChevronDown
                                  size={12}
                                  className={clsx(
                                    'transition-transform duration-200',
                                    !isPageOpen && '-rotate-90',
                                  )}
                                />
                              </button>
                            )}
                          </div>

                          {/* Nivel 3: MÓDULOS (Ramas guía de árbol visual) */}
                          {hasModules && isPageOpen && (
                            <div className="relative ml-5 pl-3 pt-0.5 pb-1 border-l-2 border-zinc-200 dark:border-zinc-800/80 space-y-1">
                              {page.modules!.map((mod) => (
                                <NavLink
                                  key={mod.key}
                                  to={page.path}
                                  className="group flex items-center gap-2 py-1 px-2 rounded-md text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                                >
                                  {/* Conector tipo árbol / dot indicador */}
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-violet-500 transition-colors shrink-0" />
                                  <span className="truncate">{mod.name}</span>
                                </NavLink>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
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
