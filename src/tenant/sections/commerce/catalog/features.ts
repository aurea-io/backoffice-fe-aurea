/**
 * Frontend contract for the commerce.catalog module.
 * Feature keys intentionally mirror the backend catalog manifest.
 */
export const catalogFeatures = {
  view: 'catalog.items.view',
  manage: 'catalog.items.manage',
} as const;

export type CatalogFeature = (typeof catalogFeatures)[keyof typeof catalogFeatures];

export const catalogModule = {
  module: 'catalog',
  section: 'commerce',
  page: 'catalog',
  scope: 'tenant',
  features: catalogFeatures,
} as const;
