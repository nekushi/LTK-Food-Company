export const dynamic = "force-dynamic";

import { getItemsInventory, ItemsReturnTypeInventory } from "@/dal/inventory/get-items";
import InventoryItemsPage from "@/app/inventory/items/item-list";

export default async function AdminInventoryItemListPage() {
  const items: ItemsReturnTypeInventory[] = await getItemsInventory();

  return <InventoryItemsPage items={items} />;
}

