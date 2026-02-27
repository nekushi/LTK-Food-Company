"use client";

import { useEffect, useState } from "react";
import StoreSalesReportClient from "./sales-report";
import { getSalesReports } from "@/dal/store/sales-report";
import { getInventoryReports } from "@/dal/store/inventory-report";
import { getBranchInventory } from "@/dal/store/get-branch-inventory";

export default function StoreSalesReportPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [salesReports, setSalesReports] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inventoryReports, setInventoryReports] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [branchInventory, setBranchInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    Promise.all([
      getSalesReports(userId),
      getInventoryReports(userId),
      getBranchInventory(userId),
    ]).then(([salesResult, inventoryResult, branchInv]) => {
      if (salesResult.success) setSalesReports(salesResult.data);
      if (inventoryResult.success) setInventoryReports(inventoryResult.data);
      setBranchInventory(branchInv);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-amber-900">Loading reports...</div>;
  }

  return (
    <StoreSalesReportClient
      initialReports={salesReports}
      initialInventoryReports={inventoryReports}
      branchInventory={branchInventory}
    />
  );
}
