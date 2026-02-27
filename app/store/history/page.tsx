"use client";

import { useEffect, useState } from "react";
import { getRequestedItemsHistoryForStore } from "@/dal/inventory/get-requested-items";
import { StoreHistoryClient } from "./StoreHistoryClient";

export default function StoreHistoryPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requestDecisions, setRequestDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    getRequestedItemsHistoryForStore(userId).then((data) => {
      setRequestDecisions(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return <StoreHistoryClient requestDecisions={requestDecisions} />;
}
