import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  UtensilsCrossed,
  Users,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowUpRight,
  Copy,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { catalogService } from '../../services/catalog.service';
import { tenantService } from '../../services/tenant.service';
import { superadminService } from '../../services/superadmin.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { CatalogItem, TenantMember, Tenant } from '../../types';

// ── SuperAdmin Global Dashboard ─────────────────────────────────────────
function SuperadminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await superadminService.getAllTenants();
        setTenants(data);
      } catch (err) {
        console.error('Error loading tenants:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const todayStr = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const realTenants = tenants.filter((t) => t.vertical !== 'system');
  const activeTenants = realTenants.filter((t) => t.isActive);
  const pausedTenants = realTenants.filter((t) => !t.isActive);

  // Count features across all tenants
  const totalFeatures = realTenants.reduce((acc, t) => {
    return acc + (t.features ? t.features.filter((f) => f.isEnabled).length : 0);
  }, 0);

  // Group by vertical
  const verticalCounts: Record<string, number> = {};
  realTenants.forEach((t) => {
    verticalCounts[t.vertical] = (verticalCounts[t.vertical] || 0) + 1;
  });

  const verticalLabels: Record<string, string> = {
    gastronomy: 'Gastronomía',
    beauty: 'Belleza',
    stock: 'Pastelería',
    health: 'Salud',
    realestate: 'Inmobiliaria',
    general: 'General',
  };

  const recentTenants = [...realTenants]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 capitalize">
            {todayStr}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Hola, {user?.name?.split(' ')[0] || 'Admin'} <span className="text-violet-500">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Resumen global de la plataforma Aurea.
          </p>
        </div>
        <Link to="/superadmin/tenants">
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
            Nuevo Tenant
          </Button>
        </Link>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Tenants Totales</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Store size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {realTenants.length}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {activeTenants.length} activos · {pausedTenants.length} pausados
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Módulos Activos</span>
            <div className="w-7 h-7 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {totalFeatures}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              módulos habilitados en total
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Verticales</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {Object.keys(verticalCounts).length}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">rubros con comercios</p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Plataforma</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-editorial text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Operativa
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Todos los sistemas activos</p>
          </div>
        </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tenants */}
        <div className="lg:col-span-2">
          <Card variant="glass" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Tenants Recientes</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Últimos comercios dados de alta en la plataforma.
                </p>
              </div>
              <Link to="/superadmin/tenants">
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={13} />}>
                  Ver todos
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-xs text-zinc-400">Cargando...</div>
              ) : recentTenants.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  No hay tenants registrados.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {recentTenants.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                            {t.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {verticalLabels[t.vertical] || t.vertical} · /{t.slug}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={t.isActive ? 'emerald' : 'zinc'} size="sm" dot={t.isActive}>
                          {t.isActive ? 'Activo' : 'Pausado'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => navigate(`/superadmin/tenants/${t.id}`)}
                        >
                          <ArrowRight size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vertical Distribution */}
        <div>
          <Card variant="glass" padding="md">
            <CardTitle className="text-base mb-3">Distribución por Rubro</CardTitle>
            <div className="space-y-2.5">
              {Object.entries(verticalCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([vertical, count]) => (
                  <div key={vertical} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 capitalize">
                        {verticalLabels[vertical] || vertical}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((count / realTenants.length) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white w-6 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Tenant Operation Dashboard ──────────────────────────────────────────
function TenantDashboard() {
  const { user } = useAuthStore();
  const { currentTenant, activeTenantId, hasFeature } = useTenantStore();

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!activeTenantId) return;

    async function fetchData() {
      setIsLoadingData(true);
      try {
        const [items, team] = await Promise.allSettled([
          catalogService.getAll(),
          tenantService.getMembers(),
        ]);

        if (isMounted) {
          if (items.status === 'fulfilled') setCatalogItems(items.value);
          if (team.status === 'fulfilled') setMembers(team.value);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [activeTenantId]);

  const publicUrl = currentTenant?.slug
    ? `${window.location.origin}/preview/${currentTenant.slug}`
    : `${window.location.origin}/preview/demo`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayStr = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in-50 duration-200">
      {/* Hero Intro Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 capitalize">
            {todayStr}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Buen día, {user?.name?.split(' ')[0] || 'Admin'} <span className="text-violet-500">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Resumen operativo y estado digital para{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">
              {currentTenant ? currentTenant.name : 'tu comercio'}
            </strong>
            .
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link to="/catalog">
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
              Nuevo Producto / Servicio
            </Button>
          </Link>

          {currentTenant?.slug && (
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" rightIcon={<ExternalLink size={13} />}>
                Ver Frontend
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Catálogo / Servicios</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <UtensilsCrossed size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {catalogItems.length}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {catalogItems.filter((i) => i.isActive).length} activos públicamente
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Equipo de Trabajo</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {members.length > 0 ? members.length : 1}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Rol actual: <strong className="capitalize">{currentTenant?.role?.toLowerCase() || 'Admin'}</strong>
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Módulos Activos</span>
            <div className="w-7 h-7 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {currentTenant?.activeFeatures?.length || 1}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5 capitalize">
              Vertical: {currentTenant?.vertical || 'General'}
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Estado Digital</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-editorial text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Publicado
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">PWA y Enlaces activos</p>
          </div>
        </Card>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Public Link */}
          <Card variant="highlight" padding="md" className="border-violet-200/80 dark:border-violet-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                  Enlace Público para Clientes
                </span>
                <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
                  Tu negocio está listo para compartir
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Comparte este enlace por WhatsApp, código QR o biografía de Instagram.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              >
                {copied ? '¡Copiado!' : 'Copiar Enlace'}
              </Button>
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-white/70 dark:bg-black/40 border border-violet-100 dark:border-violet-900/30 flex items-center justify-between gap-2 text-xs font-mono text-violet-700 dark:text-violet-300 truncate">
              <span className="truncate">{publicUrl}</span>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-violet-600 shrink-0">
                <ArrowUpRight size={14} />
              </a>
            </div>
          </Card>

          {/* Catalog */}
          <Card variant="glass" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Catálogo Reciente</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Productos y servicios cargados en este comercio.
                </p>
              </div>
              <Link to="/catalog">
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight size={13} />}>
                  Ver todo
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {catalogItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  No hay productos o servicios registrados todavía.
                  <div className="mt-3">
                    <Link to="/catalog">
                      <Button size="sm" variant="soft">Crear Primer Item</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {catalogItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/30 flex items-center justify-center font-bold text-xs text-violet-600 dark:text-violet-400 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            item.title.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {item.category || 'General'} {item.isService && item.durationMin ? `· ${item.durationMin} min` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          ${(item.priceCents / 100).toFixed(2)}
                        </p>
                        <Badge variant={item.isActive ? 'emerald' : 'zinc'} size="sm" dot={item.isActive}>
                          {item.isActive ? 'Activo' : 'Pausado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-xl shadow-sm">
                {currentTenant ? currentTenant.name.slice(0, 2).toUpperCase() : 'AU'}
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white">
                  {currentTenant ? currentTenant.name : 'Aurea Workspace'}
                </h3>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  {currentTenant?.vertical || 'Servicios'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between">
                <span>Slug público:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  /{currentTenant?.slug || 'demo'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Tu rol:</span>
                <strong className="text-violet-600 dark:text-violet-400 capitalize">
                  {currentTenant?.role?.toLowerCase() || 'Owner'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Miembros:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  {members.length > 0 ? members.length : 1}
                </strong>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Link to="/settings">
                <Button variant="outline" size="sm" className="w-full">
                  Editar Datos del Negocio
                </Button>
              </Link>
            </div>
          </Card>

          <Card variant="glass" padding="md">
            <CardTitle className="text-base mb-1">Módulos Activos</CardTitle>
            <p className="text-[11px] text-zinc-400 mb-3">
              Funcionalidades habilitadas para este comercio:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="violet" size="md">Catálogo & Precios</Badge>
              {hasFeature('bookings') && <Badge variant="emerald" size="md">Turnos & Reservas</Badge>}
              {hasFeature('tables') && <Badge variant="amber" size="md">Mesas & Salón</Badge>}
              {hasFeature('delivery') && <Badge variant="violet" size="md">Delivery & Pedidos</Badge>}
              {hasFeature('reviews') && <Badge variant="rose" size="md">Reseñas de Clientes</Badge>}
              {hasFeature('social_hub') && <Badge variant="zinc" size="md">Social Hub</Badge>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard (context-aware) ──────────────────────────────────────
export function DashboardPage() {
  const { isSuperadmin } = useAuthStore();
  const { platformMode } = useTenantStore();

  const isSuperadminMode = isSuperadmin && platformMode === 'superadmin';

  if (isSuperadminMode) {
    return <SuperadminDashboard />;
  }

  return <TenantDashboard />;
}
