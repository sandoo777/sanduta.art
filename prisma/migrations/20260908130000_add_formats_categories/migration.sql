CREATE TABLE "formats_categories" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "formats_categories_pkey" PRIMARY KEY ("code")
);

INSERT INTO "formats_categories" ("code", "name")
VALUES ('FOI', 'Foi'), ('ROLE', 'Role');

ALTER TABLE "formats"
    ADD COLUMN "categoryCode" TEXT;

ALTER TABLE "formats"
    ADD CONSTRAINT "formats_categoryCode_fkey"
    FOREIGN KEY ("categoryCode") REFERENCES "formats_categories"("code")
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "formats_categoryCode_idx"
    ON "formats"("categoryCode");
