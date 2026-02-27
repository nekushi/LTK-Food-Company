"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ItemForSale } from "@/dal/store/items-for-sale";
import {
  getItemsForSaleByStoreId,
  upsertItemForSaleForStoreId,
} from "@/dal/store/items-for-sale";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z
    .coerce.number()
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  price: z
    .coerce.number()
    .min(0, "Price cannot be negative")
    .optional()
    .default(0),
});

type FormValues = z.infer<typeof formSchema>;

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function IssueFoodStockPage() {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [items, setItems] = useState<ItemForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", quantity: 0, price: 0 },
  });

  useEffect(() => {
    const id = window.localStorage.getItem("storeId");
    setStoreId(id);

    if (!id) {
      setLoading(false);
      return;
    }

    void (async () => {
      const data = await getItemsForSaleByStoreId(id);
      setItems(data);
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!storeId) {
      alert("No store id found in localStorage. Please log in again.");
      return;
    }

    setSaving(true);
    const result = await upsertItemForSaleForStoreId({
      storeId,
      name: values.name,
      quantity: values.quantity,
      price: values.price ?? 0,
    });
    setSaving(false);

    if (!result.success) {
      alert(result.message);
      return;
    }

    const refreshed = await getItemsForSaleByStoreId(storeId);
    setItems(refreshed);
    reset({ name: "", quantity: 0, price: 0 });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">
          Issue Food Stock (Items for Sale)
        </h1>
        <p className="text-sm text-amber-800/80">
          Create or update simple items for sale using only name and quantity.
          Store is resolved from{" "}
          <span className="font-mono text-xs">localStorage.storeId</span>.
        </p>
      </div>

      {!storeId && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No <span className="font-mono">storeId</span> found in localStorage.
          Make sure you set it after login.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-amber-900">
              New / Update Item
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Bucket"
                  {...register("name")}
                  className={inputClass}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  {...register("quantity", { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Price (₱)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={saving || !storeId}
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
                Items for Sale
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
                      <th className="px-4 py-2 font-medium text-right">
                        Price
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
                        <td className="px-4 py-2 text-right text-amber-900 font-semibold">
                          ₱
                          {Number(item.price ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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

