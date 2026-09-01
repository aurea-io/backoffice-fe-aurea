// ── Roles & Permissions ──────────────────────────────────────────────────
export type Role = 'SUPERADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'CASHIER';

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
  isAureaSuperadmin?: boolean;
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

// ── Catalog Models ─────────────────────────────────────────────────────────
export interface CatalogItem {
  id: string;
  tenantId: string;
  title: string;
  description?: string | null;
  priceCents: number;
  category?: string | null;
  isService: boolean;
  durationMin?: number | null;
  imageUrl?: string | null;
  isActive: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCatalogItemInput {
  title: string;
  description?: string;
  priceCents: number;
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
    isAureaSuperadmin: boolean;
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
