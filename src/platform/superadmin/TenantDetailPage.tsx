import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Layers,
  Users,
  Check,
  Play,
  Pause,
  ArrowRight,
} from 'lucide-react';
import { superadminService, type UpdateTenantPayload } from '../../services/superadmin.service';
import { useTenantStore } from '../../store/tenantStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Tenant, FeatureKey } from '../../types';

// ── Feature Definitions ─────────────────────────────────────────────────
interface FeatureDef {
  key: FeatureKey;
  name: string;
  description: string;
  badge: string;
}

const AVAILABLE_FEATURES: FeatureDef[] = [
  {
    key: 'catalog',
    name: 'Catálogo de Productos & Servicios',
    description: 'Crear items, gestionar precios, categorías e imágenes.',
    badge: 'Base',
  },
  {
    key: 'bookings',
    name: 'Turnos & Reservas',
    description: 'Reserva online con selección de profesional, fecha y horario.',
    badge: 'Servicios',
  },
  {
    key: 'tables',
    name: 'Gestión de Salón & Mesas',
    description: 'Asignación de pedidos por mesa y vista de ticket.',
    badge: 'Gastronomía',
  },
  {
    key: 'delivery',
    name: 'Delivery & Retiro',
    description: 'Carrito de compras con cálculo de envío y confirmación.',
    badge: 'Comercio',
  },
  {
    key: 'reviews',
    name: 'Reseñas & Puntuaciones',
    description: 'Feedback y testimonios de clientes en el frontend.',
    badge: 'Fidelización',
  },
  {
    key: 'social_hub',
    name: 'Social Hub & NFC',
    description: 'Landing tipo link-in-bio para redes sociales.',
    badge: 'Marketing',
  },
];

type TabId = 'general' | 'modules' | 'team';

