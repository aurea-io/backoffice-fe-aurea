import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { bookingsApi } from '../api';
import { catalogService } from '../../../../../services/catalog.service';
import type { CatalogItem } from '../../../../../types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewBookingModal({ isOpen, onClose, onSuccess }: NewBookingModalProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [catalogItemId, setCatalogItemId] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [durationMin, setDurationMin] = useState(60);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoadingItems(true);
      setError(null);
      catalogService
        .getAll({ isService: true })
        .then((items: CatalogItem[]) => {
          setCatalogItems(items);
          if (items.length > 0) {
            setCatalogItemId(items[0].id);
          }
        })
        .catch(() => {
          setError('No se pudieron cargar los servicios del catálogo.');
        })
        .finally(() => setLoadingItems(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }
    if (!catalogItemId) {
      setError('Debes seleccionar un servicio.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await bookingsApi.createBooking({
        catalogItemId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        date,
        startTime,
        durationMin: Number(durationMin),
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al agendar la reserva. Verifique los datos.');
    } finally {
      setSubmitting(false);
    }
  };

  const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="font-editorial text-xl font-bold text-zinc-900 dark:text-white">
                Agendar Nuevo Turno
              </h3>
              <p className="text-xs text-zinc-500">Carga rápida para atención presencial o telefónica.</p>
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
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nombre del Cliente *
              </label>
              <Input
                type="text"
                placeholder="Ej. Valeria López"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Teléfono / WhatsApp
              </label>
              <Input
                type="tel"
                placeholder="Ej. +54 11 5555-1234"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Servicio a Realizar *
            </label>
            {loadingItems ? (
              <p className="py-2 text-xs text-zinc-400">Cargando servicios...</p>
            ) : (
              <select
                value={catalogItemId}
                onChange={(e) => setCatalogItemId(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                required
              >
                {catalogItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} — ${(item.priceCents / 100).toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Fecha *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Hora de Inicio *
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                required
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot} hs
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Duración (min)
              </label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min (1 h)</option>
                <option value={90}>90 min (1.5 h)</option>
                <option value={120}>120 min (2 h)</option>
                <option value={180}>180 min (3 h)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Notas adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Preferencias del cliente, alergias o detalles de atención..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} leftIcon={<CheckCircle2 size={16} />}>
              {submitting ? 'Agendando...' : 'Confirmar Cita'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
