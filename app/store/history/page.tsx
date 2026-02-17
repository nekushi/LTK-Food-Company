import { Suspense } from "react";
import { getRequestedItemsHistoryForStore } from "@/dal/inventory/get-requested-items";
import { StoreHistoryClient } from "./StoreHistoryClient";

export default async function StoreHistoryPage() {
  const requestDecisions = await getRequestedItemsHistoryForStore();

  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <StoreHistoryClient requestDecisions={requestDecisions} />
    </Suspense>
  );
}
