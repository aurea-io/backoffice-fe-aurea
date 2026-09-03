export const ordersFeatures = {
  takeaway: 'commerce.orders.takeaway',
  delivery: 'commerce.orders.delivery',
  split_bill: 'commerce.orders.split_bill',
  fiscal_receipt: 'commerce.orders.fiscal_receipt',
  realtime: 'commerce.orders.realtime',
} as const;

export type OrdersFeature = (typeof ordersFeatures)[keyof typeof ordersFeatures];

export const ordersModule = {
  module: 'orders',
  section: 'commerce',
  page: 'orders',
  scope: 'tenant',
  features: ordersFeatures,
} as const;
