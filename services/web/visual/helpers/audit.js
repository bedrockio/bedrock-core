import { expect } from '@playwright/test';

/**
 * Layout / consistency audit — catches the classes of visual bugs that are easy
 * to miss by eye but violate the UI standards (ui-best-practices.md). Runs in
 * the browser, returns a list of human-readable violations. Wire it into the
 * gate so these are caught automatically, not by the user.
 *
 * Covers, so far:
 *  - interactive font consistency (the Mantine-vs-Tailwind <button> 16px bug)
 *  - breadcrumb left-aligned with the page title (and title with content)
 *  - no stray <ol>/<ul> list markers in chrome (the breadcrumb "garbling")
 *  - no broken images (naturalWidth 0) — use a graceful placeholder instead
 *  - exactly one <h1>
 */
export async function auditLayout(page) {
  return await page.evaluate(() => {
    const v = [];
    const left = (el) => Math.round(el.getBoundingClientRect().left);
    const text = (el) => (el.textContent || '').trim().slice(0, 24);

    // 1. Every shadcn button should render at its intended size. Mantine's
    //    unlayered reset silently forced 16px; flag any drift from 14px
    //    (text-sm) for non-large buttons.
    for (const b of document.querySelectorAll('[data-slot="button"]')) {
      if (b.getAttribute('data-size') === 'lg') continue;
      const fs = parseFloat(getComputedStyle(b).fontSize);
      if (Math.abs(fs - 14) > 0.6) {
        v.push(`button font-size ${fs}px (expected ~14px): "${text(b)}"`);
      }
    }

    // 1b. In dark mode, no button should have near-black text (the outline/ghost
    //     buttons that inherit colour must pick up the light foreground, not the
    //     UA black). Catches the dark-mode wrong-text-colour class.
    if (document.documentElement.classList.contains('dark')) {
      for (const b of document.querySelectorAll('[data-slot="button"]')) {
        const m = getComputedStyle(b).color.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+)/,
        );
        if (m && +m[1] < 40 && +m[2] < 40 && +m[3] < 40) {
          v.push(`dark-mode button has near-black text: "${text(b)}"`);
        }
      }
    }

    // 2. Sidebar nav items + buttons should share one font size (catches a
    //    <button> group sitting at a different size than <a> links beside it).
    const navSizes = new Set(
      [...document.querySelectorAll('aside a, aside button')]
        .filter((el) => text(el))
        .map((el) => getComputedStyle(el).fontSize),
    );
    // allow logo/brand (larger) — only flag if the small-nav items disagree
    const navItemSizes = new Set(
      [...document.querySelectorAll('aside nav a, aside nav button')].map(
        (el) => getComputedStyle(el).fontSize,
      ),
    );
    if (navItemSizes.size > 1) {
      v.push(`sidebar nav items use mixed font sizes: ${[...navItemSizes].join(', ')}`);
    }

    // 3. Breadcrumb left edge should align with the page title (and the title
    //    with the content below it).
    const bc = document.querySelector('nav[aria-label="breadcrumb"]');
    const h1 = document.querySelector('h1');
    if (bc && h1) {
      const d = left(bc) - left(h1);
      if (Math.abs(d) > 2) {
        v.push(`breadcrumb misaligned with title by ${d}px (breadcrumb ${left(bc)} vs title ${left(h1)})`);
      }
    }

    // 4. Breadcrumb (an <ol>) must not show list markers.
    const ol = bc && bc.querySelector('ol');
    if (ol && getComputedStyle(ol).listStyleType !== 'none') {
      v.push('breadcrumb <ol> shows list markers (missing list-none)');
    }

    // 5. Exactly one <h1>.
    const h1s = document.querySelectorAll('h1').length;
    if (h1s !== 1) v.push(`expected exactly one <h1>, found ${h1s}`);

    // 6. No broken images (failed loads should use a placeholder, not the
    //    browser's broken-image glyph).
    for (const img of document.querySelectorAll('img')) {
      if (img.complete && img.naturalWidth === 0) {
        v.push(`broken image renders broken-icon: "${img.alt || img.src.slice(-32)}"`);
      }
    }

    return v;
  });
}

/** Assert the audit is clean (use inside a migrated-screen test). */
export async function expectCleanLayout(page) {
  const violations = await auditLayout(page);
  expect(
    violations,
    `layout audit violations:\n - ${violations.join('\n - ')}`,
  ).toEqual([]);
}
