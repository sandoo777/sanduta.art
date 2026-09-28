'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export type PurchaseOrderActionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderActionLine {
  id: string;
  materialId: string;
  material?: { name?: string; sku?: string } | null;
  quantity: number;
  unit: string;
}

export interface PurchaseOrderActionData {
  id: string;
  status: PurchaseOrderActionStatus;
  lastResponse?: string | null;
  supplier?: { name?: string } | null;
  lines?: PurchaseOrderActionLine[];
}

interface PurchaseOrderActionsProps {
  order: PurchaseOrderActionData;
}

export function PurchaseOrderActions({ order }: PurchaseOrderActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [received, setReceived] = useState<Record<string, number>>({});

  const canApprove = order.status === 'DRAFT';
  const canSend = order.status === 'DRAFT' || order.status === 'PENDING_APPROVAL';
  const canReceive = order.status === 'SENT';
  const canCancel = !['CANCELLED', 'RECEIVED'].includes(order.status);

  const awaitAction = async (action: 'approve' | 'send' | 'receive' | 'cancel', payload?: Record<string, unknown>) => {
    setLoadingAction(action);
    setError(null);
    try {
      const response = await fetch(`/api/purchase-orders/${order.id}/${action === 'receive' ? 'receive' : action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || 'Action failed';
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(`${action === 'cancel' ? 'Cancelled' : action === 'send' ? 'Sent' : action === 'receive' ? 'Received' : 'Approved'} successfully`);
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      toast.error(message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReceiveSubmit = async () => {
    const payload = {
      receivedQuantities: (order.lines ?? []).map((line) => ({
        materialId: line.materialId,
        quantity: Number(received[line.id] ?? 0),
      })).filter((line) => line.quantity > 0),
    };

    if (!payload.receivedQuantities.length) {
      setError('Enter at least one quantity before marking as received');
      return;
    }

    await awaitAction('receive', payload);
  };

  const actionLabel = useMemo(() => {
    if (loadingAction) return 'Processing...';
    return null;
  }, [loadingAction]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => awaitAction('approve')}
          disabled={!canApprove || !!loadingAction}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === 'approve' ? 'Approving...' : 'Approve'}
        </button>

        <button
          type="button"
          onClick={() => awaitAction('send')}
          disabled={!canSend || !!loadingAction}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === 'send' ? 'Sending...' : 'Send'}
        </button>

        <button
          type="button"
          onClick={() => setReceiveOpen(true)}
          disabled={!canReceive || !!loadingAction}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Mark Received
        </button>

        <button
          type="button"
          onClick={() => awaitAction('cancel')}
          disabled={!canCancel || !!loadingAction}
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingAction === 'cancel' ? 'Cancelling...' : 'Cancel'}
        </button>
      </div>

      {order.lastResponse && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Last response:</strong> {order.lastResponse}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}

      {actionLabel && <div className="text-sm text-slate-500">{actionLabel}</div>}

      {receiveOpen && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Mark received quantities</h3>
          <div className="space-y-3">
            {(order.lines ?? []).map((line) => (
              <div key={line.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2">
                <div>
                  <div className="font-medium text-slate-800">{line.material?.name ?? line.materialId}</div>
                  <div className="text-xs text-slate-500">{line.quantity} {line.unit}</div>
                </div>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={received[line.id] ?? ''}
                  onChange={(event) => setReceived((prev) => ({ ...prev, [line.id]: Number(event.target.value) }))}
                  className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                  placeholder="Qty"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleReceiveSubmit}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
            >
              Confirm receipt
            </button>
            <button
              type="button"
              onClick={() => setReceiveOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
