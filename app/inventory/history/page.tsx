import { Suspense } from "react";
import { getRequestedItemsHistoryForInventory } from "@/dal/inventory/get-requested-items";
import { InventoryHistoryClient } from "./InventoryHistoryClient";

export default async function InventoryHistoryPage() {
  const requestDecisions = await getRequestedItemsHistoryForInventory();

  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <InventoryHistoryClient requestDecisions={requestDecisions} />
    </Suspense>
  );
}
