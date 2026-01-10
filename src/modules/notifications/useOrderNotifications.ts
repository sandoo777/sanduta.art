import { OrderStatus } from '@/lib/orders/orderStatus';

export function useOrderNotifications() {
  const sendNotification = (type: 'placed' | 'in_production' | 'completed' | 'shipped' | 'cancelled', orderId: string, to: string) => {
    // TODO: implement actual notification logic (email, push, etc)
    // Example:
    // sendEmail(to, subject, body)
    // sendPush(to, ...)
    // logNotification(...)
    console.log(`Notificare [${type}] pentru comanda ${orderId} către ${to}`);
  };

  return {
    sendOrderPlaced: (orderId: string, to: string) => sendNotification('placed', orderId, to),
    sendOrderInProduction: (orderId: string, to: string) => sendNotification('in_production', orderId, to),
    sendOrderCompleted: (orderId: string, to: string) => sendNotification('completed', orderId, to),
    sendOrderShipped: (orderId: string, to: string) => sendNotification('shipped', orderId, to),
    sendOrderCancelled: (orderId: string, to: string) => sendNotification('cancelled', orderId, to),
  };
}
