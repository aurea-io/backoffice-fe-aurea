import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, Check, Plus, ShieldAlert, Sparkles } from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export function TenantSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { tenants, isSuperadmin } = useAuthStore();
  const { currentTenant, activeTenantId, setActiveTenantId } = useTenantStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTenant = (tenantId: string) => {
    setActiveTenantId(tenantId);
    setIsOpen(false);
  };

  const selectedTenant =
    tenants.find((t) => t.tenantId === activeTenantId) ||
    (currentTenant ? { name: currentTenant.name, slug: currentTenant.slug, vertical: currentTenant.vertical } : null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60 transition-all text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
            {selectedTenant ? selectedTenant.name.slice(0, 2).toUpperCase() : <Store size={14} />}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider">
              Workspace
            </span>
            <span className="block text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {selectedTenant ? selectedTenant.name : 'Seleccionar Negocio'}
            </span>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-violet-500' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#12131f] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95">
          <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Tus Negocios
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {tenants.map((t) => {
              const isCurrent = t.tenantId === activeTenantId;
              return (
                <button
                  key={t.tenantId}
                  type="button"
                  onClick={() => handleSelectTenant(t.tenantId)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    isCurrent
                      ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 font-semibold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] shrink-0 text-zinc-700 dark:text-zinc-300">
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left truncate">
                      <p className="truncate font-medium">{t.name}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">{t.vertical}</p>
                    </div>
                  </div>
                  {isCurrent && <Check size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />}
                </button>
              );
            })}

            {tenants.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-zinc-400">
                No tienes negocios asignados.
              </div>
            )}
          </div>

          {isSuperadmin && (
            <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/tenants');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
              >
                <ShieldAlert size={14} />
                <span>Panel SuperAdmin</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
