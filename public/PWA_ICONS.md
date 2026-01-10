# PWA Icons Setup

## Required Icons

The following icon files are referenced in `site.webmanifest` but need to be created:

- `android-chrome-192x192.png` - 192x192px icon for Android
- `android-chrome-512x512.png` - 512x512px icon for Android
- `apple-touch-icon.png` - 180x180px icon for iOS (optional)
- `favicon-16x16.png` - 16x16px favicon
- `favicon-32x32.png` - 32x32px favicon

## How to Generate

### Option 1: Use Online Generator
1. Go to https://realfavicongenerator.net/
2. Upload your logo/brand image
3. Download the generated icon pack
4. Copy icons to this `public/` directory

### Option 2: Use ImageMagick (CLI)
```bash
# From a source logo.png (recommended size: 512x512 or larger)
convert logo.png -resize 192x192 android-chrome-192x192.png
convert logo.png -resize 512x512 android-chrome-512x512.png
convert logo.png -resize 180x180 apple-touch-icon.png
convert logo.png -resize 32x32 favicon-32x32.png
convert logo.png -resize 16x16 favicon-16x16.png
```

### Option 3: Design Tool Export
Export from Figma/Sketch/Photoshop at the required sizes.

## Quick Fix (Placeholder)

For development, you can temporarily use the existing favicon.ico:
```bash
cd public
cp ../src/app/favicon.ico ./favicon-32x32.png
```

## Current Status

✅ `site.webmanifest` - Created
⚠️ Icon files - Need to be added
✅ `favicon.ico` - Exists in src/app/
