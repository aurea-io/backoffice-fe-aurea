import { useState, useEffect, useMemo } from 'react';
import { Plus, Store, Edit, Search, ArrowRight, ShieldAlert, Filter } from 'lucide-react';
import { superadminService, type CreateTenantPayload, type UpdateTenantPayload } from '../../services/superadmin.service';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TenantModal } from './components/TenantModal';
import type { Tenant } from '../../types';

const VERTICAL_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: '', label: 'Todos', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
  { value: 'gastronomy', label: 'Gastronomía', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' },
  { value: 'beauty', label: 'Belleza', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40' },
  { value: 'stock', label: 'Pastelería & Stock', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40' },
  { value: 'health', label: 'Salud', color: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40' },
  { value: 'realestate', label: 'Inmobiliaria', color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/40' },
  { value: 'general', label: 'General', color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40' },
];

const verticalLabels: Record<string, string> = {
  gastronomy: 'Gastronomía',
  beauty: 'Belleza & Spa',
  stock: 'Pastelería & Stock',
  health: 'Salud',
  realestate: 'Inmobiliaria',
  general: 'General',
  system: 'Sistema',
};

export function SuperadminTenantsPage() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const data = await superadminService.getAllTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = useMemo(() => {
    let result = tenants;

    // Filter out system tenant from the list
    result = result.filter((t) => t.vertical !== 'system');

    if (verticalFilter) {
      result = result.filter((t) => t.vertical === verticalFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q),
      );
    }

    return result;
  }, [tenants, verticalFilter, searchQuery]);

  const handleSaveTenant = async (payload: CreateTenantPayload | UpdateTenantPayload) => {
    if (tenantToEdit) {
      await superadminService.updateTenant(tenantToEdit.id, payload as UpdateTenantPayload);
    } else {
      await superadminService.createTenant(payload as CreateTenantPayload);
    }
    await fetchTenants();
  };

  const handleManageTenant = (tenantId: string) => {
    navigate(`/superadmin/tenants/${tenantId}`);
  };

  const activeTenantCount = tenants.filter((t) => t.isActive && t.vertical !== 'system').length;
  const totalTenantCount = tenants.filter((t) => t.vertical !== 'system').length;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
            <ShieldAlert size={14} />
            Gestión de Comercios
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Tenants
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {activeTenantCount} activos de {totalTenantCount} registrados
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setTenantToEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={16} />}
        >
          Nuevo Tenant
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#12131e] text-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-400"
          />
        </div>

        {/* Vertical Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter size={13} className="text-zinc-400 shrink-0" />
          {VERTICAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVerticalFilter(opt.value)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                verticalFilter === opt.value
                  ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                  : `${opt.color} border-transparent hover:border-zinc-300 dark:hover:border-zinc-600`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants List */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" label="Cargando comercios..." />
        </div>
      ) : filteredTenants.length === 0 ? (
        <Card variant="glass" padding="md" className="text-center py-16">
          <Store size={36} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {searchQuery || verticalFilter
              ? 'No se encontraron tenants con esos filtros.'
              : 'No hay tenants registrados todavía.'}
          </p>
          {!searchQuery && !verticalFilter && (
            <Button
              variant="soft"
              size="sm"
              className="mt-4"
              onClick={() => {
                setTenantToEdit(null);
                setIsModalOpen(true);
              }}
            >
              Crear el primero
            </Button>
          )}
        </Card>
      ) : (
        <Card variant="glass" padding="none" className="overflow-hidden">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredTenants.map((tenant) => {
              const featuresCount = tenant.features ? tenant.features.filter((f) => f.isEnabled).length : 0;
              const membersCount = tenant._count?.memberships || tenant.memberships?.length || 0;

              return (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors group"
                >
                  {/* Tenant Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                      {tenant.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {tenant.name}
                        </p>
                        <Badge
                          variant={tenant.isActive ? 'emerald' : 'zinc'}
                          size="sm"
                          dot={tenant.isActive}
                        >
                          {tenant.isActive ? 'Activo' : 'Pausado'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-zinc-400 font-mono">/{tenant.slug}</span>
                        <span className="text-[10px] text-zinc-300 dark:text-zinc-600">·</span>
                        <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                          {verticalLabels[tenant.vertical] || tenant.vertical}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    <div className="text-center">
                      <p className="text-base font-bold text-zinc-900 dark:text-white">{featuresCount}</p>
                      <p className="text-[10px] text-zinc-400">módulos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-zinc-900 dark:text-white">{membersCount}</p>
                      <p className="text-[10px] text-zinc-400">miembros</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setTenantToEdit(tenant);
                        setIsModalOpen(true);
                      }}
                      title="Editar datos"
                    >
                      <Edit size={13} />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleManageTenant(tenant.id)}
                      rightIcon={<ArrowRight size={13} />}
                    >
                      Gestionar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <TenantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTenant}
        tenantToEdit={tenantToEdit}
      />
    </div>
  );
}
