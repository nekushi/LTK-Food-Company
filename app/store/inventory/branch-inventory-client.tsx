"use client";

import { useState, useMemo } from "react";

const ACCOUNT_RECOGNITIONS = [
  "Office Supplies",
  "Operational Supplies",
  "Janitorial Supplies",
  "Marketing Supplies",
  "Food Supplies",
  "Food Stock",
];

type InventoryItem = {
  id: string;
  periodMonth: string;
  periodYear: string;
  supplierName: string;
  tinNumber: string | null;
  typeOfVatTaxpayer: string | null;
  typeOfStocks: string;
  productNameSpecific: string;
  productNameGeneral: string;
  itemCode: string | null;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
  status: string | null;
};

export default function BranchInventoryClient({
  inventory,
}: {
  inventory: InventoryItem[];
}) {
  const [search, setSearch] = useState("");
  const [filterRecognition, setFilterRecognition] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const uniqueMonths = useMemo(
    () => [...new Set(inventory.map((i) => i.periodMonth))].sort(),
    [inventory],
  );

  const uniqueYears = useMemo(
    () => [...new Set(inventory.map((i) => i.periodYear))].sort((a, b) => b.localeCompare(a)),
    [inventory],
  );

  const merged = useMemo(() => {
    const map = new Map<string, InventoryItem & { _totalSpend: number }>();

    for (const item of inventory) {
      const key = `${item.productNameGeneral}::${item.typeOfVatTaxpayer ?? "none"}`;
      const existing = map.get(key);

      if (existing) {
        existing._totalSpend += item.quantity * item.unitPrice;
        existing.quantity += item.quantity;
      } else {
        map.set(key, {
          ...item,
          _totalSpend: item.quantity * item.unitPrice,
        });
      }
    }

    return Array.from(map.values()).map(({ _totalSpend, ...item }) => {
      const unitPrice = item.quantity > 0 ? _totalSpend / item.quantity : 0;
      const totalPrice = item.quantity * unitPrice;
      const isVat = item.typeOfVatTaxpayer === "VAT Registered";
      const vatable = isVat ? totalPrice / 1.12 : totalPrice;
      const vat = isVat ? totalPrice - vatable : 0;
      const ewt = isVat ? vatable * 0.01 : 0;
      const netPay = isVat ? totalPrice - ewt : totalPrice;

      return {
        ...item,
        unitPrice,
        totalPrice,
        vatable,
        vat,
        ewt,
        netPay,
      };
    });
  }, [inventory]);

  const filtered = useMemo(() => {
    return merged.filter((item) => {
      if (filterRecognition && item.accountRecognition !== filterRecognition)
        return false;
      if (filterMonth && item.periodMonth !== filterMonth) return false;
      if (filterYear && item.periodYear !== filterYear) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack =
          `${item.productNameGeneral} ${item.productNameSpecific} ${item.supplierName} ${item.itemCode ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [merged, search, filterRecognition, filterMonth, filterYear]);

  const metrics = useMemo(() => {
    let totalQty = 0;
    let totalValue = 0;
    const byRecognition: Record<string, number> = {};

    for (const item of filtered) {
      totalQty += item.quantity;
      totalValue += item.netPay;
      const rec = item.accountRecognition || "Other";
      byRecognition[rec] = (byRecognition[rec] || 0) + 1;
    }

    return { totalQty, totalValue, byRecognition };
  }, [filtered]);

  const clearFilters = () => {
    setSearch("");
    setFilterRecognition("");
    setFilterMonth("");
    setFilterYear("");
  };

  const hasActiveFilters = search || filterRecognition || filterMonth || filterYear;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">Branch Inventory</h1>
        <p className="text-amber-800/80 mt-1 text-sm">
          All active inventory items assigned to your branch.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
            Total Items
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {filtered.length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
            Total Quantity
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {metrics.totalQty.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
            Net Pay
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">
            ₱{metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
            Categories
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {Object.keys(metrics.byRecognition).length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <input
            type="text"
            placeholder="Search product name, supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <select
            value={filterRecognition}
            onChange={(e) => setFilterRecognition(e.target.value)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            {ACCOUNT_RECOGNITIONS.map((rec) => (
              <option key={rec} value={rec}>
                {rec}
              </option>
            ))}
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Months</option>
            {uniqueMonths.map((m) => (
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
            <option value="">All Years</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-amber-900">
            Inventory List
          </h2>
          <span className="text-xs font-medium text-amber-600">
            Showing {filtered.length} of {merged.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-lg font-medium text-amber-800">
                {inventory.length === 0
                  ? "No inventory found"
                  : "No items match your filters"}
              </p>
              <p className="text-sm mt-1 text-amber-600/80">
                {inventory.length === 0
                  ? "Your branch has no issued stocks yet."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white border-b border-amber-100/60 text-amber-900">
                <tr>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">VAT</th>
                  <th className="px-5 py-3 font-semibold text-right">Qty</th>
                  <th className="px-5 py-3 font-semibold">Unit</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    Unit Price
                  </th>
                  <th className="px-5 py-3 font-semibold text-right">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-amber-900">
                        {item.productNameGeneral}
                      </div>
                      <div className="text-[11px] text-amber-500">
                        {item.productNameSpecific}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full">
                        {item.accountRecognition}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                          item.typeOfVatTaxpayer === "VAT Registered"
                            ? "text-emerald-700 bg-emerald-100"
                            : "text-amber-600 bg-amber-100/60"
                        }`}
                      >
                        {item.typeOfVatTaxpayer === "VAT Registered"
                          ? "VAT"
                          : "Non-VAT"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-emerald-600 font-bold text-right">
                      {item.quantity}
                    </td>
                    <td className="px-5 py-3 text-amber-600 text-xs">
                      {item.unitOfMeasurement}
                    </td>
                    <td className="px-5 py-3 text-amber-800 text-right text-xs">
                      ₱{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-emerald-700 font-semibold text-right text-xs">
                      ₱{item.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
