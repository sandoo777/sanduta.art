---
name: Add Product API Follow-up
about: Expand the first workflow validation feature into a real product creation path
title: 'feat: expand add-product-api workflow'
labels: ['feature', 'workflow']
assignees: ''
---

## Summary

Use `feature/add-product-api` as the reference workflow for small feature delivery.

## Acceptance Criteria

- A product creation endpoint validates `name` and `price` before returning success.
- The endpoint returns `400` for invalid payloads and `201` for valid payloads.
- The UI stub submits to the endpoint and shows a visible success or error state.
- Local developer flow is documented and matches the commands in [CONTRIBUTING.md](../../CONTRIBUTING.md).
- CI proves the feature path with unit, integration, and Playwright coverage.

## Tests Required

- Unit: API handler success and invalid-payload cases.
- Integration: request path through the local test server or MSW-backed flow.
- Playwright: smoke path that submits the form and verifies the success response.

## Notes

- Keep the implementation intentionally small.
- Follow the branch and PR flow used by `feature/add-product-api`.