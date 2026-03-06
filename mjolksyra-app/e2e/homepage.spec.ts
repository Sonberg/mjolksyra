import { test, expect } from "@playwright/test";

test("homepage renders brand and CTA", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page.getByText("mjölksyra")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /transform your coaching into a business/i }),
  ).toBeVisible();

  // Accept either beta signup form state or registration CTA.
  const cta = page
    .getByRole("button", { name: /get started now/i })
    .or(page.getByRole("button", { name: /join waitlist|sign up/i }));
  await expect(cta.first()).toBeVisible();
});

test("unauthenticated users can toggle theme mode", async ({ page }) => {
  await page.goto("/");

  const themeToggle = page.getByRole("button", { name: /switch to dark mode|switch to light mode/i });
  await expect(themeToggle).toBeVisible();

  const previousTheme = (await page.locator("html").getAttribute("data-theme")) ?? "light";
  await themeToggle.click();

  await expect(page.locator("html")).not.toHaveAttribute("data-theme", previousTheme);
});

test.describe("homepage calculator", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/plans", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "starter",
            name: "Starter",
            monthlyPriceSek: 199,
            includedAthletes: 5,
            extraAthletePriceSek: 49,
            sortOrder: 1,
          },
          {
            id: "pro",
            name: "Pro",
            monthlyPriceSek: 399,
            includedAthletes: 10,
            extraAthletePriceSek: 39,
            sortOrder: 2,
          },
          {
            id: "scale",
            name: "Scale",
            monthlyPriceSek: 699,
            includedAthletes: 20,
            extraAthletePriceSek: 29,
            sortOrder: 3,
          },
        ]),
      });
    });
  });

  test("shows plan selector and defaults to cheapest plan", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Calculate your earnings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Starter" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("calculator-platform-cost")).toContainText("−199 kr");
  });

  test("switching plan updates platform cost and net revenue", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Pro" }).click();

    await expect(page.getByRole("tab", { name: "Pro" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("calculator-platform-cost")).toContainText("−399 kr");
    await expect(page.getByTestId("calculator-net-revenue")).toContainText("4 596 kr");
  });

  test("changing athlete count recalculates totals and cheapest plan selection", async ({ page }) => {
    await page.goto("/");

    const athleteSlider = page.locator("input[type='range']").first();
    await athleteSlider.evaluate((element) => {
      const input = element as HTMLInputElement;
      input.value = "15";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await expect(page.getByRole("tab", { name: "Pro" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("calculator-platform-cost")).toContainText("−594 kr");
    await expect(page.getByTestId("calculator-net-revenue")).toContainText("14 391 kr");
  });

  test("uses fallback pricing when plans API fails", async ({ page }) => {
    await page.unroute("**/api/plans");
    await page.route("**/api/plans", async (route) => {
      await route.abort();
    });

    await page.goto("/");

    await expect(page.getByTestId("calculator-fallback-pricing")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Standard" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("calculator-platform-cost")).toContainText("−399 kr");
  });
});
