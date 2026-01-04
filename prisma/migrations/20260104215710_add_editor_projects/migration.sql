-- CreateTable
CREATE TABLE "editor_projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "elements" TEXT NOT NULL,
    "canvas" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "versions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editor_projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "editor_projects_userId_idx" ON "editor_projects"("userId");

-- AddForeignKey
ALTER TABLE "editor_projects" ADD CONSTRAINT "editor_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
