import path from "node:path";
import { expect, test } from "@playwright/test";

const DEMO_EMAIL = "sarah@northstar-advisory.com";
const DEMO_PASSWORD = "ChangeMe123!";

async function logIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(DEMO_EMAIL);
  await page.getByLabel("Password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

function workspaceNotice(page: import("@playwright/test").Page, text: string) {
  return page.getByText(text, { exact: true }).first();
}

function engagementCard(page: import("@playwright/test").Page, title: string) {
  return page
    .getByRole("heading", { name: title, exact: true })
    .locator('xpath=ancestor::div[contains(@class,"group border")]')
    .first();
}

test.describe.configure({ mode: "serial" });

test("main routed buttons work through the core engagement flow", async ({ page }) => {
  const uniqueSuffix = `${Date.now()}`;
  const engagementTitle = `Smoke Test ${uniqueSuffix}`;
  const uploadPath = path.join(process.cwd(), "tests", "fixtures", "brief.txt");

  await logIn(page);

  await page.getByRole("link", { name: "Create New Engagement" }).first().click();
  await expect(page.getByRole("heading", { name: "Create New Engagement" })).toBeVisible();

  await page.getByLabel("Engagement Title").fill(engagementTitle);
  await page.getByLabel("Client Alias").fill("Smoke Client");
  await page.getByLabel("Problem Type").selectOption("Market Entry Strategy");
  await page.getByLabel("Paste Brief").fill(
    "Evaluate a Saudi Arabia market entry opportunity and produce a usable first-draft proposal, issue tree, and workplan."
  );
  await page.locator('input[type="file"]').setInputFiles(uploadPath);
  await expect(page.getByText("brief.txt")).toBeVisible();
  await expect(page.getByText("Ready")).toBeVisible();
  await page.getByRole("button", { name: "Continue to Workspace" }).click();

  await expect(page.getByRole("heading", { name: engagementTitle })).toBeVisible();

  await page.getByRole("button", { name: "Brief" }).click();
  await expect(page.getByRole("heading", { name: "Canonical Brief" })).toBeVisible();
  await page.locator("textarea").first().fill(
    "Updated smoke-test brief. Focus on customer segmentation, pricing, local regulation, and operating model tradeoffs."
  );
  await page.getByRole("button", { name: "Save Brief" }).click();
  await expect(workspaceNotice(page, "Brief saved")).toBeVisible();
  await page.getByRole("button", { name: "Re-run Matching" }).click();
  await expect(workspaceNotice(page, "Matching refreshed")).toBeVisible();

  await page.getByRole("button", { name: "Proposal Starter" }).click();
  await expect(page.locator('input[type="text"]').first()).toHaveValue(new RegExp(engagementTitle));
  await page.getByRole("button", { name: "Export Draft" }).click();
  await expect(page.getByRole("heading", { name: "Export Draft" })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.md$/);
  await expect(page.getByText("Export Complete")).toBeVisible();
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("heading", { name: "Export Draft" })).toHaveCount(0);

  await page.getByRole("button", { name: "Version History" }).click();
  await expect(page.getByRole("heading", { name: "Version History" })).toBeVisible();
  await page.getByRole("button", { name: "Compare" }).first().click();
  await expect(page.getByText(/Comparing Version/i)).toBeVisible();
  await page.getByRole("button", { name: "Close version history" }).click();

  await page.getByRole("button", { name: "Open workspace actions" }).click();
  await page.getByRole("button", { name: "Save to vault" }).click();
  await expect(page.getByRole("heading", { name: "Save Engagement to Vault" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  const originalCard = engagementCard(page, engagementTitle);
  await originalCard.getByRole("button", { name: "Duplicate" }).click();
  await expect(page.getByText(`Duplicated "${engagementTitle}"`)).toBeVisible();

  const duplicateCard = engagementCard(page, `${engagementTitle} Copy`);
  await expect(duplicateCard).toBeVisible();

  await originalCard.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByText(`Archived "${engagementTitle}"`)).toBeVisible();
  await originalCard.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText(`Restored "${engagementTitle}"`)).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await duplicateCard.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(`Deleted "${engagementTitle} Copy"`)).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await originalCard.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(`Deleted "${engagementTitle}"`)).toBeVisible();
});

test("home route and engagement validation enforce the MVP entry path", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/landing$/);

  await logIn(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/new-engagement");
  await expect(page.getByRole("button", { name: "Continue to Workspace" })).toBeDisabled();

  await page.getByLabel("Engagement Title").fill("Validation Test");
  await page.getByLabel("Client Alias").fill("Validation Client");
  await page.getByLabel("Problem Type").selectOption("Market Entry Strategy");
  await expect(page.getByRole("button", { name: "Continue to Workspace" })).toBeDisabled();

  const invalidResponse = await page.evaluate(async () => {
    const response = await fetch("/api/engagements", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Invalid Engagement",
        client: "Validation Client",
        problemType: "Market Entry Strategy",
        brief: "",
        notes: "",
        uploads: [],
      }),
    });
    return {
      status: response.status,
      body: await response.json(),
    };
  });

  expect(invalidResponse.status).toBe(400);
  expect(invalidResponse.body.error).toContain("Add a brief");
});
