"use client";

import { useState } from "react";
import { addFoodStock } from "@/dal/inventory/add-food-stock";
import { toast } from "react-toastify";

interface ManageFoodStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageFoodStockModal({
  isOpen,
  onClose,
}: ManageFoodStockModalProps) {
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
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    "w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-amber-900";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="flex justify-between items-center bg-[var(--ltk-blue-100)] px-6 py-4 border-b border-amber-200 shrink-0">
          <h1 className="text-xl font-semibold text-amber-900">
            Manage Food Stock
          </h1>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 focus:outline-none bg-white/50 hover:bg-white p-1.5 rounded-md transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
          <form id="manage-food-stock-form" onSubmit={handleSubmit} className="space-y-4">
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
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-amber-200 shrink-0 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="manage-food-stock-form"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save Food Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
