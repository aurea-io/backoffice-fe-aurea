/**
 * Frontend contract for the gastronomy.kitchen module.
 */
export const kitchenFeatures = {
  view: 'kitchen.view',
  manage: 'kitchen.manage',
} as const;

export type KitchenFeature = (typeof kitchenFeatures)[keyof typeof kitchenFeatures];

export const kitchenModule = {
  module: 'kitchen',
  section: 'gastronomy',
  page: 'kitchen',
  scope: 'tenant',
  features: kitchenFeatures,
} as const;
