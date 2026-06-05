import { expect } from '@playwright/test';

/**
 * Navigate to a route, let it settle deterministically, and assert a full-page
 * screenshot against the committed baseline. Volatile regions are masked so the
 * diff is signal, not noise (plan §7.1).
 */
export async function captureScreen(page, route) {
  // Make the app's ThemeProvider follow the project's colour scheme so the
  // `*-dark` projects render genuinely dark (the provider reads localStorage
  // 'theme'). Without this the dark projects rendered light and dark-mode bugs
  // slipped through the gate.
  await page.addInitScript(() => {
    try {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      window.localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      // ignore (storage unavailable)
    }
  });

  await page.goto(route.path, { waitUntil: 'networkidle' });

  // Kill animations/transitions and the blinking caret for stable pixels.
  await page.addStyleTag({
    content: `*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}`,
  });

  // Some screens show data the harness itself mutates (login writes audit-log
  // rows + a session), so their full-page height shifts run-to-run. We still
  // load them (covering JS/console errors) but defer pixel-gating until they're
  // migrated with proper determinism/masking.
  if (route.skipScreenshot) {
    return;
  }

  // Mask regions that legitimately change run-to-run (timestamps, avatars, …).
  const masks = [
    page.locator('[data-volatile]'),
    page.locator('time'),
  ];

  await expect(page).toHaveScreenshot(`${route.name}.png`, {
    fullPage: true,
    mask: masks,
  });
}
