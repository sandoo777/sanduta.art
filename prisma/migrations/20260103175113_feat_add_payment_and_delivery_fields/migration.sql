-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "paynetSessionId" TEXT,
ADD COLUMN     "trackingNumber" TEXT;
