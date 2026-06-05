import { defineConfig, devices } from '@playwright/test';

/**
 * Chrome-based visual + conformance gate for the Mantine → shadcn migration.
 * See change-ui-framework-to-shadcn.html §7.
 *
 * Run locally:
 *   yarn test:visual                 # against a running dev server on :2200
 *   yarn test:visual --update-snapshots   # (re)capture baselines
 *
 * Layers:
 *   - auth.spec.js  → logged-out screens (web server only, no API)
 *   - app.spec.js   → authenticated screens (needs API + seeded session)
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:2200';

export default defineConfig({
  testDir: '.',
  snapshotDir: './baselines',
  outputDir: './.results',
  globalSetup: './global-setup.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: './.report', open: 'never' }]]
    : [['list']],

  use: {
    baseURL: BASE_URL,
    // Determinism: no animations, fixed locale/timezone (plan §7.1).
    locale: 'en-US',
    timezoneId: 'UTC',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Pixel-diff tolerance — start permissive, tighten as screens stabilise (§7.3).
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },

  // Matrix dimension #1: viewport × colour scheme. The route × state dimension
  // lives inside the specs. ~40 routes × these 4 projects ≈ 160 screenshots.
  projects: [
    {
      name: 'desktop-light',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
    },
    {
      name: 'desktop-dark',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'dark' },
    },
    {
      name: 'mobile-light',
      use: { ...devices['Pixel 7'], colorScheme: 'light' },
    },
    {
      name: 'mobile-dark',
      use: { ...devices['Pixel 7'], colorScheme: 'dark' },
    },
  ],
});
