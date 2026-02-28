"use client";

import { useEffect, useState } from "react";
import { getCurrentStore } from "@/dal/store/get-current-store";
import { getOnTheWayItemsForStore } from "@/dal/inventory/get-requested-items";
import { getAuth } from "@/lib/auth-storage";
import DeliveryRunClient from "@/app/delivery/DeliveryRunClient";

export default function StoreDeliveryViewPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [onTheWayItems, setOnTheWayItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getAuth("userId") || "";
    getCurrentStore(userId).then((store) => {
      if (store) {
        getOnTheWayItemsForStore(store.id).then((items) => {
          setOnTheWayItems(items);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-amber-900">Loading...</div>;
  }

  return (
    <div className="p-4">
      <DeliveryRunClient onTheWayItems={onTheWayItems} showControls={false} />
    </div>
  );
}
