import { useEffect, useState } from 'react';
import { ChefHat, Check, Clock } from 'lucide-react';
import { kitchenApi } from './api';
import { useTenantStore } from '../../../../store/tenantStore';
import type { RestaurantOrder } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';

const nextStatus: Record<string, RestaurantOrder['status']> = {
  open: 'preparing',
  preparing: 'ready',
  ready: 'served',
};

const getElapsedMinutes = (dateStr?: string) => {
  if (!dateStr) return 0;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
};

const getTimerBadgeStyle = (mins: number) => {
  if (mins < 10) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (mins < 20) return 'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
  return 'text-rose-800 bg-rose-50 border-rose-200 animate-pulse dark:bg-rose-950/60 dark:text-rose-300';
};

export default function KitchenPage() {
  const { activeTenantId } = useTenantStore();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext may be restricted by browser policy
    }
  };

  const load = async () => {
    if (!activeTenantId) return;
    setLoading(true);
    try {
      const nextOrders = await kitchenApi.getKitchenOrders();
      if (nextOrders.length > orders.length && orders.length > 0) {
        playChime();
      }
      setOrders(nextOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [activeTenantId]);

  const advance = async (order: RestaurantOrder) => {
    const status = nextStatus[order.status];
    if (!status) return;
    await kitchenApi.updateKitchenOrder(order.id, status);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Gastronomía</span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Pantalla de cocina (KDS)</h1>
        <p className="text-sm text-zinc-500">Pedidos activos ordenados por antigüedad con semáforo de demora.</p>
      </div>
      {loading ? (
        <LoadingSpinner size="lg" label="Cargando comandas..." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const badgeStyle = getTimerBadgeStyle(elapsed);

            return (
              <Card key={order.id} variant="glass" className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>
                      <ChefHat className="mr-2 inline text-violet-600" size={17} />
                      {order.table ? `Mesa ${order.table.number}` : 'Pedido'}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeStyle}`}>
                      <Clock size={12} />
                      {elapsed} min
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-xs text-zinc-500">
                    {order.customerName || 'Cliente'} · {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                  </p>
                <div className="space-y-2">
                  {order.lines.map((line, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"
                    >
                      <span>
                        {line.quantity}× {line.catalogItem?.title || 'Ítem'}
                      </span>
                      <span className="text-xs text-zinc-500">{line.guestName || ''}</span>
                    </div>
                  ))}
                </div>
                {nextStatus[order.status] && (
                  <Button className="mt-4 w-full" size="sm" onClick={() => advance(order)} leftIcon={<Check size={14} />}>
                    Marcar {nextStatus[order.status]}
                  </Button>
                )}
                </CardContent>
              </Card>
            );
          })}
          {orders.length === 0 && <p className="text-sm text-zinc-500">No hay comandas pendientes.</p>}
        </div>
      )}
    </div>
  );
}
