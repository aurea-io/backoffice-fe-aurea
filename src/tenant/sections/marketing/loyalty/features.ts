export const loyaltyFeatures = {
  earn_rules: 'marketing.loyalty.earn_rules',
  rewards: 'marketing.loyalty.rewards',
} as const;

export type LoyaltyFeature = (typeof loyaltyFeatures)[keyof typeof loyaltyFeatures];

export const loyaltyModule = {
  module: 'loyalty',
  section: 'marketing',
  page: 'loyalty',
  scope: 'tenant',
  features: loyaltyFeatures,
} as const;
