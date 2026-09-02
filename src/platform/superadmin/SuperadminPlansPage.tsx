import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { superadminService } from '../../services/superadmin.service';
import type { Plan } from '../../types';

export default function SuperadminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [form, setForm] = useState({ key: '', name: '', description: '', includedFeatures: 'catalog' });
  const load = () => { setLoading(true); superadminService.getPlans().then(setPlans).catch(() => setError('No se pudieron cargar los planes.')).finally(() => setLoading(false)); };
  useEffect(load, []);
  const create = async () => { if (!form.key || !form.name) return; await superadminService.createPlan({ ...form, includedFeatures: form.includedFeatures.split(',').map((x) => x.trim()).filter(Boolean), prices: [] }); setForm({ key: '', name: '', description: '', includedFeatures: 'catalog' }); load(); };
  return <div className="space-y-6"><div className="flex items-end justify-between"><div><span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Superadmin</span><h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Planes comerciales</h1><p className="text-sm text-zinc-500">Configurá módulos incluidos y disponibilidad.</p></div><Button variant="ghost" size="icon" onClick={load} title="Actualizar"><RefreshCw size={16} /></Button></div>
    <Card variant="glass"><CardHeader><CardTitle>Nuevo plan</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-4"><Input placeholder="Clave" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} /><Input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><Input placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><Input placeholder="Módulos: catalog, bookings" value={form.includedFeatures} onChange={(e) => setForm({ ...form, includedFeatures: e.target.value })} /></div><Button className="mt-4" onClick={create} leftIcon={<Plus size={15} />}>Crear plan</Button></CardContent></Card>
    {error && <p className="text-sm text-rose-600">{error}</p>}{loading ? <LoadingSpinner size="lg" label="Cargando planes..." /> : <div className="grid gap-4 md:grid-cols-2">{plans.map((plan) => <Card key={plan.id} variant="glass"><CardHeader><CardTitle>{plan.name}</CardTitle><span className="text-xs text-zinc-500">{plan.key}</span></CardHeader><CardContent><div className="flex flex-wrap gap-2">{plan.includedFeatures.map((feature) => <span key={feature} className="rounded-lg bg-violet-50 px-2 py-1 text-xs text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{feature}</span>)}</div></CardContent></Card>)}</div>}
  </div>;
}
