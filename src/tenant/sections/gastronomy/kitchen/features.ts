export const kitchenFeatures = {
  timer: 'gastronomy.kitchen.timer',
  stage_progression: 'gastronomy.kitchen.stage_progression',
} as const;

export type KitchenFeature = (typeof kitchenFeatures)[keyof typeof kitchenFeatures];

export const kitchenModule = {
  module: 'kitchen',
  section: 'gastronomy',
  page: 'kitchen',
  scope: 'tenant',
  features: kitchenFeatures,
} as const;
