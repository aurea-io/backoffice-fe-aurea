import { useEffect, useState } from 'react';
import { Contact, Plus, Search, StickyNote } from 'lucide-react';
import { tenantService } from '../../services/tenant.service';
import { useTenantStore } from '../../store/tenantStore';
import type { Client } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function ClientsPage() {
  const { activeTenantId } = useTenantStore();
  const [clients, setClients] = useState<Client[]>([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true);
  const load = async () => { if (!activeTenantId) return; setLoading(true); try { setClients(await tenantService.getClients(search)); } finally { setLoading(false); } };
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [activeTenantId, search]);
  const addClient = async () => { const name = window.prompt('Nombre del cliente'); if (!name?.trim()) return; const phone = window.prompt('Teléfono (opcional)') || undefined; await tenantService.createClient({ name: name.trim(), phone }); await load(); };
  const addNote = async (client: Client) => { const body = window.prompt(`Nota para ${client.name}`); if (!body?.trim()) return; await tenantService.addClientNote(client.id, body.trim()); await load(); };
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Relación</span><h1 className="font-editorial text-3xl font-bold text-zinc-900 dark:text-white">Clientes</h1><p className="text-sm text-zinc-500">Contacto, historial y notas para una atención personalizada.</p></div><Button onClick={addClient} leftIcon={<Plus size={15} />}>Nuevo cliente</Button></div><div className="max-w-md"><Input placeholder="Buscar por nombre, email o teléfono..." value={search} onChange={(event) => setSearch(event.target.value)} leftIcon={<Search size={16} />} /></div>{loading ? <LoadingSpinner size="lg" label="Cargando clientes..." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{clients.map((client) => <Card key={client.id} variant="glass"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Contact size={17} className="text-violet-600" />{client.name}</CardTitle><button className="text-zinc-400 hover:text-violet-600" title="Agregar nota" onClick={() => addNote(client)}><StickyNote size={16} /></button></CardHeader><CardContent><div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300"><p>{client.phone || 'Sin teléfono'}</p><p>{client.email || 'Sin email'}</p><p className="text-xs text-zinc-500">{client._count?.bookings || 0} turnos registrados</p></div>{client.notes?.[0] && <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{client.notes[0].body}</p>}</CardContent></Card>)}{clients.length === 0 && <p className="text-sm text-zinc-500">No hay clientes para mostrar.</p>}</div>}</div>;
}
