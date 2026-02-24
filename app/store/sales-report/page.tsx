import { Suspense } from "react";
import StoreSalesReportClient from "./sales-report";
import { getSalesReports } from "@/dal/store/sales-report";
import { getInventoryReports } from "@/dal/store/inventory-report";
import { getBranchInventory } from "@/dal/store/get-branch-inventory";

export default async function StoreSalesReportPage() {
  const [salesResult, inventoryResult, branchInventory] = await Promise.all([
    getSalesReports(),
    getInventoryReports(),
    getBranchInventory(),
  ]);

  const salesReports = salesResult.success ? salesResult.data : [];
  const inventoryReports = inventoryResult.success ? inventoryResult.data : [];

  return (
    <Suspense fallback={<div className="p-8 text-amber-900">Loading reports...</div>}>
      <StoreSalesReportClient
        initialReports={salesReports}
        initialInventoryReports={inventoryReports}
        branchInventory={branchInventory}
      />
    </Suspense>
  );
}
