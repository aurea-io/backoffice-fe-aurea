import { useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { ordersApi } from './api';
import type { RestaurantOrder } from '../../../../types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    ordersApi
      .getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Comercio</span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Pedidos y Comandas</h1>
        <p className="text-sm text-zinc-500">Gestión de comandas activas, takeaway y delivery en tiempo real.</p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            <ChefHat className="mr-2 inline" size={18} />
            Pedidos Activos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" label="Cargando comandas..." />
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No hay pedidos activos para mostrar.</p>
          ) : (
            <div className="space-y-3">
              {orders
                .filter((order) => !['paid', 'canceled'].includes(order.status))
                .map((order) => (
                  <div key={order.id} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{order.table ? `Mesa ${order.table.number}` : 'Pedido'}</span>
                      <span className="text-xs text-violet-600">{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {order.lines.map((line) => `${line.quantity}× ${line.catalogItem?.title ?? 'Ítem'}`).join(' · ')}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
