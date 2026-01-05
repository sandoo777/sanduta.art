#!/usr/bin/env python3
import re
import os

files = [
    "src/app/api/account/orders/[orderId]/route.ts",
    "src/app/api/account/orders/[orderId]/details/route.ts",
    "src/app/api/account/addresses/[addressId]/route.ts",
    "src/app/api/account/files/[fileId]/reuse/route.ts",
    "src/app/api/account/files/[fileId]/route.ts",
    "src/app/api/account/security/sessions/[sessionId]/route.ts",
    "src/app/api/account/notifications/[notificationId]/route.ts",
    "src/app/api/account/notifications/[notificationId]/archive/route.ts",
    "src/app/api/account/projects/[projectId]/route.ts",
    "src/app/api/account/projects/[projectId]/duplicate/route.ts",
    "src/app/api/account/projects/[projectId]/move/route.ts",
    "src/app/api/account/projects/folders/[folderId]/route.ts",
    "src/app/api/delivery/novaposhta/track/[trackingNumber]/route.ts",
    "src/app/api/orders/[id]/route.ts",
    "src/app/api/editor/projects/[id]/route.ts",
    "src/app/api/admin/variants/[id]/route.ts",
    "src/app/api/admin/categories/[id]/route.ts",
    "src/app/api/admin/materials/[id]/consume/route.ts",
    "src/app/api/admin/materials/[id]/route.ts",
    "src/app/api/admin/orders/[id]/items/route.ts",
    "src/app/api/admin/orders/[id]/items/[itemId]/route.ts",
    "src/app/api/admin/orders/[id]/route.ts",
    "src/app/api/admin/orders/[id]/files/[fileId]/route.ts",
    "src/app/api/admin/orders/[id]/files/route.ts",
    "src/app/api/admin/users/[id]/route.ts",
    "src/app/api/admin/customers/[id]/tags/[tagId]/route.ts",
    "src/app/api/admin/customers/[id]/tags/route.ts",
    "src/app/api/admin/customers/[id]/route.ts",
    "src/app/api/admin/customers/[id]/notes/route.ts",
    "src/app/api/admin/customers/[id]/notes/[noteId]/route.ts",
    "src/app/api/admin/products/[id]/images/route.ts",
    "src/app/api/admin/products/[id]/images/[imageId]/route.ts",
    "src/app/api/admin/products/[id]/route.ts",
    "src/app/api/admin/products/[id]/variants/route.ts",
    "src/app/api/admin/products/[id]/variants/[variantId]/route.ts",
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} - not found")
        continue
    
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern 1: Simple { params }: { params: { id: string } }
    # Replace with { params }: { params: Promise<{ id: string }> } and add await
    
    # Find all function declarations with params
    pattern = r'(export async function (GET|POST|PUT|PATCH|DELETE)\(\s*request: (?:Request|NextRequest),\s*){ params }: { params: ({ [^}]+ })\s*}'
    
    def replace_func(match):
        prefix = match.group(1)
        method = match.group(2)
        params_type = match.group(3)
        return f"{prefix}{{ params }}: {{ params: Promise<{params_type}> }}"
    
    new_content = re.sub(pattern, replace_func, content)
    
    # Now add await params destructuring after the function opening brace
    # Find first { after function declaration and add const ... = await params;
    
    # Extract param names from type
    param_names = re.findall(r'(\w+):\s*string', content)
    
    if param_names and new_content != content:
        # Find the position after try { or function body opening
        for param_name in set(param_names):
            # Replace params.paramName with paramName throughout
            new_content = re.sub(rf'params\.{param_name}\b', param_name, new_content)
        
        # Add destructuring at the beginning of function
        if 'const {' not in new_content.split('export async function')[1].split('\n')[2]:
            # Insert after the function declaration line and before try block
            parts = new_content.split(') {\n', 1)
            if len(parts) == 2:
                param_destructure = ', '.join(set(param_names))
                indent = '  '
                if parts[1].strip().startswith('try'):
                    indent = '    '
                new_content = parts[0] + ') {\n' + f'  const {{ {param_destructure} }} = await params;\n' + parts[1]
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"✓ Updated {filepath}")
    else:
        print(f"- No changes needed for {filepath}")

print("\nDone!")
