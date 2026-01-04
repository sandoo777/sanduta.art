/*
  Warnings:

  - You are about to drop the column `canvas` on the `editor_projects` table. All the data in the column will be lost.
  - You are about to drop the column `elements` on the `editor_projects` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `editor_projects` table. All the data in the column will be lost.
  - You are about to drop the column `versions` on the `editor_projects` table. All the data in the column will be lost.
  - Added the required column `data` to the `editor_projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "editor_projects" DROP COLUMN "canvas",
DROP COLUMN "elements",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "versions",
ADD COLUMN     "data" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company" TEXT,
ADD COLUMN     "cui" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Moldova',
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
