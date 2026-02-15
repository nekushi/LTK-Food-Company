"use client";

import { useMemo, useState } from "react";
import { DUMMY_INVENTORY_HISTORY } from "./dummyData";
import type { InventoryHistoryEntry } from "./types";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
const months = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

export default function InventoryHistoryPage() {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterType, setFilterType] = useState<"all" | "In" | "Out">("all");
  const [filterProduct, setFilterProduct] = useState("");

  const filtered = useMemo(() => {
    return DUMMY_INVENTORY_HISTORY.filter((entry) => {
      if (filterMonth && entry.periodMonth !== filterMonth) return false;
      if (filterYear && entry.periodYear !== filterYear) return false;
      if (filterType !== "all" && entry.type !== filterType) return false;
      if (filterProduct.trim()) {
        const q = filterProduct.trim().toLowerCase();
        const match =
          entry.productNameGeneral.toLowerCase().includes(q) ||
          entry.productNameSpecific.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [filterMonth, filterYear, filterType, filterProduct]);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">History</h1>
      <p className="text-amber-800/80">
        History of in and out of products (items added / issued).
      </p>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4">
        <span className="text-sm font-medium text-amber-900">Filters</span>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            placeholder="Product name"
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/70 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "all" | "In" | "Out")
            }
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All (In/Out)</option>
            <option value="In">In</option>
            <option value="Out">Out</option>
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
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
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Type
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Stock type
                </th>
                <th className="min-w-[120px] px-5 py-4 font-semibold text-amber-900">
                  Product (general)
                </th>
                <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
                  Product (specific)
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Qty
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Unit
                </th>
                <th className="min-w-[160px] px-5 py-4 font-semibold text-amber-900">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-amber-700"
                  >
                    No history records match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry: InventoryHistoryEntry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-amber-100 hover:bg-amber-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.date}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                          entry.type === "In"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.stockType}
                    </td>
                    <td className="min-w-[120px] px-5 py-3 text-amber-900">
                      {entry.productNameGeneral}
                    </td>
                    <td className="min-w-[140px] px-5 py-3 text-amber-900">
                      {entry.productNameSpecific}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.quantity}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {entry.measurement}
                    </td>
                    <td className="min-w-[160px] px-5 py-3 text-amber-900">
                      {entry.notes}
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
