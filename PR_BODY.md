## Titlu și sumar

feat: add products API and UI stub

- adaugă un endpoint minim `POST /api/products` pentru validarea fluxului de dezvoltare
- adaugă un stub UI pentru exercitarea endpointului din browser
- adaugă test unitar Jest pentru handler și extinde acoperirea pentru health, validare și feature flag
- adaugă pași minimi de CI, staging și rollback pentru acest feature

## Pași de testare

1. `npm ci`
2. `npm run jest-only`
3. `npm run start-test-server`
4. `npx vitest run`
5. `node scripts/dev-server.js`
6. `curl -X POST http://localhost:3000/api/products -d '{"name":"a","price":1}' -H "Content-Type: application/json"`

## Rezultate teste

- `ci:jest`: verde pentru `src/tests/products.test.ts`
- `ci:vitest`: necesită serverul de test și handlere MSW extinse pentru endpointurile comune
- `ci:playwright`: nevalidat în acest branch

## Observabilitate și rollback

- endpoint nou `GET /api/health`
- loguri de bază pentru requesturile către endpointurile noi
- feature flag: `ENABLE_ADD_PRODUCT_API`

### Runbook rollback

1. setează `ENABLE_ADD_PRODUCT_API=false`
2. redeploy pe staging sau restart local pentru serverul de dev
3. verifică `GET /api/health` și confirmă `productsApiEnabled: false`
4. rulează din nou smoke checks înainte de reactivare

## Checklist

- [x] branch-ul respectă convenția `feature/<ticket>-short-desc`
- [x] commiturile folosesc convenții tip conventional commits
- [x] există test unitar pentru endpointul nou
- [x] există acoperire minimă pentru integrare/MSW
- [x] documentația contributorilor a fost actualizată
- [x] artefactele de debug vor fi curățate înainte de merge