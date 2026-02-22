"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RequestedItemHistoryEntry } from "@/dal/inventory/get-requested-items";

const Map = dynamic(() => import("@/components/delivery-map/Map"), {
  ssr: false,
});

function groupByStore(
  items: RequestedItemHistoryEntry[],
): globalThis.Map<string, RequestedItemHistoryEntry[]> {
  const map = new globalThis.Map<string, RequestedItemHistoryEntry[]>();
  for (const item of items) {
    const key = item.storeId;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export default function DeliveryClient({
  issuedItems,
}: {
  issuedItems: RequestedItemHistoryEntry[];
}) {
  const router = useRouter();
  const [boxItemIds, setBoxItemIds] = useState<Set<string>>(new Set());

  const byStore = groupByStore(issuedItems);
  const storeEntries = Array.from(byStore.entries());
  const boxItems = issuedItems.filter((item) => boxItemIds.has(item.id));
  const boxStoreName = boxItems.length > 0 ? boxItems[0].storeUsername : null;

  const addStoreToBox = (storeId: string) => {
    const items = byStore.get(storeId) ?? [];
    setBoxItemIds(new Set(items.map((i) => i.id)));
  };

  const removeFromBox = (id: string) => {
    setBoxItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleOffForDelivery = async () => {
    const ids = Array.from(boxItemIds);
    if (ids.length === 0) return;
    const res = await fetch("/api/inventory/set-delivery-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemIds: ids,
        deliveryStatus: "on the way",
      }),
    });
    if (!res.ok) return;
    setBoxItemIds(new Set());
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ltk-blue-white)]">
      <div className="border-b border-amber-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-amber-900">
          Delivery — Issued items to deliver
        </h1>
        <p className="mt-1 text-sm text-amber-800/80">
          Issued stocks by store. Add stores to the delivery box, then mark Off
          for Delivery.
        </p>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {storeEntries.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center text-amber-800">
                No issued items to deliver. Issue stocks from Items Flow first.
              </div>
            ) : (
              storeEntries.map(([storeId, items]) => {
                const storeName = items[0]?.storeUsername ?? "Store";
                const isSelectedStore = boxStoreName === storeName;
                return (
                  <div
                    key={storeId}
                    className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden"
                  >
                    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-amber-900">
                        {storeName}
                      </span>
                      <span className="text-xs text-amber-700">
                        · {items.length} item{items.length !== 1 ? "s" : ""} to
                        deliver
                      </span>
                      <button
                        type="button"
                        onClick={() => addStoreToBox(storeId)}
                        className={`ml-auto rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          isSelectedStore
                            ? "border-amber-500 bg-amber-200 text-amber-900 cursor-default"
                            : "border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
                        }`}
                      >
                        {isSelectedStore
                          ? "In delivery box"
                          : "Add to delivery box"}
                      </button>
                    </div>
                    <ul className="divide-y divide-amber-100">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3 text-sm text-amber-900"
                        >
                          <span className="font-medium">
                            {item.productNameGeneral} × {item.quantity}{" "}
                            {item.unitOfMeasurement}
                          </span>
                          {item.note && (
                            <span
                              className="text-xs text-amber-600 max-w-[200px] truncate"
                              title={item.note}
                            >
                              {item.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50/80 overflow-hidden">
              <div className="border-b border-amber-200 bg-amber-100 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-900">
                  Delivery box
                </span>
                <button
                  type="button"
                  onClick={handleOffForDelivery}
                  disabled={boxItemIds.size === 0}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Off for Delivery
                </button>
              </div>
              <ul className="divide-y divide-amber-200 max-h-[240px] overflow-y-auto">
                {boxItems.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-amber-600">
                    Add stores from the list to the delivery box.
                  </li>
                ) : (
                  boxItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-amber-900"
                    >
                      <span className="truncate">
                        {item.productNameGeneral} × {item.quantity}{" "}
                        {item.unitOfMeasurement}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromBox(item.id)}
                        className="shrink-0 text-amber-600 hover:text-amber-800 text-xs"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-sm font-medium text-amber-700">
                Destination
              </span>
              <p className="mt-1 font-semibold text-amber-900">
                {boxItems.length === 0 ? "—" : "1 store"}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-sm font-medium text-amber-700">
                Store name
              </span>
              <p className="mt-1 font-semibold text-amber-900">
                {boxStoreName ?? "—"}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-sm font-medium text-amber-700">
                Assignment
              </span>
              <p className="mt-1 font-semibold text-amber-900">
                Assigned by inventory
              </p>
            </div>
            <div className="flex-1 min-h-[200px]">
              <Map />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type Tcenter = {
  lat: number;
  lng: number;
};
