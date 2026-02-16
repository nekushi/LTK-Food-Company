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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { getRequestedItemsWithStore } from "@/dal/inventory/get-requested-items";

interface RequestedItem {
  id: string; // Prisma UUID
  productNameGeneral: string;
  quantity: number;
  storeId: string;
}

type RequestedItemWithStoreUI = RequestedItem;

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

  useEffect(() => {
    // Load existing requested items so they appear permanently
    const loadInitialRequestedItems = async () => {
      try {
        const items = await getRequestedItemsWithStore();
        const mapped: RequestedItemWithStoreUI[] = items.map((item) => ({
          id: item.id,
          productNameGeneral: item.productNameGeneral,
          quantity: item.quantity,
          storeId: item.storeId,
        }));
        setNotifications(mapped);
        setInitialIds(new Set(mapped.map((item) => item.id)));
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
        (payload: RealtimePostgresChangesPayload<RequestedItem>) => {
          const newItem = payload.new as RequestedItemWithStoreUI;

          // Show browser notification
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New Item Requested!", {
              body: `Item "${newItem.productNameGeneral}" x${newItem.quantity} requested.`,
            });
          }

          // Update UI notifications
          setNotifications((prev) => [newItem, ...prev]);
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(subscription).catch(console.error);
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
          <p className="text-sm text-gray-600">
            Quick access to all inventory tools and real-time item requests.
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-gray-800 text-white rounded-full px-3 py-1 text-sm font-semibold">
              {notifications.length} total request
              {notifications.length > 1 ? "s" : ""}
            </span>
            {notifications.filter((n) => !initialIds.has(n.id)).length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                {
                  notifications.filter((n) => !initialIds.has(n.id)).length
                }{" "}
                new
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
        <h2 className="text-lg font-semibold mb-3">Requests</h2>
        {notifications.length > 0 ? (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`border p-3 rounded-md flex items-center justify-between text-sm transition-colors ${
                  initialIds.has(n.id)
                    ? "border-gray-200 bg-white hover:bg-gray-50"
                    : "border-blue-400 bg-blue-50"
                }`}
              >
                <div>
                  <div className="font-medium">
                    {n.productNameGeneral} x{n.quantity}
                  </div>
                  {!initialIds.has(n.id) && (
                    <div className="text-xs text-blue-700 font-semibold">
                      New request
                    </div>
                  )}
                  {initialIds.has(n.id) && (
                    <div className="text-xs text-gray-600">Existing request</div>
                  )}
                </div>
                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-full border border-red-500 text-red-600 hover:bg-red-50"
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
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">
            No new item requests yet. You&apos;ll see them here as they come in.
          </p>
        )}
      </section>
    </div>
  );
}
