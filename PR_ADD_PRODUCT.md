Title: feat: add products API and UI stub

What:
- Minimal POST /api/products endpoint
- UI stub to exercise endpoint
- Unit test for API

How to test locally:
1. npm ci
2. node scripts/dev-server.js
3. curl -X POST http://localhost:3000/api/products -d '{"name":"a","price":1}' -H "Content-Type: application/json"

Notes:
- This is the first feature to validate dev flow. Expand handlers and MSW as needed.

Rollback runbook:
1. Disable the feature by setting `ENABLE_ADD_PRODUCT_API=false`.
2. Redeploy staging or restart the local dev server.
3. Verify `GET /api/health` reports `productsApiEnabled: false`.
4. Re-run smoke checks before re-enabling the flag.