# Categories Backend API Documentation

## Overview

Backend complet pentru modulul Categories cu CRUD operations, validări și protecție acces.

**Status:** ✅ Production Ready

---

## Database Model

### Prisma Schema

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  color     String?   @default("#3B82F6")
  icon      String?   @default("📦")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  products Product[]

  @@map("categories")
}
```

### Fields Description

- **id**: Unique identifier (CUID)
- **name**: Category name (unique, required)
- **slug**: URL-friendly identifier (unique, required)
- **color**: Hex color code (optional, default: #3B82F6)
- **icon**: Emoji icon (optional, default: 📦)
- **createdAt**: Creation timestamp
- **updatedAt**: Last update timestamp
- **products**: Relation to Product model

---

## API Endpoints

### Base URL
```
/api/admin/categories
```

### Authentication
All endpoints require:
- ✅ Valid session token
- ✅ User role: `ADMIN`

Returns `401 Unauthorized` if not authenticated or not ADMIN.

---

## 1. GET /api/admin/categories

Get all categories ordered alphabetically.

### Request
```http
GET /api/admin/categories
Cookie: next-auth.session-token=YOUR_TOKEN
```

### Response: 200 OK
```json
[
  {
    "id": "clxxx123",
    "name": "Business Cards",
    "slug": "business-cards",
    "color": "#3B82F6",
    "icon": "📇",
    "createdAt": "2026-01-04T10:00:00.000Z",
    "updatedAt": "2026-01-04T10:00:00.000Z",
    "_count": {
      "products": 5
    }
  },
  {
    "id": "clxxx456",
    "name": "Flyers",
    "slug": "flyers",
    "color": "#10B981",
    "icon": "📄",
    "createdAt": "2026-01-04T11:00:00.000Z",
    "updatedAt": "2026-01-04T11:00:00.000Z",
    "_count": {
      "products": 12
    }
  }
]
```

### Features
- ✅ Alphabetical ordering by name
- ✅ Includes product count per category
- ✅ Returns empty array if no categories

### Error Responses
- `401 Unauthorized`: Not authenticated or not ADMIN
- `500 Internal Server Error`: Database error

---

## 2. POST /api/admin/categories

Create a new category.

### Request
```http
POST /api/admin/categories
Content-Type: application/json
Cookie: next-auth.session-token=YOUR_TOKEN

