import React, { useEffect, useState } from 'react';
import {
  Layers,
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  Tag,
  Award,
  Utensils,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { modulesApi, type TenantModuleItem } from './api';
import { useTenantStore } from '../../../store/tenantStore';
import { api } from '../../../api/client';

const ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Calendar,
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  Tag,
  Award,
  Utensils,
  ChefHat,
};

export default function ModulesPage() {
  const [modules, setModules] = useState<TenantModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { activeTenantId, setNavigation } = useTenantStore();

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await modulesApi.getModules();
      setModules(data);
    } catch (err) {
      console.error('Error loading modules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleToggle = async (mod: TenantModuleItem) => {
    const nextState = !mod.isEnabled;
    setUpdatingKey(mod.key);
    setFeedback(null);

    // Actualización optimista en UI
    setModules((prev) =>
      prev.map((m) => (m.key === mod.key ? { ...m, isEnabled: nextState } : m))
    );

    try {
      const res = await modulesApi.toggleModule(mod.key, nextState);
      setFeedback({
        type: 'success',
        message: res.message || `Módulo "${mod.name}" ${nextState ? 'activado' : 'desactivado'}.`,
      });

      // Refrescar el árbol de navegación del Sidebar
      if (activeTenantId) {
        const { data: navData } = await api.get<{ sections: any[] }>('/tenant/navigation', {
          headers: { 'x-tenant-id': activeTenantId },
        });
        if (navData?.sections) {
          setNavigation(navData.sections);
        }
      }
    } catch (err: any) {
      // Revertir en caso de error
      setModules((prev) =>
        prev.map((m) => (m.key === mod.key ? { ...m, isEnabled: !nextState } : m))
      );
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Error al actualizar el estado del módulo.',
      });
    } finally {
      setUpdatingKey(null);
    }
  };

  const categories = ['Todas', ...Array.from(new Set(modules.map((m) => m.category)))];

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todas' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Personalización del Negocio
          </span>
          <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
            Módulos y Secciones
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Activa o desactiva las funciones operativas de tu comercio para simplificar tu panel.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar módulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white/70 py-2 pl-9 pr-4 text-sm text-zinc-900 outline-none backdrop-blur-md transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-white"
          />
        </div>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label="Cargando catálogo de módulos..." />
        </div>
      ) : filteredModules.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            No se encontraron módulos con los filtros aplicados.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((mod) => {
            const IconComp = ICONS[mod.icon] || Layers;
            const isUpdating = updatingKey === mod.key;

            return (
              <Card
                key={mod.key}
                variant="glass"
                className={`relative overflow-hidden transition-all duration-200 ${
                  mod.isEnabled
                    ? 'border-violet-500/20 shadow-sm'
                    : 'border-zinc-200/60 opacity-70 grayscale-[30%] dark:border-zinc-800/60'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                          mod.isEnabled
                            ? 'bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400'
                            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                        }`}
                      >
                        <IconComp size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                          {mod.name}
                        </CardTitle>
                        <span className="text-[11px] font-semibold text-zinc-400">
                          {mod.category}
                        </span>
                      </div>
                    </div>

                    {/* Toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={mod.isEnabled}
                      disabled={isUpdating}
                      onClick={() => handleToggle(mod)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                        mod.isEnabled
                          ? 'bg-violet-600'
                          : 'bg-zinc-300 dark:bg-zinc-700'
                      } ${isUpdating ? 'cursor-wait opacity-60' : ''}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          mod.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {mod.description}
                  </CardDescription>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400">
                      Ruta:{' '}
                      <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[10px] dark:bg-zinc-800">
                        /{mod.section}/{mod.key}
                      </code>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        mod.isEnabled
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {mod.isEnabled ? 'Habilitado' : 'Inactivo'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
