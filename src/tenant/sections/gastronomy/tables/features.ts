/**
 * Frontend contract for the gastronomy.tables module.
 */
export const tablesFeatures = {
  view: 'tables.view',
  manage: 'tables.manage',
} as const;

export type TablesFeature = (typeof tablesFeatures)[keyof typeof tablesFeatures];

export const tablesModule = {
  module: 'tables',
  section: 'gastronomy',
  page: 'tables',
  scope: 'tenant',
  features: tablesFeatures,
} as const;
