// "use client";

// import Link from "next/link";
// import { useEffect } from "react";
// import { createClient } from "@supabase/supabase-js";
// import { supabase } from "@/lib/supabase";
// import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// export default function Inventory() {
//   useEffect(() => {
//     const subscription = supabase
//       .channel("requested_items")
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "RequestedItems" },
//         (payload) => {
//           if (Notification.permission === "granted") {
//             new Notification("New Request!", {
//               body: `Item #${payload.new.itemId} requested`,
//             });
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(subscription).catch(console.error);
//     };
//   }, []);

//   return (
//     <div className="p-4">
//       <p>This is inventory page.</p>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { rejectRequest } from "@/dal/inventory/get-requested-items";

interface RequestedItem {
  id: string;
  productNameGeneral: string;
  quantity: number;
  storeId: string;
}

interface RequestedItemWithStoreUI extends RequestedItem {
  storeUsername?: string;
}

interface InventoryDashboardLink {
  href: string;
  title: string;
  description: string;
}

const inventoryLinks: InventoryDashboardLink[] = [
  {
    href: "/inventory/add-inventory",
    title: "Add Inventory",
    description: "Create new inventory records and manage stock-in.",
  },
  {
    href: "/inventory/inventory-list",
    title: "Inventory List",
    description: "View current inventory items and details.",
  },
  {
    href: "/inventory/items",
    title: "Items",
    description: "Browse all items available in the system.",
  },
  {
    href: "/inventory/items-flow",
    title: "Items Flow",
    description: "Track item movement between stores and warehouses.",
  },
  {
    href: "/inventory/history",
    title: "History",
    description: "Review historical inventory transactions.",
  },
  {
    href: "/inventory/chats",
    title: "Chats",
    description: "Collaborate with other staff about inventory needs.",
  },
];

