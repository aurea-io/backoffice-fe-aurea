export const posFeatures = {
  shifts: 'commerce.pos.shifts',
  blind_closing: 'commerce.pos.blind_closing',
  multi_tender: 'commerce.pos.multi_tender',
} as const;

export type PosFeature = (typeof posFeatures)[keyof typeof posFeatures];

export const posModule = {
  module: 'pos',
  section: 'commerce',
  page: 'pos',
  scope: 'tenant',
  features: posFeatures,
} as const;
