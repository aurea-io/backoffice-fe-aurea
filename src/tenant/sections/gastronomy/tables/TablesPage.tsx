import { useEffect, useState } from 'react';
import { Armchair, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { tablesApi } from './api';
import type { RestaurantTable } from '../../../../types';

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    tablesApi
      .getTables()
      .then(setTables)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cycle = async (table: RestaurantTable) => {
    const statuses: RestaurantTable['status'][] = ['available', 'occupied', 'billing'];
    const next = statuses[(statuses.indexOf(table.status) + 1) % statuses.length];
    await tablesApi.updateTable(table.id, next);
    load();
  };

  const openQr = async (table: RestaurantTable) => {
    const qr = await tablesApi.getTableQr(table.id);
    window.open(qr.qrImageUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Gastronomía</span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Salón y Mesas</h1>
        <p className="text-sm text-zinc-500">Supervisá el estado de mesas y generá códigos QR para la carta digital.</p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" label="Cargando mesas..." />
      ) : (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>
              <Armchair className="mr-2 inline" size={18} />
              Mesas del Salón
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {tables.map((table) => (
                <div key={table.id} className="space-y-1">
                  <Button
                    variant={table.status === 'available' ? 'outline' : 'soft'}
                    className="h-20 w-full flex-col"
                    onClick={() => cycle(table)}
                  >
                    <strong>Mesa {table.number}</strong>
                    <span className="text-[10px]">{table.status}</span>
                  </Button>
                  <button
                    className="flex w-full items-center justify-center gap-1 text-[10px] font-semibold text-violet-600"
                    onClick={() => openQr(table)}
                  >
                    <QrCode size={12} />
                    Generar QR
                  </button>
                </div>
              ))}
              {tables.length === 0 && <p className="col-span-3 text-sm text-zinc-500">No hay mesas configuradas.</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
