import React, { useState } from 'react';
import { X, CreditCard, Banknote, QrCode, CheckCircle2, AlertCircle, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { ordersApi } from '../../orders/api';

export interface CartItem {
  id: string;
  title: string;
  price: number; // en centavos
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalCents: number;
  onSuccess: () => void;
}

export function CheckoutModal({ isOpen, onClose, cart, totalCents, onSuccess }: CheckoutModalProps) {
  const [paymentMode, setPaymentMode] = useState<'single' | 'split'>('single');
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  
  // Split payment state
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [secondMethod, setSecondMethod] = useState<'card' | 'transfer'>('card');
  
  // Cash received for change calculation
  const [cashReceived, setCashReceived] = useState<number>(0);
  
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const totalPesos = totalCents / 100;
  const remainingForSecond = Math.max(0, totalPesos - cashAmount);
  const change = Math.max(0, (cashReceived || 0) - (paymentMode === 'split' ? cashAmount : (selectedMethod === 'cash' ? totalPesos : 0)));

  const handleProcessPayment = async () => {
    setSubmitting(true);
    setError(null);

    const itemsPayload = cart.map((item) => ({
      catalogItemId: item.id,
      quantity: item.quantity,
      unitPriceCents: item.price,
    }));

    const paymentDetails =
      paymentMode === 'split'
        ? [
            { method: 'cash', amountCents: Math.round(cashAmount * 100) },
            { method: secondMethod, amountCents: Math.round(remainingForSecond * 100) },
          ]
        : [{ method: selectedMethod, amountCents: totalCents }];

    try {
      const order = await ordersApi.createOrder({
        customerName: customerName.trim() || 'Cliente Mostrador',
        type: 'takeaway',
        items: itemsPayload,
        payments: paymentDetails,
        notes: paymentMode === 'split' ? `Pago dividido: Efectivo $${cashAmount} + ${secondMethod} $${remainingForSecond}` : undefined,
      });
      setCompletedOrder(order);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al procesar el cobro. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {!completedOrder ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <div>
                <h3 className="font-editorial text-xl font-bold text-zinc-900 dark:text-white">
                  Cobrar Venta
                </h3>
                <p className="text-xs text-zinc-500">
                  Total a cobrar:{' '}
                  <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                    ${totalPesos.toLocaleString('es-AR')}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 space-y-4">
              {/* Cliente */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Cliente (Opcional)
                </label>
                <Input
                  type="text"
                  placeholder="Nombre del cliente o 'Consumidor Final'"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Modo de Pago: Simple vs Split */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Modalidad de Cobro
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('single')}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      paymentMode === 'single'
                        ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                    }`}
                  >
                    Pago Único
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('split');
                      setCashAmount(Math.round(totalPesos / 2));
                    }}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      paymentMode === 'split'
                        ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                    }`}
                  >
                    Pago Dividido (Split)
                  </button>
                </div>
              </div>

              {/* Pago Único */}
              {paymentMode === 'single' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cash')}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                        selectedMethod === 'cash'
                          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                      }`}
                    >
                      <Banknote size={20} />
                      <span>Efectivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                        selectedMethod === 'card'
                          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                      }`}
                    >
                      <CreditCard size={20} />
                      <span>Tarjeta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('transfer')}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                        selectedMethod === 'transfer'
                          ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-300'
                      }`}
                    >
                      <QrCode size={20} />
                      <span>QR / Transf.</span>
                    </button>
                  </div>

                  {selectedMethod === 'cash' && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Efectivo Recibido ($)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            placeholder={totalPesos.toString()}
                            value={cashReceived || ''}
                            onChange={(e) => setCashReceived(Number(e.target.value))}
                            className="w-full font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                            Vuelto / Cambio
                          </label>
                          <div className="flex h-10 items-center rounded-xl bg-white px-3 font-mono text-sm font-bold text-emerald-600 shadow-inner dark:bg-zinc-900 dark:text-emerald-400">
                            ${change > 0 ? change.toLocaleString('es-AR') : '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Pago Dividido */
                <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Parte 1: Efectivo ($)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={totalPesos}
                        value={cashAmount || ''}
                        onChange={(e) => {
                          const val = Math.min(totalPesos, Math.max(0, Number(e.target.value)));
                          setCashAmount(val);
                        }}
                        className="w-full font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Parte 2: Restante ($)
                      </label>
                      <div className="flex h-10 items-center rounded-xl bg-white px-3 font-mono text-sm font-bold text-violet-700 shadow-inner dark:bg-zinc-900 dark:text-violet-300">
                        ${remainingForSecond.toLocaleString('es-AR')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Medio para el Restante
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSecondMethod('card')}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                          secondMethod === 'card'
                            ? 'border-violet-500 bg-violet-600 text-white'
                            : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        <CreditCard size={14} />
                        <span>Tarjeta</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSecondMethod('transfer')}
                        className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                          secondMethod === 'transfer'
                            ? 'border-violet-500 bg-violet-600 text-white'
                            : 'border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        <QrCode size={14} />
                        <span>Transferencia / QR</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de Confirmación */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={submitting}
                  leftIcon={<CheckCircle2 size={16} />}
                >
                  {submitting ? 'Procesando...' : `Confirmar Cobro $${totalPesos.toLocaleString('es-AR')}`}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Comprobante de Cobro Exitoso */
          <div className="space-y-4 py-2 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Receipt size={32} />
            </div>

            <div>
              <h3 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
                ¡Venta Cobrada con Éxito!
              </h3>
              <p className="text-xs text-zinc-500">Orden #{completedOrder.id?.slice(-6).toUpperCase()}</p>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4 text-left font-mono text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex justify-between border-b border-zinc-200 pb-2 font-bold dark:border-zinc-700">
                <span>Total Cobrado:</span>
                <span>${totalPesos.toLocaleString('es-AR')}</span>
              </div>
              <div className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
                <p>Modalidad: {paymentMode === 'split' ? 'Pago Dividido (Split)' : `Pago Único (${selectedMethod})`}</p>
                <p>Cliente: {customerName || 'Consumidor Final'}</p>
                <p>Ítems: {cart.length} producto(s)</p>
                {change > 0 && <p className="font-bold text-emerald-600">Vuelto entregado: ${change.toLocaleString('es-AR')}</p>}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={() => window.print()} variant="secondary" leftIcon={<Receipt size={16} />}>
                Imprimir Ticket
              </Button>
              <Button onClick={handleFinish} leftIcon={<ArrowRight size={16} />}>
                Nueva Venta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
