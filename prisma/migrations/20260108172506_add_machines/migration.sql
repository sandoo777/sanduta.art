-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "costPerHour" DECIMAL(10,2),
    "speed" TEXT,
    "maxWidth" INTEGER,
    "maxHeight" INTEGER,
    "compatibleMaterialIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatiblePrintMethodIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);
