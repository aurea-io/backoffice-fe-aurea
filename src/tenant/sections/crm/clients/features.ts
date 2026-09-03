export const clientsFeatures = {
  profile: 'crm.clients.profile',
  history: 'crm.clients.history',
  preferences: 'crm.clients.preferences',
} as const;

export type ClientsFeature = (typeof clientsFeatures)[keyof typeof clientsFeatures];

export const clientsModule = {
  module: 'clients',
  section: 'crm',
  page: 'clients',
  scope: 'tenant',
  features: clientsFeatures,
} as const;
