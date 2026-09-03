/**
 * Frontend contract for the services.bookings module.
 */
export const bookingsFeatures = {
  view: 'bookings.view',
  manage: 'bookings.manage',
} as const;

export type BookingsFeature = (typeof bookingsFeatures)[keyof typeof bookingsFeatures];

export const bookingsModule = {
  module: 'bookings',
  section: 'services',
  page: 'bookings',
  scope: 'tenant',
  features: bookingsFeatures,
} as const;
