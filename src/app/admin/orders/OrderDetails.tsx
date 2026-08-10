'use client';

import { useEffect, useState } from 'react';
import { useOrders } from '@/modules/orders/useOrders';
import { OrderStatusManager } from './components/OrderStatusManager';
import { PaymentStatusManager } from './components/PaymentStatusManager';
import { AssignOperator } from './components/AssignOperator';
import { OrderItemsManager } from './components/OrderItemsManager';
import { OrderFilesManager } from './components/OrderFilesManager';
import { OrderTimeline } from './components/OrderTimeline';
import { toast } from 'sonner';
import { ChevronLeft, Clock3, Cpu, Layers, Printer, RefreshCw, Scissors, Wallet } from 'lucide-react';
import { AuthLink } from '@/components/common/links/AuthLink';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Order } from '@/types/models';
import { EQUIPMENT_TYPE_CONFIG, MACHINE_STATUS_CONFIG, MACHINE_TYPES } from '@/modules/machines/types';

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

interface MaterialUsageDetail {
  id: string;
  quantity: number;
  unit: string;
  wastePercent: number;
  totalUsed: number;
  cost: number;
  createdAt: string;
  material: {
    id: string;
    name: string;
    category: { id: string; name: string } | null;
    pricePerSqm: number | null;
    pricePerMeter: number | null;
    pricePerUnit: number | null;
  };
}

interface ProductionJobSummary {
  id: string;
  name: string;
  status: string;
  priority?: string;
  estimatedMinutes?: number | null;
  estimatedCost?: string | number | null;
  outsourcedCost?: string | number | null;
  outsourcedProfit?: string | number | null;
  notes?: string | null;
  product?: {
    id: string;
    name: string;
    saleUnit?: 'M2' | 'UNIT' | null;
  } | null;
  printMethod?: {
    id: string;
    name: string;
    type: string;
    isOutsourced?: boolean;
    termenFurnizor?: string | null;
    markup?: string | number | null;
  } | null;
  material?: {
    id: string;
    name: string;
    unit: string;
  } | null;
  machine?: {
    id: string;
    name: string;
    type: string;
    equipmentType: string;
    status: string;
  } | null;
  assignedTo?: { id: string; name: string } | null;
  materialUsages?: MaterialUsageDetail[];
}

interface OrderDetail extends Order {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: { id: string; productId: string; variantId?: string; quantity: number; unitPrice: number; lineTotal: number; customDescription?: string; product?: { id: string; name: string; price: number; saleUnit?: 'M2' | 'UNIT' | null } }[];
  files: { id: string; url: string; name: string; createdAt: string }[];
  productionJobs?: ProductionJobSummary[];
  _count?: {
    orderItems: number;
    files: number;
    productionJobs?: number;
  };
}

const getSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    ONLINE: 'Online',
    OFFLINE: 'Offline',
  };
  return labels[source] || source;
};

const getChannelLabel = (channel: string) => {
  const labels: Record<string, string> = {
    WEB: 'Web',
    PHONE: 'Telefon',
    WALK_IN: 'Vizita',
    EMAIL: 'Email',
  };
  return labels[channel] || channel;
};

const getMachineStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    AVAILABLE: 'Disponibil',
    BUSY: 'Ocupat',
    MAINTENANCE: 'Mentenanță',
  };
  return labels[status] || status;
};

const getMachineStatusColor = (status: string) => {
  if (status === 'AVAILABLE') return 'text-green-700 bg-green-100';
  if (status === 'BUSY')      return 'text-amber-700 bg-amber-100';
  return 'text-red-700 bg-red-100';
};

const getJobStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING:    'În așteptare',
    IN_PROGRESS: 'În lucru',
    ON_HOLD:    'Suspendat',
    COMPLETED:  'Finalizat',
    CANCELED:   'Anulat',
  };
  return labels[status] || status;
};

const getJobStatusColor = (status: string) => {
  if (status === 'COMPLETED') return 'text-green-700 bg-green-100';
  if (status === 'IN_PROGRESS') return 'text-blue-700 bg-blue-100';
  if (status === 'CANCELED')  return 'text-red-700 bg-red-100';
  if (status === 'ON_HOLD')   return 'text-orange-700 bg-orange-100';
  return 'text-gray-700 bg-gray-100';
};

