/**
 * Prisma Schema Extensions pentru I18n
 * 
 * Acest fișier conține extensiile necesare pentru schema.prisma
 * pentru a adăuga suport multilingv.
 * 
 * INSTRUCȚIUNI:
 * 1. Adaugă aceste câmpuri în modelele specificate din schema.prisma
 * 2. Rulează: npx prisma migrate dev --name add_i18n_support
 * 3. Regenerează clientul: npx prisma generate
 */

// ============================================
// Product Model - Adaugă traduceri
// ============================================
/*
model Product {
  // ... câmpuri existente ...
  
  // Traduceri multilingve (JSON)
  translations Json? @default("{}")
  // Structură:
  // {
  //   "ro": { "name": "...", "description": "...", "descriptionShort": "..." },
  //   "en": { "name": "...", "description": "...", "descriptionShort": "..." },
  //   "ru": { "name": "...", "description": "...", "descriptionShort": "..." }
  // }
}
*/

// ============================================
// Category Model - Adaugă traduceri
// ============================================
/*
model Category {
  // ... câmpuri existente ...
  
  // Traduceri multilingve (JSON)
  translations Json? @default("{}")
  // Structură:
  // {
  //   "ro": { "name": "...", "description": "..." },
  //   "en": { "name": "...", "description": "..." },
  //   "ru": { "name": "...", "description": "..." }
  // }
}
*/

// ============================================
// Page Model (CMS) - Adaugă traduceri
// ============================================
/*
model Page {
  // ... câmpuri existente ...
  
  // Traduceri multilingve (JSON)
  translations Json? @default("{}")
  // Structură:
  // {
  //   "ro": { "title": "...", "slug": "...", "content": "...", "excerpt": "..." },
  //   "en": { "title": "...", "slug": "...", "content": "...", "excerpt": "..." },
  //   "ru": { "title": "...", "slug": "...", "content": "...", "excerpt": "..." }
  // }
}
*/

// ============================================
// BlogPost Model - Adaugă traduceri
// ============================================
/*
model BlogPost {
  // ... câmpuri existente ...
  
  // Traduceri multilingve (JSON)
  translations Json? @default("{}")
  // Structură:
  // {
  //   "ro": { "title": "...", "slug": "...", "content": "...", "excerpt": "..." },
  //   "en": { "title": "...", "slug": "...", "content": "...", "excerpt": "..." },
  //   "ru": { "title": "...", "slug": "...", "content": "...", "excerpt": "..." }
  // }
}
*/

// ============================================
// Material Model - Adaugă traduceri
// ============================================
/*
model Material {
  // ... câmpuri existente ...
  
  // Traduceri multilingve (JSON)
  translations Json? @default("{}")
  // Structură:
  // {
  //   "ro": { "name": "...", "description": "..." },
  //   "en": { "name": "...", "description": "..." },
  //   "ru": { "name": "...", "description": "..." }
  // }
}
*/

// ============================================
// EmailTemplate Model - Adaugă traduceri
// ============================================
/*
model EmailTemplate {
  id        String   @id @default(cuid())
  type      String   @unique // 'order_confirmation', 'shipping_notification', etc.
  
  // Traduceri multilingve (JSON)
  translations Json @default("{}")
  // Structură:
  // {
  //   "ro": { "subject": "...", "body": "...", "preheader": "..." },
  //   "en": { "subject": "...", "body": "...", "preheader": "..." },
  //   "ru": { "subject": "...", "body": "...", "preheader": "..." }
  // }
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("email_templates")
}
*/

// ============================================
// Translation Model - Sistem de traduceri
// ============================================
/*
model Translation {
  id        String   @id @default(cuid())
  key       String   @unique // ex: 'common.loading', 'product.addToCart'
  
  // Traduceri per limbă
  ro        String?
  en        String?
  ru        String?
  
  // Metadate
  category  String?  // ex: 'common', 'product', 'cart', 'admin'
  version   Int      @default(1)
  published Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([key])
  @@index([category])
  @@map("translations")
}
*/

/**
 * HELPERS pentru a lucra cu traduceri în TypeScript
 */

// Type pentru Product cu traduceri
export interface ProductWithTranslations {
  id: string;
  name: string;
  translations: {
    ro?: {
      name: string;
      description?: string;
      descriptionShort?: string;
    };
    en?: {
      name: string;
      description?: string;
      descriptionShort?: string;
    };
    ru?: {
      name: string;
      description?: string;
      descriptionShort?: string;
    };
  };
}

// Type pentru Category cu traduceri
export interface CategoryWithTranslations {
  id: string;
  name: string;
  translations: {
    ro?: { name: string; description?: string };
    en?: { name: string; description?: string };
    ru?: { name: string; description?: string };
  };
}

// Type pentru Page cu traduceri
export interface PageWithTranslations {
  id: string;
  translations: {
    ro?: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
    };
    en?: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
    };
    ru?: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
    };
  };
}
