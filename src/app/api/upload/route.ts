import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  return cloudinaryUrl && 
         cloudinaryUrl !== "cloudinary://api_key:api_secret@cloud_name" &&
         !cloudinaryUrl.includes("api_key");
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
      cloudinary.config();
      
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "sanduta-products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      return NextResponse.json({ url: (result as any).secure_url });
    } else {
      // Local file upload fallback
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
      
      return NextResponse.json({ url: publicUrl });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}