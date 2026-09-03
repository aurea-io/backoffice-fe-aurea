import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { tenantService } from '../../../services/tenant.service';
import type { TenantAnalytics } from '../../../types';
import { formatCurrencyFromCents } from '../../../utils/currency';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { tenantService.getAnalytics().then(setAnalytics).catch(() => undefined).finally(() => setIsLoading(false)); }, []);
  const today = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  if (isLoading) return <LoadingSpinner />;
  return <div className="space-y-6 lg:space-y-8 animate-in fade-in-50 duration-200">
    <section className="pb-5 border-b border-zinc-200/80 dark:border-zinc-800"><p className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 capitalize">{today}</p><h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">Hola, {user?.name?.split(' ')[0] || 'Comercio'} <span className="text-violet-500">✦</span></h1><p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">Bienvenido al panel de control de tu comercio en Aurea.</p></section>
    {analytics ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[['Miembros', analytics.members], ['Reservas', analytics.bookings], ['Pedidos', analytics.orders], ['Ingresos', formatCurrencyFromCents(analytics.revenueCents ?? 0)]].map(([label, value]) => <Card key={String(label)} variant="glass" padding="md"><p className="text-xs text-zinc-500">{label}</p><p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{value}</p></Card>)}</div> : <Card variant="glass" padding="md"><Badge variant="emerald"><Sparkles size={14} className="mr-1" /> Sin datos disponibles</Badge></Card>}
  </div>;
}
