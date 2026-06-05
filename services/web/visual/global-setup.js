import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, request as pwRequest } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'state.json');

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:2200';
const API_URL = process.env.API_URL || 'http://localhost:2300';
// Seeded admin fixture — override in CI / .env. The web app stores its JWT in
// localStorage under the key `jwt` (see src/utils/api/token.js).
const EMAIL = process.env.E2E_EMAIL || 'admin@bedrock.foundation';
const PASSWORD = process.env.E2E_PASSWORD || '';

/**
 * Logs in once via the API and persists a storageState with the JWT in
 * localStorage, so every authenticated test reuses it (plan §7.3). If the API
 * is unreachable or creds are missing, we skip silently and app.spec.js skips.
 */
export default async function globalSetup() {
  // Stale session from a previous run shouldn't mask an unreachable API now.
  fs.rmSync(AUTH_FILE, { force: true });

  if (!PASSWORD) {
    console.warn(
      '[visual] E2E_PASSWORD not set — authenticated screens will be skipped.',
    );
    return;
  }

  let token;
  try {
    const api = await pwRequest.newContext();
    const res = await api.post(`${API_URL}/1/auth/password/login`, {
      data: { email: EMAIL, password: PASSWORD },
    });
    if (!res.ok()) {
      console.warn(`[visual] login failed (${res.status()}) — app screens skipped.`);
      await api.dispose();
      return;
    }
    ({ token } = (await res.json()).data);
    await api.dispose();
  } catch (e) {
    console.warn(`[visual] API unreachable (${e.message}) — app screens skipped.`);
    return;
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE_URL);
  await page.evaluate((t) => window.localStorage.setItem('jwt', t), token);

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await ctx.storageState({ path: AUTH_FILE });
  await browser.close();
  console.log('[visual] seeded authenticated session →', AUTH_FILE);
}
