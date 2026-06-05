import { expect } from '@playwright/test';

/**
 * Structural conformance checks for the UI Design Standards (§5 / §7.5).
 * These complement the pixel diff: they assert the *shape* of a screen, not its
 * appearance. Universally-true checks are hard assertions; standards that depend
 * on not-yet-migrated structure are opt-in via the `expect*` flags so the gate
 * can be tightened screen-by-screen as the migration progresses.
 */
export async function assertConformance(page, opts = {}) {
  const {
    expectSingleTitle = true, // §5.2 one <h1> per screen
    expectBreadcrumb = false, // §5.2 breadcrumb on dashboard screens
    expectSinglePrimary = false, // §5.4 exactly one primary action
    expectTable = false, // §5.3 CRUD views are tables
  } = opts;

  if (expectSingleTitle) {
    await expect(
      page.locator('h1'),
      '§5.2 exactly one page <h1> title',
    ).toHaveCount(1);
  }

  if (expectBreadcrumb) {
    const crumb = page.locator(
      'nav[aria-label="breadcrumb" i], [data-slot="breadcrumb"]',
    );
    await expect(crumb.first(), '§5.2 breadcrumb present').toBeVisible();
  }

  if (expectSinglePrimary) {
    // shadcn primary buttons render the default variant (bg-primary). Note an
    // `asChild` button renders as its child element (e.g. an <a>), so match any
    // element with the button slot — not just <button>.
    const primary = page.locator('[data-slot="button"].bg-primary');
    await expect(
      primary,
      '§5.4 at most one primary action per view',
    ).toHaveCount(1);
  }

  if (expectTable) {
    await expect(
      page.locator('table').first(),
      '§5.3 CRUD list view uses a table',
    ).toBeVisible();
  }
}

/**
 * Attach a console-error collector to a page. Call the returned `assertClean()`
 * after the screen settles to fail on any React/runtime console error (§7.5).
 */
// Resource-load failures (e.g. a missing fixture image 404) are data gaps, not
// app bugs — the gate should catch JS errors, not seed-data holes.
const RESOURCE_NOISE = /Failed to load resource|net::ERR_|ERR_BLOCKED|favicon/i;

export function trackConsoleErrors(page) {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !RESOURCE_NOISE.test(msg.text())) {
      errors.push(msg.text());
    }
  });
  // Uncaught JS exceptions are always real.
  page.on('pageerror', (err) => errors.push(String(err)));
  return {
    assertClean() {
      expect(errors, `no console/runtime errors:\n${errors.join('\n')}`).toEqual(
        [],
      );
    },
  };
}
