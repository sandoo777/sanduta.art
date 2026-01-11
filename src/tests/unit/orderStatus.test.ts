/**
 * Unit Tests - Order Status Logic
 * Tests pentru tranziții de status comenzi
 */

import { describe, it, expect } from 'vitest';

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

type OrderTransitionResult = {
  success: boolean;
  newStatus?: OrderStatus;
  error?: string;
};

class OrderStatusManager {
  /**
   * Verifică dacă o tranziție de status este validă
   */
  static canTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ): boolean {
    // Comenzile anulate nu pot trece în alt status
    if (currentStatus === OrderStatus.CANCELLED) {
      return false;
    }

    // Comenzile livrate nu pot trece în alt status (except cancelled pentru retur)
    if (currentStatus === OrderStatus.DELIVERED && newStatus !== OrderStatus.CANCELLED) {
      return false;
    }

    // Nu poți trece în producție fără plată confirmată
    if (
      newStatus === OrderStatus.IN_PRODUCTION &&
      paymentStatus !== PaymentStatus.PAID
    ) {
      return false;
    }

    // Tranziții valide
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.IN_PRODUCTION,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.IN_PRODUCTION]: [
        OrderStatus.READY_FOR_DELIVERY,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_DELIVERY]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERED]: [OrderStatus.CANCELLED], // Pentru retururi
      [OrderStatus.CANCELLED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Efectuează tranziția de status
   */
  static transition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ): OrderTransitionResult {
    if (!this.canTransition(currentStatus, newStatus, paymentStatus)) {
      return {
        success: false,
        error: `Invalid transition from ${currentStatus} to ${newStatus}`,
      };
    }

    return {
      success: true,
      newStatus,
    };
  }

  /**
   * Obține următoarele statusuri posibile
   */
  static getNextStatuses(
    currentStatus: OrderStatus,
    paymentStatus: PaymentStatus
  ): OrderStatus[] {
    const allNextStatuses: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED],
      [OrderStatus.IN_PRODUCTION]: [
        OrderStatus.READY_FOR_DELIVERY,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.READY_FOR_DELIVERY]: [
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.DELIVERED]: [OrderStatus.CANCELLED],
      [OrderStatus.CANCELLED]: [],
    };

    const possibleStatuses = allNextStatuses[currentStatus] || [];

    // Filtrează statusurile care necesită plată
    return possibleStatuses.filter((status) => {
      if (status === OrderStatus.IN_PRODUCTION) {
        return paymentStatus === PaymentStatus.PAID;
      }
      return true;
    });
  }

  /**
   * Verifică dacă comanda poate fi anulată
   */
  static canCancel(currentStatus: OrderStatus): boolean {
    return (
      currentStatus !== OrderStatus.CANCELLED &&
      currentStatus !== OrderStatus.DELIVERED
    );
  }

  /**
   * Calculează statusul de progres (%)
   */
  static getProgressPercentage(status: OrderStatus): number {
    const progressMap: Record<OrderStatus, number> = {
      [OrderStatus.PENDING]: 0,
      [OrderStatus.CONFIRMED]: 20,
      [OrderStatus.IN_PRODUCTION]: 50,
      [OrderStatus.READY_FOR_DELIVERY]: 80,
      [OrderStatus.DELIVERED]: 100,
      [OrderStatus.CANCELLED]: 0,
    };

    return progressMap[status] || 0;
  }
}

describe('OrderStatusManager - Valid Transitions', () => {
  it('permite tranziția PENDING → CONFIRMED', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(true);
    expect(result.newStatus).toBe(OrderStatus.CONFIRMED);
  });

  it('permite tranziția CONFIRMED → IN_PRODUCTION cu plată', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PRODUCTION,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(true);
    expect(result.newStatus).toBe(OrderStatus.IN_PRODUCTION);
  });

  it('permite tranziția IN_PRODUCTION → READY_FOR_DELIVERY', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.IN_PRODUCTION,
      OrderStatus.READY_FOR_DELIVERY,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(true);
  });

  it('permite tranziția READY_FOR_DELIVERY → DELIVERED', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.DELIVERED,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(true);
  });

  it('permite anularea din orice status (except DELIVERED)', () => {
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PRODUCTION,
      OrderStatus.READY_FOR_DELIVERY,
    ];

    statuses.forEach((status) => {
      const result = OrderStatusManager.transition(
        status,
        OrderStatus.CANCELLED,
        PaymentStatus.PAID
      );
      expect(result.success).toBe(true);
    });
  });
});

