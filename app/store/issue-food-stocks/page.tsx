"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  upsertItemForSale,
  getItemsForSale,
  deleteItemForSale,
  ItemForSaleRow,
} from "@/dal/store/items-for-sale";
import { FiTrash2, FiPlus } from "react-icons/fi";

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function IssueFoodStocksPage() {
  const [items, setItems] = useState<ItemForSaleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formName, setFormName] = useState("");
  const [formQuantity, setFormQuantity] = useState<number>(0);
  const [formPrice, setFormPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || ""
      : "";

  useEffect(() => {
    const uid = localStorage.getItem("userId") || "";
    getItemsForSale(uid).then((res) => {
      if (res.success) setItems(res.data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (formQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (formPrice < 0) {
      toast.error("Price cannot be negative");
      return;
    }

    setSubmitting(true);
    const result = await upsertItemForSale(userId, {
      name: formName.trim(),
      quantity: formQuantity,
      price: formPrice,
      date: formDate,
    });

    if (result.success) {
      toast.success(result.message);
      setFormName("");
      setFormQuantity(0);
      setFormPrice(0);

      const refreshed = await getItemsForSale(userId);
      if (refreshed.success) setItems(refreshed.data);
    } else {
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (itemId: string) => {
    const result = await deleteItemForSale(userId, itemId);
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const totalItems = items.length;
  const totalStock = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">
          Issue Food Stocks
        </h1>
        <p className="text-amber-800/80">
          Add food items for sale. These will appear in the POS system.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
            Total Items
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {totalItems}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
            Total Stock
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {totalStock.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-500 p-5 shadow-sm text-white">
          <p className="text-xs font-medium text-amber-100 uppercase tracking-wide">
            Total Value
          </p>
          <p className="text-2xl font-bold mt-1">
            ₱
            {totalValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm h-fit">
          <h2 className="mb-4 text-sm font-semibold text-amber-900 flex items-center gap-2">
            <FiPlus className="text-amber-700" />
            Add Item for Sale
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Chicken Joy, Burger Steak"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  placeholder="0"
                  value={formQuantity || ""}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Price (₱)</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={formPrice || ""}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Saving..." : "Add to Food Stocks"}
            </button>
          </form>
        </div>

        {/* Items list */}
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col h-[520px]">
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 shrink-0">
            <h2 className="text-sm font-semibold text-amber-900">
              Current Food Stocks
            </h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="p-6 text-center text-sm text-amber-600">
                Loading...
              </p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-amber-600/80 mt-10">
                No food stocks yet. Add items using the form.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white shadow-sm border-b border-amber-200 z-10">
                  <tr className="text-amber-900 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold text-right">Qty</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Price
                    </th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Date
                    </th>
                    <th className="px-4 py-3 font-semibold w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-amber-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-amber-900 font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-amber-800 font-bold text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-emerald-700 font-bold text-right">
                        ₱
                        {item.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-amber-600 text-right text-xs">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
