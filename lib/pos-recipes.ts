/**
 * POS recipe definitions: when a menu item is sold, these ingredients are deducted
 * from the store's inventory (Inventory rows with storeId).
 *
 * Reference:
 * - 1 Burger = 1 patty & 2 buns
 * - 1 spaghetti = 200g spag noodles & 60g spag sauce
 * - 1 burger steak = 1 patty & 200g rice & 60g steak sauce
 * - 1 chicken = 1 raw chicken
 */

export interface RecipeIngredient {
  /** Matches Inventory.productNameGeneral (contains, case-insensitive) */
  productKey: string;
  quantity: number;
  unit: string;
}

/** Map: POS item name (lowercase, trimmed) -> ingredients to deduct per 1 unit sold */
const RECIPES: Record<string, RecipeIngredient[]> = {
  burger: [
    { productKey: "patty", quantity: 1, unit: "pc" },
    { productKey: "buns", quantity: 2, unit: "pc" },
  ],
  "burger steak": [
    { productKey: "patty", quantity: 1, unit: "pc" },
    { productKey: "rice", quantity: 200, unit: "g" },
    { productKey: "steak sauce", quantity: 60, unit: "g" },
  ],
  spaghetti: [
    { productKey: "spag noodles", quantity: 200, unit: "g" },
    { productKey: "spag sauce", quantity: 60, unit: "g" },
  ],
  chicken: [{ productKey: "raw chicken", quantity: 1, unit: "pc" }],
};

function normalizeItemName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Returns recipe ingredients for a POS item name, or null if no recipe.
 * Tries exact match first, then "contains" (e.g. "Chicken Joy" -> chicken).
 */
export function getRecipeForItem(itemName: string): RecipeIngredient[] | null {
  const key = normalizeItemName(itemName);
  if (RECIPES[key]) return [...RECIPES[key]];

  for (const [recipeKey, ingredients] of Object.entries(RECIPES)) {
    if (key.includes(recipeKey) || recipeKey.includes(key)) return [...ingredients];
  }
  return null;
}
