"use client";

import { useMemo, useState } from "react";
import type { ItemForSale, PosCheckoutLine } from "@/dal/store/items-for-sale";
import { checkoutItemsForSaleForStoreId } from "@/dal/store/items-for-sale";
import { toast } from "react-toastify";

type PosCartLine = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

export default function StorePosClient({ items }: { items: ItemForSale[] }) {
  const [cart, setCart] = useState<PosCartLine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ItemForSale | null>(null);
  const [formQuantity, setFormQuantity] = useState<number>(1);

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, line) => sum + line.quantity * (line.price ?? 0),
        0,
      ),
    [cart],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [items, searchQuery],
  );

  const openModal = (item: ItemForSale) => {
    setModalItem(item);
    setFormQuantity(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  const addToCart = () => {
    if (!modalItem) return;
    const qty = Number(formQuantity);
    if (!Number.isFinite(qty) || qty <= 0) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex((line) => line.id === modalItem.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: modalItem.id,
          name: modalItem.name,
          quantity: qty,
          price: modalItem.price,
        },
      ];
    });

    closeModal();
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    if (typeof window === "undefined") return;

    const storeId = window.localStorage.getItem("storeId");
    if (!storeId) {
      alert("No storeId in localStorage. Please log in again.");
      return;
    }

    const lines: PosCheckoutLine[] = cart.map((line) => ({
      id: line.id,
      quantity: line.quantity,
    }));

    const result = await checkoutItemsForSaleForStoreId({ storeId, lines });
    if (!result.success) {
      toast.error(result.message || "Checkout failed.");
      return;
    }

    toast.success("Checkout completed.");
    setCart([]);
    // Quantities will be reflected after next reload or navigation; a live refresh
    // can be added later if needed.
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50/50 p-4 lg:p-6 overflow-hidden">
      {/* Header Area */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Point of Sale</h1>
          <p className="text-sm text-amber-700/80 mt-1">
            Simple POS using only item name and quantity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-amber-200 bg-white pl-10 pr-4 py-2 text-sm text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-shadow"
            />
            <svg
              className="absolute left-3 top-2 h-5 w-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Items grid */}
        <div
          className="lg:col-span-8 xl:col-span-9 overflow-y-auto pr-2 rounded-xl"
          style={{ scrollbarWidth: "thin" }}
        >
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-amber-600 bg-white rounded-xl border border-amber-100 shadow-sm h-full">
              <svg
                className="w-16 h-16 text-amber-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm mt-1 text-amber-500">
                Try adjusting your search or add items for sale.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openModal(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col h-full"
                >
                  <div className="h-32 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border-b border-amber-50 p-4">
                    <span className="text-4xl">🧾</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-amber-900 leading-tight mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-medium">
                          AVAILABLE
                        </span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {item.quantity}
                        </span>
                        <span className="text-[11px] text-amber-700 mt-1 font-medium">
                          ₱
                          {Number(item.price ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-amber-200 shadow-xl flex flex-col overflow-hidden h-full min-h-[400px] lg:minh-0 relative z-10">
          <div className="p-4 border-b border-amber-100 bg-amber-50/50 shrink-0">
            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Current Cart
            </h2>
            <p className="text-xs text-amber-700/80 mt-1">
              {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 bg-gray-50/30"
            style={{ scrollbarWidth: "none" }}
          >
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-amber-600/60 p-6 text-center">
                <svg
                  className="w-12 h-12 mb-3 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <p className="text-sm font-medium text-amber-800">
                  Your cart is empty
                </p>
                <p className="text-xs mt-1">
                  Select items from the list to add them.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((line, index) => (
                  <div
                    key={line.id + index}
                    className="bg-white border border-amber-100 rounded-xl p-3 shadow-sm relative group flex items-start justify-between"
                  >
                    <div className="pr-8">
                      <p className="text-sm font-bold text-amber-900 leading-tight mb-1">
                        {line.name}
                      </p>
                      <div className="flex items-center gap-2 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium text-amber-800 w-max">
                        <span>Qty: {line.quantity}</span>
                        <span className="text-amber-400">|</span>
                        <span>
                          ₱
                          {Number(line.price ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <span className="text-amber-400">|</span>
                        <span className="font-semibold text-emerald-700">
                          ₱
                          {(line.quantity * (line.price ?? 0)).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                      title="Remove item"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-amber-100 shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-amber-900 font-medium">
              <span>Total</span>
              <span className="text-lg font-bold">
                ₱
                {cartTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={checkout}
              disabled={cart.length === 0}
              className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              <span>Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/30 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-amber-900">
              Add to cart
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={modalItem.name}
                  readOnly
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={addToCart}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Add to cart
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

