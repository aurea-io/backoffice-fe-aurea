import { useEffect, useState } from 'react';
import { DollarSign, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { posApi } from './api';
import type { CashSession } from '../../../../types';

export default function PosPage() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number>(0);

  const load = () => {
    setLoading(true);
    posApi
      .getCash()
      .then(setSession)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const open = async () => {
    await posApi.openCash(Math.round(amount * 100));
    setAmount(0);
    load();
  };

  const close = async () => {
    await posApi.closeCash(Math.round(amount * 100));
    setAmount(0);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Comercio</span>
        <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Punto de Venta / Caja</h1>
        <p className="text-sm text-zinc-500">Apertura y cierre de turnos y arqueos ciegos.</p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>
            <DollarSign className="mr-2 inline" size={18} />
            Estado de Caja
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner size="lg" label="Consultando estado de caja..." />
          ) : session ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Unlock size={18} />
                <span className="font-semibold">Caja Abierta</span>
              </div>
              <p className="text-sm text-zinc-500">Monto inicial: ${(session.openingCents / 100).toFixed(2)}</p>
              <div className="flex max-w-sm gap-2">
                <Input
                  type="number"
                  placeholder="Monto de cierre ($)"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <Button variant="danger" leftIcon={<Lock size={14} />} onClick={close}>
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Lock size={18} />
                <span className="font-semibold">Caja Cerrada</span>
              </div>
              <p className="text-sm text-zinc-500">Ingresá el saldo base para iniciar el turno.</p>
              <div className="flex max-w-sm gap-2">
                <Input
                  type="number"
                  placeholder="Monto de apertura ($)"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <Button leftIcon={<Unlock size={14} />} onClick={open}>
                  Abrir Caja
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
