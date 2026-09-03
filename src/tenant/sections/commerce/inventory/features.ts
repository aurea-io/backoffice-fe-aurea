export const inventoryFeatures = {
  minimum_alerts: 'commerce.inventory.minimum_alerts',
  manual_adjust: 'commerce.inventory.manual_adjust',
  movements_history: 'commerce.inventory.movements_history',
} as const;

export type InventoryFeature = (typeof inventoryFeatures)[keyof typeof inventoryFeatures];

export const inventoryModule = {
  module: 'inventory',
  section: 'commerce',
  page: 'inventory',
  scope: 'tenant',
  features: inventoryFeatures,
} as const;
