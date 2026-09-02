import { useEffect, useState } from 'react';
import { Gift, Minus, Plus } from 'lucide-react';
import { tenantService } from '../../services/tenant.service';
import type { LoyaltyAccount } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function LoyaltyPage() {
  const [accounts, setAccounts] = useState<LoyaltyAccount[]>([]); const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); tenantService.getLoyalty().then(setAccounts).finally(() => setLoading(false)); };
  useEffect(load, []);
  const operate = async (account: LoyaltyAccount, operation: 'earn' | 'redeem') => { const value = Number(window.prompt(operation === 'earn' ? 'Puntos a sumar' : 'Puntos a canjear') || 0); if (value > 0) { await tenantService.operateLoyalty(account.customerId, value, operation); load(); } };
  return <div className="space-y-6"><div><span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Marketing</span><h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Fidelización</h1><p className="text-sm text-zinc-500">Premiá la recurrencia con puntos y niveles por cliente.</p></div>{loading ? <LoadingSpinner size="lg" label="Cargando cuentas..." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{accounts.map((account) => <Card key={account.id} variant="glass"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Gift size={17} className="text-violet-600" />{account.customer.name}<span className="ml-auto text-xs font-normal uppercase text-zinc-500">{account.tier}</span></CardTitle></CardHeader><CardContent><p className="mb-4 text-2xl font-bold">{account.points.toLocaleString('es-AR')} <span className="text-sm font-normal text-zinc-500">puntos</span></p><div className="flex gap-2"><Button size="sm" onClick={() => operate(account, 'earn')} leftIcon={<Plus size={14} />}>Sumar</Button><Button size="sm" variant="outline" onClick={() => operate(account, 'redeem')} leftIcon={<Minus size={14} />}>Canjear</Button></div></CardContent></Card>)}{accounts.length === 0 && <p className="text-sm text-zinc-500">Todavía no hay cuentas de fidelización.</p>}</div>}</div>;
}
