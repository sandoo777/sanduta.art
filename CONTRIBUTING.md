Dev quickstart
1. npm ci
2. npm run start-test-server   # optional for integration
3. npm run dev                 # start Next dev
4. npm run jest-only           # unit tests
5. npx vitest run              # integration tests

Workflow rules
1. Branch naming: `feature/<ticket>-short-desc` or `fix/<ticket>-short-desc`.
2. Commits: small, focused, one logical change per commit, with conventional commit format.
3. Before opening a PR, run `npm run jest-only` and `npx vitest run` locally.
4. If tests fail, include the relevant failing logs in the PR description.
5. PRs must include a one-line title, a 3-4 bullet summary, and testing steps.
6. Update this file or project sprint docs when developer-facing behavior changes.

Feature branch flow
1. `git checkout -b feature/<ticket>-short-desc`
2. Implement changes
3. `git add .`
4. `git commit -m "feat(<ticket>): short description"`
5. `git push -u origin HEAD`

PR checklist
1. Unit tests added.
2. Integration tests added or MSW handlers extended.
3. `npm run jest-only` passes locally.
4. `npm run start-test-server` plus `npx vitest run` passes locally, or only Playwright remains failing.
5. CI is green for `ci:jest` and `ci:vitest`.
6. No debug artifacts are committed.
7. Use squash or rebase merge according to repo policy.

GitHub enforcement note
1. The repository can validate branch names, conventional commit messages, and PR body structure in CI.
2. Requiring at least 1 reviewer must still be enabled in GitHub branch protection settings.