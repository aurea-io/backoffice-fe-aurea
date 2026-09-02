import { useState, useEffect, useMemo } from 'react';
import {
  Store,
  Plus,
  Search,
  Filter,
  Layers,
  Edit,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Share2,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  superadminService,
  type CreateTenantPayload,
  type UpdateTenantPayload,
} from '../../services/superadmin.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/Dialog';
import { TenantModal } from './components/TenantModal';
import { TenantModulesModal } from './components/TenantModulesModal';
import type { Tenant, Invitation } from '../../types';

const VERTICAL_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: '', label: 'Todos los Rubros', color: '' },
  { value: 'gastronomy', label: 'Gastronomía', color: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'beauty', label: 'Belleza', color: 'text-rose-600 dark:text-rose-400' },
  { value: 'stock', label: 'Pastelería & Stock', color: 'text-amber-600 dark:text-amber-400' },
  { value: 'health', label: 'Salud', color: 'text-cyan-600 dark:text-cyan-400' },
  { value: 'realestate', label: 'Inmobiliaria', color: 'text-sky-600 dark:text-sky-400' },
  { value: 'general', label: 'General', color: 'text-violet-600 dark:text-violet-400' },
];

const verticalLabels: Record<string, string> = {
  gastronomy: 'Gastronomía',
  beauty: 'Belleza & Estética',
  stock: 'Pastelería & Stock',
  health: 'Salud & Bienestar',
  realestate: 'Inmobiliaria',
  general: 'Comercio General',
  system: 'Sistema',
};

