# Customers API - Ghid de Testare

Acest document conține scenarii complete de testare pentru modulul Customers API.

## Pregătire pentru Testare

### 1. Autentificare
Obține un token de sesiune autentificându-te ca ADMIN sau MANAGER:

```bash
# Login
curl -X POST "http://localhost:3000/api/auth/callback/credentials" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Salvează cookie-ul din răspuns pentru requests ulterioare
# Exemplu: next-auth.session-token=eyJhbGc...
```

### 2. Variabile de Mediu
Pentru testare mai ușoară, setează variabile:

```bash
export API_URL="http://localhost:3000/api/admin/customers"
export TOKEN="next-auth.session-token=YOUR_TOKEN_HERE"
```

## Scenarii de Testare

### Scenariu 1: CRUD Complet pentru Clienți

#### 1.1. Creare Client
```bash
# Test: Creează un client nou cu toate câmpurile
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "name": "Maria Popescu",
    "email": "maria.popescu@example.com",
    "phone": "+40721234567",
    "company": "SC Test SRL",
    "address": "Str. Testului 123",
    "city": "București",
    "country": "România"
  }'

# Răspuns așteptat: 201 Created
# Salvează ID-ul clientului pentru teste următoare (ex: CUSTOMER_ID=1)
```

#### 1.2. Validare Email Duplicat
```bash
# Test: Încearcă să creezi client cu același email
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "name": "Alt Nume",
    "email": "maria.popescu@example.com"
  }'

# Răspuns așteptat: 409 Conflict
# {"error": "Customer with this email already exists"}
```

#### 1.3. Validare Email Invalid
```bash
# Test: Email fără format valid
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "name": "Test User",
    "email": "invalid-email"
  }'

# Răspuns așteptat: 400 Bad Request
# {"error": "Invalid email format"}
```

#### 1.4. Validare Nume Lipsă
```bash
# Test: Creare fără nume (câmp obligatoriu)
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "email": "test@example.com"
  }'

# Răspuns așteptat: 400 Bad Request
# {"error": "Name is required"}
```

#### 1.5. Citire Client Individual
```bash
# Test: Obține detalii complete client + statistici
export CUSTOMER_ID=1
curl -X GET "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 200 OK cu notes[], tags[], orders[], statistics
```

#### 1.6. Actualizare Client
```bash
# Test: Actualizează câmpuri client
curl -X PATCH "$API_URL/$CUSTOMER_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "company": "SC Updated SRL",
    "city": "Cluj-Napoca",
    "phone": "+40731999888"
  }'

# Răspuns așteptat: 200 OK cu datele actualizate
```

#### 1.7. Ștergere Client (fără comenzi)
```bash
# Test: Șterge client fără comenzi
curl -X DELETE "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 200 OK
# {"message": "Customer deleted successfully"}
```

### Scenariu 2: Protecție la Ștergere (Clienți cu Comenzi)

#### 2.1. Creare Client pentru Test
```bash
# Creează client
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "name": "Ion Ionescu",
    "email": "ion@example.com"
  }'

# Salvează CUSTOMER_ID din răspuns
```

#### 2.2. Creare Comandă pentru Client
```bash
# Creează o comandă legată de acest client
curl -X POST "http://localhost:3000/api/admin/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "customerId": '$CUSTOMER_ID',
    "items": [{"productId": 1, "quantity": 1, "price": 99.99}],
    "total": 99.99,
    "status": "PENDING"
  }'
```

#### 2.3. Încercare Ștergere Client cu Comenzi
```bash
# Test: Încearcă să ștergi client cu comenzi
curl -X DELETE "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 400 Bad Request
# {"error": "Cannot delete customer with existing orders. Customer has 1 order(s)."}
```

### Scenariu 3: Gestionare Note

#### 3.1. Adăugare Notă
```bash
# Test: Adaugă notă pentru client
curl -X POST "$API_URL/$CUSTOMER_ID/notes" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "content": "Client preferă livrare prin curier privat"
  }'

# Răspuns așteptat: 201 Created
# Salvează NOTE_ID din răspuns
```

#### 3.2. Verificare Notă în Detalii Client
```bash
# Test: Verifică că nota apare în GET customer
curl -X GET "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN" | jq '.notes'

# Răspuns așteptat: Array cu nota adăugată
```

#### 3.3. Adăugare Multiplu Note
```bash
# Test: Adaugă mai multe note
for i in {1..3}; do
  curl -X POST "$API_URL/$CUSTOMER_ID/notes" \
    -H "Content-Type: application/json" \
    -H "Cookie: $TOKEN" \
    -d "{\"content\": \"Test note $i\"}"
done

# Verifică ordinea (cea mai nouă primă)
curl -X GET "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN" | jq '.notes[].content'
```

