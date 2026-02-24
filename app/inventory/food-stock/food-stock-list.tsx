"use client";

import { useState, useMemo } from "react";
import { ManageFoodStockModal } from "./ManageFoodStockModal";

interface FoodStockListProps {
  items: any[]; // Using any to sidestep TS typing issues since prisma client isn't fully synced
}

export function FoodStockList({ items }: FoodStockListProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const query = filterQuery.toLowerCase();
      return (
        item.productNameGeneral?.toLowerCase().includes(query) ||
        item.typeOfStocks?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    });
  }, [items, filterQuery]);

  const thClass =
    "border-b border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-amber-900";
  const tdClass =
    "whitespace-nowrap border-b border-amber-100 px-4 py-3 text-sm text-amber-900";

  return (
    <div className="flex min-h-full flex-col p-4 sm:p-6 lg:p-8 bg-[var(--ltk-blue-gray)]">
      {/* Header & Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Food Stock</h1>
          <p className="mt-1 text-sm text-amber-700">
            Manage your food inventory beginning stocks, additional stocks, and issuances.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1 max-w-sm">
          <label className="sr-only">Search</label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-amber-500/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-amber-200 py-2 pl-10 pr-3 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-sm text-amber-900 placeholder:text-amber-500/60"
              placeholder="Search by name, type, or status..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition"
        >
          Manage Food Stock
        </button>
      </div>

      {/* Table */}
      <div className="max-w-[1800px] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse bg-white">
            <thead>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Food Name</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Quantity</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 bg-white">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-amber-50/50 transition-colors"
                >
                  <td className={tdClass}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`${tdClass} font-medium`}>
                    {item.productNameGeneral}
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.typeOfStocks === "Beginning Stocks"
                          ? "bg-blue-100 text-blue-800"
                          : item.typeOfStocks === "Additional Stocks"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {item.typeOfStocks}
                    </span>
                  </td>
                  <td className={tdClass}>{item.quantity}</td>
                  <td className={tdClass}>
                    {item.status ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {item.status}
                      </span>
                    ) : (
                      <span className="text-amber-500/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-amber-700"
                  >
                    No food stock entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManageFoodStockModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </div>
  );
}
