"use client";

import { useEffect, useState } from "react";
import { getBranchInventory } from "@/dal/store/get-branch-inventory";
import { getAuth } from "@/lib/auth-storage";
import BranchInventoryClient from "./branch-inventory-client";

export default function BranchInventoryPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth("userId") || "";
    getBranchInventory(userId).then((data) => {
      setInventory(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-amber-900">Loading inventory...</div>;
  }

  return <BranchInventoryClient inventory={inventory} />;
}
