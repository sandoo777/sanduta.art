Title: chore(test): separate jest/vitest/playwright runners and add test server + MSW

Summary:
- Separate test runners: jest for unit, vitest for integration, playwright for E2E.
- Added start-test-server for local CI-compatible test server.
- Added MSW handlers and vitest setup to mock API calls.
- Updated jest config to ignore vitest/playwright suites.
- CI workflow runs jobs separately: ci:jest, ci:vitest, ci:playwright.

How to test locally:
1. npm ci
2. npm run jest-only
3. npm run start-test-server & npx vitest run
4. npx playwright test --list

Notes:
- Playwright webServer temporarily disabled; restore only if CI can reliably start the app.
- MSW covers common API endpoints; extend handlers for remaining failing endpoints.