export function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verticalFilter, setVerticalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);
  const [tenantToManageModules, setTenantToManageModules] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success notification
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Copy feedback
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

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
    let result = tenants.filter((t) => t.vertical !== 'system');

    if (verticalFilter) {
      result = result.filter((t) => t.vertical === verticalFilter);
    }

    if (statusFilter === 'active') {
      result = result.filter((t) => t.isActive);
    } else if (statusFilter === 'paused') {
      result = result.filter((t) => !t.isActive);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.memberships?.some((m) => m.user?.email.toLowerCase().includes(q)) ||
          t.invitations?.some((i) => i.email.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [tenants, verticalFilter, statusFilter, searchQuery]);

  const handleSaveTenant = async (payload: CreateTenantPayload | UpdateTenantPayload): Promise<Tenant> => {
    let result: Tenant;
    if (tenantToEdit) {
      result = await superadminService.updateTenant(tenantToEdit.id, payload as UpdateTenantPayload);
      setSuccessBanner(`¡Comercio "${result.name}" actualizado correctamente!`);
    } else {
      result = await superadminService.createTenant(payload as CreateTenantPayload);
      setSuccessBanner(`¡Comercio "${result.name}" dado de alta con éxito!`);
    }
    await fetchTenants();
    setTimeout(() => setSuccessBanner(null), 4000);
    return result;
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsDeleting(true);
    try {
      await superadminService.deleteTenant(tenantToDelete.id);
      setSuccessBanner(`¡Comercio "${tenantToDelete.name}" eliminado definitivamente!`);
      setTenantToDelete(null);
      await fetchTenants();
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el tenant');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyInvitationLink = (inv: Invitation) => {
    const link = `${window.location.origin}/register?code=${inv.code}&email=${encodeURIComponent(inv.email)}`;
    navigator.clipboard.writeText(link);
    setCopiedCodeId(inv.id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const shareWhatsApp = (inv: Invitation, tenantName: string) => {
    const link = `${window.location.origin}/register?code=${inv.code}&email=${encodeURIComponent(inv.email)}`;
    const msg = `¡Hola! Ya dimos de alta tu comercio *${tenantName}* en Aurea Pages.\n\nAccedé a tu cuenta y activá tu panel con este enlace de registro:\n${link}\n\n(Código de invitación: *${inv.code}*)`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const realTenants = tenants.filter((t) => t.vertical !== 'system');
  const activeTenantsCount = realTenants.filter((t) => t.isActive).length;

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header estilo Gastos/Orux */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Store size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Gestión de Tenants & Comercios
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Alta de clientes, suscripción de paquetes por rubro, control de invitaciones y bajas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTenants}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTenantToEdit(null);
              setIsCreateModalOpen(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Nuevo Tenant
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-sm animate-in fade-in-0 duration-150">
          <CheckCircle size={18} className="shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="glass" padding="sm" className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Total Comercios</span>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{realTenants.length}</p>
        </Card>
        <Card variant="glass" padding="sm" className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Comercios Activos</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeTenantsCount}</p>
        </Card>
        <Card variant="glass" padding="sm" className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Comercios Pausados</span>
          <p className="text-2xl font-bold text-zinc-500">{realTenants.length - activeTenantsCount}</p>
        </Card>
        <Card variant="glass" padding="sm" className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-semibold uppercase">Invitaciones Pendientes</span>
          <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {realTenants.reduce((acc, t) => acc + (t.invitations?.filter((i) => !i.used).length || 0), 0)}
          </p>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por comercio, slug, código de invitación o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#12131e] text-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-400"
          />
        </div>

        {/* Vertical Filter */}
        <select
          value={verticalFilter}
          onChange={(e) => setVerticalFilter(e.target.value)}
          className="bg-white dark:bg-[#12131e] text-zinc-900 dark:text-zinc-100 text-xs font-semibold rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500 min-w-[160px]"
        >
          {VERTICAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200/80 dark:border-zinc-700/60 shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Activos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'paused'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Pausados
          </button>
        </div>
      </div>

      {/* Tenants List */}
      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" label="Cargando tenants..." />
        </div>
      ) : filteredTenants.length === 0 ? (
        <Card variant="glass" padding="md" className="text-center py-16">
          <Store size={40} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">No se encontraron comercios</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery || verticalFilter || statusFilter !== 'all'
              ? 'Probá ajustando los filtros o el término de búsqueda.'
              : 'Todavía no diste de alta ningún tenant. Creá el primero para comenzar.'}
          </p>
          {!searchQuery && !verticalFilter && statusFilter === 'all' && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => {
                setTenantToEdit(null);
                setIsCreateModalOpen(true);
              }}
              leftIcon={<Plus size={15} />}
            >
              Crear Primer Tenant
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((tenant) => {
            const activeFeaturesList = tenant.features ? tenant.features.filter((f) => f.isEnabled) : [];
            const ownerMembership = tenant.memberships?.find((m) => m.role === 'OWNER');
            const pendingInvitation = tenant.invitations?.find((i) => !i.used);

            return (
              <Card
                key={tenant.id}
                variant="glass"
                padding="none"
                className="overflow-hidden hover:border-violet-500/40 transition-all duration-200"
              >
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Identity & Modules */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-base shrink-0 shadow-sm">
                      {tenant.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                          {tenant.name}
                        </h3>
                        <Badge
                          variant={tenant.isActive ? 'emerald' : 'zinc'}
                          size="sm"
                          dot={tenant.isActive}
                        >
                          {tenant.isActive ? 'Publicado' : 'Pausado'}
                        </Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {verticalLabels[tenant.vertical] || tenant.vertical}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-mono">/{tenant.slug}</span>
                        <span>·</span>
                        <a
                          href={`http://localhost:5173/preview/${tenant.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-violet-500 inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Ver Web</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      {/* Active Modules Chips */}
                      <div className="pt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                          Módulos:
                        </span>
                        {activeFeaturesList.map((f) => (
                          <span
                            key={f.featureKey}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/30 capitalize"
                          >
                            {f.featureKey.replace('_', ' ')}
                          </span>
                        ))}
                        {activeFeaturesList.length === 0 && (
                          <span className="text-[10px] text-zinc-400 italic">Sin módulos habilitados</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Owner / Invitation Status */}
                  <div className="lg:w-72 shrink-0 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                    {ownerMembership ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {ownerMembership.user?.name ? ownerMembership.user.name.slice(0, 2).toUpperCase() : 'OW'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-white truncate">
                            {ownerMembership.user?.name || 'Titular'}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">{ownerMembership.user?.email}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <CheckCircle size={10} /> Cuenta Registrada
                          </span>
                        </div>
                      </div>
                    ) : pendingInvitation ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Invitación Pendiente
                          </span>
                          <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            {pendingInvitation.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {pendingInvitation.email}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-[11px] h-7 px-2"
                            onClick={() => copyInvitationLink(pendingInvitation)}
                            leftIcon={
                              copiedCodeId === pendingInvitation.id ? <Check size={12} /> : <Copy size={12} />
                            }
                          >
                            {copiedCodeId === pendingInvitation.id ? '¡Copiado!' : 'Copiar Link'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 h-7 px-2"
                            onClick={() => shareWhatsApp(pendingInvitation, tenant.name)}
                            title="Compartir por WhatsApp"
                          >
                            <Share2 size={13} />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-zinc-400 italic text-[11px]">
                        Sin dueño asignado ni invitación activa.
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTenantToManageModules(tenant)}
                      leftIcon={<Layers size={14} />}
                    >
                      Módulos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTenantToEdit(tenant);
                        setIsCreateModalOpen(true);
                      }}
                      leftIcon={<Edit size={14} />}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-zinc-200 dark:border-zinc-800"
                      onClick={() => setTenantToDelete(tenant)}
                      title="Eliminar comercio definitivamente"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Tenant Modal */}
      <TenantModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTenantToEdit(null);
        }}
        onSave={handleSaveTenant}
        tenantToEdit={tenantToEdit}
      />

      {/* Quick Modules Manager Modal */}
      <TenantModulesModal
        isOpen={!!tenantToManageModules}
        onClose={() => setTenantToManageModules(null)}
        tenant={tenantToManageModules}
        onSaved={fetchTenants}
      />

      {/* Delete Permanent Confirmation Dialog */}
      <Dialog
        open={!!tenantToDelete}
        onOpenChange={(open) => !open && !isDeleting && setTenantToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle size={24} />
              </div>
              <DialogTitle className="text-rose-600 dark:text-rose-400">
                ¿Eliminar Tenant Definitivamente?
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-zinc-600 dark:text-zinc-300">
              Estás a punto de eliminar de forma permanente el comercio{' '}
              <strong className="text-zinc-900 dark:text-white font-bold">
                "{tenantToDelete?.name}"
              </strong>{' '}
              (<span className="font-mono text-xs">/{tenantToDelete?.slug}</span>).
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-semibold">⚠️ Acción irreversible:</p>
            <p>
              Se purgarán de la base de datos todas las configuraciones, módulos asignados, miembros vinculados e invitaciones pendientes asociadas a este tenant.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setTenantToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteTenant}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              leftIcon={<Trash2 size={14} />}
            >
              Sí, Eliminar Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
