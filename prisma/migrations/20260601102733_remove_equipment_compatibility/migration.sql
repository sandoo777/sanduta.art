/*
  Warnings:

  - You are about to drop the column `compatibleMaterialIds` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the column `compatiblePrintMethodIds` on the `machines` table. All the data in the column will be lost.
  - You are about to drop the `_MachinePrintMethodCompatibility` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MachinePrintMethodCompatibility" DROP CONSTRAINT "_MachinePrintMethodCompatibility_A_fkey";

-- DropForeignKey
ALTER TABLE "_MachinePrintMethodCompatibility" DROP CONSTRAINT "_MachinePrintMethodCompatibility_B_fkey";

-- AlterTable
ALTER TABLE "machines" DROP COLUMN "compatibleMaterialIds",
DROP COLUMN "compatiblePrintMethodIds";

-- AlterTable
ALTER TABLE "print_methods" ADD COLUMN     "compatibleEquipmentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "_MachinePrintMethodCompatibility";
