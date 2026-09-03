import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Lock,
  Unlock,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { posApi } from './api';
import { catalogService } from '../../../../services/catalog.service';
import { CheckoutModal, type CartItem } from './components/CheckoutModal';
import { CloseCashModal } from './components/CloseCashModal';
import type { CashSession, CatalogItem } from '../../../../types';

export default function PosPage() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const [isOpeningSubmitting, setIsOpeningSubmitting] = useState(false);

  // Catalog & Cart
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCloseCashOpen, setIsCloseCashOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cashData, itemsData] = await Promise.all([
        posApi.getCash(),
        catalogService.getAll().catch(() => []),
      ]);
      setSession(cashData);
      setCatalogItems(itemsData);
    } catch (err) {
      console.error('Error loading POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCash = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpeningSubmitting(true);
    setFeedback(null);
    try {
      const res = await posApi.openCash(Math.round(openingAmount * 100));
      setSession(res);
      setOpeningAmount(0);
      setFeedback({
        type: 'success',
        message: 'Turno de caja abierto correctamente. ¡Buenas ventas!',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Error al abrir el turno de caja.',
      });
    } finally {
      setIsOpeningSubmitting(false);
    }
  };

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          title: item.title,
          price: item.priceCents,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCents = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const categories = ['Todas', ...Array.from(new Set(catalogItems.map((item) => item.category).filter(Boolean))) as string[]];

  const filteredItems = catalogItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Comercio & Ventas
          </span>
          <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
            Punto de Venta / Terminal de Caja
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Cobro en mostrador, emisión de tickets y control de turnos de caja.
          </p>
        </div>

        {session && session.status === 'open' && (
          <Button
            variant="secondary"
            onClick={() => setIsCloseCashOpen(true)}
            leftIcon={<Lock size={16} />}
          >
            Cerrar Turno (Arqueo)
          </Button>
        )}
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Control de Apertura de Caja si está cerrada */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" label="Consultando estado de caja..." />
        </div>
      ) : !session || session.status === 'closed' ? (
        <Card variant="glass" className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <Lock size={20} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">
                  Caja Cerrada
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Para registrar ventas o emitir tickets, debes iniciar un turno declarando el fondo de caja inicial.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOpenCash} className="flex flex-wrap items-end gap-3">
              <div className="w-full sm:w-64">
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Fondo Inicial en Efectivo ($)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Ej. 15000"
                  value={openingAmount || ''}
                  onChange={(e) => setOpeningAmount(Number(e.target.value))}
                  required
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={isOpeningSubmitting} leftIcon={<Unlock size={16} />}>
                {isOpeningSubmitting ? 'Abriendo caja...' : 'Abrir Turno de Caja'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Estado de Caja Abierta Banner */
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 px-4 py-3 text-xs dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <Unlock size={16} />
            <span className="font-bold">Turno Abierto</span>
            <span className="text-zinc-400">·</span>
            <span>
              Fondo inicial:{' '}
              <strong className="font-mono font-bold">
                ${((session.openingCents || 0) / 100).toLocaleString('es-AR')}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">
            Iniciado: {new Date(session.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
          </span>
        </div>
      )}

      {/* Terminal de Venta (Grilla de 2 Columnas) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna Izquierda: Catálogo de Productos y Servicios (8 cols) */}
        <div className="space-y-4 lg:col-span-7 xl:col-span-8">
          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar artículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white/70 py-1.5 pl-8 pr-3 text-xs text-zinc-900 outline-none backdrop-blur-md transition-all focus:border-violet-500 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-white"
              />
            </div>
          </div>

          {/* Grilla de Artículos */}
          {filteredItems.length === 0 ? (
            <Card variant="glass">
              <CardContent className="py-12 text-center text-sm text-zinc-500">
                No hay productos o servicios disponibles.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  disabled={!session || session.status !== 'open'}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white/80 p-3.5 text-left shadow-sm backdrop-blur-sm transition-all hover:border-violet-500/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800/80 dark:bg-zinc-900/80"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                        {item.category || 'General'}
                      </span>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-zinc-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">
                      {item.title}
                    </h4>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
                    <span className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
                      ${(item.priceCents / 100).toLocaleString('es-AR')}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-950/60 dark:text-violet-400">
                      <Plus size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Ticket de Venta / Carrito (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card variant="glass" className="sticky top-20">
            <CardHeader className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <ShoppingCart size={18} className="text-violet-600" />
                  <span>Ticket de Venta</span>
                </CardTitle>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-zinc-400 hover:text-rose-500"
                  >
                    Vaciar
                  </button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-400">
                  <Package size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                  <p>El carrito está vacío.</p>
                  <p className="mt-1">Selecciona artículos del catálogo para agregarlos.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Lista de Ítems */}
                  <div className="max-h-[300px] divide-y divide-zinc-100 overflow-y-auto pr-1 dark:divide-zinc-800">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2.5">
                        <div className="pr-2">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                            {item.title}
                          </p>
                          <p className="font-mono text-[11px] text-zinc-400">
                            ${(item.price / 100).toLocaleString('es-AR')} c/u
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center font-mono text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-zinc-300 hover:text-rose-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totales */}
                  <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Artículos ({totalItemsCount}):</span>
                      <span className="font-mono">${(totalCents / 100).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                      <span>Total:</span>
                      <span className="font-mono text-violet-600 dark:text-violet-400">
                        ${(totalCents / 100).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <Button
                      type="button"
                      className="mt-4 w-full"
                      size="lg"
                      disabled={!session || session.status !== 'open' || cart.length === 0}
                      onClick={() => setIsCheckoutOpen(true)}
                    >
                      Cobrar ${(totalCents / 100).toLocaleString('es-AR')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales de Cobro y Cierre */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        totalCents={totalCents}
        onSuccess={() => {
          clearCart();
          setFeedback({
            type: 'success',
            message: '¡Venta registrada y cobrada exitosamente!',
          });
        }}
      />

      <CloseCashModal
        isOpen={isCloseCashOpen}
        onClose={() => setIsCloseCashOpen(false)}
        onSuccess={() => {
          loadData();
          setFeedback({
            type: 'success',
            message: 'Turno de caja cerrado y arqueo registrado correctamente.',
          });
        }}
      />
    </div>
  );
}
