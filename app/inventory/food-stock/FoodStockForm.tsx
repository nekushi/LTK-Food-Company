"use client";

import { useState } from "react";
import { addFoodStock } from "@/dal/inventory/add-food-stock";
import { toast } from "react-toastify";

export function FoodStockForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: 0,
    beginningStock: 0,
    additionalStock: 0,
    issuedStock: 0,
    status: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foodName) {
      toast.error("Food name is required");
      return;
    }

    setLoading(true);
    const result = await addFoodStock({
      foodName: formData.foodName,
      quantity: Number(formData.quantity) || 0,
      beginningStock: Number(formData.beginningStock) || 0,
      additionalStock: Number(formData.additionalStock) || 0,
      issuedStock: Number(formData.issuedStock) || 0,
      status: formData.status,
    });
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setFormData({
        foodName: "",
        quantity: 0,
        beginningStock: 0,
        additionalStock: 0,
        issuedStock: 0,
        status: "",
      });
    } else {
      toast.error(result.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    "w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-amber-900";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-start bg-[var(--ltk-blue-white)] py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Header banner */}
        <div className="bg-[var(--ltk-blue-100)] px-6 py-3">
          <h1 className="text-center text-lg font-semibold text-amber-900">
            Food Stock Form
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Food Name:</label>
            <input
              type="text"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter food name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Total Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div>
              <label className={labelClass}>Beginning Stock:</label>
              <input
                type="number"
                name="beginningStock"
                value={formData.beginningStock}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className={labelClass}>Additional Stock:</label>
              <input
                type="number"
                name="additionalStock"
                value={formData.additionalStock}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className={labelClass}>Issued Stock:</label>
              <input
                type="number"
                name="issuedStock"
                value={formData.issuedStock}
                onChange={handleChange}
                className={inputClass}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="col-span-2">
              <label className={labelClass}>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select status (optional)</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Spoiled">Spoiled</option>
                <option value="Low Stock">Low Stock</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-amber-200 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Food Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
