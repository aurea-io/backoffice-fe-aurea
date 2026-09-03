import { useEffect, useState } from 'react';
import { CalendarClock, Check, X } from 'lucide-react';
import { tenantService } from '../../../../services/tenant.service';
import type { TableBooking } from '../../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';

export default function TableBookingsPage() {
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    tenantService
      .getTableBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const change = async (booking: TableBooking, status: TableBooking['status']) => {
    await tenantService.updateTableBooking(booking.id, status);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
          Gastronomía
        </span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
          Reservas de mesa
        </h1>
        <p className="text-sm text-zinc-500">
          Disponibilidad, comensales y confirmaciones del salón.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" label="Cargando reservas..." />
      ) : (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>
              <CalendarClock className="mr-2 inline text-violet-600" size={18} />
              Agenda de mesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-semibold">
                      {booking.customerName} · {booking.partySize} personas
                    </p>
                    <p className="text-xs text-zinc-500">
                      {booking.date.slice(0, 10)} · {booking.startTime} · Mesa{' '}
                      {booking.table?.number || 'asignación automática'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-800">
                      {booking.status}
                    </span>
                    {booking.status === 'requested' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => change(booking, 'confirmed')}
                          leftIcon={<Check size={14} />}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => change(booking, 'canceled')}
                          title="Cancelar"
                        >
                          <X size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">
                  No hay reservas de mesa.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
