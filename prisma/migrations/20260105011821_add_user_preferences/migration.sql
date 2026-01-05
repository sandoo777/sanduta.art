-- CreateEnum
CREATE TYPE "Language" AS ENUM ('RO', 'EN', 'RU');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EditorUnit" AS ENUM ('PX', 'MM', 'CM');

-- CreateEnum
CREATE TYPE "UIDensity" AS ENUM ('COMPACT', 'STANDARD', 'SPACIOUS');

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'RO',
    "theme" "Theme" NOT NULL DEFAULT 'SYSTEM',
    "emailOrders" BOOLEAN NOT NULL DEFAULT true,
    "emailProjects" BOOLEAN NOT NULL DEFAULT true,
    "emailFiles" BOOLEAN NOT NULL DEFAULT true,
    "emailPromotions" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "editorSnapToGrid" BOOLEAN NOT NULL DEFAULT true,
    "editorGridVisible" BOOLEAN NOT NULL DEFAULT true,
    "editorGridSize" INTEGER NOT NULL DEFAULT 10,
    "editorUnit" "EditorUnit" NOT NULL DEFAULT 'PX',
    "editorAutoSave" INTEGER NOT NULL DEFAULT 10,
    "editorUIDensity" "UIDensity" NOT NULL DEFAULT 'STANDARD',
    "configDefaultQuantity" INTEGER NOT NULL DEFAULT 1,
    "configDefaultProductionTime" TEXT NOT NULL DEFAULT 'standard',
    "configDefaultDelivery" TEXT NOT NULL DEFAULT 'courier',
    "configDefaultPayment" TEXT NOT NULL DEFAULT 'card',
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "specialOffers" BOOLEAN NOT NULL DEFAULT false,
    "personalizedRecommend" BOOLEAN NOT NULL DEFAULT false,
    "productNews" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
