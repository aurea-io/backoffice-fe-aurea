import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  CalendarDays,
  ShoppingBag,
  Package,
  Banknote,
  Armchair,
  ChefHat,
  CalendarClock,
  Contact,
  BadgePercent,
  Gift,
  Store,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';

export interface ModuleItem {
  key: string;
  name: string;
  feature?: string;
  description?: string;
}

export interface PageItem {
  id: string;
  name: string;
  path: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  feature?: string;
  capability?: string;
  permissions?: string[];
  modules?: ModuleItem[];
  superadminOnly?: boolean;
}

export interface SectionItem {
  id: string;
  name: string;
  description?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  pages: PageItem[];
  superadminOnly?: boolean;
}

export const PAGE_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  members: Users,
  theme: Settings,
  billing: CreditCard,
  bookings: CalendarDays,
  catalog: ShoppingBag,
  inventory: Package,
  pos: Banknote,
  tables: Armchair,
  'table-bookings': CalendarClock,
  kitchen: ChefHat,
  clients: Contact,
  coupons: BadgePercent,
  loyalty: Gift,
};

export const SECTION_ICONS: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  core: Sparkles,
  services: CalendarDays,
  commerce: ShoppingBag,
  gastronomy: Armchair,
  crm: Contact,
  marketing: BadgePercent,
  platform: Store,
};

export const DEFAULT_PAGE_ICON = FileText;
export const DEFAULT_SECTION_ICON = Sparkles;

export const SUPERADMIN_TAXONOMY: SectionItem = {
  id: 'platform',
  name: 'Plataforma Aurea',
  icon: Store,
  superadminOnly: true,
  pages: [
    {
      id: 'tenants',
      name: 'Tenants & Comercios',
      path: '/tenants',
      icon: Store,
      superadminOnly: true,
      modules: [
        { key: 'provisioning', name: 'Alta y Estado' },
        { key: 'memberships', name: 'Membresías' },
      ],
    },
    {
      id: 'plans',
      name: 'Planes Comerciales',
      path: '/superadmin/plans',
      icon: CreditCard,
      superadminOnly: true,
      modules: [
        { key: 'pricing', name: 'Precios & Límites' },
        { key: 'entitlements', name: 'Módulos del Plan' },
      ],
    },
    {
      id: 'features',
      name: 'Catálogo de Módulos',
      path: '/superadmin/features',
      icon: Layers,
      superadminOnly: true,
      modules: [
        { key: 'registry', name: 'Módulos Globales' },
        { key: 'rules', name: 'Reglas de Negocio' },
      ],
    },
  ],
};
