import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

/**
 * Image Upload API
 * 
 * Current: Local file storage in /public/uploads/products/
 * Future: Migrate to Vercel Blob Storage for production
 * 
 * @see docs/IMAGE_UPLOAD.md for migration guide
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Local file upload
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
    console.log(`[Upload] File saved: ${publicUrl}`);
    
    return NextResponse.json({ 
      url: publicUrl,
      size: buffer.length,
      type: file.type,
      name: fileName
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}