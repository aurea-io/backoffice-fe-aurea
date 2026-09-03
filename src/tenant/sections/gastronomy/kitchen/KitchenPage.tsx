import { useEffect, useState } from 'react';
import { ChefHat, Check, Clock } from 'lucide-react';
import { tenantService } from '../../../../services/tenant.service';
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

export default function KitchenPage() {
  const { activeTenantId } = useTenantStore();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!activeTenantId) return;
    setLoading(true);
    try {
      setOrders(await tenantService.getKitchenOrders());
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
    await tenantService.updateKitchenOrder(order.id, status);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
          Operación
        </span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
          Pantalla de cocina
        </h1>
        <p className="text-sm text-zinc-500">
          Pedidos activos ordenados por antigüedad. Se actualiza automáticamente.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" label="Cargando comandas..." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>
                    <ChefHat className="mr-2 inline text-violet-600" size={17} />
                    {order.table ? `Mesa ${order.table.number}` : 'Pedido'}
                  </span>
                  <span className="text-xs font-medium text-zinc-500">
                    <Clock className="mr-1 inline" size={13} />
                    {order.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-xs text-zinc-500">
                  {order.customerName || 'Cliente'} ·{' '}
                  {new Date(order.createdAt || Date.now()).toLocaleTimeString()}
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
                      <span className="text-xs text-zinc-500">
                        {line.guestName || ''}
                      </span>
                    </div>
                  ))}
                </div>
                {nextStatus[order.status] && (
                  <Button
                    className="mt-4 w-full"
                    size="sm"
                    onClick={() => advance(order)}
                    leftIcon={<Check size={14} />}
                  >
                    Marcar {nextStatus[order.status]}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-zinc-500">No hay comandas pendientes.</p>
          )}
        </div>
      )}
    </div>
  );
}
