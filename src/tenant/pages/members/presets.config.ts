import type { Role } from '../../../types';

export interface RolePreset { role: Role; label: string; permissions: string[] }
export const ROLE_PRESETS: Record<string, RolePreset[]> = {
  gastronomy: [
    { role: 'STAFF', label: 'Mozo', permissions: ['tables.view', 'orders.create'] },
    { role: 'CASHIER', label: 'Cajero', permissions: ['pos.cashier', 'orders.view'] },
    { role: 'MANAGER', label: 'Encargado', permissions: ['catalog.edit', 'members.view'] },
  ],
  beauty: [{ role: 'STAFF', label: 'Estilista', permissions: ['appointments.self', 'clients.view'] }, { role: 'MANAGER', label: 'Recepción', permissions: ['appointments.all', 'pos.cashier'] }],
  stock: [{ role: 'STAFF', label: 'Vendedor', permissions: ['catalog.view', 'pos.cashier'] }, { role: 'MANAGER', label: 'Depósito', permissions: ['inventory.manage'] }],
  general: [{ role: 'STAFF', label: 'Colaborador', permissions: ['catalog.view'] }, { role: 'MANAGER', label: 'Encargado', permissions: ['catalog.edit', 'members.view'] }],
};
