"use client";

import { useMemo, useState } from "react";
import type { RequestedItemHistoryEntry } from "@/dal/inventory/get-requested-items";

const STATUSES = ["Pending", "Approved", "On the way", "Delivered", "Rejected"] as const;

interface StoreHistoryClientProps {
  requestDecisions: RequestedItemHistoryEntry[];
}

export function StoreHistoryClient({ requestDecisions }: StoreHistoryClientProps) {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterItem, setFilterItem] = useState("");

  const getStatus = (entry: RequestedItemHistoryEntry) => {
    // If it's from the decided requests, it has a note.
    if (entry.isRequestApproved) {
      if (entry.deliveryStatus === "success") return "Delivered";
      if (entry.deliveryStatus === "on the way") return "On the way";
      return "Approved";
    }
    return "Rejected";
  };

  const filtered = useMemo(() => {
    return requestDecisions.filter((entry) => {
      const status = getStatus(entry);
      if (filterStatus && status !== filterStatus) return false;
      if (filterItem.trim()) {
        const q = filterItem.trim().toLowerCase();
        const match = entry.productNameGeneral.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [requestDecisions, filterStatus, filterItem]);

  const statusClass = (status: string) => {
    switch (status) {
      case "Delivered":
      case "success":
        return "bg-emerald-100 text-emerald-800";
      case "Approved":
      case "to be delivered":
        return "bg-blue-100 text-blue-800";
      case "On the way":
        return "bg-indigo-100 text-indigo-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">History</h1>
      <p className="text-amber-800/80">
        History of requested items and their approval status.
      </p>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4">
        <span className="text-sm font-medium text-amber-900">Filters</span>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
            placeholder="Item name"
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/70 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-[1800px] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50">
                <th className="min-w-[160px] px-5 py-4 font-semibold text-amber-900">
                  Product
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Qty
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Unit
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Status
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Delivery Status
                </th>
                <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-amber-700"
                  >
                    No requests match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => {
                  const status = getStatus(entry);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-amber-100 hover:bg-amber-50/50"
                    >
                      <td className="min-w-[160px] px-5 py-3 text-amber-900">
                        {entry.productNameGeneral}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {entry.quantity}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {entry.unitOfMeasurement}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClass(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {entry.deliveryStatus ? (
                          <span className="capitalize">{entry.deliveryStatus}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="min-w-[140px] px-5 py-3 text-amber-900">
                        {entry.note ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
