// ── Roles & Permissions ──────────────────────────────────────────────────
export type Role = 'OWNER' | 'MANAGER' | 'STAFF' | 'CASHIER';

export type FeatureKey =
  | 'catalog'
  | 'bookings'
  | 'social_hub'
  | 'delivery'
  | 'tables'
  | 'reviews';

export type Theme = 'LIGHT' | 'DARK' | 'SYSTEM';

// ── User Model ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  preferences?: Record<string, unknown> | null;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ── Tenant Context & Models ────────────────────────────────────────────────
export interface TenantSummary {
  tenantId: string;
  slug: string;
  name: string;
  vertical: string; // "gastronomy" | "beauty" | "health" | "stock" | etc.
  role: Role;
}

export interface TenantContext {
  tenantId: string;
  slug: string;
  name: string;
  vertical: string;
  role: Role;
  permissions: string[];
  /** Effective feature keys returned by the backend; new modules are not a frontend compile-time change. */
  activeFeatures: string[];
  settings?: TenantSettings | null;
}

export interface TenantFeature {
  id: string;
  tenantId: string;
  featureKey: FeatureKey | string;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantSettings {
  branding?: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    coverUrl?: string;
    tagline?: string;
    fontStyle?: 'serif' | 'sans' | 'modern';
  };
  contact?: {
    phone?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    instagram?: string;
    website?: string;
  };
  schedule?: {
    days?: string;
    hours?: string;
    timezone?: string;
  };
  [key: string]: unknown;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  vertical: string;
  isActive: boolean;
  settings?: TenantSettings | null;
  createdAt: string;
  updatedAt: string;
  features?: TenantFeature[];
  memberships?: TenantMember[];
  invitations?: Invitation[];
  invitation?: Invitation;
  _count?: {
    catalogItems?: number;
    memberships?: number;
  };
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface TenantBilling {
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  plan: { id: string; key: string; name: string; description?: string | null; includedFeatures: string[]; prices: Array<{ currency: string; amountCents: number; interval: string }> } | null;
  addons: Array<{ addon: { key: string; name: string; priceCents: number; currency: string }; quantity: number }>;
}
export interface PaymentIntent { id: string; status: string; provider: string; checkoutUrl?: string | null; mode?: string; }

export interface Plan {
  id: string; key: string; name: string; description?: string | null; isActive: boolean;
  includedFeatures: string[];
  prices: Array<{ id?: string; currency: string; amountCents: number; interval: string; isActive?: boolean }>;
}

export interface Booking {
  id: string; tenantId: string; catalogItemId: string; customerName: string; customerEmail?: string | null; customerPhone?: string | null;
  date: string; startTime: string; durationMin: number; status: 'requested' | 'confirmed' | 'completed' | 'canceled' | 'no_show'; paymentStatus: string;
  catalogItem?: CatalogItem;
}

export interface InventoryItem { id: string; tenantId: string; name: string; sku?: string | null; unit: string; quantity: number; minimum: number; costCents: number; isActive: boolean; }
export interface RestaurantTable { id: string; number: number; seats: number; status: 'available' | 'occupied' | 'reserved' | 'billing'; }
export interface TableBooking { id: string; customerName: string; customerEmail?: string | null; customerPhone?: string | null; date: string; startTime: string; durationMin: number; partySize: number; status: 'requested' | 'confirmed' | 'canceled' | 'completed'; notes?: string | null; table?: RestaurantTable | null; }
export interface TableQr { tableId: string; tableNumber: number; tenantName: string; menuUrl: string; qrImageUrl: string; }
export interface RestaurantOrder { id: string; status: 'open' | 'preparing' | 'ready' | 'served' | 'paid' | 'canceled'; customerName?: string | null; createdAt?: string; table?: RestaurantTable | null; lines: Array<{ quantity: number; unitPriceCents: number; guestName?: string | null; catalogItem?: CatalogItem }> }
export interface CashSession { id: string; status: 'open' | 'closed'; openingCents: number; closingCents?: number | null; openedAt: string; closedAt?: string | null; notes?: string | null; }
export interface TenantAnalytics { members: number; bookings: number; orders: number; inventoryItems: number; inventoryUnits: number; activeFeatures: number; revenueCents?: number; averageTicketCents?: number; ordersByChannel?: Record<string, number>; topProducts?: Array<{ title: string; quantity: number; revenueCents: number }>; bookingsByStatus?: Array<{ status: string; count: number }>; dailySeries?: Array<{ date: string; orders: number; revenueCents: number }>; ordersByHour?: Array<{ hour: string; count: number }>; }
export interface Client { id: string; name: string; email?: string | null; phone?: string | null; notes: Array<{ id: string; body: string; createdAt: string }>; _count?: { bookings: number }; }
export interface LoyaltyAccount { id: string; customerId: string; points: number; tier: string; customer: Pick<Client, 'id' | 'name' | 'email' | 'phone'>; }
export interface Coupon { id: string; code: string; type: 'percentage' | 'fixed'; value: number; maxUses?: number | null; usedCount: number; expiresAt?: string | null; isActive: boolean; }

// ── Catalog Models ─────────────────────────────────────────────────────────
export interface CatalogItem {
  id: string;
  tenantId: string;
  title: string;
  description?: string | null;
  priceCents: number;
  sku?: string | null;
  stockInitial?: number | null;
  professionalId?: string | null;
  category?: string | null;
  categoryId?: string | null;
  modifierGroupIds?: string[];
  isService: boolean;
  durationMin?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogCategory { id: string; tenantId: string; name: string; slug: string; parentId?: string | null; isActive: boolean; }
export interface CatalogModifierOption { id: string; groupId: string; name: string; priceDeltaCents: number; isActive: boolean; }
export interface CatalogModifierGroup { id: string; tenantId: string; name: string; minSelections: number; maxSelections: number; isActive: boolean; options: CatalogModifierOption[]; }

export interface CreateCatalogItemInput {
  title: string;
  description?: string;
  priceCents: number;
  sku?: string;
  stockInitial?: number;
  professionalId?: string;
  category?: string;
  isService?: boolean;
  durationMin?: number;
  imageUrl?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateCatalogItemInput extends Partial<CreateCatalogItemInput> {}

// ── Auth API Responses ─────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  tenants: TenantSummary[];
}

export interface CapabilityResponse {
  map: Record<string, boolean>;
  tree: Array<{ key: string; enabled: boolean; [key: string]: unknown }>;
}

export interface UserContextResponse {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  currentContext: TenantContext | null;
  allTenants: TenantSummary[];
}

// ── Invitation & Code System ───────────────────────────────────────────────
export interface Invitation {
  id: string;
  code: string;
  email: string;
  role: Role;
  tenantId?: string | null;
  expiresAt: string;
  used: boolean;
  usedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationInput {
  email: string;
  role?: Role;
  tenantId?: string;
  daysValid?: number;
}
