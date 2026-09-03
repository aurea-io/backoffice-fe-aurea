import { useEffect, useState } from 'react';
import { Package, Plus, Sliders } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { inventoryApi } from './api';
import type { InventoryItem } from '../../../../types';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [qty, setQty] = useState(0);
  const [min, setMin] = useState(0);

  const load = () => {
    setLoading(true);
    inventoryApi
      .getInventory()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const create = async () => {
    if (!name.trim()) return;
    await inventoryApi.createInventory({ name, quantity: Number(qty), minimum: Number(min) });
    setName('');
    setQty(0);
    setMin(0);
    load();
  };

  const adjust = async (id: string, delta: number) => {
    await inventoryApi.adjustInventory(id, delta, 'Ajuste manual');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Comercio</span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Inventario y Stock</h1>
        <p className="text-sm text-zinc-500">Supervisá existencias y aplicá ajustes de stock en tiempo real.</p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            <Plus className="mr-2 inline" size={18} />
            Nuevo artículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="number" placeholder="Cantidad" value={qty || ''} onChange={(e) => setQty(Number(e.target.value))} />
            <Input type="number" placeholder="Mínimo de alerta" value={min || ''} onChange={(e) => setMin(Number(e.target.value))} />
            <Button onClick={create}>Crear</Button>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            <Package className="mr-2 inline" size={18} />
            Existencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" label="Cargando existencias..." />
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">No hay artículos registrados.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((it) => (
                <div key={it.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-xs text-zinc-500">
                      Stock: {it.quantity} {it.unit} · Mínimo: {it.minimum}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => adjust(it.id, 1)}>
                      +1
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => adjust(it.id, -1)}>
                      -1
                    </Button>
                    <Button size="sm" variant="ghost" leftIcon={<Sliders size={14} />} onClick={() => adjust(it.id, 5)}>
                      +5
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
