import { Suspense } from "react";
import { ItemsFlowForm } from "./ItemsFlowForm";
import { getItemsInventory } from "@/dal/inventory/get-items";
import type { ItemsReturnTypeInventory } from "@/dal/inventory/get-items";

export default async function ItemsFlowPage() {
  const items: ItemsReturnTypeInventory[] = await getItemsInventory();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <ItemsFlowForm inventoryItems={items} />
      </Suspense>
    </div>
  );
}
