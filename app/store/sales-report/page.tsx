"use client";

import { useEffect, useState } from "react";
import StoreSalesReportClient from "./sales-report";
import { getSalesReports } from "@/dal/store/sales-report";
import { getInventoryReports } from "@/dal/store/inventory-report";
import { getBranchInventory } from "@/dal/store/get-branch-inventory";
import { getTodayPOSReceipts, getTodayPOSInventory, POSReceiptGroup, POSInventoryItem } from "@/dal/store/pos-receipts";
import { getAuth } from "@/lib/auth-storage";

export default function StoreSalesReportPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [salesReports, setSalesReports] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inventoryReports, setInventoryReports] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [branchInventory, setBranchInventory] = useState<any[]>([]);
  const [posReceipts, setPosReceipts] = useState<POSReceiptGroup[]>([]);
  const [posTotalSales, setPosTotalSales] = useState(0);
  const [posInventory, setPosInventory] = useState<POSInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth("userId") || "";
    Promise.all([
      getSalesReports(userId),
      getInventoryReports(userId),
      getBranchInventory(userId),
      getTodayPOSReceipts(userId),
      getTodayPOSInventory(userId),
    ]).then(([salesResult, inventoryResult, branchInv, posResult, posInvResult]) => {
      if (salesResult.success) setSalesReports(salesResult.data);
      if (inventoryResult.success) setInventoryReports(inventoryResult.data);
      setBranchInventory(branchInv);
      if (posResult.success) {
        setPosReceipts(posResult.data);
        setPosTotalSales(posResult.totalSales);
      }
      if (posInvResult.success) setPosInventory(posInvResult.data);
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
      posReceipts={posReceipts}
      posTotalSales={posTotalSales}
      posInventory={posInventory}
    />
  );
}
