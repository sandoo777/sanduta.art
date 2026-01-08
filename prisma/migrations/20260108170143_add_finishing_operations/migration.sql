-- CreateTable
CREATE TABLE "finishing_operations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "costFix" DECIMAL(10,2),
    "costPerUnit" DECIMAL(10,2),
    "costPerM2" DECIMAL(10,2),
    "timeSeconds" INTEGER,
    "compatibleMaterialIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatiblePrintMethodIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finishing_operations_pkey" PRIMARY KEY ("id")
);
