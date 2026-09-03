export const couponsFeatures = {
  usage_limit: 'marketing.coupons.usage_limit',
  min_purchase: 'marketing.coupons.min_purchase',
} as const;

export type CouponsFeature = (typeof couponsFeatures)[keyof typeof couponsFeatures];

export const couponsModule = {
  module: 'coupons',
  section: 'marketing',
  page: 'coupons',
  scope: 'tenant',
  features: couponsFeatures,
} as const;