const verticalLabels: Record<string, string> = {
  gastronomy: 'Gastronomía',
  beauty: 'Belleza & Spa',
  stock: 'Pastelería & Stock',
  health: 'Salud',
  realestate: 'Inmobiliaria',
  general: 'General',
};

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enterTenantOperation } = useTenantStore();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // General tab state
  const [editName, setEditName] = useState('');
  const [editVertical, setEditVertical] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

  // Modules tab state
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({});
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const [featureSuccess, setFeatureSuccess] = useState<string | null>(null);

  const loadTenant = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await superadminService.getTenantById(id);
      setTenant(data);
      populateGeneralForm(data);
      populateFeatures(data);
    } catch (err) {
      console.error('Error loading tenant:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const populateGeneralForm = (t: Tenant) => {
    setEditName(t.name);
    setEditVertical(t.vertical);
    setEditIsActive(t.isActive);
  };

  const populateFeatures = (t: Tenant) => {
    const map: Record<string, boolean> = {};
    AVAILABLE_FEATURES.forEach((f) => {
      map[f.key] = false;
    });
    if (t.features) {
      t.features.forEach((tf) => {
        map[tf.featureKey] = tf.isEnabled;
      });
    }
    setFeatureToggles(map);
  };

  // ── General Tab Handlers ──────────────────────────────────────────────
  const handleSaveGeneral = async () => {
    if (!id || !tenant) return;
    if (!window.confirm('¿Confirmás guardar los cambios de este tenant?')) return;
    setIsSavingGeneral(true);
    setGeneralSuccess(null);
    try {
      const payload: UpdateTenantPayload = {
        name: editName.trim(),
        vertical: editVertical,
        isActive: editIsActive,
      };
      const updated = await superadminService.updateTenant(id, payload);
      setTenant(updated);
      setGeneralSuccess('Datos actualizados correctamente.');
      setTimeout(() => setGeneralSuccess(null), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  // ── Modules Tab Handlers ──────────────────────────────────────────────
  const handleToggleFeature = (key: string) => {
    setFeatureToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveFeatures = async () => {
    if (!id) return;
    if (!window.confirm('¿Confirmás aplicar esta configuración de módulos? El cambio quedará auditado.')) return;
    setIsSavingFeatures(true);
    setFeatureSuccess(null);
    try {
      const payload = Object.entries(featureToggles).map(([featureKey, isEnabled]) => ({
        featureKey,
        isEnabled,
      }));
      await superadminService.batchAssignFeatures(id, payload);
      setFeatureSuccess('Módulos actualizados correctamente.');
      setTimeout(() => setFeatureSuccess(null), 3000);

      // Refresh tenant data
      await loadTenant();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar módulos.');
    } finally {
      setIsSavingFeatures(false);
    }
  };

  // ── Enter tenant operation ────────────────────────────────────────────
  const handleOperateAsTenant = () => {
    if (!id) return;
    enterTenantOperation(id);
    navigate('/dashboard');
  };

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'modules', label: 'Módulos', icon: Layers },
    { id: 'team', label: 'Equipo', icon: Users },
  ];

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" label="Cargando tenant..." />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-zinc-500">Tenant no encontrado.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/superadmin/tenants')}>
          Volver a Tenants
        </Button>
      </div>
    );
  }

  const featuresCount = tenant.features ? tenant.features.filter((f) => f.isEnabled).length : 0;
  const membersCount = tenant._count?.memberships || tenant.memberships?.length || 0;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Back Link */}
      <button
        type="button"
        onClick={() => navigate('/superadmin/tenants')}
        className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Volver a Tenants</span>
      </button>

      {/* Tenant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-xl shadow-sm shrink-0">
            {tenant.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
                {tenant.name}
              </h1>
              <Badge variant={tenant.isActive ? 'emerald' : 'zinc'} size="sm" dot={tenant.isActive}>
                {tenant.isActive ? 'Activo' : 'Pausado'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-400 font-mono">/{tenant.slug}</span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {verticalLabels[tenant.vertical] || tenant.vertical}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">
                {featuresCount} módulos · {membersCount} miembros
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOperateAsTenant}
          rightIcon={<ArrowRight size={14} />}
        >
          Operar como Tenant
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-violet-700 dark:text-violet-300 border-violet-600'
                : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in-50 duration-150">
        {/* ── General Tab ── */}
        {activeTab === 'general' && (
          <Card variant="glass" padding="md" className="space-y-5">
            {generalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check size={16} />
                <span>{generalSuccess}</span>
              </div>
            )}

            <Input
              label="Nombre Comercial"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Vertical / Rubro
              </label>
              <select
                value={editVertical}
                onChange={(e) => setEditVertical(e.target.value)}
                className="w-full bg-white dark:bg-[#12131e] text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500"
              >
                <option value="gastronomy">Gastronomía & Restaurantes</option>
                <option value="beauty">Belleza, Estética & Turnos</option>
                <option value="stock">Pastelería & Stock Minorista</option>
                <option value="health">Salud & Profesionales</option>
                <option value="realestate">Inmobiliaria & Propiedades</option>
                <option value="general">Comercio General</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2 pb-1">
              <button
                type="button"
                onClick={() => setEditIsActive(!editIsActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  editIsActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    editIsActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  {editIsActive ? <Play size={13} className="text-emerald-500" /> : <Pause size={13} className="text-zinc-400" />}
                  {editIsActive ? 'Tenant Activo' : 'Tenant Pausado'}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {editIsActive
                    ? 'El comercio está operativo y accesible.'
                    : 'El comercio está pausado. Nadie puede operar en él.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveGeneral}
                isLoading={isSavingGeneral}
                leftIcon={<Check size={16} />}
              >
                Guardar Cambios
              </Button>
            </div>
          </Card>
        )}

        {/* ── Modules Tab ── */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            {featureSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check size={16} />
                <span>{featureSuccess}</span>
              </div>
            )}

            <Card variant="glass" padding="none" className="overflow-hidden">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {AVAILABLE_FEATURES.map((feature) => {
                  const isEnabled = !!featureToggles[feature.key];
                  return (
                    <div
                      key={feature.key}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                            {feature.name}
                          </h4>
                          <span className="text-[10px] font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full border border-violet-200/80 dark:border-violet-800/40">
                            {feature.badge}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg">
                          {feature.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFeature(feature.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                          isEnabled ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {Object.values(featureToggles).filter(Boolean).length} de {AVAILABLE_FEATURES.length} módulos habilitados
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveFeatures}
                  isLoading={isSavingFeatures}
                  leftIcon={<Check size={16} />}
                >
                  Guardar Módulos
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── Team Tab ── */}
        {activeTab === 'team' && (
          <Card variant="glass" padding="md">
            {tenant.memberships && tenant.memberships.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {tenant.memberships.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                        {member.user.avatarUrl ? (
                          <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          member.user.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {member.user.name}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={member.isActive ? 'violet' : 'zinc'} size="sm">
                        {member.role}
                      </Badge>
                      {!member.isActive && (
                        <Badge variant="zinc" size="sm">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No hay miembros cargados o la información no está disponible desde esta vista.
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Operá como tenant para gestionar el equipo desde la sección de Equipo.
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
