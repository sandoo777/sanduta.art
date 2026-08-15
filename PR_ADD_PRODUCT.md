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