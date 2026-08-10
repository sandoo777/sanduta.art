-- AlterTable
ALTER TABLE "machines" ADD COLUMN     "inkChangeoverCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "supportedColorModes" "ColorMode"[] DEFAULT ARRAY['CMYK', 'CMYK_WHITE', 'CMYK_WHITE_VARNISH', 'CMYK_LC_LM', 'CMYK_OG', 'MONO', 'SPOT', 'PANTONE']::"ColorMode"[];

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "supportedColorModes" "ColorMode"[] DEFAULT ARRAY['CMYK', 'CMYK_WHITE', 'CMYK_WHITE_VARNISH', 'CMYK_LC_LM', 'CMYK_OG', 'MONO', 'SPOT', 'PANTONE']::"ColorMode"[];
