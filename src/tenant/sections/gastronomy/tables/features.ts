export const tablesFeatures = {
  status: 'gastronomy.tables.status',
  qr_generator: 'gastronomy.tables.qr_generator',
  bookings: 'gastronomy.tables.bookings',
} as const;

export type TablesFeature = (typeof tablesFeatures)[keyof typeof tablesFeatures];

export const tablesModule = {
  module: 'tables',
  section: 'gastronomy',
  page: 'tables',
  scope: 'tenant',
  features: tablesFeatures,
} as const;
