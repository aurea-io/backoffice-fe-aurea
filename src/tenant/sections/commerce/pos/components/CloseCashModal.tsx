import React, { useState } from 'react';
import { X, Lock, Calculator, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { posApi } from '../api';

interface CloseCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseCashModal({ isOpen, onClose, onSuccess }: CloseCashModalProps) {
  const [countedAmount, setCountedAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const closingCents = Math.round(countedAmount * 100);
      await posApi.closeCash(closingCents, notes.trim() || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cerrar el turno de caja.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-bold text-zinc-900 dark:text-white">
                Cierre de Turno & Arqueo Ciego
              </h3>
              <p className="text-xs text-zinc-500">Declara el dinero físico contado en el cajón.</p>
            </div>
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
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            <p className="font-bold">⚠️ Procedimiento de Control Ciego:</p>
            <p className="mt-1">
              Cuenta todo el dinero en efectivo del cajón e ingresa el monto total exacto. El sistema comparará tu conteo contra las transacciones registradas.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Monto Físico Contado en Caja ($) *
            </label>
            <Input
              type="number"
              min={0}
              step="any"
              placeholder="0.00"
              value={countedAmount || ''}
              onChange={(e) => setCountedAmount(Number(e.target.value))}
              required
              className="w-full font-mono text-base font-bold"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Observaciones / Justificación de diferencias
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Retiro para compra de insumos, cambio para delivery..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} variant="secondary" leftIcon={<Lock size={16} />}>
              {submitting ? 'Cerrando caja...' : 'Confirmar Cierre de Caja'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
