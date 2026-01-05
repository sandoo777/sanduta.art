#!/bin/bash

# Fix Next.js 15+ async params in route handlers

files=(
  "src/app/api/account/orders/[orderId]/route.ts"
  "src/app/api/account/orders/[orderId]/details/route.ts"
  "src/app/api/account/addresses/[addressId]/route.ts"
  "src/app/api/account/addresses/[addressId]/default/route.ts"
  "src/app/api/account/files/[fileId]/reuse/route.ts"
  "src/app/api/account/files/[fileId]/route.ts"
  "src/app/api/account/security/sessions/[sessionId]/route.ts"
  "src/app/api/account/notifications/[notificationId]/route.ts"
  "src/app/api/account/notifications/[notificationId]/archive/route.ts"
  "src/app/api/account/projects/[projectId]/route.ts"
  "src/app/api/account/projects/[projectId]/duplicate/route.ts"
  "src/app/api/account/projects/[projectId]/move/route.ts"
  "src/app/api/account/projects/folders/[folderId]/route.ts"
  "src/app/api/delivery/novaposhta/track/[trackingNumber]/route.ts"
  "src/app/api/orders/[id]/route.ts"
  "src/app/api/editor/projects/[id]/route.ts"
  "src/app/api/admin/variants/[id]/route.ts"
  "src/app/api/admin/categories/[id]/route.ts"
  "src/app/api/admin/materials/[id]/consume/route.ts"
  "src/app/api/admin/materials/[id]/route.ts"
  "src/app/api/admin/orders/[id]/items/route.ts"
  "src/app/api/admin/orders/[id]/items/[itemId]/route.ts"
  "src/app/api/admin/orders/[id]/route.ts"
  "src/app/api/admin/orders/[id]/files/[fileId]/route.ts"
  "src/app/api/admin/orders/[id]/files/route.ts"
  "src/app/api/admin/users/[id]/route.ts"
  "src/app/api/admin/customers/[id]/tags/[tagId]/route.ts"
  "src/app/api/admin/customers/[id]/tags/route.ts"
  "src/app/api/admin/customers/[id]/route.ts"
  "src/app/api/admin/customers/[id]/notes/route.ts"
  "src/app/api/admin/customers/[id]/notes/[noteId]/route.ts"
  "src/app/api/admin/products/[id]/images/route.ts"
  "src/app/api/admin/products/[id]/images/[imageId]/route.ts"
  "src/app/api/admin/products/[id]/route.ts"
  "src/app/api/admin/products/[id]/variants/route.ts"
  "src/app/api/admin/products/[id]/variants/[variantId]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Replace { params }: { params: with { params: segmentParams }: { params: Promise<
    sed -i 's/{ params }: { params:/{ params: segmentParams }: { params: Promise</g' "$file"
    
    # Add await params at the beginning of function body
    # This is a simple approach - might need manual adjustment
    sed -i '/segmentParams }: { params: Promise</a\  const params = await segmentParams;' "$file"
  fi
done

echo "Done! Please review the changes."
