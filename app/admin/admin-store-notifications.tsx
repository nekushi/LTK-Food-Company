"use client";

import { useEffect, useMemo, useState } from "react";
import { FiBell, FiPackage, FiClock } from "react-icons/fi";
import { getStoreNotifications } from "@/dal/admin/store-notifications";

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

export default function AdminStoreNotifications() {
  const [notifications, setNotifications] = useState<StoreNotif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreNotifications().then((data) => {
      setNotifications(data as StoreNotif[]);
      setLoading(false);
    });
  }, []);

  const byStore = useMemo(() => {
    const map = new Map<string, { storeName: string; items: StoreNotif[] }>();
    for (const n of notifications) {
      const key = n.storeId;
      if (!map.has(key)) {
        map.set(key, { storeName: n.store.user.username, items: [] });
      }
      map.get(key)!.items.push(n);
    }
    return Array.from(map.values());
  }, [notifications]);

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

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <FiBell className="text-amber-700" />
          Store Notifications
        </h2>
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <FiBell className="text-amber-700" />
          Store Notifications
        </h2>
        {notifications.length > 0 && (
          <span className="bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-xs font-semibold border border-amber-200">
            {notifications.length} total
          </span>
        )}
      </div>

      {byStore.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[420px] overflow-y-auto pr-1">
          {byStore.map(({ storeName, items }) => (
            <div
              key={storeName}
              className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-900">{storeName}</span>
                <span className="text-[11px] text-amber-600 font-medium">
                  {items.length} notification{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ul className="divide-y divide-amber-50">
                {items.slice(0, 10).map((n) => (
                  <li key={n.id} className="px-4 py-2.5 flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-base shrink-0">{typeIcon(n.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          {typeLabel(n.type)}
                        </span>
                      </div>
                      <p className="text-amber-900 mt-0.5 truncate">{n.message}</p>
                      <p className="text-[11px] text-amber-500 mt-0.5">{formatTime(n.createdAt)}</p>
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
            No store notifications yet. Notifications will appear when stores request items or link attendance data.
          </p>
        </div>
      )}
    </div>
  );
}
