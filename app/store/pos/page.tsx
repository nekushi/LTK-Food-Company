"use client";

import { useEffect, useState } from "react";
import type { ItemForSale } from "@/dal/store/items-for-sale";
import { getItemsForSaleByStoreId } from "@/dal/store/items-for-sale";
import StorePosClient from "./pos-client";

export default function StorePosPage() {
  const [items, setItems] = useState<ItemForSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storeId = window.localStorage.getItem("storeId");
    if (!storeId) {
      setLoading(false);
      return;
    }

    void (async () => {
      const data = await getItemsForSaleByStoreId(storeId);
      setItems(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-8 text-amber-900">Loading POS...</div>;
  }

  return <StorePosClient items={items} />;
}
