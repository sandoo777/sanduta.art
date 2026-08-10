-- CreateEnum
CREATE TYPE "ColorMode" AS ENUM ('CMYK', 'CMYK_WHITE', 'CMYK_WHITE_VARNISH', 'CMYK_LC_LM', 'CMYK_OG', 'MONO', 'SPOT', 'PANTONE');

-- AlterTable
ALTER TABLE "print_methods" ADD COLUMN "colorMode_new" "ColorMode";

UPDATE "print_methods"
SET "colorMode_new" = CASE
  WHEN "colorMode" IS NULL THEN NULL
  WHEN upper(trim("colorMode")) = 'CMYK' THEN 'CMYK'::"ColorMode"
  WHEN upper(trim("colorMode")) IN ('CMYK+WHITE', 'CMYK_WHITE', 'CMYK WHITE') THEN 'CMYK_WHITE'::"ColorMode"
  WHEN upper(trim("colorMode")) IN ('CMYK+WHITE+VARNISH', 'CMYK_WHITE_VARNISH', 'CMYK WHITE VARNISH') THEN 'CMYK_WHITE_VARNISH'::"ColorMode"
  WHEN upper(trim("colorMode")) IN ('CMYK+LC+LM', 'CMYK_LC_LM', 'CMYK LC LM') THEN 'CMYK_LC_LM'::"ColorMode"
  WHEN upper(trim("colorMode")) IN ('CMYK+OG', 'CMYK_OG', 'CMYK OG') THEN 'CMYK_OG'::"ColorMode"
  WHEN upper(trim("colorMode")) IN ('MONO', 'B&W', 'BW', 'BLACK&WHITE', 'BLACK AND WHITE') THEN 'MONO'::"ColorMode"
  WHEN upper(trim("colorMode")) = 'SPOT' THEN 'SPOT'::"ColorMode"
  WHEN upper(trim("colorMode")) = 'PANTONE' THEN 'PANTONE'::"ColorMode"
  ELSE NULL
END;

ALTER TABLE "print_methods" DROP COLUMN "colorMode";
ALTER TABLE "print_methods" RENAME COLUMN "colorMode_new" TO "colorMode";
