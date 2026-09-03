import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { tenantService } from '../../../services/tenant.service';
import { paymentsService } from '../../../services/payments.service';
import type { TenantBilling } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { useTenantStore } from '../../../store/tenantStore';

export default function BillingPage() {
  const [billing, setBilling] = useState<TenantBilling | null>(null);
  const { currentTenant } = useTenantStore();
  useEffect(() => { tenantService.getBilling().then(setBilling).catch(() => setBilling({ status: 'unavailable', plan: null, addons: [] })); }, []);
  if (!billing) return <LoadingSpinner size="lg" label="Cargando suscripción..." />;
  return <div className="space-y-6">
    <div><span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Facturación</span><h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Mi suscripción</h1><p className="text-sm text-zinc-500">Plan, módulos y estado de tu cuenta.</p></div>
    <Card variant="glass"><CardHeader><CardTitle>{billing.plan?.name ?? 'Sin plan asignado'}</CardTitle></CardHeader><CardContent>
      <div className="mb-5 flex items-center gap-3"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{billing.status}</span>{billing.plan?.description && <span className="text-sm text-zinc-500">{billing.plan.description}</span>}</div>
      {billing.plan ? <><h3 className="mb-2 text-sm font-semibold">Módulos incluidos</h3><div className="flex flex-wrap gap-2">{billing.plan.includedFeatures.map((feature) => <span key={feature} className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{feature}</span>)}</div>{currentTenant?.activeFeatures?.includes('payments') && billing.plan.prices[0] && <Button className="mt-5" onClick={async () => { const price = billing.plan!.prices[0]; const intent = await paymentsService.createPaymentIntent({ provider: 'mercadopago', amountCents: price.amountCents, currency: price.currency, referenceType: 'subscription', referenceId: billing.plan!.id, returnUrl: window.location.href }); if (intent.checkoutUrl) window.location.href = intent.checkoutUrl; }}>Pagar suscripción</Button>}</> : <p className="text-sm text-zinc-500">Contactá al administrador para asignar un plan.</p>}
    </CardContent></Card>
  </div>;
}