{
  "name": "Business Cards",
  "slug": "business-cards",
  "color": "#3B82F6",
  "icon": "📇"
}
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ Yes | Category name (unique) |
| slug | string | ❌ No | URL slug (auto-generated if not provided) |
| color | string | ❌ No | Hex color (default: #3B82F6) |
| icon | string | ❌ No | Emoji icon (default: 📦) |

### Response: 201 Created
```json
{
  "id": "clxxx123",
  "name": "Business Cards",
  "slug": "business-cards",
  "color": "#3B82F6",
  "icon": "📇",
  "createdAt": "2026-01-04T10:00:00.000Z",
  "updatedAt": "2026-01-04T10:00:00.000Z",
  "_count": {
    "products": 0
  }
}
```

### Validations
- ✅ `name` is required
- ✅ `name` must be unique
- ✅ `slug` must be unique (if provided)
- ✅ Auto-generates slug from name if not provided
- ✅ Sets default color and icon if not provided

### Slug Auto-Generation
```javascript
// Input: "Business Cards & More"
// Output: "business-cards-more"

slug = name.toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]/g, '');
```

### Error Responses
- `400 Bad Request`: Missing name
  ```json
  { "error": "Name is required" }
  ```
- `400 Bad Request`: Duplicate name
  ```json
  { "error": "Category name already exists" }
  ```
- `400 Bad Request`: Duplicate slug
  ```json
  { "error": "Category slug already exists" }
  ```
- `401 Unauthorized`: Not authenticated or not ADMIN
- `500 Internal Server Error`: Database error

---

## 3. GET /api/admin/categories/:id

Get a single category by ID.

### Request
```http
GET /api/admin/categories/clxxx123
Cookie: next-auth.session-token=YOUR_TOKEN
```

### Response: 200 OK
```json
{
  "id": "clxxx123",
  "name": "Business Cards",
  "slug": "business-cards",
  "color": "#3B82F6",
  "icon": "📇",
  "createdAt": "2026-01-04T10:00:00.000Z",
  "updatedAt": "2026-01-04T10:00:00.000Z",
  "_count": {
    "products": 5
  }
}
```

### Error Responses
- `404 Not Found`: Category doesn't exist
  ```json
  { "error": "Category not found" }
  ```
- `401 Unauthorized`: Not authenticated or not ADMIN
- `500 Internal Server Error`: Database error

---

## 4. PATCH /api/admin/categories/:id

Update an existing category.

### Request
```http
PATCH /api/admin/categories/clxxx123
Content-Type: application/json
Cookie: next-auth.session-token=YOUR_TOKEN

{
  "name": "Premium Business Cards",
  "color": "#8B5CF6"
}
```

### Request Body (all optional)

| Field | Type | Description |
|-------|------|-------------|
| name | string | New category name |
| slug | string | New URL slug |
| color | string | New hex color |
| icon | string | New emoji icon |

### Response: 200 OK
```json
{
  "id": "clxxx123",
  "name": "Premium Business Cards",
  "slug": "business-cards",
  "color": "#8B5CF6",
  "icon": "📇",
  "createdAt": "2026-01-04T10:00:00.000Z",
  "updatedAt": "2026-01-04T12:00:00.000Z",
  "_count": {
    "products": 5
  }
}
```

### Validations
- ✅ Partial updates supported (send only changed fields)
- ✅ `name` must be unique (if changed)
- ✅ `slug` must be unique (if changed)
- ✅ Validates against other categories (excluding current)
- ✅ Allows null values for color and icon

### Error Responses
- `404 Not Found`: Category doesn't exist
  ```json
  { "error": "Category not found" }
  ```
- `400 Bad Request`: Duplicate name
  ```json
  { "error": "Category name already exists" }
  ```
- `400 Bad Request`: Duplicate slug
  ```json
  { "error": "Category slug already exists" }
  ```
- `401 Unauthorized`: Not authenticated or not ADMIN
- `500 Internal Server Error`: Database error

---

## 5. DELETE /api/admin/categories/:id

Delete a category.

### Request
```http
DELETE /api/admin/categories/clxxx123
Cookie: next-auth.session-token=YOUR_TOKEN
```

### Response: 200 OK
```json
{
  "message": "Category deleted successfully"
}
```

### Business Rules
- ❌ **Cannot delete category with associated products**
- ✅ Must reassign or delete products first
- ✅ Checks product count before deletion

### Error Responses
- `404 Not Found`: Category doesn't exist
  ```json
  { "error": "Category not found" }
  ```
- `400 Bad Request`: Has associated products
  ```json
  { 
    "error": "Cannot delete category. It has 5 associated products. Please reassign or delete the products first." 
  }
  ```
- `401 Unauthorized`: Not authenticated or not ADMIN
- `500 Internal Server Error`: Database error

---

## Security

### Authentication
```typescript
const session = await getServerSession(authOptions);

if (!session || session.user.role !== Role.ADMIN) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Access Control
- ✅ All endpoints require authentication
- ✅ Only `ADMIN` role can access
- ✅ Session validated on every request
- ✅ Returns 401 for unauthorized access

### Role Hierarchy
| Role | Access |
|------|--------|
| ADMIN | ✅ Full access |
| MANAGER | ❌ No access |
| OPERATOR | ❌ No access |
| CLIENT | ❌ No access |

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication/authorization error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Logging
```typescript
console.error('Error fetching categories:', error);
```

All errors are logged to console for debugging.

---

## Database Relations

### Category ↔ Product

```prisma
Category {
  products Product[] // One-to-Many
}

Product {
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId String?
}
```

### Cascade Rules
- ❌ **No automatic cascade delete**
- ✅ Explicit check before deletion
- ✅ Prevents orphaned products

---

## Testing

See [TESTING.md](./TESTING.md) for complete test suite.

### Quick Test
```bash
# 1. Get all categories
curl http://localhost:3000/api/admin/categories \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 2. Create category
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"name":"Test Category"}'

# 3. Update category
curl -X PATCH http://localhost:3000/api/admin/categories/CATEGORY_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"color":"#FF0000"}'

# 4. Delete category
curl -X DELETE http://localhost:3000/api/admin/categories/CATEGORY_ID \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Implementation Files

```
src/app/api/admin/categories/
├── route.ts              # GET, POST
├── [id]/
│   └── route.ts         # GET, PATCH, DELETE
├── TESTING.md           # Test suite documentation
└── README.md            # This file
```

---

## Next Steps

### Integration with Frontend
1. Update Categories page to use API
2. Add loading states
3. Add error handling
4. Add success notifications

### Future Enhancements
- [ ] Bulk operations (delete multiple)
- [ ] Category ordering/sorting
- [ ] Category parent/child hierarchy
- [ ] Category image upload
- [ ] Search and filters
- [ ] Pagination for large datasets
- [ ] Export to CSV/Excel

---

## Summary

✅ **Complete CRUD operations**  
✅ **Input validation**  
✅ **Unique constraints**  
✅ **Business logic (no delete with products)**  
✅ **Access control (ADMIN only)**  
✅ **Error handling**  
✅ **Alphabetical ordering**  
✅ **Product count included**  
✅ **Auto slug generation**  

**Status: Production Ready** 🚀
