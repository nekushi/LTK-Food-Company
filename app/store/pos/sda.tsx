"use client";

import { useState, useEffect } from "react";
import type { ItemForSale } from "@/dal/store/items-for-sale";
import {
  getItemsForSaleForStore,
  upsertItemForSale,
} from "@/dal/store/items-for-sale";

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function StoreSimplePosPage() {
  const [items, setItems] = useState<ItemForSale[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const data = await getItemsForSaleForStore();
      setItems(data);
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const result = await upsertItemForSale({ name, quantity });
    setSaving(false);

    if (!result.success) {
      // simple fallback; project already uses toast elsewhere but we keep this page minimal
      alert(result.message);
      return;
    }

    const refreshed = await getItemsForSaleForStore();
    setItems(refreshed);
    setName("");
    setQuantity(0);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">
          Simple POS Items
        </h1>
        <p className="text-sm text-amber-800/80">
          Maintain a minimal list of items for sale (name and quantity only).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-amber-900">
              Add / Update Item
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Burger Meal"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={Number.isNaN(quantity) ? "" : quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Item"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
              <h2 className="text-sm font-semibold text-amber-900">
                Current Items
              </h2>
            </div>
            <div className="max-h-[480px] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-sm text-amber-700">Loading...</div>
              ) : items.length === 0 ? (
                <div className="p-6 text-sm text-amber-600/80">
                  No items yet. Add one on the left.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-white sticky top-0 border-b border-amber-100">
                    <tr className="text-amber-900">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium text-right">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-amber-50 hover:bg-amber-50/50"
                      >
                        <td className="px-4 py-2 text-amber-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-right text-amber-900 font-semibold">
                          {item.quantity}
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
    </div>
  );
}

