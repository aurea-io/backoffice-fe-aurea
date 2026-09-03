import { useEffect, useState } from 'react';
import { AlertTriangle, PackagePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { tenantService } from '../../../../services/tenant.service';
import type { InventoryItem } from '../../../../types';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  const load = () => {
    setLoading(true);
    tenantService
      .getInventory()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    if (!name.trim()) return;
    await tenantService.createInventory({ name, quantity: 0, minimum: 0 });
    setName('');
    load();
  };

  const adjust = async (item: InventoryItem) => {
    const raw = window.prompt(`Cantidad a sumar/restar para ${item.name}`, '1');
    if (raw === null) return;
    const amount = Number(raw);
    if (!Number.isFinite(amount)) return;
    await tenantService.adjustInventory(item.id, amount, 'Ajuste manual');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
          Comercio
        </span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
          Inventario
        </h1>
        <p className="text-sm text-zinc-500">
          Controlá existencias, costos y alertas de reposición.
        </p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Agregar artículo</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Input
            placeholder="Nombre del artículo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={add} leftIcon={<PackagePlus size={15} />}>
            Agregar
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner size="lg" label="Cargando inventario..." />
      ) : (
        <Card variant="glass">
          <CardContent>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      {item.quantity} {item.unit} · mínimo {item.minimum}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.quantity <= item.minimum && (
                      <AlertTriangle className="text-amber-500" size={16} />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjust(item)}
                    >
                      Ajustar
                    </Button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">
                  No hay artículos cargados.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
