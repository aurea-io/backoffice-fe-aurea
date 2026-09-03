import { useEffect, useState } from 'react';
import { Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { tenantService } from '../../../../services/tenant.service';
import type { CashSession } from '../../../../types';

export default function PosPage() {
  const [cash, setCash] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');

  const load = () => {
    setLoading(true);
    tenantService
      .getCash()
      .then(setCash)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const open = async () => {
    await tenantService.openCash(Number(amount) || 0);
    setAmount('');
    load();
  };

  const close = async () => {
    await tenantService.closeCash(Number(amount) || 0);
    setAmount('');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
          Caja
        </span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">
          Punto de venta
        </h1>
        <p className="text-sm text-zinc-500">
          Apertura, cierre y arqueo de caja.
        </p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            <Banknote className="mr-2 inline" size={18} />
            Sesión de caja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" label="Consultando caja..." />
          ) : (
            <div className="space-y-4">
              <p className="text-sm">
                Estado: <strong>{cash?.status ?? 'closed'}</strong>
              </p>
              <Input
                type="number"
                min="0"
                placeholder={
                  cash?.status === 'open'
                    ? 'Efectivo contado al cierre'
                    : 'Efectivo inicial'
                }
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={cash?.status === 'open' ? close : open}>
                {cash?.status === 'open' ? 'Cerrar caja' : 'Abrir caja'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
