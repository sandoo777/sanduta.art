# 🎨 User Preferences System - Documentație Completă

## 📋 Cuprins

1. [Prezentare Generală](#prezentare-generală)
2. [Arhitectură](#arhitectură)
3. [Sistem i18n](#sistem-i18n)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Componente UI](#componente-ui)
7. [State Management](#state-management)
8. [Integrare](#integrare)
9. [Testare](#testare)
10. [Best Practices](#best-practices)

---

## 🎯 Prezentare Generală

Sistemul complet de preferințe ale utilizatorului oferă control granular asupra experienței în platformă, cu suport pentru **3 limbi** (RO/EN/RU) și salvare automată a setărilor.

### ✨ Caracteristici Principale

- **Multi-limbă**: Română, Engleză, Rusă
- **Teme**: Light, Dark, System
- **Notificări**: Email, Push, In-App
- **Editor**: Grid, unități, auto-save, UI density
- **Configurator**: Setări implicite pentru comenzi
- **Comunicări**: Newsletter, oferte, recomandări

---

## 🏗️ Arhitectură

```
┌─────────────────────────────────────────────────────────┐
│                    User Preferences                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Database   │  │     API      │  │      UI      │  │
│  │   (Prisma)   │◄─┤   (Routes)   │◄─┤ (Components) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ▲                                     ▲          │
│         │                                     │          │
│         └─────────────┬───────────────────────┘          │
│                       │                                   │
│              ┌────────▼────────┐                         │
│              │  usePreferences │                         │
│              │      Hook       │                         │
│              └─────────────────┘                         │
│                       ▲                                   │
│                       │                                   │
│              ┌────────▼────────┐                         │
│              │   i18n System   │                         │
│              │   (Zustand)     │                         │
│              └─────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow

1. **User Action** → Component receives user interaction
2. **Update Function** → usePreferences hook sends PATCH request
3. **API Route** → Validates and saves to database
4. **Response** → UI updates instantly with new preferences
5. **i18n Sync** → Language changes trigger full UI re-render

---

## 🌐 Sistem i18n

### Structură

```
src/modules/i18n/
├── index.ts              # Exports
├── i18n.ts               # Core i18n logic
└── languages/
    ├── ro.json           # Traduceri Română
    ├── en.json           # Traduceri Engleză
    └── ru.json           # Traduceri Rusă
```

### Utilizare

```typescript
import { useTranslations, useI18n } from "@/modules/i18n";

// În componente
function MyComponent() {
  const { t } = useTranslations();
  const { language, setLanguage } = useI18n();

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <button onClick={() => setLanguage("EN")}>
        Switch to English
      </button>
    </div>
  );
}
```

### Features

- ✅ **Auto-detect browser language** pe prima vizită
- ✅ **Persist în localStorage** pentru vizitatori anonimi
- ✅ **Sync cu database** pentru utilizatori autentificați
- ✅ **Fallback la română** dacă traducerea lipsește
- ✅ **Hot reload** la schimbarea limbii

### Structură Traduceri

```json
{
  "common": {
    "save": "Salvează",
    "cancel": "Anulează",
    "loading": "Se încarcă..."
  },
  "dashboard": {
    "title": "Tablou de bord",
    "projects": "Proiecte"
  },
  "preferences": {
    "title": "Preferințele mele",
    "language": {
      "title": "Limbă",
      "ro": "Română"
    }
  }
}
```

---

## 🗄️ Database Schema

### UserPreferences Model

```prisma
model UserPreferences {
  id        String   @id @default(cuid())
  userId    String   @unique
  
  // Language & Theme
  language  Language @default(RO)
  theme     Theme    @default(SYSTEM)
  
  // Notifications
  emailOrders        Boolean @default(true)
  emailProjects      Boolean @default(true)
  emailFiles         Boolean @default(true)
  emailPromotions    Boolean @default(false)
  pushNotifications  Boolean @default(true)
  inAppNotifications Boolean @default(true)
  
  // Editor Preferences
  editorSnapToGrid    Boolean    @default(true)
  editorGridVisible   Boolean    @default(true)
  editorGridSize      Int        @default(10)
  editorUnit          EditorUnit @default(PX)
  editorAutoSave      Int        @default(10)
  editorUIDensity     UIDensity  @default(STANDARD)
  
  // Configurator Preferences
  configDefaultQuantity       Int    @default(1)
  configDefaultProductionTime String @default("standard")
  configDefaultDelivery       String @default("courier")
  configDefaultPayment        String @default("card")
  
  // Communications & Marketing
  newsletter              Boolean @default(false)
  specialOffers           Boolean @default(false)
  personalizedRecommend   Boolean @default(false)
  productNews             Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Enums

```prisma
enum Language {
  RO
  EN
  RU
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

enum EditorUnit {
  PX
  MM
  CM
}

enum UIDensity {
  COMPACT
  STANDARD
  SPACIOUS
}
```

---

## 🔌 API Routes

### GET /api/account/preferences

**Descriere**: Obține preferințele utilizatorului. Creează automat preferințe cu valori default dacă nu există.

**Auth**: Required ✅

**Response**:
```json
{
  "id": "clx123...",
  "userId": "clx456...",
  "language": "RO",
  "theme": "SYSTEM",
  "emailOrders": true,
  "emailProjects": true,
  "editorSnapToGrid": true,
  "editorGridSize": 10,
  "configDefaultQuantity": 1,
  "newsletter": false,
  "createdAt": "2024-01-05T10:00:00.000Z",
  "updatedAt": "2024-01-05T10:00:00.000Z"
}
```

### PATCH /api/account/preferences

**Descriere**: Actualizează preferințele utilizatorului (partial update).

**Auth**: Required ✅

**Body**:
```json
{
  "language": "EN",
  "theme": "DARK",
  "emailOrders": false,
  "editorGridSize": 20
}
```

**Response**: Obiectul UserPreferences actualizat

**Validări**:
- `language` must be one of: RO, EN, RU
- `theme` must be one of: LIGHT, DARK, SYSTEM
- `editorUnit` must be one of: PX, MM, CM
- `editorUIDensity` must be one of: COMPACT, STANDARD, SPACIOUS

---

## 🎨 Componente UI

### 1. LanguageSettings

**Path**: `src/components/account/preferences/LanguageSettings.tsx`

**Features**:
- Radio buttons pentru fiecare limbă
- Flag icons pentru identificare vizuală
- Label nativ (Română, English, Русский)
- Auto-save la selecție
- Actualizare instant a UI-ului

**Props**: None (folosește usePreferences hook)

### 2. ThemeSettings

**Path**: `src/components/account/preferences/ThemeSettings.tsx`

**Features**:
- 3 carduri pentru Light/Dark/System
- Iconuri intuitive (Sun, Moon, Monitor)
- Descrieri clare pentru fiecare temă
- Aplicare instant cu smooth transition
- Checkmark pentru tema activă

### 3. NotificationSettings

**Path**: `src/components/account/preferences/NotificationSettings.tsx`

**Features**:
- Toggle switches moderne
- Grupare pe categorii (Email, Push, In-App)
- Descrieri pentru fiecare opțiune
- Auto-save la toggle
- Loading state

### 4. EditorPreferences

**Path**: `src/components/account/preferences/EditorPreferences.tsx`

**Features**:
- Grid settings (snap, visibility, size)
- Unități de măsură (PX/MM/CM)
- Auto-save interval (5/10/30 sec)
- UI Density (Compact/Standard/Spacious)
- Input numeric pentru grid size

### 5. ConfiguratorPreferences

**Path**: `src/components/account/preferences/ConfiguratorPreferences.tsx`

**Features**:
- Cantitate default (input numeric)
- Timp producție (Standard/Express)
- Metodă livrare (Courier/Pickup)
- Metodă plată (Card/Cash/Transfer)
- Button groups pentru opțiuni

### 6. CommunicationSettings

**Path**: `src/components/account/preferences/CommunicationSettings.tsx`

**Features**:
- Toggle pentru newsletter
- Toggle pentru oferte speciale
- Toggle pentru recomandări personalizate
- Toggle pentru noutăți produse
- Descrieri clare pentru fiecare opțiune

### 7. LanguageSwitcher

**Path**: `src/components/common/LanguageSwitcher.tsx`

**Features**:
- 2 variante: `default` și `compact`
- Dropdown cu toate limbile
- Flag icons
- Click outside to close
- Sync cu backend pentru useri autentificați
- Fallback la localStorage pentru anonimi

**Props**:
```typescript
interface LanguageSwitcherProps {
  variant?: "default" | "compact";
}
```

**Usage**:
```tsx
// În header public
<LanguageSwitcher variant="compact" />

// În dashboard
<LanguageSwitcher />
```

---

## 🪝 State Management

### usePreferences Hook

**Path**: `src/modules/account/usePreferences.ts`

**Interface**:
```typescript
interface UsePreferencesReturn {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
  updateNotificationPreferences: (data: Partial<Notifications>) => Promise<void>;
  updateEditorPreferences: (data: Partial<Editor>) => Promise<void>;
  updateConfiguratorPreferences: (data: Partial<Configurator>) => Promise<void>;
  updateCommunicationPreferences: (data: Partial<Communication>) => Promise<void>;
}
```

**Usage Example**:
```typescript
function MyComponent() {
  const {
    preferences,
    loading,
    error,
    updateLanguage,
    updateTheme
  } = usePreferences();

  const handleLanguageChange = async (lang: Language) => {
    try {
      await updateLanguage(lang);
      // UI se actualizează automat
    } catch (error) {
      console.error("Failed to update language:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Current language: {preferences?.language}</p>
      <button onClick={() => handleLanguageChange("EN")}>
        Switch to English
      </button>
    </div>
  );
}
```

**Features**:
- ✅ Auto-fetch la mount
- ✅ Loading & error states
- ✅ Optimistic UI updates
- ✅ Error handling cu rollback
- ✅ Type-safe cu TypeScript
- ✅ Sync cu i18n store pentru limbă
- ✅ Aplicare instant pentru temă

---

## 🔗 Integrare

### Header Public

**File**: `src/components/public/Header.tsx`

```tsx
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function Header() {
  return (
    <header>
      <div className="flex items-center space-x-4">
        <LanguageSwitcher variant="compact" />
        {/* ...alte componente */}
      </div>
    </header>
  );
}
```

### Dashboard Sidebar

**File**: `src/components/account/AccountSidebar.tsx`

```tsx
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

const navItems = [
  // ...alte items
  {
    label: "Preferințe",
    href: "/dashboard/preferences",
    icon: AdjustmentsHorizontalIcon,
  },
];

function SidebarContent() {
  return (
    <>
      <nav>{/* nav items */}</nav>
      
      <div className="px-3 py-4 border-t border-gray-200">
        <LanguageSwitcher />
      </div>
      
      <div className="px-3 py-6 border-t border-gray-200">
        {/* logout button */}
      </div>
    </>
  );
}
```

### În Editor sau Alte Module

```tsx
import { usePreferences } from "@/modules/account/usePreferences";
import { useTranslations } from "@/modules/i18n";

function EditorCanvas() {
  const { preferences } = usePreferences();
  const { t } = useTranslations();

  // Aplică preferințele editorului
  useEffect(() => {
    if (preferences) {
      // Configurează grid
      setGridSize(preferences.editorGridSize);
      setGridVisible(preferences.editorGridVisible);
      setSnapToGrid(preferences.editorSnapToGrid);
      
      // Configurează auto-save
      setAutoSaveInterval(preferences.editorAutoSave * 1000);
      
      // Configurează unități
      setUnit(preferences.editorUnit);
    }
  }, [preferences]);

  return (
    <div>
      <h1>{t("editor.title")}</h1>
      {/* canvas */}
    </div>
  );
}
```

---

## 🧪 Testare

### Manual Testing Checklist

#### Test 1: Schimbare Limbă
- [ ] Deschide `/dashboard/preferences`
- [ ] Selectează limba Engleză
- [ ] Verifică că UI se actualizează instant
- [ ] Refresh pagina
- [ ] Verifică că limba rămâne Engleză
- [ ] Repetă pentru Rusă și Română

#### Test 2: Schimbare Temă
- [ ] Selectează tema "Light"
- [ ] Verifică background alb
- [ ] Selectează tema "Dark"
- [ ] Verifică background întunecat
- [ ] Selectează tema "System"
- [ ] Verifică că se adaptează la sistem

#### Test 3: Notificări
- [ ] Toggle fiecare opțiune de notificare
- [ ] Refresh pagina
- [ ] Verifică că setările persistă

#### Test 4: Editor Preferences
- [ ] Modifică grid size la 20
- [ ] Toggle snap to grid
- [ ] Schimbă unitatea la MM
- [ ] Schimbă auto-save la 30 sec
- [ ] Deschide editorul
- [ ] Verifică că setările sunt aplicate

#### Test 5: Responsive Design
- [ ] Testează pe desktop (1920x1080)
- [ ] Testează pe tablet (768px)
- [ ] Testează pe mobil (375px)
- [ ] Verifică că layout-ul se adaptează corect

#### Test 6: Language Switcher
- [ ] Click pe language switcher în header
- [ ] Verifică dropdown-ul se deschide
- [ ] Selectează o limbă diferită
- [ ] Verifică că se închide dropdown-ul
- [ ] Verifică că limba s-a schimbat

### Automated Testing Script

```bash
# Rulează scriptul de testare
./scripts/test-preferences.sh
```

**Note**: Trebuie să setezi `YOUR_SESSION_TOKEN` în script cu un token valid de sesiune.

---

## ✅ Best Practices

### 1. Auto-Save

Toate preferințele se salvează automat la schimbare. **NU** este nevoie de buton "Save".

```tsx
// ✅ CORECT
const handleChange = async (value) => {
  await updatePreference(value);
  // Auto-saved
};

// ❌ GREȘIT
const [pendingChanges, setPendingChanges] = useState({});

const handleChange = (value) => {
  setPendingChanges({ ...pendingChanges, value });
};

const handleSave = async () => {
  await updatePreference(pendingChanges);
};
```

### 2. Loading States

Arată loading state în timpul salvării pentru feedback vizual.

```tsx
const [saving, setSaving] = useState(false);

const handleUpdate = async (value) => {
  setSaving(true);
  try {
    await updatePreference(value);
  } finally {
    setSaving(false);
  }
};
```

### 3. Error Handling

Gestionează erorile elegant și oferă feedback.

```tsx
const handleUpdate = async (value) => {
  try {
    await updatePreference(value);
    toast.success("Preferințe salvate");
  } catch (error) {
    toast.error("Eroare la salvare");
    console.error(error);
  }
};
```

### 4. Type Safety

Folosește TypeScript pentru type safety.

```tsx
// ✅ CORECT
type Language = "RO" | "EN" | "RU";
const updateLanguage = async (lang: Language) => {
  // Type-safe
};

// ❌ GREȘIT
const updateLanguage = async (lang: string) => {
  // Nu este type-safe
};
```

### 5. i18n Keys

Folosește chei consistente pentru traduceri.

```tsx
// ✅ CORECT
t("preferences.language.title")
t("preferences.theme.dark")
t("common.save")

// ❌ GREȘIT
t("Limbă")
t("dark")
t("Save button")
```

### 6. Component Isolation

Fiecare secțiune de preferințe ar trebui să fie un component separat.

```tsx
// ✅ CORECT
<LanguageSettings />
<ThemeSettings />
<NotificationSettings />

// ❌ GREȘIT
function PreferencesPage() {
  return (
    <div>
      {/* Toate preferințele într-un singur component */}
    </div>
  );
}
```

### 7. Responsive Design

Folosește grid responsive pentru layout.

```tsx
// ✅ CORECT
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <div>{/* Coloana 1 */}</div>
  <div>{/* Coloana 2 */}</div>
</div>

// ❌ GREȘIT
<div className="flex">
  <div className="w-1/2">{/* Nu e responsive */}</div>
  <div className="w-1/2">{/* Nu e responsive */}</div>
</div>
```

---

## 📚 Resurse Adiționale

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js i18n](https://nextjs.org/docs/advanced-features/i18n-routing)
- [Zustand State Management](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎉 Concluzie

Sistemul de preferințe oferă o experiență completă și personalizabilă pentru utilizatori, cu:

- ✅ **3 limbi** suportate (RO/EN/RU)
- ✅ **Auto-save** pentru toate setările
- ✅ **Type-safe** cu TypeScript
- ✅ **Responsive design** pe toate device-urile
- ✅ **Smooth transitions** pentru schimbări
- ✅ **Error handling** robust
- ✅ **Loading states** pentru feedback vizual

**Pagină**: `/dashboard/preferences`

**Status**: ✅ Production Ready
