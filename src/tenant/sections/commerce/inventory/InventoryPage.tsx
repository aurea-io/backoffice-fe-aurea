import { useEffect, useState } from 'react';
import { Package, Plus, Sliders, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyCritical, setOnlyCritical] = useState(false);

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

  const criticalItemsCount = items.filter((it) => it.quantity <= it.minimum).length;

  const filteredItems = items.filter((it) => {
    const matchesSearch = it.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isCritical = it.quantity <= it.minimum;
    if (onlyCritical) return matchesSearch && isCritical;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Comercio</span>
          <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Inventario y Stock</h1>
          <p className="text-sm text-zinc-500">Supervisá existencias y aplicá ajustes de stock en tiempo real.</p>
        </div>

        {criticalItemsCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle size={16} />
            <span>{criticalItemsCount} artículo(s) con stock crítico</span>
          </div>
        )}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              <Package className="mr-2 inline" size={18} />
              Existencias
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48">
                <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar en stock..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white/70 py-1.5 pl-8 pr-3 text-xs text-zinc-900 outline-none backdrop-blur-md transition-all focus:border-violet-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyCritical(!onlyCritical)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  onlyCritical
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {onlyCritical ? 'Mostrando: Solo Críticos' : 'Filtrar Stock Bajo'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" label="Cargando existencias..." />
          ) : filteredItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              {onlyCritical ? 'No hay artículos en estado crítico.' : 'No hay artículos registrados.'}
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredItems.map((it) => {
                const isCritical = it.quantity <= it.minimum;
                return (
                  <div key={it.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      {isCritical ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                          <AlertTriangle size={18} />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          <Package size={18} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-zinc-900 dark:text-white">{it.name}</p>
                          {isCritical && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              Stock Bajo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">
                          Stock:{' '}
                          <strong className={isCritical ? 'font-bold text-amber-600' : ''}>
                            {it.quantity} {it.unit}
                          </strong>{' '}
                          · Mínimo de alerta: {it.minimum}
                        </p>
                      </div>
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
