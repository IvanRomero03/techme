import { test as setup, expect } from "@playwright/test";
import path from "path";
import { env } from "techme/env";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  console.log(env.NODE_ENV, process.env.CI);
  await page.goto("http://localhost:3000/api/auth/signin");
  await page.getByLabel("Email").fill(env.CI_EMAIL);
  await page.getByLabel("Password").fill(env.CI_PASSWORD);
  // await page.getByRole("button", { name: "Sign in with Credentials" }).click();
  const button = page.getByRole("button", {
    name: "Sign in with Credentials",
  });
  await button.click();
  await page.waitForURL("http://localhost:3000/");
  await page.context().storageState({ path: authFile });
  //   await page.goto("https://github.com/login");
  // await page.getByLabel("Username or email address").fill("username");
  //   await page.getByLabel("Password").fill("password");
  //   await page.getByRole("button", { name: "Sign in" }).click();
  //   // Wait until the page receives the cookies.
  //   //
  //   // Sometimes login flow sets cookies in the process of several redirects.
  //   // Wait for the final URL to ensure that the cookies are actually set.
  //   await page.waitForURL("https://github.com/");
  //   // Alternatively, you can wait until the page reaches a state where all cookies are set.
  //   await expect(
  //     page.getByRole("button", { name: "View profile and more" }),
  //   ).toBeVisible();
  //   // End of authentication steps.
  //   await page.context().storageState({ path: authFile });
});
