"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";
import { getRecipeForItem } from "@/lib/pos-recipes";

/**
 * Deduct recipe ingredients from the store's Inventory when a POS item is sold.
 * Finds Inventory rows for this store whose productNameGeneral matches each
 * ingredient's productKey (contains, case-insensitive) and reduces quantity.
 */
export async function deductRecipeFromStoreInventory(
  storeId: string,
  itemName: string,
  quantitySold: number,
): Promise<{ deducted: boolean; message?: string }> {
  const recipe = getRecipeForItem(itemName);
  if (!recipe || recipe.length === 0) return { deducted: false };

  for (const ing of recipe) {
    const amountNeeded = Math.round(ing.quantity * quantitySold);
    if (amountNeeded <= 0) continue;

    const keyLower = ing.productKey.toLowerCase();
    const rows = await prisma.inventory.findMany({
      where: {
        storeId,
        OR: [
          { productNameGeneral: { contains: ing.productKey, mode: "insensitive" } },
          { productNameSpecific: { contains: ing.productKey, mode: "insensitive" } },
        ],
      },
      orderBy: [{ quantity: "desc" }, { createdAt: "desc" }],
    });

    if (rows.length === 0) continue;

    let remaining = amountNeeded;
    for (const row of rows) {
      if (remaining <= 0) break;
      const deduct = Math.min(remaining, row.quantity);
      if (deduct <= 0) continue;
      await prisma.inventory.update({
        where: { id: row.id },
        data: { quantity: row.quantity - deduct, updatedAt: new Date(currentNow()) },
      });
      remaining -= deduct;
    }
  }

  return { deducted: true };
}
