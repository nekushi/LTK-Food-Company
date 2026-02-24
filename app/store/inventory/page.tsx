import { Suspense } from "react";
import { getBranchInventory } from "@/dal/store/get-branch-inventory";
import BranchInventoryClient from "./branch-inventory-client";

export default async function BranchInventoryPage() {
  const inventory = await getBranchInventory();

  return (
    <Suspense
      fallback={
        <div className="p-8 text-amber-900">Loading inventory...</div>
      }
    >
      <BranchInventoryClient inventory={inventory} />
    </Suspense>
  );
}
