"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { FiPackage, FiAlertCircle } from "react-icons/fi";

interface RequestedItem {
  id: string;
  productNameGeneral: string;
  quantity: number;
  storeId: string;
}

interface RequestedItemUI extends RequestedItem {
  storeUsername?: string;
  receivedAt: number;
}

export default function AdminLiveRequests() {
  const [requests, setRequests] = useState<RequestedItemUI[]>([]);
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const res = await fetch("/api/inventory/requested-items");
        if (!res.ok) return;
        const data: {
          success: boolean;
          items?: {
            id: string;
            productNameGeneral: string;
            quantity: number;
            storeId: string;
            storeUsername: string;
          }[];
        } = await res.json();

        if (!data.success || !data.items) return;

        const mapped: RequestedItemUI[] = data.items.map((item) => ({
          id: item.id,
          productNameGeneral: item.productNameGeneral,
          quantity: item.quantity,
          storeId: item.storeId,
          storeUsername: item.storeUsername,
          receivedAt: 0,
        }));

        setRequests(mapped);
        setInitialIds(new Set(mapped.map((i) => i.id)));

        const names: Record<string, string> = {};
        for (const item of mapped) {
          if (item.storeUsername) names[item.storeId] = item.storeUsername;
        }
        setStoreNames((prev) => ({ ...prev, ...names }));
      } catch (err) {
        console.error("Failed to load initial requests", err);
      }
    };

    void loadInitial();

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().catch(console.error);
      }
    }

    const subscription = supabase
      .channel("admin_requested_items")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "RequestedItems",
        },
        async (payload: RealtimePostgresChangesPayload<RequestedItem>) => {
          const raw = payload.new as RequestedItem;
          const newItem: RequestedItemUI = {
            id: raw.id,
            productNameGeneral: raw.productNameGeneral,
            quantity: raw.quantity,
            storeId: raw.storeId,
            receivedAt: Date.now(),
          };
          setRequests((prev) => [newItem, ...prev]);

          try {
            const res = await fetch(
              `/api/inventory/store-username/${raw.storeId}`,
            );
            if (res.ok) {
              const data: { success: boolean; username?: string } =
                await res.json();
              if (data.success && data.username) {
                setStoreNames((prev) => ({
                  ...prev,
                  [raw.storeId]: data.username!,
                }));
                setRequests((prev) =>
                  prev.map((r) =>
                    r.id === raw.id
                      ? { ...r, storeUsername: data.username }
                      : r,
                  ),
                );
              }
            }
          } catch (err) {
            console.error("Failed to fetch store username", err);
          }

          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("New Item Request", {
              body: `${newItem.productNameGeneral} x${newItem.quantity}`,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription).catch(console.error);
    };
  }, []);

  const byStore = useMemo(() => {
    const storeMap = new Map<
      string,
      Map<
        string,
        { quantity: number; ids: string[]; isNew: boolean; storeUsername?: string }
      >
    >();

    for (const r of requests) {
      if (!storeMap.has(r.storeId)) storeMap.set(r.storeId, new Map());
      const productMap = storeMap.get(r.storeId)!;

      const existing = productMap.get(r.productNameGeneral);
      if (existing) {
        existing.quantity += r.quantity;
        existing.ids.push(r.id);
        if (!initialIds.has(r.id)) existing.isNew = true;
      } else {
        productMap.set(r.productNameGeneral, {
          quantity: r.quantity,
          ids: [r.id],
          isNew: !initialIds.has(r.id),
          storeUsername: r.storeUsername,
        });
      }
    }

    return Array.from(storeMap.entries()).map(([storeId, productMap]) => {
      const items = Array.from(productMap.entries()).map(
        ([productNameGeneral, data]) => ({
          id: data.ids[0],
          productNameGeneral,
          quantity: data.quantity,
          isNew: data.isNew,
          storeUsername: data.storeUsername,
        }),
      );
      const hasNew = items.some((i) => i.isNew);
      return { storeId, items, hasNew };
    });
  }, [requests, initialIds]);

  const totalRequests = byStore.length;
  const newRequests = byStore.filter((g) => g.hasNew).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <FiPackage className="text-amber-700" />
          Live Item Requests
          {newRequests > 0 && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {totalRequests > 0 && (
            <span className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-xs font-semibold border border-amber-200">
              {totalRequests} store{totalRequests !== 1 ? "s" : ""}
            </span>
          )}
          {newRequests > 0 && (
            <span className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-semibold border border-red-200 animate-pulse">
              {newRequests} new
            </span>
          )}
        </div>
      </div>

      {byStore.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
          {byStore.map(({ storeId, items, hasNew }) => (
            <div
              key={storeId}
              className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all ${
                hasNew
                  ? "border-red-300 ring-1 ring-red-200"
                  : "border-amber-200"
              }`}
            >
              <div
                className={`px-4 py-3 flex items-center justify-between ${
                  hasNew ? "bg-red-50 border-b border-red-200" : "bg-amber-50 border-b border-amber-200"
                }`}
              >
                <span className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                  {hasNew && <FiAlertCircle className="text-red-500 text-base" />}
                  {storeNames[storeId] ?? items[0]?.storeUsername ?? "Store"}
                </span>
                <span className="text-[11px] text-amber-600 font-medium">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="divide-y divide-amber-50">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`px-4 py-2.5 flex items-center justify-between text-sm ${
                      item.isNew ? "bg-red-50/50" : ""
                    }`}
                  >
                    <span className="text-amber-900 font-medium truncate mr-3">
                      {item.productNameGeneral}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-700 font-semibold">
                        x{item.quantity}
                      </span>
                      {item.isNew && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center">
          <FiPackage className="mx-auto text-3xl text-amber-300 mb-3" />
          <p className="text-sm text-amber-600">
            No pending item requests. New requests from stores will appear here in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
