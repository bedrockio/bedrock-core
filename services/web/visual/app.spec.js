import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { test } from '@playwright/test';

import { expectCleanLayout } from './helpers/audit.js';
import { captureScreen } from './helpers/capture.js';
import { assertConformance, trackConsoleErrors } from './helpers/conformance.js';
import { APP_ROUTES } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, '.auth', 'state.json');
const hasSession = fs.existsSync(AUTH_FILE);

// Authenticated screens require a seeded session captured by global-setup.js.
// When the API isn't reachable (e.g. quick local web-only run) we skip cleanly
// rather than fail — the gate still covers every logged-out screen.
test.describe('authenticated screens', () => {
  test.skip(
    !hasSession,
    'No seeded session (API unreachable) — app screens skipped. See visual/README.md.',
  );
  test.use({ storageState: hasSession ? AUTH_FILE : undefined });

  for (const route of APP_ROUTES) {
    test(`app screen: ${route.name}`, async ({ page }) => {
      const console_ = trackConsoleErrors(page);

      await captureScreen(page, route);

      // Conformance is only enforced once a screen is migrated to shadcn
      // (route.migrated). This lets us baseline the current Mantine screens
      // without failing, then enforce §5 per-screen as each is converted.
      if (route.migrated) {
        const isList = route.name.endsWith('-list');
        await assertConformance(page, {
          expectSingleTitle: true,
          expectBreadcrumb: true,
          expectTable: isList,
          expectSinglePrimary: isList,
        });
        // Pre-existing Mantine screens may log console errors that aren't ours
        // to fix yet; only enforce a clean console once a screen is migrated.
        console_.assertClean();
        // Layout/consistency audit (font sizes, breadcrumb alignment, markers,
        // broken images) — catches the bugs a human would have to spot by eye.
        await expectCleanLayout(page);
      }
    });
  }
});
