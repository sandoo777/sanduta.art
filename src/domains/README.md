# Domain-Driven Structure

Această structură organizează logica de business pe domenii independente.

## 📁 Structura Domeniilor

```
src/domains/
├── user/           # Domeniul utilizatorilor
├── admin/          # Domeniul administrare
├── manager/        # Domeniul management
├── orders/         # Domeniul comenzi
├── products/       # Domeniul produse
└── catalog/        # Domeniul catalog public
```

## 🏗️ Structură per Domeniu

Fiecare domeniu conține:

```
domain/
├── services/       # Logică business (orchestration)
├── repositories/   # Data access layer (CRUD operations)
├── types/          # TypeScript types & interfaces
├── hooks/          # React hooks pentru UI
└── utils/          # Helper functions specifice domeniului
```

## 📋 Principii

1. **Separare logică/UI**: Business logic în services, UI logic în hooks
2. **Independență**: Fiecare domeniu este autonom
3. **Reutilizare**: Serviciile pot fi folosite din API routes sau components
4. **Type Safety**: Types centralizate per domeniu

## 🔄 Data Flow

```
UI Component → Hook → Service → Repository → Database
     ↓                              ↓
   State                         Prisma
```

## 📚 Documentație Detaliată

Vezi:
- `domains/user/README.md`
- `domains/orders/README.md`
- `domains/products/README.md`
- etc.
