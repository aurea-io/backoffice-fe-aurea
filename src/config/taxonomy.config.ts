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
} from 'lucide-react';

export interface ModuleItem {
  key: string;
  name: string;
  description?: string;
}

export interface PageItem {
  id: string;
  name: string;
  path: string;
  icon: ComponentType<{ size?: number; className?: string }>;
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

export const CANONICAL_TAXONOMY: SectionItem[] = [
  {
    id: 'core',
    name: 'Principal',
    description: 'Administración del Tenant, equipo y configuración base.',
    icon: Sparkles,
    pages: [
      {
        id: 'dashboard',
        name: 'Resumen',
        path: '/dashboard',
        icon: LayoutDashboard,
        modules: [
          { key: 'kpis', name: 'KPIs & Métricas' },
          { key: 'recent_activity', name: 'Actividad Reciente' },
          { key: 'alerts', name: 'Alertas del Sistema' },
        ],
      },
      {
        id: 'members',
        name: 'Equipo',
        path: '/members',
        icon: Users,
        capability: 'tenant:employees:read',
        modules: [
          { key: 'invitations', name: 'Invitaciones' },
          { key: 'role_assignment', name: 'Roles & Permisos' },
        ],
      },
      {
        id: 'theme',
        name: 'Configuración',
        path: '/settings',
        icon: Settings,
        modules: [
          { key: 'branding', name: 'Identidad & Colores' },
          { key: 'css_customization', name: 'Personalización Visual' },
        ],
      },
      {
        id: 'billing',
        name: 'Plan y Facturación',
        path: '/settings/billing',
        icon: CreditCard,
        modules: [
          { key: 'plan_details', name: 'Detalles del Plan' },
          { key: 'credits_usage', name: 'Consumo de Créditos' },
          { key: 'addons', name: 'Módulos y Addons' },
        ],
      },
    ],
  },
  {
    id: 'services',
    name: 'Servicios',
    description: 'Prestación de servicios profesionales por turno.',
    icon: CalendarDays,
    pages: [
      {
        id: 'bookings',
        name: 'Agenda de Turnos',
        path: '/appointments',
        icon: CalendarDays,
        capability: 'bookings',
        permissions: ['appointments:read', 'bookings.view'],
        modules: [
          { key: 'create', name: 'Crear Turnos' },
          { key: 'reschedule', name: 'Reprogramar' },
          { key: 'photo_upload', name: 'Fotos de Referencia' },
          { key: 'staff_assignment', name: 'Asignar Profesional' },
          { key: 'notifications', name: 'Recordatorios' },
        ],
      },
    ],
  },
  {
    id: 'commerce',
    name: 'Comercio',
    description: 'Transacciones comerciales, catálogo, inventario y caja.',
    icon: ShoppingBag,
    pages: [
      {
        id: 'catalog',
        name: 'Catálogo',
        path: '/catalog',
        icon: ShoppingBag,
        capability: 'catalog',
        permissions: ['catalog:read', 'catalog.view', 'catalog:write'],
        modules: [
          { key: 'items', name: 'Gestión de Ítems' },
          { key: 'add_to_cart', name: 'Agregar al Carrito' },
          { key: 'variants', name: 'Modificadores y Variantes' },
          { key: 'images', name: 'Galería de Fotos' },
          { key: 'stock_badge', name: 'Insignia de Stock' },
        ],
      },
      {
        id: 'inventory',
        name: 'Inventario',
        path: '/inventory',
        icon: Package,
        capability: 'inventory',
        permissions: ['inventory:read', 'inventory.manage'],
        modules: [
          { key: 'minimum_alerts', name: 'Alertas de Stock Mínimo' },
          { key: 'manual_adjust', name: 'Ajuste Manual' },
          { key: 'movements_history', name: 'Historial de Movimientos' },
        ],
      },
      {
        id: 'pos',
        name: 'Caja & Cobros',
        path: '/pos',
        icon: Banknote,
        capability: 'pos_cashier',
        permissions: ['pos.cashier', 'pos:read'],
        modules: [
          { key: 'shifts', name: 'Turnos de Caja' },
          { key: 'blind_closing', name: 'Arqueo Ciego' },
          { key: 'multi_tender', name: 'Múltiples Medios de Pago' },
        ],
      },
    ],
  },
  {
    id: 'gastronomy',
    name: 'Gastronomía',
    description: 'Operación de salón, mesas físicas y pantalla de cocina.',
    icon: Armchair,
    pages: [
      {
        id: 'tables',
        name: 'Salón y Mesas',
        path: '/restaurant',
        icon: Armchair,
        capability: 'tables',
        permissions: ['tables.view', 'tables:read', 'orders:create'],
        modules: [
          { key: 'status', name: 'Estado de Mesas' },
          { key: 'qr_generator', name: 'Generador de QR' },
          { key: 'bookings', name: 'Comandas de Mesa' },
        ],
      },
      {
        id: 'table-bookings',
        name: 'Reservas de Salón',
        path: '/table-bookings',
        icon: CalendarClock,
        capability: 'bookings',
        permissions: ['bookings.view', 'tables.view'],
        modules: [
          { key: 'qr_view', name: 'Reserva Online' },
          { key: 'table_request', name: 'Asignación de Comensales' },
        ],
      },
      {
        id: 'kitchen',
        name: 'Cocina / KDS',
        path: '/kitchen',
        icon: ChefHat,
        capability: 'kitchen',
        permissions: ['kitchen.view', 'kitchen:read'],
        modules: [
          { key: 'timer', name: 'Cronómetro de Espera' },
          { key: 'stage_progression', name: 'Avance de Platos' },
        ],
      },
    ],
  },
  {
    id: 'crm',
    name: 'Gestión de Clientes',
    description: 'Directorio de clientes, historial de visitas y preferencias.',
    icon: Contact,
    pages: [
      {
        id: 'clients',
        name: 'Clientes',
        path: '/clients',
        icon: Contact,
        capability: 'clients',
        permissions: ['clients:read', 'clients.view'],
        modules: [
          { key: 'profile', name: 'Ficha del Cliente' },
          { key: 'history', name: 'Historial de Visitas' },
          { key: 'preferences', name: 'Preferencias' },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Lealtad',
    description: 'Programas de fidelización y cupones de descuento.',
    icon: BadgePercent,
    pages: [
      {
        id: 'coupons',
        name: 'Cupones',
        path: '/coupons',
        icon: BadgePercent,
        capability: 'marketing',
        permissions: ['marketing:read'],
        modules: [
          { key: 'usage_limit', name: 'Límite de Uso' },
          { key: 'min_purchase', name: 'Compra Mínima' },
        ],
      },
      {
        id: 'loyalty',
        name: 'Fidelización',
        path: '/loyalty',
        icon: Gift,
        capability: 'marketing',
        permissions: ['marketing:read'],
        modules: [
          { key: 'earn_rules', name: 'Reglas de Acumulación' },
          { key: 'rewards', name: 'Catálogo de Premios' },
        ],
      },
    ],
  },
];

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
