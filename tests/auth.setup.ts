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
  const button = page.getByRole("button", {
    name: "Sign in with Credentials",
  });
  await button.click();
  await page.waitForURL("http://localhost:3000/");
  await page.context().storageState({ path: authFile });
});
