"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { FiBell, FiPackage, FiClock, FiAlertCircle, FiXCircle } from "react-icons/fi";
import {
  getStoreNotifications,
  deleteStoreNotification,
  deleteStoreNotificationsByStore,
} from "@/dal/admin/store-notifications";
import { rejectItemRequest } from "@/dal/admin/reject-item-request";
import { toast } from "react-toastify";

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

interface StoreNotif {
  id: string;
  storeId: string;
  type: string;
  message: string;
  createdAt: Date;
  store: {
    user: { username: string };
  };
}

type Tab = "notifications" | "item_requests";

export default function AdminStoreHub() {
  const [tab, setTab] = useState<Tab>("notifications");

  const [notifications, setNotifications] = useState<StoreNotif[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);

  const [requests, setRequests] = useState<RequestedItemUI[]>([]);
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  const [rejectModal, setRejectModal] = useState<{
    ids: string[];
    productName: string;
    storeName: string;
  } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    getStoreNotifications().then((data) => {
      setNotifications(data as StoreNotif[]);
      setNotifLoading(false);
    });
  }, []);

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
            const res = await fetch(`/api/inventory/store-username/${raw.storeId}`);
            if (res.ok) {
              const data: { success: boolean; username?: string } = await res.json();
              if (data.success && data.username) {
                setStoreNames((prev) => ({ ...prev, [raw.storeId]: data.username! }));
                setRequests((prev) =>
                  prev.map((r) => (r.id === raw.id ? { ...r, storeUsername: data.username } : r)),
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

  const notifByStore = useMemo(() => {
    const map = new Map<string, { storeName: string; items: StoreNotif[] }>();
    for (const n of notifications) {
      if (!map.has(n.storeId)) {
        map.set(n.storeId, { storeName: n.store.user.username, items: [] });
      }
      map.get(n.storeId)!.items.push(n);
    }
    return Array.from(map.values());
  }, [notifications]);

  const requestsByStore = useMemo(() => {
    const storeMap = new Map<
      string,
      Map<string, { quantity: number; ids: string[]; isNew: boolean; storeUsername?: string }>
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
      const items = Array.from(productMap.entries()).map(([productNameGeneral, data]) => ({
        id: data.ids[0],
        ids: data.ids,
        productNameGeneral,
        quantity: data.quantity,
        isNew: data.isNew,
        storeUsername: data.storeUsername,
      }));
      const hasNew = items.some((i) => i.isNew);
      return { storeId, items, hasNew };
    });
  }, [requests, initialIds]);

  const newRequestStores = requestsByStore.filter((g) => g.hasNew).length;

  const typeIcon = (type: string) => {
    switch (type) {
      case "item_request":
        return <FiPackage className="text-blue-500" />;
      case "attendance":
        return <FiClock className="text-emerald-500" />;
      default:
        return <FiBell className="text-amber-500" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "item_request":
        return "Item Request";
      case "attendance":
        return "Attendance";
      default:
        return "Notification";
    }
  };

  const formatTime = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleDeleteNotif = async (id: string) => {
    const result = await deleteStoreNotification(id);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleClearStoreNotifs = async (storeId: string) => {
    const result = await deleteStoreNotificationsByStore(storeId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.storeId !== storeId));
      toast.success("Notifications cleared");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setIsRejecting(true);
    try {
      const result = await rejectItemRequest(rejectModal.ids, rejectNote.trim());
      if (result.success) {
        toast.success(`Rejected "${rejectModal.productName}" from ${rejectModal.storeName}`);
        setRequests((prev) => prev.filter((r) => !rejectModal.ids.includes(r.id)));
        setRejectModal(null);
        setRejectNote("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  const tabs: { key: Tab; label: string; count: number; hasNew: boolean }[] = [
    {
      key: "notifications",
      label: "Notifications",
      count: notifications.length,
      hasNew: notifications.length > 0,
    },
    {
      key: "item_requests",
      label: "Item Requests",
      count: requestsByStore.length,
      hasNew: newRequestStores > 0,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-amber-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-amber-700 text-amber-900"
                : "border-transparent text-amber-600 hover:text-amber-800 hover:border-amber-300"
            }`}
          >
            {t.key === "notifications" ? (
              <FiBell className="text-base" />
            ) : (
              <FiPackage className="text-base" />
            )}
            {t.label}
            {t.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  tab === t.key
                    ? "bg-amber-700 text-white"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
              >
                {t.count}
              </span>
            )}
            {t.hasNew && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <>
          {notifLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-700" />
            </div>
          ) : notifByStore.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {notifByStore.map(({ storeName, items }) => (
                <div
                  key={storeName}
                  className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                      {storeName}
                      <span className="flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-600 font-medium">
                        {items.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleClearStoreNotifs(items[0].storeId)}
                        className="text-[10px] font-semibold text-red-500 hover:text-red-700 transition-colors"
                        title="Clear all notifications for this store"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                  <ul className="divide-y divide-amber-50">
                    {items.slice(0, 10).map((n) => (
                      <li key={n.id} className="px-4 py-2.5 flex items-start gap-3 text-sm group">
                        <span className="mt-0.5 text-base shrink-0">{typeIcon(n.type)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              {typeLabel(n.type)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteNotif(n.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-0.5"
                              title="Delete notification"
                            >
                              <FiXCircle className="text-sm" />
                            </button>
                          </div>
                          <p className="text-amber-900 mt-0.5 truncate">{n.message}</p>
                          <p className="text-[11px] text-amber-500 mt-0.5">
                            {formatTime(n.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                    {items.length > 10 && (
                      <li className="px-4 py-2 text-xs text-amber-500 text-center">
                        +{items.length - 10} more
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center">
              <FiBell className="mx-auto text-3xl text-amber-300 mb-3" />
              <p className="text-sm text-amber-600">
                No store notifications yet. Notifications appear when stores request items or link
                attendance data.
              </p>
            </div>
          )}
        </>
      )}

      {/* Item Requests Tab */}
      {tab === "item_requests" && (
        <>
          {requestsByStore.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
              {requestsByStore.map(({ storeId, items, hasNew }) => (
                <div
                  key={storeId}
                  className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all ${
                    hasNew ? "border-red-300 ring-1 ring-red-200" : "border-amber-200"
                  }`}
                >
                  <div
                    className={`px-4 py-3 flex items-center justify-between ${
                      hasNew
                        ? "bg-red-50 border-b border-red-200"
                        : "bg-amber-50 border-b border-amber-200"
                    }`}
                  >
                    <span className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                      {hasNew && <FiAlertCircle className="text-red-500 text-base" />}
                      {storeNames[storeId] ?? items[0]?.storeUsername ?? "Store"}
                      {hasNew && (
                        <span className="flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
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
                          <span className="text-amber-700 font-semibold">x{item.quantity}</span>
                          {item.isNew && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              New
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setRejectModal({
                                ids: item.ids,
                                productName: item.productNameGeneral,
                                storeName:
                                  storeNames[storeId] ?? item.storeUsername ?? "Store",
                              })
                            }
                            className="text-red-400 hover:text-red-600 transition-colors p-0.5"
                            title="Reject item"
                          >
                            <FiXCircle className="text-base" />
                          </button>
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
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
              <h3 className="text-base font-bold text-amber-900">Reject Item Request</h3>
              <p className="text-xs text-amber-600 mt-0.5">
                {rejectModal.productName} &mdash; {rejectModal.storeName}
              </p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <label htmlFor="reject-note" className="text-xs font-semibold text-amber-900">
                Note (optional)
              </label>
              <textarea
                id="reject-note"
                rows={3}
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Add a reason for rejection..."
                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t border-amber-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);
                  setRejectNote("");
                }}
                disabled={isRejecting}
                className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
