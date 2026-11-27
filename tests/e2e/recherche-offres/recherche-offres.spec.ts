import { expect, test } from "@playwright/test";

test("Scénario 1 : consulter ses candidatures avec une session valide", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Louis Claes/ }).click();
  await page.getByRole("link", { name: "Mes candidatures" }).click();

  await expect(page.getByRole("heading", { name: "Mes candidatures" })).toBeVisible();
  const inProgressApplication = page
    .getByRole("row")
    .filter({ hasText: "Assistant conversationnel interne" });
  await expect(inProgressApplication).toContainText("En cours");

  await page.getByRole("checkbox", { name: "Afficher les candidatures retirées" }).check();
  const withdrawnApplication = page
    .getByRole("row")
    .filter({ hasText: "Tableau de bord de qualité des données" });
  await expect(withdrawnApplication).toContainText("Retirée");
});

test("Scénario 2 : afficher l’erreur lorsque le retrait d’une offre échoue", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Julien Lambert/ }).click();
  await page.getByRole("link", { name: "Offres" }).click();

  const blockedOffer = page.getByRole("row").filter({ hasText: "Offre de test non retirable" });
  await expect(blockedOffer).toContainText("Soumise");

  const confirmation = page.waitForEvent("dialog").then(async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });
  await blockedOffer
    .getByRole("button", { name: "Retirer l'offre Offre de test non retirable" })
    .click();
  await confirmation;

  await expect(page.getByRole("alert")).toHaveText(
    "Cette offre est liée à un stage et ne peut pas être supprimée",
  );
  await expect(blockedOffer).toBeVisible();
});
