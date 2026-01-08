-- CreateTable
CREATE TABLE "print_methods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "costPerM2" DECIMAL(10,2),
    "costPerSheet" DECIMAL(10,2),
    "speed" TEXT,
    "maxWidth" INTEGER,
    "maxHeight" INTEGER,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "materialIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "print_methods_pkey" PRIMARY KEY ("id")
);
