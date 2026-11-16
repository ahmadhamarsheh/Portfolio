import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Keep tests hermetic: never call Cloudflare from CI.
test.beforeEach(async ({ page }) => {
  await page.route('https://challenges.cloudflare.com/**', (route) => route.abort());
});

async function expectNoHorizontalScroll(page: Page) {
  const [scrollWidth, clientWidth] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe('home page', () => {
  test('English renders left-to-right with the main sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page).toHaveTitle(/Ahmad Hamarsheh/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Reliable backends');
    for (const id of ['work', 'experience', 'services', 'about', 'contact']) {
      await expect(page.locator(`section#${id}`)).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
  });

  test('Arabic renders right-to-left', async ({ page }) => {
    await page.goto('/ar/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('أنظمة خلفية موثوقة');
    await expectNoHorizontalScroll(page);
  });

  test('language switch keeps you on the same page', async ({ page }) => {
    await page.goto('/work/jawwal-payments-kyc/');
    await page.locator('header nav').getByRole('link', { name: 'عربي', exact: true }).click();
    await expect(page).toHaveURL(/\/ar\/work\/jawwal-payments-kyc\/?$/);
    await page.locator('header nav').getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL(/\/work\/jawwal-payments-kyc\/?$/);
  });

  test('theme toggle switches and remembers the theme', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await page.locator('[data-theme-toggle]').click();
    const after = await html.getAttribute('data-theme');
    expect(after).not.toBe(before);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', after ?? '');
  });

  test('exposes SEO metadata and structured data', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/og\/home\.png$/,
    );
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
    );
    expect(jsonLd['@graph'][0]['@type']).toBe('Person');
  });
});

test.describe('case studies', () => {
  test('a case study page shows the architecture diagram and decisions', async ({ page }) => {
    await page.goto('/work/salla-zid-integrations/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Salla');
    await expect(page.getByRole('img', { name: /Architecture diagram/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Key decisions' })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test('unknown pages return the bilingual 404', async ({ page }) => {
    const response = await page.goto('/does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});

test.describe('contact form', () => {
  test('shows translated validation errors without sending', async ({ page }) => {
    let posted = false;
    await page.route('**/api/contact', (route) => {
      posted = true;
      return route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto('/#contact');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    expect(posted).toBe(false);
  });

  test('sends a valid message as JSON and confirms success', async ({ page }) => {
    let payload: Record<string, unknown> = {};
    await page.route('**/api/contact', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, json: { ok: true } });
    });
    await page.goto('/ar/#contact');
    await page.getByLabel('اسمك').fill('Sara Haddad');
    await page.getByLabel('البريد الإلكتروني').fill('sara@example.com');
    await page
      .getByLabel('الرسالة')
      .fill('نحتاج إلى ربط بوابة دفع لمتجرنا الإلكتروني في أقرب وقت.');
    await page.getByRole('button', { name: 'أرسل الرسالة' }).click();
    await expect(page.getByRole('status')).toContainText('شكراً لك');
    expect(payload).toMatchObject({
      name: 'Sara Haddad',
      email: 'sara@example.com',
      lang: 'ar',
      website: '',
    });
  });

  test('explains rate limiting to the visitor', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 429, json: { ok: false, error: 'rate_limited' } }),
    );
    await page.goto('/#contact');
    await page.getByLabel('Your name').fill('Sara');
    await page.getByLabel('Email').fill('sara@example.com');
    await page.getByLabel('Message').fill('Hello, this is a long enough message.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status')).toContainText('Too many messages');
  });
});

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 320, height: 720 } });

  test('menu opens, links work and the layout fits 320px', async ({ page }) => {
    await page.goto('/');
    await expectNoHorizontalScroll(page);
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#mobile-nav').getByRole('link', { name: 'Services' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/#services$/);
  });
});

test.describe('accessibility (axe, WCAG 2.1 AA)', () => {
  for (const path of ['/', '/ar/', '/work/jawwal-payments-kyc/']) {
    for (const theme of ['dark', 'light'] as const) {
      test(`${path} in ${theme} mode has no serious violations`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
        await page.goto(path);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        const serious = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        expect(
          serious,
          JSON.stringify(
            serious.map((v) => [v.id, v.nodes.map((n) => n.target)]),
            null,
            2,
          ),
        ).toEqual([]);
      });
    }
  }
});
