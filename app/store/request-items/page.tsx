import {
  getItemsInventory,
  getItemsStore,
  ItemsReturnTypeInventory,
  ItemsReturnTypeStore,
} from "@/dal/inventory/get-items";
import { Suspense } from "react";
import StoreRequestItemPage from "./request-items";
import { MergedItemReturnTypeInventory } from "@/dal/inventory/request-items";

export default async function StoreRequestItemPageSSR() {
  // const itemsAvailable: ItemsReturnTypeStore[] = await getItemsStore();
  const itemsAvailable: ItemsReturnTypeInventory[] = await getItemsInventory();
  // const itemsAvailable: MergedItemReturnTypeInventory[] = await getItemsInventory();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreRequestItemPage items={itemsAvailable} />
    </Suspense>
  );
}
