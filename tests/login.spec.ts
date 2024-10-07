import { test, expect, type Page, selectors } from "@playwright/test";
import { env } from "techme/env";

test.beforeEach(async ({ browser, page }) => {
  // const b = await browser.newContext();
  // page = await b.newPage();
  // await page.goto("http://localhost:3000");
  // const page = await b.newPage();
  // await page.goto("http://localhost:3000");
  // test.extend({ page });
  // return {};
  // return { page };
});

test("login", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await page.waitForTimeout(3000);
  await expect(page).toHaveTitle("TechMe");
  const text = await page.$$eval("button", (buttons) =>
    buttons.map((b) => b.textContent),
  );
  expect(text).toContain("Sign in with Google");
  expect(text).toContain("Sign in with Azure");
  const button = await page.$("button:has-text('Sign in with Google')");
  await button?.click();
  await page.waitForTimeout(2000);
  expect(page.url()).toContain("accounts.google.com");
  const emailInput = await page.$("input[type=email]");
  console.log(env.CI_EMAIL);
  expect(emailInput).not.toBeNull();
  await emailInput?.fill(env.CI_EMAIL);
  const nextButton = await page.$("button:has-text('Next')");
  await nextButton?.click();
  await page.waitForTimeout(2000);
  const passwordInput = await page.$("input[type=password]");
  await page.waitForTimeout(2000);
  expect(passwordInput).not.toBeNull();
  await passwordInput?.fill(env.CI_PASSWORD);
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
