/**
 * POS recipe definitions: when a menu item is sold, these ingredients are deducted
 * from the store's inventory (Inventory rows with storeId).
 * productKey matches Inventory.productNameGeneral/productNameSpecific (contains, case-insensitive).
 *
 * Reference (instructions):
 * Burger = 1 patty 1 buns
 * Cheese Burger = 1 cheese 1 patty 1 burger (burger = 1 patty 1 buns)
 * Spaghetti = 200g spaghetti noodles 50g spaghetti sauce
 * Chicken Sandwich Burger = 1 chicken sandwich 1 buns
 * Palabok = 200g palabok noodles 50g palabok sauce
 * Chicken = 1 chicken 150g rice
 * Burger Steak = 1 patty 150g rice
 * Fillet Meal = 1 chicken patty 150g rice
 * Rice = 150g rice
 * Fries = 150g potato fries
 * Coke / Royal / Sprite = 500ml each
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
    { productKey: "buns", quantity: 1, unit: "pc" },
  ],
  "cheese burger": [
    { productKey: "cheese", quantity: 1, unit: "pc" },
    { productKey: "patty", quantity: 1, unit: "pc" },
    { productKey: "buns", quantity: 1, unit: "pc" },
  ],
  spaghetti: [
    { productKey: "spaghetti noodles", quantity: 200, unit: "g" },
    { productKey: "spaghetti sauce", quantity: 50, unit: "g" },
  ],
  "chicken sandwich burger": [
    { productKey: "chicken sandwich", quantity: 1, unit: "pc" },
    { productKey: "buns", quantity: 1, unit: "pc" },
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
  coke: [{ productKey: "coke 500ml", quantity: 1, unit: "pc" }],
  royal: [{ productKey: "royal 500ml", quantity: 1, unit: "pc" }],
  sprite: [{ productKey: "sprite 500ml", quantity: 1, unit: "pc" }],
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

/** All ingredients that have a numeric portion (g or mL) for inventory report normalization */
const PORTION_INGREDIENTS: { productKey: string; portion: number }[] = (() => {
  const seen = new Map<string, number>();
  for (const ingredients of Object.values(RECIPES)) {
    for (const ing of ingredients) {
      if (ing.unit === "g" || ing.unit === "mL") {
        const key = ing.productKey.toLowerCase();
        if (!seen.has(key) || ing.quantity > (seen.get(key) ?? 0)) seen.set(key, ing.quantity);
      }
    }
  }
  return [...seen.entries()]
    .map(([productKey, portion]) => ({ productKey, portion }))
    .sort((a, b) => b.productKey.length - a.productKey.length);
})();

/**
 * Returns the POS portion size for a product (e.g. 150 for potato fries, 150 for rice)
 * when the product is a POS recipe ingredient measured in g or mL. Used so inventory
 * report values can be stored/displayed as multiples of that portion.
 */
export function getPortionSizeForProduct(productName: string): number | null {
  const nameLower = productName.toLowerCase().trim();
  if (!nameLower) return null;
  for (const { productKey, portion } of PORTION_INGREDIENTS) {
    if (nameLower.includes(productKey) || productKey.includes(nameLower)) return portion;
  }
  return null;
}
