import { test, expect, type Page, selectors } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000");
});

test("has title", async ({ page }) => {
  await page.waitForTimeout(2000);
  await expect(page).toHaveTitle("TechMe");
  const title = await page.title();
  const text = await page.$$eval("button", (buttons) =>
    buttons.map((b) => b.textContent),
  );
  expect(text).toContain("Sign in with Google");
  expect(text).toContain("Sign in with Azure");
  const button = await page.$("button:has-text('Sign in with Google')");
  await button?.click();
  await page.waitForTimeout(2000);
  const emailInput = await page.$("input[type=email]");
  await emailInput?.fill("mponcezertuche@gmail.com");
  const nextButton = await page.$("button:has-text('Next')");
  await nextButton?.click();
  await page.waitForTimeout(2000);
  const passwordInput = await page.$("input[type=password]");
  await passwordInput?.fill("Over12:)");
  const signInButton = await page.$("button:has-text('Next')");
  await signInButton?.click();
  await page.waitForTimeout(2000);
  const continueButton = await page.$("button:has-text('Continue')");
  await continueButton?.click();
  let i = 0;
  while (!page.url().includes("localhost:3000/dashboard")) {
    await page.waitForTimeout(100);
    i++;
    if (i > 100) {
      break;
    }
  }
  expect(page.url()).toContain("localhost:3000/dashboard");
});
