export enum OrderStatus {
  Pending = 'pending',
  AwaitingPayment = 'awaiting_payment',
  Processing = 'processing',
  InProduction = 'in_production',
  ReadyForPickup = 'ready_for_pickup',
  Shipped = 'shipped',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'În așteptare',
  [OrderStatus.AwaitingPayment]: 'Așteaptă plată',
  [OrderStatus.Processing]: 'În procesare',
  [OrderStatus.InProduction]: 'În producție',
  [OrderStatus.ReadyForPickup]: 'Gata de ridicare',
  [OrderStatus.Shipped]: 'Expediată',
  [OrderStatus.Completed]: 'Finalizată',
  [OrderStatus.Cancelled]: 'Anulată',
};