export default function Inventory() {
  const [notifications, setNotifications] = useState<RequestedItemWithStoreUI[]>(
    [],
  );
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [storeIdToUsername, setStoreIdToUsername] = useState<
    Record<string, string>
  >({});
  const [decisionModal, setDecisionModal] = useState<{
    open: boolean;
    itemId: string;
    productName: string;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  useEffect(() => {
    // Load existing requested items so they appear permanently
    const loadInitialRequestedItems = async () => {
      try {
        const response = await fetch("/api/inventory/requested-items");
        if (!response.ok) {
          throw new Error("Failed to load requested items");
        }
        const data: {
          success: boolean;
          items?: {
            id: string;
            productNameGeneral: string;
            quantity: number;
            storeId: string;
            storeUsername: string;
          }[];
        } = await response.json();

        if (!data.success || !data.items) return;

        const mapped: RequestedItemWithStoreUI[] = data.items.map((item) => ({
          id: item.id,
          productNameGeneral: item.productNameGeneral,
          quantity: item.quantity,
          storeId: item.storeId,
          storeUsername: item.storeUsername,
        }));

        setNotifications(mapped);
        setInitialIds(new Set(mapped.map((item) => item.id)));

        const names: Record<string, string> = {};
        for (const item of mapped) {
          if (item.storeUsername) {
            names[item.storeId] = item.storeUsername;
          }
        }
        setStoreIdToUsername((prev) => ({ ...prev, ...names }));
      } catch (error) {
        console.error("Failed to load requested items", error);
      }
    };

    void loadInitialRequestedItems();

    // Request browser notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().catch(console.error);
      }
    }

    // Subscribe to Supabase Realtime for INSERT on RequestedItems
    const subscription = supabase
      .channel("requested_items")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "RequestedItems",
        },
        async (payload: RealtimePostgresChangesPayload<RequestedItem>) => {
          console.log("[Inventory] Realtime INSERT payload:", payload);
          const raw = payload.new as RequestedItem;
          const newItem: RequestedItemWithStoreUI = {
            id: raw.id,
            productNameGeneral: raw.productNameGeneral,
            quantity: raw.quantity,
            storeId: raw.storeId,
          };
          setNotifications((prev) => [newItem, ...prev]);

          // Fetch store username via API
          try {
            const response = await fetch(
              `/api/inventory/store-username/${raw.storeId}`,
            );
            if (response.ok) {
              const data: { success: boolean; username?: string } =
                await response.json();
              if (data.success && data.username) {
                setStoreIdToUsername((prev) => ({
                  ...prev,
                  [raw.storeId]: data.username!,
                }));
                // Update the item with username
                setNotifications((prev) =>
                  prev.map((item) =>
                    item.id === raw.id
                      ? { ...item, storeUsername: data.username }
                      : item,
                  ),
                );
              }
            }
          } catch (error) {
            console.error("Failed to fetch store username", error);
          }

          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New request", {
              body: `${newItem.productNameGeneral} x${newItem.quantity}`,
            });
          }
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(subscription).catch(console.error);
    };
  }, []);

  /** Group requests by store: { storeId -> items[] }; each group = 1 request */
  const byStore = useMemo(() => {
    const map = new Map<string, RequestedItemWithStoreUI[]>();
    for (const n of notifications) {
      const list = map.get(n.storeId) ?? [];
      list.push(n);
      map.set(n.storeId, list);
    }
    return Array.from(map.entries()).map(([storeId, items]) => ({
      storeId,
      items,
    }));
  }, [notifications]);

  const totalRequests = byStore.length;
  const newRequests = byStore.filter((group) =>
    group.items.some((n) => !initialIds.has(n.id)),
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
          <p className="text-sm text-gray-600">
            Quick access to all inventory tools and real-time item requests.
          </p>
        </div>
        {totalRequests > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 text-white rounded-full px-3 py-1 text-sm font-semibold">
              {totalRequests} request
              {totalRequests !== 1 ? "s" : ""} total
            </span>
            {newRequests > 0 && (
              <span className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                {newRequests} new
              </span>
            )}
          </div>
        )}
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Inventory modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inventoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-1">{link.title}</h3>
              <p className="text-sm text-gray-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Requests (by store)</h2>
        {byStore.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {byStore.map(({ storeId, items }) => (
              <div
                key={storeId}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden"
              >
                <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {storeIdToUsername[storeId] ?? items[0]?.storeUsername ?? "Store"} · {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-center justify-between px-3 py-2 text-sm ${
                        initialIds.has(n.id)
                          ? "bg-white hover:bg-gray-50"
                          : "bg-blue-50/70"
                      }`}
                    >
                      <div>
                        <span className="font-medium">
                          {n.productNameGeneral} x{n.quantity}
                        </span>
                        {!initialIds.has(n.id) && (
                          <span className="ml-2 text-xs font-semibold text-blue-700">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded border border-red-600 text-red-700 bg-red-50 hover:bg-red-100 font-medium"
                          onClick={() =>
                            setDecisionModal({
                              open: true,
                              itemId: n.id,
                              productName: n.productNameGeneral,
                            })
                          }
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="text-xs px-2 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            try {
                              const response = await fetch(
                                `/api/inventory/requested-items/${n.id}`,
                                { method: "DELETE" },
                              );
                              if (!response.ok) {
                                throw new Error("Failed to delete request");
                              }
                              setNotifications((prev) =>
                                prev.filter((item) => item.id !== n.id),
                              );
                              setInitialIds((prev) => {
                                const next = new Set(prev);
                                next.delete(n.id);
                                return next;
                              });
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No item requests yet. They will appear here grouped by store.
          </p>
        )}
      </section>

      {/* Reject modal: note for store */}
      {decisionModal?.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!decisionSubmitting) {
              setDecisionModal(null);
              setDecisionNote("");
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Reject request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Item: <span className="font-medium text-gray-800">{decisionModal.productName}</span>. Add a note for the store (will show on their history).
            </p>
            <textarea
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Note for the store (optional)"
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                disabled={decisionSubmitting}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => {
                  setDecisionModal(null);
                  setDecisionNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={decisionSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                onClick={async () => {
                  setDecisionSubmitting(true);
                  const result = await rejectRequest([decisionModal.itemId], decisionNote);
                  setDecisionSubmitting(false);
                  if (result.success) {
                    setNotifications((prev) =>
                      prev.filter((n) => n.id !== decisionModal.itemId)
                    );
                    setInitialIds((prev) => {
                      const next = new Set(prev);
                      next.delete(decisionModal.itemId);
                      return next;
                    });
                    setDecisionModal(null);
                    setDecisionNote("");
                  }
                }}
              >
                {decisionSubmitting ? "Saving..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