#### 3.4. Ștergere Notă
```bash
# Test: Șterge o notă
export NOTE_ID=1
curl -X DELETE "$API_URL/$CUSTOMER_ID/notes/$NOTE_ID" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 200 OK
# {"message": "Note deleted successfully"}
```

#### 3.5. Validare Notă Lipsă
```bash
# Test: Încearcă să ștergi notă inexistentă
curl -X DELETE "$API_URL/$CUSTOMER_ID/notes/99999" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 404 Not Found
# {"error": "Note not found for this customer"}
```

### Scenariu 4: Gestionare Tag-uri

#### 4.1. Adăugare Tag cu Culoare
```bash
# Test: Adaugă tag VIP cu culoare roșie
curl -X POST "$API_URL/$CUSTOMER_ID/tags" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "label": "VIP",
    "color": "#FF0000"
  }'

# Răspuns așteptat: 201 Created
# Salvează TAG_ID din răspuns
```

#### 4.2. Adăugare Tag fără Culoare (Default)
```bash
# Test: Tag fără culoare (va folosi default #808080)
curl -X POST "$API_URL/$CUSTOMER_ID/tags" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "label": "B2B"
  }'

# Răspuns așteptat: 201 Created cu color="#808080"
```

#### 4.3. Adăugare Multiplu Tag-uri
```bash
# Test: Adaugă mai multe tag-uri cu culori diferite
curl -X POST "$API_URL/$CUSTOMER_ID/tags" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{"label": "Premium", "color": "#FFD700"}'

curl -X POST "$API_URL/$CUSTOMER_ID/tags" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{"label": "Fidel", "color": "#00FF00"}'

# Verifică tag-urile în GET
curl -X GET "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN" | jq '.tags'
```

#### 4.4. Ștergere Tag
```bash
# Test: Șterge un tag
export TAG_ID=1
curl -X DELETE "$API_URL/$CUSTOMER_ID/tags/$TAG_ID" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 200 OK
# {"message": "Tag deleted successfully"}
```

#### 4.5. Validare Tag Fără Label
```bash
# Test: Încearcă să creezi tag fără label
curl -X POST "$API_URL/$CUSTOMER_ID/tags" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "color": "#FF0000"
  }'

# Răspuns așteptat: 400 Bad Request
# {"error": "Label is required"}
```

### Scenariu 5: Statistici Client

#### 5.1. Pregătire Date
```bash
# Creează client
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "name": "Stats Test User",
    "email": "stats@example.com"
  }'

export CUSTOMER_ID=<id_din_raspuns>

# Creează 3 comenzi cu valori diferite
curl -X POST "http://localhost:3000/api/admin/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "customerId": '$CUSTOMER_ID',
    "items": [{"productId": 1, "quantity": 2, "price": 50}],
    "total": 100,
    "status": "COMPLETED"
  }'

curl -X POST "http://localhost:3000/api/admin/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "customerId": '$CUSTOMER_ID',
    "items": [{"productId": 2, "quantity": 1, "price": 150}],
    "total": 150,
    "status": "COMPLETED"
  }'

curl -X POST "http://localhost:3000/api/admin/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "customerId": '$CUSTOMER_ID',
    "items": [{"productId": 3, "quantity": 3, "price": 25}],
    "total": 75,
    "status": "PENDING"
  }'
```

#### 5.2. Verificare Statistici
```bash
# Test: Verifică calculul corect al statisticilor
curl -X GET "$API_URL/$CUSTOMER_ID" \
  -H "Cookie: $TOKEN" | jq '.statistics'

# Răspuns așteptat:
# {
#   "totalOrders": 3,
#   "totalSpent": 325,  // 100 + 150 + 75
#   "lastOrderDate": "2024-01-04T..." // Data ultimei comenzi
# }
```

### Scenariu 6: Căutare și Filtrare

#### 6.1. Căutare după Nume
```bash
# Test: Caută clienți după nume
curl -X GET "$API_URL?search=popescu" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: Clienți cu "popescu" în nume
```

#### 6.2. Căutare după Email
```bash
# Test: Caută clienți după email
curl -X GET "$API_URL?search=@example.com" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: Clienți cu "@example.com" în email
```

#### 6.3. Paginare
```bash
# Test: Obține pagina 1 cu 5 rezultate
curl -X GET "$API_URL?page=1&limit=5" \
  -H "Cookie: $TOKEN"

# Verifică răspunsul paginării:
# pagination: { total: X, page: 1, limit: 5, pages: Y }

# Test: Pagina 2
curl -X GET "$API_URL?page=2&limit=5" \
  -H "Cookie: $TOKEN"
```

