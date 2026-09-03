/**
 * Frontend contract for the commerce.pos module.
 */
export const posFeatures = {
  view: 'pos.view',
  cashier: 'pos.cashier',
} as const;

export type PosFeature = (typeof posFeatures)[keyof typeof posFeatures];

export const posModule = {
  module: 'pos',
  section: 'commerce',
  page: 'pos',
  scope: 'tenant',
  features: posFeatures,
} as const;
