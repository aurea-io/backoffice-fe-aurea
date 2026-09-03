export const bookingsFeatures = {
  create: 'services.bookings.create',
  reschedule: 'services.bookings.reschedule',
  photo_upload: 'services.bookings.photo_upload',
  staff_assignment: 'services.bookings.staff_assignment',
  notifications: 'services.bookings.notifications',
} as const;

export type BookingsFeature = (typeof bookingsFeatures)[keyof typeof bookingsFeatures];

export const bookingsModule = {
  module: 'bookings',
  section: 'services',
  page: 'bookings',
  scope: 'tenant',
  features: bookingsFeatures,
} as const;
