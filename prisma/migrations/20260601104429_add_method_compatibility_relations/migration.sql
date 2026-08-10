/*
  Warnings:

  - You are about to drop the column `compatibleEquipmentIds` on the `print_methods` table. All the data in the column will be lost.
  - You are about to drop the column `materialIds` on the `print_methods` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_PrintMethodMaterials" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PrintMethodMaterials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PrintMethodMachines" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PrintMethodMachines_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PrintMethodMaterials_B_index" ON "_PrintMethodMaterials"("B");

-- CreateIndex
CREATE INDEX "_PrintMethodMachines_B_index" ON "_PrintMethodMachines"("B");

-- Backfill data from legacy scalar arrays before dropping columns
INSERT INTO "_PrintMethodMaterials" ("A", "B")
SELECT DISTINCT material_id, pm.id
FROM "print_methods" pm
CROSS JOIN LATERAL unnest(COALESCE(pm."materialIds", ARRAY[]::TEXT[])) AS material_id
JOIN "materials" m ON m.id = material_id;

INSERT INTO "_PrintMethodMachines" ("A", "B")
SELECT DISTINCT machine_id, pm.id
FROM "print_methods" pm
CROSS JOIN LATERAL unnest(COALESCE(pm."compatibleEquipmentIds", ARRAY[]::TEXT[])) AS machine_id
JOIN "machines" m ON m.id = machine_id;

-- AlterTable
ALTER TABLE "print_methods" DROP COLUMN "compatibleEquipmentIds",
DROP COLUMN "materialIds";

-- AddForeignKey
ALTER TABLE "_PrintMethodMaterials" ADD CONSTRAINT "_PrintMethodMaterials_A_fkey" FOREIGN KEY ("A") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrintMethodMaterials" ADD CONSTRAINT "_PrintMethodMaterials_B_fkey" FOREIGN KEY ("B") REFERENCES "print_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrintMethodMachines" ADD CONSTRAINT "_PrintMethodMachines_A_fkey" FOREIGN KEY ("A") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrintMethodMachines" ADD CONSTRAINT "_PrintMethodMachines_B_fkey" FOREIGN KEY ("B") REFERENCES "print_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
