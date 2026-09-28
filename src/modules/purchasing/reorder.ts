export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'RECEIVED' | 'CANCELLED';
export type PurchaseOrderAction = 'approve' | 'send' | 'receive' | 'cancel';

export interface InventorySnapshot {
  materialId: string;
  quantity: number;
  unit?: string | null;
}

export interface ReorderRuleInput {
  id?: string;
  materialId: string;
  minThreshold: number;
  reorderQuantity: number;
  supplierId: string;
  enabled: boolean;
}

export interface DraftPoLineInput {
  materialId: string;
  quantity: number;
  unit?: string | null;
  unitCost?: number | null;
}

export interface ReorderCandidate extends ReorderRuleInput {
  triggerQuantity: number;
  unit: string;
}

export function evaluateReorderCandidates(
  rules: ReorderRuleInput[],
  inventoryItems: InventorySnapshot[]
): ReorderCandidate[] {
  return rules.flatMap((rule) => {
    if (!rule.enabled) return [];

    const inventoryItem = inventoryItems.find((item) => item.materialId === rule.materialId);
    if (!inventoryItem) return [];

    const quantity = Number(inventoryItem.quantity ?? 0);
    if (quantity > Number(rule.minThreshold ?? 0)) return [];

    return [{
      ...rule,
      triggerQuantity: quantity,
      unit: inventoryItem.unit ?? 'unit',
    }];
  });
}

export function aggregateDraftPoLines(lines: DraftPoLineInput[]): DraftPoLineInput[] {
  const map = new Map<string, DraftPoLineInput>();

  for (const line of lines) {
    const key = line.materialId;
    const previous = map.get(key);
    const nextQuantity = Number((previous?.quantity ?? 0) + Number(line.quantity ?? 0));
    const unitCost = Number(previous?.unitCost ?? line.unitCost ?? 0);

    map.set(key, {
      materialId: key,
      quantity: nextQuantity,
      unit: line.unit ?? previous?.unit ?? 'unit',
      unitCost,
    });
  }

  return Array.from(map.values());
}

export function buildPurchaseOrderTotal(lines: DraftPoLineInput[]): number {
  return lines.reduce((sum, line) => {
    const unitCost = Number(line.unitCost ?? 0);
    const quantity = Number(line.quantity ?? 0);
    return sum + (unitCost * quantity);
  }, 0);
}

export function applyPoStatusTransition(status: PurchaseOrderStatus, action: PurchaseOrderAction): PurchaseOrderStatus {
  const transitions: Record<PurchaseOrderStatus, Partial<Record<PurchaseOrderAction, PurchaseOrderStatus>>> = {
    DRAFT: {
      approve: 'PENDING_APPROVAL',
      cancel: 'CANCELLED',
    },
    PENDING_APPROVAL: {
      send: 'SENT',
      cancel: 'CANCELLED',
    },
    SENT: {
      receive: 'RECEIVED',
      cancel: 'CANCELLED',
    },
    RECEIVED: {},
    CANCELLED: {},
  };

  const nextStatus = transitions[status]?.[action];
  if (!nextStatus) {
    throw new Error('Invalid PO status transition');
  }

  return nextStatus;
}
