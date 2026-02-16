import {
  getItemsInventory,
  ItemsReturnTypeInventory,
} from "@/dal/inventory/get-items";
import { Suspense } from "react";
import InventoryItemsPage from "./item-list";

export default async function InventoryItemsPageSSR() {
  const items: ItemsReturnTypeInventory[] = await getItemsInventory();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryItemsPage items={items} />
    </Suspense>
  );
}
