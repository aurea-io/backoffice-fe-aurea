/**
 * Frontend contract for the commerce.inventory module.
 */
export const inventoryFeatures = {
  view: 'inventory.view',
  manage: 'inventory.manage',
} as const;

export type InventoryFeature = (typeof inventoryFeatures)[keyof typeof inventoryFeatures];

export const inventoryModule = {
  module: 'inventory',
  section: 'commerce',
  page: 'inventory',
  scope: 'tenant',
  features: inventoryFeatures,
} as const;
