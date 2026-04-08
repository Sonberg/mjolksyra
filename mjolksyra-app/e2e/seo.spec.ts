import { expect, test } from "@playwright/test";

test("home page exposes structured data for AI/search crawlers", async ({ page }) => {
  await page.goto("/");

  const canonical = page.locator("link[rel='canonical']");
  await expect(canonical).toHaveAttribute("href", "/");

  const structuredData = await page
    .locator("script[type='application/ld+json']")
    .first()
    .textContent();

  expect(structuredData).toContain('"@type":"Organization"');
  expect(structuredData).toContain('"@type":"SoftwareApplication"');
  expect(structuredData).toContain('"@type":"FAQPage"');
  expect(structuredData).toContain("AI workout planner");
});

test("robots.txt allows public crawling and exposes AI crawler directives", async ({ page }) => {
  const response = await page.request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();

  const body = await response.text();
  expect(body).toContain("User-agent: OAI-SearchBot");
  expect(body).toContain("User-agent: GPTBot");
  expect(body).toContain("Disallow: /app");
  expect(body).toContain("Sitemap:");
});

test("utility pages stay out of the index", async ({ page }) => {
  await page.goto("/design-system");

  const robots = page.locator("meta[name='robots']");
  await expect(robots).toHaveAttribute("content", /noindex/i);
});
