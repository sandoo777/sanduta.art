-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('LARGE_FORMAT', 'DIGITAL', 'HOURLY');

-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "costClickBW" DECIMAL(10,4),
ADD COLUMN     "costClickColor" DECIMAL(10,4),
ADD COLUMN     "energyConsumptionKw" DECIMAL(10,2),
ADD COLUMN     "equipmentType" "EquipmentType" NOT NULL DEFAULT 'HOURLY',
ADD COLUMN     "headAmortPerM2" DECIMAL(10,4),
ADD COLUMN     "inkPerM2" DECIMAL(10,4),
ADD COLUMN     "maintCostPerM2" DECIMAL(10,4),
ADD COLUMN     "materialPerM2" DECIMAL(10,4),
ADD COLUMN     "maxFormat" TEXT,
ADD COLUMN     "maxGramWeight" INTEGER,
ADD COLUMN     "operatorCostPerHour" DECIMAL(10,2),
ADD COLUMN     "printerAmortPerM2" DECIMAL(10,4),
ADD COLUMN     "servicePerClick" DECIMAL(10,6),
ADD COLUMN     "speedM2PerHour" DECIMAL(10,2),
ADD COLUMN     "speedPpm" INTEGER;

-- AlterTable
ALTER TABLE "production_jobs" ADD COLUMN     "actualCost" DECIMAL(10,2),
ADD COLUMN     "estimatedCost" DECIMAL(10,2),
ADD COLUMN     "estimatedMinutes" INTEGER,
ADD COLUMN     "quantity" DECIMAL(10,4);
