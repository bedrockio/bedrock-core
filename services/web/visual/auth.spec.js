import { test } from '@playwright/test';

import { expectCleanLayout } from './helpers/audit.js';
import { captureScreen } from './helpers/capture.js';
import { assertConformance, trackConsoleErrors } from './helpers/conformance.js';
import { AUTH_ROUTES } from './routes.js';

// Logged-out screens. These run with the web server alone — no API needed —
// so this spec is the part of the gate that works without booting the stack.
test.use({ storageState: { cookies: [], origins: [] } });

for (const route of AUTH_ROUTES) {
  test(`auth screen: ${route.name}`, async ({ page }) => {
    const console_ = trackConsoleErrors(page);

    await captureScreen(page, route);

    await assertConformance(page, {
      // Auth screens have exactly one title (e.g. "Login", "Sign Up").
      expectSingleTitle: true,
    });
    console_.assertClean();
    await expectCleanLayout(page);
  });
}
