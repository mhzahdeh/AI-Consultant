import { expect, test } from "@playwright/test";
import path from "node:path";

test("login, create engagement, upload, save, restore, and export", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email address").fill("sarah@northstar-advisory.com");
  await page.getByLabel("Password").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: /Create New Engagement/i }).first().click();
  await expect(page.getByRole("heading", { name: "Create New Engagement" })).toBeVisible();

  await page.getByLabel("Engagement Title").fill("Smoke Test Engagement");
  await page.getByLabel("Client Alias").fill("Test Client");
  await page.getByLabel("Problem Type").selectOption("market-entry");
  await page.getByLabel("Paste Brief").fill("Evaluate a new market-entry opportunity and produce a working recommendation.");

  const fixturePath = path.join(process.cwd(), "README.md");
  await page.locator('input[type="file"]').setInputFiles(fixturePath);
  await page.getByRole("button", { name: /Continue to Workspace/i }).click();

  await expect(page.getByRole("heading", { name: "Smoke Test Engagement" })).toBeVisible();

  await page.getByRole("button", { name: /Proposal Starter/i }).click();
  const problemStatement = page.locator("textarea").first();
  await problemStatement.fill("Updated proposal content from smoke test.");
  await page.getByRole("button", { name: /^Save$/ }).nth(1).click();

  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page.getByRole("button", { name: /Export as DOCX/i }).click();
  await expect(page.getByText("Export Complete")).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();

  await page.getByRole("button", { name: "Version History" }).click();
  await expect(page.getByRole("heading", { name: "Version History" })).toBeVisible();
  await page.getByRole("button", { name: /Restore Version/i }).first().click();
  await expect(page.getByText("Version restored successfully")).toBeVisible();
});
