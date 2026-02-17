"use client";

import { useMemo, useState } from "react";
import type { RequestedItemHistoryEntry } from "@/dal/inventory/get-requested-items";
import { DUMMY_STORE_HISTORY } from "./dummyData";
import type { StoreRequestHistoryEntry } from "./types";

const STATUSES = ["Pending", "Approved", "Delivered", "Cancelled"] as const;

interface StoreHistoryClientProps {
  requestDecisions: RequestedItemHistoryEntry[];
}

export function StoreHistoryClient({ requestDecisions }: StoreHistoryClientProps) {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterItem, setFilterItem] = useState("");

  const filtered = useMemo(() => {
    return DUMMY_STORE_HISTORY.filter((entry) => {
      if (filterStatus && entry.status !== filterStatus) return false;
      if (filterItem.trim()) {
        const q = filterItem.trim().toLowerCase();
        const match =
          entry.itemName.toLowerCase().includes(q) ||
          (entry.itemCode?.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [filterStatus, filterItem]);

  const statusClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-amber-100 text-amber-800";
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

      {/* Your request decisions (from inventory: approved / rejected) */}
      {requestDecisions.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3">
            <h2 className="text-sm font-semibold text-amber-900">
              Your request decisions
            </h2>
            <p className="text-xs text-amber-700/80">
              Requests you made and whether they were approved or rejected by inventory.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/70">
                  <th className="min-w-[120px] px-5 py-3 font-semibold text-amber-900">
                    Product
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                    Qty
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                    Unit
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 font-semibold text-amber-900">
                    Status
                  </th>
                  <th className="min-w-[160px] px-5 py-3 font-semibold text-amber-900">
                    Note from inventory
                  </th>
                </tr>
              </thead>
              <tbody>
                {requestDecisions.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-amber-100 hover:bg-amber-50/50"
                  >
                    <td className="px-5 py-3 text-amber-900">
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
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                          entry.isRequestApproved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.isRequestApproved ? "Approved" : "Rejected"}
                      </span>
                    </td>
                    <td className="min-w-[160px] px-5 py-3 text-amber-900">
                      {entry.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4">
        <span className="text-sm font-medium text-amber-900">Filters</span>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
            placeholder="Item name or code"
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
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Date
                </th>
                <th className="min-w-[160px] px-5 py-4 font-semibold text-amber-900">
                  Item
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Item code
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
                <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-amber-700"
                  >
                    No requests match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry: StoreRequestHistoryEntry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-amber-100 hover:bg-amber-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.date}
                    </td>
                    <td className="min-w-[160px] px-5 py-3 text-amber-900">
                      {entry.itemName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.itemCode ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.quantity}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.unit}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClass(entry.status)}`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="min-w-[140px] px-5 py-3 text-amber-900">
                      {entry.notes ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
