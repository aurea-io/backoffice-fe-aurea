import { useEffect, useState } from 'react';
import { CalendarDays, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { tenantService } from '../../../../services/tenant.service';
import type { Booking } from '../../../../types';

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    tenantService
      .getBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const change = async (booking: Booking, status: Booking['status']) => {
    await tenantService.updateBooking(booking.id, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
          Servicios
        </span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
          Agenda y turnos
        </h1>
        <p className="text-sm text-zinc-500">
          Confirmá, completá o cancelá las citas y turnos de servicios del comercio.
        </p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            <CalendarDays className="mr-2 inline" size={18} />
            Turnos y citas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" label="Cargando agenda..." />
          ) : bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No hay citas para mostrar.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div>
                    <p className="font-semibold">{booking.customerName}</p>
                    <p className="text-xs text-zinc-500">
                      {booking.date.slice(0, 10)} · {booking.startTime} ·{' '}
                      {booking.catalogItem?.title ?? 'Servicio'}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