#### 6.4. Sortare
```bash
# Test: Sortare după nume (A-Z)
curl -X GET "$API_URL?sortBy=name&sortOrder=asc" \
  -H "Cookie: $TOKEN"

# Test: Sortare după data creării (cel mai nou)
curl -X GET "$API_URL?sortBy=createdAt&sortOrder=desc" \
  -H "Cookie: $TOKEN"

# Test: Sortare după email
curl -X GET "$API_URL?sortBy=email&sortOrder=asc" \
  -H "Cookie: $TOKEN"
```

#### 6.5. Combinație Căutare + Sortare + Paginare
```bash
# Test: Căutare cu toate filtrele
curl -X GET "$API_URL?search=test&sortBy=createdAt&sortOrder=desc&page=1&limit=10" \
  -H "Cookie: $TOKEN"
```

### Scenariu 7: Autorizare și Securitate

#### 7.1. Request fără Autentificare
```bash
# Test: Încearcă request fără token
curl -X GET "$API_URL"

# Răspuns așteptat: 401 Unauthorized
# {"error": "Unauthorized"}
```

#### 7.2. Request cu Rol Insuficient
```bash
# Login ca USER (nu ADMIN/MANAGER)
# Apoi încearcă să accesezi customers API

curl -X GET "$API_URL" \
  -H "Cookie: next-auth.session-token=USER_TOKEN"

# Răspuns așteptat: 401 Unauthorized
```

#### 7.3. Validare Cross-Customer pentru Note/Tag-uri
```bash
# Creează 2 clienți
export CUSTOMER_1=1
export CUSTOMER_2=2

# Creează notă pentru CUSTOMER_1
curl -X POST "$API_URL/$CUSTOMER_1/notes" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{"content": "Test note"}'

export NOTE_ID=<id_din_raspuns>

# Test: Încearcă să ștergi nota lui CUSTOMER_1 prin CUSTOMER_2
curl -X DELETE "$API_URL/$CUSTOMER_2/notes/$NOTE_ID" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 404 Not Found
# {"error": "Note not found for this customer"}
```

### Scenariu 8: Edge Cases

#### 8.1. Client fără Email
```bash
# Test: Creează client doar cu nume (email opțional)
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "name": "No Email Customer"
  }'

# Răspuns așteptat: 201 Created (email este opțional)
```

#### 8.2. Update Email la Duplicat
```bash
# Test: Încearcă să actualizezi email-ul unui client la un email existent
export CUSTOMER_ID=1

curl -X PATCH "$API_URL/$CUSTOMER_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: $TOKEN" \
  -d '{
    "email": "existing@example.com"
  }'

# Răspuns așteptat: 409 Conflict (dacă email-ul există deja)
```

#### 8.3. Client Inexistent
```bash
# Test: Încearcă să accesezi client inexistent
curl -X GET "$API_URL/99999" \
  -H "Cookie: $TOKEN"

# Răspuns așteptat: 404 Not Found
# {"error": "Customer not found"}
```

## Verificare Finală

### Checklist Complet

- [ ] Creare client cu toate câmpurile
- [ ] Creare client doar cu nume (minim)
- [ ] Validare email duplicat (409)
- [ ] Validare email invalid (400)
- [ ] Validare nume lipsă (400)
- [ ] Citire client cu statistici corecte
- [ ] Update client (toate câmpurile)
- [ ] Ștergere client fără comenzi (200)
- [ ] Protecție ștergere cu comenzi (400)
- [ ] Adăugare notă (201)
- [ ] Ștergere notă (200)
- [ ] Validare notă inexistentă (404)
- [ ] Adăugare tag cu culoare (201)
- [ ] Adăugare tag fără culoare (default)
- [ ] Ștergere tag (200)
- [ ] Validare tag fără label (400)
- [ ] Calculul corect al statisticilor (totalOrders, totalSpent, lastOrderDate)
- [ ] Căutare după nume și email
- [ ] Paginare corectă
- [ ] Sortare (asc/desc) pe name, email, createdAt
- [ ] Request fără autentificare (401)
- [ ] Request cu rol USER (401)
- [ ] Validare cross-customer pentru note/tag-uri

## Raportare Bug-uri

Dacă găsești probleme, raportează cu:
1. Endpoint-ul testat
2. Request body/query params
3. Răspuns actual vs așteptat
4. Status code primit
5. Token folosit (ADMIN/MANAGER/USER)

## Automatizare Teste

Pentru rulare automată, consideră:
- Jest + Supertest pentru teste unitare
- Postman Collections pentru API testing
- GitHub Actions pentru CI/CD