const formatMinutes = (min?: number | null) => {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m} min`;
};

const formatEstimatedCost = (value?: string | number | null) => {
  if (value === null || value === undefined || Number(value) <= 0) return null;
  return `${Number(value).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON`;
};

const formatMaterialUnit = (unit?: string | null) => {
  if (!unit) return '';

  const labels: Record<string, string> = {
    pcs: 'buc',
    unit: 'buc',
    m2: 'm2',
    meter: 'm',
    liter: 'L',
    ml: 'ml',
    gram: 'g',
    kg: 'kg',
  };

  return labels[unit] ?? unit;
};

function getMachineIcon(type?: string, equipmentType?: string) {
  const typeMatch = type ? MACHINE_TYPES.find((item) => item.value === type) : null;
  if (typeMatch) return typeMatch.icon;

  switch (equipmentType) {
    case 'LARGE_FORMAT':
      return Printer;
    case 'DIGITAL':
      return Layers;
    case 'HOURLY':
      return Scissors;
    default:
      return Cpu;
  }
}

function ProductionTab({
  jobs,
  orderItems,
  orderTotal,
}: {
  jobs: ProductionJobSummary[];
  orderItems: OrderDetail['orderItems'];
  orderTotal: number;
}) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 text-sm">Niciun job de producție asociat acestei comenzi.</p>
      </div>
    );
  }

  const totalMinutes = jobs.reduce((s, j) => s + (j.estimatedMinutes ?? 0), 0);
  const totalCost    = jobs.reduce((s, j) => s + (j.estimatedCost ? Number(j.estimatedCost) : 0), 0);
  const totalOutsourceCost = jobs.reduce((s, j) => s + Number(j.outsourcedCost ?? 0), 0);
  const totalOutsourceProfit = jobs.reduce((sum, job) => {
    if (!job.printMethod?.isOutsourced) {
      return sum;
    }

    const supplierCost = Number(job.outsourcedCost ?? 0);
    const markupPercent = Number(job.printMethod?.markup ?? 0);
    return sum + (supplierCost * markupPercent) / 100;
  }, 0);
  const allUsages    = jobs.flatMap((j) => j.materialUsages ?? []);
  const totalMaterialCost = allUsages.reduce((s, u) => s + Number(u.cost ?? 0), 0);
  const estimatedInternalProfit = totalCost > 0 ? orderTotal - totalCost : 0;

  return (
    <div className="space-y-4">
      {/* Summary row */}
      {jobs.length > 1 && (
        <div className="flex gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <span className="font-medium text-blue-800">
            {jobs.length} joburi de producție
          </span>
          {totalMinutes > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-blue-700">
              ⏱ Total timp: <strong>{formatMinutes(totalMinutes)}</strong>
            </span>
          )}
          {totalCost > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700">
              💰 Total cost est.: <strong>{formatEstimatedCost(totalCost)}</strong>
            </span>
          )}
          {totalCost > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
              📈 Profit intern est.: <strong>{estimatedInternalProfit.toFixed(2)} MDL</strong>
            </span>
          )}
          {totalMaterialCost > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              📦 Cost materiale: <strong>{totalMaterialCost.toFixed(2)} MDL</strong>
            </span>
          )}
          {totalOutsourceCost > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
              🏷 Cost furnizor: <strong>{totalOutsourceCost.toFixed(2)} MDL</strong>
            </span>
          )}
          {totalOutsourceProfit !== 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">
              📈 Profit: <strong>{totalOutsourceProfit.toFixed(2)} MDL</strong>
            </span>
          )}
        </div>
      )}

      {/* Job cards */}
      {jobs.map((job) => {
        const isOutsource = Boolean(job.printMethod?.isOutsourced);
        const orderLineSale = job.product?.id
          ? orderItems
              .filter((item) => item.productId === job.product?.id)
              .reduce((sum, item) => sum + Number(item.lineTotal), 0)
          : (jobs.length > 0 ? orderTotal / jobs.length : 0);
        const supplierCost = Number(job.outsourcedCost ?? 0);
        const markupPercent = Number(job.printMethod?.markup ?? 0);
        const markupValue = supplierCost * (markupPercent / 100);
        const outsourceSale = supplierCost + markupValue;
        const jobSale = isOutsource ? outsourceSale : orderLineSale;
        const internalSinecost = Number(job.estimatedCost ?? 0);
        const jobProfit = isOutsource ? markupValue : (jobSale - internalSinecost);

        return (
        <div key={job.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {job.product?.saleUnit && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                Unitate: <strong>{job.product.saleUnit === 'M2' ? 'm²' : 'bucată'}</strong>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] text-sky-700">
              Vânzare: <strong>{jobSale.toFixed(2)} MDL</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] text-green-700">
              Profit: <strong>{jobProfit.toFixed(2)} MDL</strong>
            </span>
          </div>

          {/* Job header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900">{job.name}</p>
              {job.assignedTo && (
                <p className="text-xs text-gray-500 mt-0.5">Operator: {job.assignedTo.name}</p>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getJobStatusColor(job.status)}`}>
              {getJobStatusLabel(job.status)}
            </span>
          </div>

          {/* Machine info */}
          {job.printMethod?.isOutsourced ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase text-amber-700">Outsource</p>
              <p className="text-sm text-amber-900">Furnizor: {job.printMethod.name}</p>
              {job.product?.name && (
                <p className="text-xs text-amber-700">Produs: {job.product.name}</p>
              )}
              {job.printMethod.termenFurnizor && (
                <p className="text-xs text-amber-700">Termen furnizor: {job.printMethod.termenFurnizor}</p>
              )}
              {Number(job.printMethod?.markup ?? 0) > 0 && (
                <p className="text-xs text-amber-700">
                  Markup: {markupPercent.toFixed(2)}% (
                  {markupValue.toFixed(2)} MDL)
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {Number(job.outsourcedCost ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] text-violet-700">
                    Cost furnizor: <strong>{Number(job.outsourcedCost).toFixed(2)} MDL</strong>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] text-sky-700">
                  Pret vanzare: <strong>{jobSale.toFixed(2)} MDL</strong>
                </span>
                {jobProfit !== 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] text-green-700">
                    Profit: <strong>{jobProfit.toFixed(2)} MDL</strong>
                  </span>
                ) : null}
              </div>
            </div>
          ) : job.machine ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700">
                  {(() => {
                    const Icon = getMachineIcon(job.machine?.type, job.machine?.equipmentType);
                    return <Icon className="h-4.5 w-4.5" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Echipament folosit</p>
                  {job.product?.name && (
                    <p className="text-xs text-gray-500 mb-1">Produs: {job.product.name}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">{job.machine.name}</p>
                    {job.machine.equipmentType && (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${EQUIPMENT_TYPE_CONFIG[job.machine.equipmentType as keyof typeof EQUIPMENT_TYPE_CONFIG]?.bg ?? 'bg-gray-100'} ${EQUIPMENT_TYPE_CONFIG[job.machine.equipmentType as keyof typeof EQUIPMENT_TYPE_CONFIG]?.color ?? 'text-gray-600'}`}>
                        {EQUIPMENT_TYPE_CONFIG[job.machine.equipmentType as keyof typeof EQUIPMENT_TYPE_CONFIG]?.label ?? job.machine.equipmentType}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{job.machine.type}</p>
                </div>
                {(() => {
                  const machineStatusCfg = MACHINE_STATUS_CONFIG[job.machine.status as keyof typeof MACHINE_STATUS_CONFIG];
                  if (machineStatusCfg) {
                    return (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${machineStatusCfg.bg} ${machineStatusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${machineStatusCfg.dot}`} />
                        {machineStatusCfg.label}
                      </span>
                    );
                  }

                  return (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getMachineStatusColor(job.machine.status)}`}>
                      {getMachineStatusLabel(job.machine.status)}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Fără echipament asociat</p>
          )}

          {!job.printMethod?.isOutsourced && job.material && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-indigo-700">Material folosit</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-700">
                  Material: <strong>{job.material.name}</strong>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-indigo-200 px-2 py-0.5 text-[11px] text-indigo-700">
                  Unitate: <strong>{formatMaterialUnit(job.material.unit)}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Material consumption */}
          {!job.printMethod?.isOutsourced && job.materialUsages && job.materialUsages.length > 0 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-emerald-700">Consumabile (MaterialUsage)</p>
              <div className="space-y-2">
                {job.materialUsages.map((usage) => {
                  return (
                    <div key={usage.id} className="rounded-lg border border-emerald-100 bg-white p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {usage.material.name}
                        </span>
                        {usage.material.category && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            {usage.material.category.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          Cantitate: <strong>{usage.quantity.toFixed(2)} {usage.unit}</strong>
                        </span>
                        {usage.wastePercent > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] text-amber-700">
                            Pierderi: <strong>{usage.wastePercent}%</strong>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-700">
                          Total: <strong>{usage.totalUsed.toFixed(2)} {usage.unit}</strong>
                        </span>
                        {Number(usage.cost) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] text-violet-700">
                            Cost: <strong>{Number(usage.cost).toFixed(2)} MDL</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Time + Cost estimates */}
          {(job.estimatedMinutes || job.estimatedCost || job.outsourcedCost) && (
            <div className="flex gap-4 text-sm">
              {job.estimatedMinutes && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                  <Clock3 className="h-4 w-4" />
                  <span className="font-semibold">{formatMinutes(job.estimatedMinutes)}</span>
                  <span className="text-xs text-blue-600/70">estimat</span>
                </div>
              )}
              {(() => {
                const displayedSinecost = job.printMethod?.isOutsourced
                  ? Number(job.outsourcedCost ?? 0)
                  : Number(job.estimatedCost ?? 0);

                if (!displayedSinecost || displayedSinecost <= 0) {
                  return null;
                }

                return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-lg text-violet-800">
                  <Wallet className="h-4 w-4" />
                  <span className="font-semibold">Sinecost: {formatEstimatedCost(displayedSinecost)}</span>
                  <span className="text-xs text-violet-600/70">estimat</span>
                </div>
                );
              })()}
            </div>
          )}

          {job.notes && (
            <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">{job.notes}</p>
          )}
        </div>
      );
      })}
    </div>
  );
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'files' | 'production' | 'timeline'>('overview');

  const { getOrder } = useOrders();

  const loadOrder = async () => {
    setIsLoading(true);
    const result = await getOrder(params.id);
    if (result.success) {
      setOrder(result.data);
    } else {
      toast.error('Eroare la încărcare: ' + result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Se încarcă comanda...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Comanda nu a fost găsită</p>
        <AuthLink
          href="/admin/orders"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700"
        >
          Înapoi la comenzi
        </AuthLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AuthLink
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </AuthLink>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comanda {order.id}</h1>
            <p className="text-gray-600 mt-1">
              Client: {order.customerName} ({order.customerEmail})
            </p>
          </div>
        </div>
        <button
          onClick={loadOrder}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700
            rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <RefreshCw size={18} />
          Reîncarcă
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {Number(order.totalPrice).toFixed(2)} {order.currency}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Sursă / Canal</p>
          <p className="text-lg font-semibold text-gray-900 mt-2">
            {getSourceLabel(order.source)} / {getChannelLabel(order.channel)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Articole</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {order._count?.orderItems || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold">Fișiere</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {order._count?.files || 0}
          </p>
        </div>
      </div>

      {/* Manager Cards */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Gestiune Comandă</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <OrderStatusManager
            orderId={order.id}
            currentStatus={order.status}
            onStatusChanged={(status) => setOrder({ ...order, status })}
          />
          <PaymentStatusManager
            orderId={order.id}
            currentPaymentStatus={order.paymentStatus}
            onPaymentStatusChanged={(status) => setOrder({ ...order, paymentStatus: status })}
          />
          <AssignOperator
            orderId={order.id}
            assignedToUserId={order.assignedTo?.id}
            assignedOperatorName={order.assignedTo?.name}
            onOperatorAssigned={() => loadOrder()}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['overview', 'items', 'files', 'production', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && 'Prezentare generală'}
              {tab === 'items' && 'Articole'}
              {tab === 'files' && 'Fișiere'}
              {tab === 'production' && (
                <span className="flex items-center justify-center gap-1">
                  Producție
                  {(order._count?.productionJobs ?? 0) > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                      {order._count!.productionJobs}
                    </span>
                  )}
                </span>
              )}
              {tab === 'timeline' && 'Timeline'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informații Client
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nume</p>
                      <p className="text-gray-900 font-medium">
                        {order.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-gray-900 font-medium">
                        {order.customerEmail}
                      </p>
                    </div>
                    {order.customerPhone && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Telefon</p>
                        <p className="text-gray-900 font-medium">
                          {order.customerPhone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informații Comandă
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">ID Comandă</p>
                      <p className="text-gray-900 font-mono font-medium">
                        {order.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Creat</p>
                      <p className="text-gray-900 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {order.dueDate && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Data Scadenței</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(order.dueDate).toLocaleDateString('ro-RO')}
                        </p>
                      </div>
                    )}
                    {order.assignedTo && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Operator Alocat</p>
                        <p className="text-gray-900 font-medium">
                          {order.assignedTo.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Production Tab */}
          {activeTab === 'production' && (
            <ProductionTab
              jobs={order.productionJobs ?? []}
              orderItems={order.orderItems}
              orderTotal={Number(order.totalPrice)}
            />
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <OrderItemsManager
              orderId={order.id}
              items={order.orderItems}
              onItemsChanged={loadOrder}
            />
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <OrderFilesManager
              orderId={order.id}
              files={order.files}
              onFilesChanged={loadOrder}
            />
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <OrderTimeline
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
              status={order.status}
              paymentStatus={order.paymentStatus}
              itemsCount={order._count?.orderItems || 0}
              filesCount={order._count?.files || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