describe('OrderStatusManager - Invalid Transitions', () => {
  it('nu permite tranziția CONFIRMED → IN_PRODUCTION fără plată', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.CONFIRMED,
      OrderStatus.IN_PRODUCTION,
      PaymentStatus.PENDING
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('nu permite tranziția PENDING → IN_PRODUCTION (skip CONFIRMED)', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.PENDING,
      OrderStatus.IN_PRODUCTION,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(false);
  });

  it('nu permite tranziția din CANCELLED', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.CANCELLED,
      OrderStatus.PENDING,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(false);
  });

  it('nu permite tranziția DELIVERED → IN_PRODUCTION', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.DELIVERED,
      OrderStatus.IN_PRODUCTION,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(false);
  });

  it('nu permite tranziția înapoi (DELIVERED → PENDING)', () => {
    const result = OrderStatusManager.transition(
      OrderStatus.DELIVERED,
      OrderStatus.PENDING,
      PaymentStatus.PAID
    );

    expect(result.success).toBe(false);
  });
});

describe('OrderStatusManager - Next Statuses', () => {
  it('returnează statusurile următoare pentru PENDING', () => {
    const nextStatuses = OrderStatusManager.getNextStatuses(
      OrderStatus.PENDING,
      PaymentStatus.PAID
    );

    expect(nextStatuses).toContain(OrderStatus.CONFIRMED);
    expect(nextStatuses).toContain(OrderStatus.CANCELLED);
    expect(nextStatuses.length).toBe(2);
  });

  it('exclude IN_PRODUCTION dacă nu este plătit', () => {
    const nextStatuses = OrderStatusManager.getNextStatuses(
      OrderStatus.CONFIRMED,
      PaymentStatus.PENDING
    );

    expect(nextStatuses).not.toContain(OrderStatus.IN_PRODUCTION);
    expect(nextStatuses).toContain(OrderStatus.CANCELLED);
  });

  it('include IN_PRODUCTION dacă este plătit', () => {
    const nextStatuses = OrderStatusManager.getNextStatuses(
      OrderStatus.CONFIRMED,
      PaymentStatus.PAID
    );

    expect(nextStatuses).toContain(OrderStatus.IN_PRODUCTION);
  });

  it('returnează array gol pentru CANCELLED', () => {
    const nextStatuses = OrderStatusManager.getNextStatuses(
      OrderStatus.CANCELLED,
      PaymentStatus.PAID
    );

    expect(nextStatuses.length).toBe(0);
  });
});

describe('OrderStatusManager - Cancel Logic', () => {
  it('permite anularea pentru statusuri active', () => {
    expect(OrderStatusManager.canCancel(OrderStatus.PENDING)).toBe(true);
    expect(OrderStatusManager.canCancel(OrderStatus.CONFIRMED)).toBe(true);
    expect(OrderStatusManager.canCancel(OrderStatus.IN_PRODUCTION)).toBe(true);
  });

  it('nu permite anularea pentru DELIVERED', () => {
    expect(OrderStatusManager.canCancel(OrderStatus.DELIVERED)).toBe(false);
  });

  it('nu permite anularea pentru CANCELLED', () => {
    expect(OrderStatusManager.canCancel(OrderStatus.CANCELLED)).toBe(false);
  });
});

describe('OrderStatusManager - Progress Tracking', () => {
  it('calculează progresul corect pentru fiecare status', () => {
    expect(OrderStatusManager.getProgressPercentage(OrderStatus.PENDING)).toBe(0);
    expect(OrderStatusManager.getProgressPercentage(OrderStatus.CONFIRMED)).toBe(20);
    expect(OrderStatusManager.getProgressPercentage(OrderStatus.IN_PRODUCTION)).toBe(50);
    expect(OrderStatusManager.getProgressPercentage(OrderStatus.READY_FOR_DELIVERY)).toBe(80);
    expect(OrderStatusManager.getProgressPercentage(OrderStatus.DELIVERED)).toBe(100);
    expect(OrderStatusManager.getProgressPercentage(OrderStatus.CANCELLED)).toBe(0);
  });
});
