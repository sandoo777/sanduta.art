## Title and summary

One-line title.

- Summary bullet 1
- Summary bullet 2
- Summary bullet 3

## Testing steps

1. `npm run jest-only`
2. `npm run start-test-server` or MSW equivalent
3. `npx vitest run`

## Test results

- `ci:jest`:
- `ci:vitest`:
- `ci:playwright`:

## Failing logs

Paste relevant failing logs here if any test is not green.

## Checklist

- [ ] Branch name follows `feature/<ticket>-short-desc` or `fix/<ticket>-short-desc`
- [ ] Commits use conventional commit format
- [ ] Unit tests added
- [ ] Integration tests added or MSW handlers updated
- [ ] Docs updated if behavior changed
- [ ] No debug artifacts committed