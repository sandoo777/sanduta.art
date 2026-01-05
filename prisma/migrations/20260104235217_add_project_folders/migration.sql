-- AlterTable
ALTER TABLE "editor_projects" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "project_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_folders_userId_idx" ON "project_folders"("userId");

-- CreateIndex
CREATE INDEX "editor_projects_folderId_idx" ON "editor_projects"("folderId");

-- AddForeignKey
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "project_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_folders" ADD CONSTRAINT "project_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
