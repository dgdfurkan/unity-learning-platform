---
name: "playwright-pro"
description: "Focused Playwright testing toolkit for this learning platform. Use for end-to-end tests, responsive device checks, authentication and role flows, CRUD, file upload, accessibility, realtime dashboards, flaky-test diagnosis, and test review."
---

# Playwright Pro — Project Edition

Use Playwright to prove the critical student and admin journeys on desktop, tablet, and mobile.

## Workflow

1. Run `playwright-init` when the project has no verified configuration.
2. Write tests from the user-visible behavior and the selected template.
3. Run `playwright-review` before commit.
4. Run `playwright-fix` only for a real failing or flaky test.
5. Re-run the affected test, then the complete critical-flow suite.

## Golden rules

1. Prefer `getByRole()`, then `getByLabel()`, `getByText()`, `getByPlaceholder()`, `getByTestId()`, and CSS only as a last resort.
2. Never use `page.waitForTimeout()`; use web-first assertions.
3. Keep tests isolated and deterministic.
4. Use `baseURL`; do not hardcode deployment URLs.
5. Use retries only in CI and collect a trace on the first retry.
6. Mock external services, not the behavior under test.
7. Test authorization at the backend boundary; a hidden admin button is not proof of security.
8. Test empty, loading, error, unauthorized, offline, and success states where relevant.

## Project-critical journeys

- Login and role-based redirect
- Student cannot access admin routes or operations
- Admin creates a student account
- Admin assigns work; student sees it
- Student submits text, link, or allowed file
- Admin scores and comments; mastery changes
- Review queue schedules and resurfaces concepts
- PWA app shell opens offline
- iPhone safe-area, bottom navigation, virtual keyboard, and no horizontal overflow
- Tablet and desktop lesson workspace retain context

## References

Read `reference/` for assertions, locators, fixtures, common pitfalls, and flaky-test diagnosis.

Read only the relevant file under `templates/`. The project carries a reduced template set for accessibility, auth, CRUD, realtime dashboards, uploads, validation, and first-time setup.

