import { getItemsStore, ItemsReturnTypeStore } from "@/dal/inventory/get-items";
import { Suspense } from "react";
import StoreRequestItemPage from "./request-items";

export default async function StoreRequestItemPageSSR() {
  const itemsAvailable: ItemsReturnTypeStore[] = await getItemsStore();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreRequestItemPage items={itemsAvailable} />
    </Suspense>
  );
}
