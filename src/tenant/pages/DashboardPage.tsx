import { useEffect, useState } from 'react';
import {
  Store,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  ExternalLink,
  CheckCircle,
  Globe,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { superadminService } from '../../services/superadmin.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { Tenant } from '../../types';
import { tenantService } from '../../services/tenant.service';
import type { TenantAnalytics } from '../../types';
import { formatCurrencyFromCents } from '../../utils/currency';

export function DashboardPage() {
  const { user, isSuperadmin, tenants: userTenants } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!isSuperadmin) {
        tenantService.getAnalytics().then(setAnalytics).catch(() => undefined).finally(() => setIsLoading(false));
        return;
      }

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
  }, [isSuperadmin]);

  const todayStr = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const verticalLabels: Record<string, string> = {
    gastronomy: 'Gastronomía',
    beauty: 'Belleza',
    stock: 'Pastelería',
    health: 'Salud',
    realestate: 'Inmobiliaria',
    general: 'General',
  };

  // ── Merchant View (Non-SuperAdmin) ────────────────────────────────────────
  if (!isSuperadmin) {
    const primaryTenant = userTenants?.[0];

    return (
      <div className="space-y-6 lg:space-y-8 animate-in fade-in-50 duration-200">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 capitalize">
              {todayStr}
            </p>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
              Hola, {user?.name?.split(' ')[0] || 'Comercio'} <span className="text-violet-500">✦</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Bienvenido al panel de control de tu comercio en Aurea.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="md">
              <Sparkles size={14} className="mr-1" />
              Comercio Activo
            </Badge>
          </div>
        </section>

        {primaryTenant ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Tenant Overview */}
            <div className="md:col-span-2 space-y-4">
              <Card variant="glass" padding="md" className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-xl shadow-sm shrink-0">
                    {primaryTenant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {primaryTenant.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-zinc-400">/{primaryTenant.slug}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 capitalize">
                        {verticalLabels[primaryTenant.vertical] || primaryTenant.vertical}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-violet-900 dark:text-violet-200">
                      Sitio Web & Landing Pública
                    </p>
                    <p className="text-[11px] text-violet-700 dark:text-violet-400 font-mono mt-0.5">
                      {new URL(`/public/${primaryTenant.slug}`, window.location.origin).toString()}
                    </p>
                  </div>

                  <a
                    href={`/public/${primaryTenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="primary" size="sm" rightIcon={<ExternalLink size={13} />}>
                      Visitar Web
                    </Button>
                  </a>
                </div>
              </Card>
              {analytics && <><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Card variant="glass" padding="sm"><p className="text-xs text-zinc-500">Miembros</p><strong className="text-2xl">{analytics.members}</strong></Card><Card variant="glass" padding="sm"><p className="text-xs text-zinc-500">Reservas</p><strong className="text-2xl">{analytics.bookings}</strong></Card><Card variant="glass" padding="sm"><p className="text-xs text-zinc-500">Pedidos</p><strong className="text-2xl">{analytics.orders}</strong></Card><Card variant="glass" padding="sm"><p className="text-xs text-zinc-500">Artículos stock</p><strong className="text-2xl">{analytics.inventoryItems}</strong></Card></div><div className="grid gap-4 sm:grid-cols-2"><Card variant="glass" padding="sm"><p className="text-xs text-zinc-500">Facturación registrada</p><strong className="text-2xl">{formatCurrencyFromCents(analytics.revenueCents || 0)}</strong><p className="text-xs text-zinc-500">Ticket promedio: {formatCurrencyFromCents(analytics.averageTicketCents || 0)}</p></Card><Card variant="glass" padding="sm"><p className="mb-2 text-xs text-zinc-500">Productos más vendidos</p>{analytics.topProducts?.slice(0, 3).map((product) => <div key={product.title} className="flex justify-between text-sm"><span>{product.title}</span><strong>{product.quantity}</strong></div>) || <p className="text-xs text-zinc-500">Sin ventas todavía</p>}</Card></div></>}
            </div>

            {/* Account Details */}
            <div>
              <Card variant="glass" padding="md" className="space-y-3">
                <CardTitle className="text-base">Tu Cuenta</CardTitle>
                <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Nombre:</span>
                    <strong className="text-zinc-900 dark:text-white">{user?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-zinc-900 dark:text-white">{user?.email}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rol en el local:</span>
                    <Badge variant="violet" size="sm">
                      {primaryTenant.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                      <CheckCircle size={12} /> Habilitado
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card variant="glass" padding="md" className="text-center py-12">
            <Store size={36} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              No tienes un comercio asignado actualmente.
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Contactá al administrador de la plataforma para vincular tu cuenta.
            </p>
          </Card>
        )}
      </div>
    );
  }

  // ── SuperAdmin View ───────────────────────────────────────────────────────
  const realTenants = tenants.filter((t) => t.vertical !== 'system');
  const activeTenants = realTenants.filter((t) => t.isActive);
  const pausedTenants = realTenants.filter((t) => !t.isActive);

  const totalFeatures = realTenants.reduce((acc, t) => {
    return acc + (t.features ? t.features.filter((f) => f.isEnabled).length : 0);
  }, 0);

  const verticalCounts: Record<string, number> = {};
  realTenants.forEach((t) => {
    verticalCounts[t.vertical] = (verticalCounts[t.vertical] || 0) + 1;
  });

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
            Panel de Resumen Global del Backoffice Aurea.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="violet" size="md">
            <ShieldCheck size={14} className="mr-1" />
            Modo Superadmin
          </Badge>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Tenants Registrados</span>
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
            <span className="font-medium">Módulos Asignados</span>
            <div className="w-7 h-7 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/50 text-fuchsia-600 dark:text-fuchsia-400 flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {totalFeatures}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              features activas totales
            </p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Rubros / Verticales</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div>
            <span className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              {Object.keys(verticalCounts).length}
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">sectores en actividad</p>
          </div>
        </Card>

        <Card variant="glass" padding="sm" className="space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span className="font-medium">Estado del Sistema</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles size={14} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-editorial text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Operativo
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">API & Base de datos conectada</p>
          </div>
        </Card>
      </section>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tenants List Overview */}
        <div className="lg:col-span-2">
          <Card variant="glass" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Comercios en la Plataforma</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Vista rápida de los comercios dados de alta.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8">
                  <LoadingSpinner size="md" label="Cargando comercios..." />
                </div>
              ) : realTenants.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-400">
                  No hay comercios registrados.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {realTenants.map((t) => {
                    const featCount = t.features ? t.features.filter((f) => f.isEnabled).length : 0;
                    return (
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
                              {verticalLabels[t.vertical] || t.vertical} · <span className="font-mono">/{t.slug}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-zinc-400 hidden sm:inline">
                            {featCount} módulos
                          </span>
                          <Badge variant={t.isActive ? 'emerald' : 'zinc'} size="sm" dot={t.isActive}>
                            {t.isActive ? 'Activo' : 'Pausado'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Platform Breakdown & Status */}
        <div className="space-y-6">
          {/* Vertical Distribution */}
          <Card variant="glass" padding="md">
            <CardTitle className="text-base mb-3">Distribución por Rubro</CardTitle>
            {realTenants.length === 0 ? (
              <p className="text-xs text-zinc-400">Sin datos de comercios.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(verticalCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([vertical, count]) => (
                    <div key={vertical} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {verticalLabels[vertical] || vertical}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {count} {count === 1 ? 'tenant' : 'tenants'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((count / (realTenants.length || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          {/* User Profile Card */}
          <Card variant="glass" padding="md">
            <CardTitle className="text-base mb-2">Sesión Actual</CardTitle>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Email:</span>
                <strong className="text-zinc-900 dark:text-zinc-200">{user?.email}</strong>
              </div>
              <div className="flex justify-between">
                <span>Rol global:</span>
                <strong className="text-violet-600 dark:text-violet-400">
                  {isSuperadmin ? 'Superadmin' : 'Usuario'}
                </strong>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
