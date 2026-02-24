"use client";

import { useMemo, useState } from "react";
import {
  getItemsInventory,
  ItemsReturnTypeInventory,
} from "@/dal/inventory/get-items";
import { ManageItemModal } from "./ManageItemModal";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

function formatPeriod(month: string, year: string): string {
  const i = parseInt(month, 10);
  if (Number.isNaN(i) || i < 1 || i > 12) return `${month}/${year}`;
  return `${MONTH_NAMES[i - 1]} ${year}`;
}

export default function InventoryItemsPage({
  items,
}: {
  items: ItemsReturnTypeInventory[];
}) {
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterProductGeneral, setFilterProductGeneral] = useState("");
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filterProductGeneral.trim()) {
        const match = item.productNameGeneral
          .toLowerCase()
          .includes(filterProductGeneral.trim().toLowerCase());
        if (!match) return false;
      }
      if (filterMonth && item.periodMonth !== filterMonth) return false;
      if (filterYear && item.periodYear !== filterYear) return false;
      return true;
    });
  }, [filterMonth, filterYear, filterProductGeneral]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    let office = 0;
    let operational = 0;
    let janitorial = 0;
    let marketing = 0;

    for (const item of filtered) {
      // Robust case-insensitive check against accountRecognition
      const rec = (item.accountRecognition || "").toLowerCase();
      if (rec.includes("office")) office++;
      else if (rec.includes("operational")) operational++;
      else if (rec.includes("janitorial")) janitorial++;
      else if (rec.includes("marketing")) marketing++;
    }

    return { total, office, operational, janitorial, marketing };
  }, [filtered]);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Items</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">
            Total items
          </span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.total}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">Office Supplies</span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.office}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">Operational Supplies</span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.operational}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">Janitorial Supplies</span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.janitorial}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">Marketing Supplies</span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.marketing}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4">
        <span className="text-sm font-medium text-amber-900">Filters</span>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="sr-only" htmlFor="filter-product-general">
              Product name (general)
            </label>
            <input
              id="filter-product-general"
              type="text"
              value={filterProductGeneral}
              onChange={(e) => setFilterProductGeneral(e.target.value)}
              placeholder="Product name (general)"
              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="filter-month">
              Period (mm)
            </label>
            <select
              id="filter-month"
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
          </div>
          <div>
            <label className="sr-only" htmlFor="filter-year">
              Period (yyyy)
            </label>
            <select
              id="filter-year"
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
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="ml-auto rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 transition"
        >
          Manage Item
        </button>
      </div>

      <div className="max-w-[1800px] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50">
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Period
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Type of stocks
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  VAT type
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Supplier
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  TIN no
                </th>
                <th className="min-w-[120px] px-5 py-4 font-semibold text-amber-900">
                  Product (general)
                </th>
                <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
                  Product (specific)
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Account recognition
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Measurement
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Qty
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Unit price
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Total price
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Vatable
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  VAT
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  EWT
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Net pay
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Item code
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-5 py-12 text-center text-amber-700"
                  >
                    No items match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item: ItemsReturnTypeInventory) => (
                  <tr
                    key={item.id}
                    className="border-b border-amber-100 hover:bg-amber-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {formatPeriod(item.periodMonth, item.periodYear)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.typeOfStocks}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.typeOfVatTaxpayer ?? "—"}
                    </td>
                    <td className="min-w-[100px] px-5 py-3 text-amber-900">
                      {item.supplierName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.tinNumber ?? "—"}
                    </td>
                    <td className="min-w-[120px] px-5 py-3 text-amber-900">
                      {item.productNameGeneral}
                    </td>
                    <td className="min-w-[140px] px-5 py-3 text-amber-900">
                      {item.productNameSpecific}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.accountRecognition}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.unitOfMeasurement}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.quantity}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.totalPrice.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.vatable.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.vat.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.ewt.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-amber-900">
                      {item.netPay.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.itemCode ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManageItemModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        inventoryItems={items}
      />
    </div>
  );
}
