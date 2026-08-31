import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Instagram,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { api } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { CatalogItem, Tenant } from '../../types';

interface PublicTenantConfig {
  tenant: { id: string; slug: string; name: string; vertical: string };
  settings: Tenant['settings'];
  capabilities: Record<string, boolean>;
}

export default function PublicTenantPreviewPage() {
  const { slug } = useParams<{ slug: string }>();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<CatalogItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('Hoy, 16:30');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    async function loadPublicData() {
      setIsLoading(true);
      try {
        const configRes = await api.get<PublicTenantConfig>(`/public/tenants/${slug}/config`);
        const config = configRes.data;
        const found = {
          ...config.tenant,
          isActive: true,
          settings: config.settings,
          createdAt: '',
          updatedAt: '',
        } as Tenant;

        if (found) {
          setTenant(found);
          const theme = document.createElement('link');
          theme.rel = 'stylesheet';
          theme.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/public/tenants/${found.slug}/style.css`;
          theme.dataset.tenantTheme = found.slug;
          document.head.appendChild(theme);
          const catRes = await api.get<CatalogItem[]>('/catalog', {
            headers: { 'x-tenant-id': found.id },
          });
          setItems(catRes.data);
          if (catRes.data.length > 0) {
            setSelectedService(catRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching preview data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPublicData();
    return () => {
      document.head.querySelector(`link[data-tenant-theme="${slug}"]`)?.remove();
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8fc] dark:bg-[#0c0d12]">
        <LoadingSpinner size="lg" label="Cargando experiencia digital..." />
      </div>
    );
  }

  const primaryAccent = (tenant?.settings as any)?.branding?.primaryColor || '#7c3aed';
  const isBeauty = tenant?.vertical === 'beauty';

  return (
    <div className="min-h-screen bg-[#faf8fc] dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 font-sans pb-24">
      {/* Top Floating Back Bar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#12131e]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 px-4 py-2.5 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Volver al Backoffice</span>
        </Link>
        <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/40">
          Vista Previa del Cliente
        </span>
      </div>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-violet-950/20 via-transparent to-transparent pt-12 pb-8 px-4 text-center max-w-3xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-editorial font-bold text-3xl mx-auto mb-4 shadow-xl violet-glow">
          {tenant ? tenant.name.slice(0, 2).toUpperCase() : 'AU'}
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {tenant?.name || 'Aurea Digital Space'}
        </h1>

        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto">
          {(tenant?.settings as any)?.branding?.tagline ||
            (isBeauty
              ? 'Agenda tu turno online en simples pasos y descubre nuestros tratamientos exclusivos.'
              : 'Descubre nuestra carta y realiza tu pedido digital.')}
        </p>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
          {(tenant?.settings as any)?.contact?.address && (
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-violet-500" />
              {(tenant?.settings as any).contact.address}
            </span>
          )}
          {(tenant?.settings as any)?.contact?.phone && (
            <span className="flex items-center gap-1">
              <Phone size={13} className="text-violet-500" />
              {(tenant?.settings as any).contact.phone}
            </span>
          )}
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Booking / Catalog View */}
        {bookingSuccess ? (
          <Card variant="glass" padding="lg" className="text-center py-12 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
              ¡Turno Confirmado con Éxito!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Te esperamos el <strong>{selectedDate}</strong> para tu servicio de{' '}
              <strong>{selectedService?.title}</strong>.
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={() => setBookingSuccess(false)}
              className="mt-4"
            >
              Reservar Otro Turno
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Services / Products Catalog */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="font-editorial text-xl font-bold text-zinc-900 dark:text-white">
                  {isBeauty ? 'Elige un Servicio' : 'Nuestra Carta'}
                </h3>
                <span className="text-xs text-zinc-400 font-medium">
                  {items.length} opciones disponibles
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const isSelected = selectedService?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedService(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-violet-50/80 dark:bg-violet-950/40 border-violet-500/80 dark:border-violet-500 shadow-sm'
                          : 'bg-white dark:bg-[#12131e] border-zinc-200/80 dark:border-zinc-800/80 hover:border-violet-300 dark:hover:border-violet-800'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center font-bold text-xs text-violet-700 dark:text-violet-300 shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            item.title.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          {item.durationMin && (
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Clock size={11} className="text-violet-500" />
                              {item.durationMin} min
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-bold text-violet-700 dark:text-violet-300">
                          ${(item.priceCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Booking Calendar / Cart Panel */}
            <div className="space-y-4">
              <Card variant="glass" padding="md" className="sticky top-16 border-violet-200/80 dark:border-violet-800/40">
                <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  {isBeauty ? 'Resumen del Turno' : 'Tu Pedido'}
                </h3>

                {selectedService ? (
                  <div className="space-y-4 pt-3">
                    <div className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/30">
                      <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 uppercase">
                        Seleccionado
                      </p>
                      <p className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5">
                        {selectedService.title}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Total: ${(selectedService.priceCents / 100).toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Horarios Disponibles:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['15:00', '16:30', '18:00', '19:30'].map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedDate(`Hoy, ${time}`)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                              selectedDate === `Hoy, ${time}`
                                ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {time} hs
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mt-4"
                      onClick={() => setBookingSuccess(true)}
                    >
                      {isBeauty ? 'Confirmar Reserva' : 'Pedir Ahora'}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 py-6 text-center">
                    Selecciona un servicio o producto para continuar.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
