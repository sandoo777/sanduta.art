import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Check CLOUDINARY_URL
  if (cloudinaryUrl) {
    const isPlaceholder = cloudinaryUrl === "cloudinary://api_key:api_secret@cloud_name" ||
                         cloudinaryUrl.includes("api_key") ||
                         cloudinaryUrl.includes("api_secret");
    return !isPlaceholder;
  }

  // Check individual variables
  if (cloudName && apiKey && apiSecret) {
    const isPlaceholder = cloudName === "cloud_name" || 
                         apiKey === "api_key" || 
                         apiSecret === "api_secret";
    return !isPlaceholder;
  }

  return false;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use Cloudinary if configured, otherwise save locally
    if (isCloudinaryConfigured()) {
      console.log('[Upload] Using Cloudinary');
      
      // Configure Cloudinary
      cloudinary.config();
      
      // Upload to Cloudinary with optimizations
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: "sanduta-products",
            // Optimization settings
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('[Upload] Cloudinary error:', error);
              reject(error);
            } else {
              console.log('[Upload] Cloudinary success:', result?.secure_url);
              resolve(result);
            }
          }
        ).end(buffer);
      });

      return NextResponse.json({ 
        url: (result as any).secure_url,
        cloudinary: true 
      });
    } else {
      // Local file upload fallback
      console.log('[Upload] Using local storage (Cloudinary not configured)');
      
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const uploadDir = join(process.cwd(), "public", "uploads", "products");
      const filePath = join(uploadDir, fileName);

      // Create upload directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      // Write file to disk
      await writeFile(filePath, buffer);

      // Return public URL
      const publicUrl = `/uploads/products/${fileName}`;
      console.log(`[Upload] File saved locally: ${publicUrl}`);
      
      return NextResponse.json({ 
        url: publicUrl,
        cloudinary: false,
        warning: "Using local storage. Configure Cloudinary for production."
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}