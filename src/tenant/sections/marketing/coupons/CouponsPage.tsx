import { useEffect, useState } from 'react';
import { BadgePercent, Plus } from 'lucide-react';
import { couponsApi } from './api';
import type { Coupon } from '../../../../types';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    couponsApi
      .getCoupons()
      .then(setCoupons)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    const code = window.prompt('Código del cupón');
    if (!code?.trim()) return;
    const value = Number(window.prompt('Valor (porcentaje o centavos)') || 0);
    if (!value) return;
    await couponsApi.createCoupon({ code: code.trim(), type: 'percentage', value });
    load();
  };

  const deactivate = async (coupon: Coupon) => {
    await couponsApi.deactivateCoupon(coupon.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Marketing</span>
          <h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Cupones</h1>
          <p className="text-sm text-zinc-500">Descuentos con vencimiento y límite de usos.</p>
        </div>
        <Button onClick={add} leftIcon={<Plus size={15} />}>
          Nuevo cupón
        </Button>
      </div>
      {loading ? (
        <LoadingSpinner size="lg" label="Cargando cupones..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coupons.map((coupon) => (
            <Card key={coupon.id} variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BadgePercent size={17} className="text-violet-600" />
                  {coupon.code}
                </CardTitle>
                <span className={`text-xs ${coupon.isActive ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  {coupon.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `$ ${(coupon.value / 100).toLocaleString('es-AR')}`}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Usos: {coupon.usedCount}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                </p>
                {coupon.isActive && (
                  <Button className="mt-4" size="sm" variant="outline" onClick={() => deactivate(coupon)}>
                    Desactivar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
          {coupons.length === 0 && <p className="text-sm text-zinc-500">No hay cupones configurados.</p>}
        </div>
      )}
    </div>
  );
}
