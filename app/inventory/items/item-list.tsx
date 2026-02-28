"use client";

import { useMemo, useState } from "react";
import {
  getItemsInventory,
  ItemsReturnTypeInventory,
} from "@/dal/inventory/get-items";
import { ManageItemModal } from "./ManageItemModal";
import { ACCOUNTING_RECOGNITION_ITEM_LIST } from "@/schemas/items.schema";

/** Map stored accountRecognition to the 2 display categories (Dry / Raw). */
function toItemListCategory(
  rec: string | null,
): "Dry materials" | "Raw materials" {
  const r = (rec ?? "").toLowerCase();
  if (r.includes("food")) return "Raw materials";
  return "Dry materials";
}

export default function InventoryItemsPage({
  items,
  simplifiedForm = false,
}: {
  items: ItemsReturnTypeInventory[];
  simplifiedForm?: boolean;
}) {
  const [filterAccountRecognition, setFilterAccountRecognition] = useState("");
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
      if (
        filterAccountRecognition &&
        toItemListCategory(item.accountRecognition) !== filterAccountRecognition
      )
        return false;
      return true;
    });
  }, [items, filterProductGeneral, filterAccountRecognition]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    let dry = 0;
    let raw = 0;
    for (const item of filtered) {
      if (toItemListCategory(item.accountRecognition) === "Raw materials")
        raw++;
      else dry++;
    }
    return { total, dry, raw };
  }, [filtered]);

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Items</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">
            Total items
          </span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.total}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">
            Dry materials
          </span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.dry}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
          <span className="text-sm font-medium text-amber-700">
            Raw materials
          </span>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {metrics.raw}
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
            <label className="sr-only" htmlFor="filter-account-recognition">
              Account Recognition
            </label>
            <select
              id="filter-account-recognition"
              value={filterAccountRecognition}
              onChange={(e) => setFilterAccountRecognition(e.target.value)}
              className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">All</option>
              {ACCOUNTING_RECOGNITION_ITEM_LIST.map((rec) => (
                <option key={rec} value={rec}>
                  {rec}
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
                  Date
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Type of stocks
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
                  Total price
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
                    colSpan={11}
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
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.typeOfStocks}
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
                      {toItemListCategory(item.accountRecognition)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.unitOfMeasurement}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                      {item.quantity}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-amber-900">
                      {item.totalPrice.toFixed(2)}
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
        simplifiedForm={simplifiedForm}
      />
    </div>
  );
}
