CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'SENT', 'RECEIVED', 'CANCELLED');

CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "defaultLeadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'MDL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT,
    "supplierId" TEXT NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "totalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MDL',
    "expectedDeliveryDate" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "lastResponse" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'unit',
    "unitCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_order_lines_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_lines_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "purchase_order_events" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchase_order_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_order_events_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "reorder_rules" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "minThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplierId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reorder_rules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reorder_rules_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reorder_rules_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "purchase_orders_poNumber_key" ON "purchase_orders"("poNumber");
CREATE UNIQUE INDEX "reorder_rules_materialId_supplierId_key" ON "reorder_rules"("materialId", "supplierId");
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");
CREATE INDEX "purchase_order_lines_purchaseOrderId_idx" ON "purchase_order_lines"("purchaseOrderId");
CREATE INDEX "purchase_order_lines_materialId_idx" ON "purchase_order_lines"("materialId");
CREATE INDEX "purchase_order_events_purchaseOrderId_idx" ON "purchase_order_events"("purchaseOrderId");
CREATE INDEX "reorder_rules_supplierId_idx" ON "reorder_rules"("supplierId");
CREATE INDEX "reorder_rules_enabled_idx" ON "reorder_rules"("enabled");
