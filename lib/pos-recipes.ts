/**
 * POS recipe definitions: when a menu item is sold, these ingredients are deducted
 * from the store's inventory (Inventory rows with storeId).
 *
 * Reference:
 * Burger = 1 patty, 1 buns
 * Cheese Burger = 1 cheese, 1 patty, 1 buns
 * Chicken Sandwich Burger = 1 chicken sandwich, 1 buns
 * Spaghetti = 200g spaghetti noodles, 50g spaghetti sauce
 * Palabok = 200g palabok noodles, 50g palabok sauce
 * Chicken = 1 chicken, 150g rice
 * Burger Steak = 1 patty, 150g rice
 * Fillet Meal = chicken patty, 150g rice
 * Rice = 150g rice
 * Fries = 150g potato fries
 * Coke = 500ml coke, Royal = 500ml royal, Sprite = 500ml sprite
 */

export interface RecipeIngredient {
  /** Matches Inventory.productNameGeneral / productNameSpecific (contains, case-insensitive) */
  productKey: string;
  quantity: number;
  unit: string;
}

/** Map: POS item name (lowercase, trimmed) -> ingredients to deduct per 1 unit sold */
const RECIPES: Record<string, RecipeIngredient[]> = {
  burger: [
    { productKey: "patty", quantity: 1, unit: "pc" },
    { productKey: "buns", quantity: 1, unit: "pc" },
  ],
  "cheese burger": [
    { productKey: "cheese", quantity: 1, unit: "pc" },
    { productKey: "patty", quantity: 1, unit: "pc" },
    { productKey: "buns", quantity: 1, unit: "pc" },
  ],
  "chicken sandwich burger": [
    { productKey: "chicken sandwich", quantity: 1, unit: "pc" },
    { productKey: "buns", quantity: 1, unit: "pc" },
  ],
  spaghetti: [
    { productKey: "spaghetti noodles", quantity: 200, unit: "g" },
    { productKey: "spaghetti sauce", quantity: 50, unit: "g" },
  ],
  palabok: [
    { productKey: "palabok noodles", quantity: 200, unit: "g" },
    { productKey: "palabok sauce", quantity: 50, unit: "g" },
  ],
  chicken: [
    { productKey: "chicken", quantity: 1, unit: "pc" },
    { productKey: "rice", quantity: 150, unit: "g" },
  ],
  "burger steak": [
    { productKey: "patty", quantity: 1, unit: "pc" },
    { productKey: "rice", quantity: 150, unit: "g" },
  ],
  "fillet meal": [
    { productKey: "chicken patty", quantity: 1, unit: "pc" },
    { productKey: "rice", quantity: 150, unit: "g" },
  ],
  rice: [{ productKey: "rice", quantity: 150, unit: "g" }],
  fries: [{ productKey: "potato fries", quantity: 150, unit: "g" }],
  coke: [{ productKey: "coke", quantity: 500, unit: "ml" }],
  royal: [{ productKey: "royal", quantity: 500, unit: "ml" }],
  sprite: [{ productKey: "sprite", quantity: 500, unit: "ml" }],
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
    if (key.includes(recipeKey) || recipeKey.includes(key))
      return [...ingredients];
  }
  return null;
}
