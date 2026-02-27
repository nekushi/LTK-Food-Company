"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  getItemsForSale,
  sellItemForSale,
  ItemForSaleRow,
} from "@/dal/store/items-for-sale";
import { FiSearch, FiShoppingCart, FiTrash2, FiX } from "react-icons/fi";

interface CartLine {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
}

interface QuantityModal {
  item: ItemForSaleRow;
  existingQty: number;
}

export default function POSPage() {
  const [items, setItems] = useState<ItemForSaleRow[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [modal, setModal] = useState<QuantityModal | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const qtyInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (modal && qtyInputRef.current) {
      qtyInputRef.current.focus();
      qtyInputRef.current.select();
    }
  }, [modal]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  const openQuantityModal = (item: ItemForSaleRow) => {
    const existing = cart.find((c) => c.itemId === item.id);
    setModal({ item, existingQty: existing?.quantity ?? 0 });
    setModalQty(1);
  };

  const confirmAddToCart = () => {
    if (!modal) return;
    const { item, existingQty } = modal;
    const totalQty = existingQty + modalQty;

    if (totalQty > item.quantity) {
      toast.error(`Only ${item.quantity - existingQty} more available`);
      return;
    }
    if (modalQty <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item.id);
      if (existing) {
        return prev.map((c) =>
          c.itemId === item.id
            ? { ...c, quantity: c.quantity + modalQty }
            : c,
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          price: item.price,
          quantity: modalQty,
          maxStock: item.quantity,
        },
      ];
    });

    setModal(null);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, c) => sum + c.price * c.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart],
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    let failed = 0;
    for (const line of cart) {
      const result = await sellItemForSale(userId, line.itemId, line.quantity);
      if (!result.success) {
        toast.error(`${line.name}: ${result.message}`);
        failed++;
      }
    }

    if (failed === 0) {
      toast.success(
        `Sale completed! ${cartCount} item${cartCount !== 1 ? "s" : ""} — ₱${cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      );
    } else {
      toast.warn(`${cart.length - failed}/${cart.length} items sold`);
    }

    setCart([]);
    const refreshed = await getItemsForSale(userId);
    if (refreshed.success) setItems(refreshed.data);
    setProcessing(false);
  };

  const availableForModal = modal
    ? modal.item.quantity - modal.existingQty
    : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-3">
        <h1 className="text-xl font-semibold text-amber-900">
          Point of Sale
        </h1>
        <p className="text-amber-800/80 text-sm">
          Tap an item to add it to your cart.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Product grid */}
        <div className="col-span-8 flex flex-col border-r border-amber-200 overflow-hidden">
          <div className="px-6 py-3 border-b border-amber-100">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-white pl-10 pr-3 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <p className="text-center text-amber-600 mt-20">Loading...</p>
            ) : filteredItems.length === 0 ? (
              <div className="text-center mt-20">
                <p className="text-amber-600/80">
                  {searchQuery
                    ? "No items match your search."
                    : "No items for sale. Add items via Issue Food Stocks."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const inCart = cart.find((c) => c.itemId === item.id);
                  const remaining = item.quantity - (inCart?.quantity ?? 0);
                  return (
                    <button
                      key={item.id}
                      onClick={() => openQuantityModal(item)}
                      disabled={remaining <= 0}
                      className={`group relative rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                        remaining <= 0
                          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                          : inCart
                            ? "border-amber-400 bg-amber-50 ring-1 ring-amber-300"
                            : "border-amber-200 bg-white hover:border-amber-300"
                      }`}
                    >
                      <p className="text-sm font-semibold text-amber-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-lg font-bold text-emerald-700 mt-1">
                        ₱{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-amber-500 mt-1">
                        Stock: {item.quantity}
                        {inCart && (
                          <span className="text-amber-700 font-medium">
                            {" "}· In cart: {inCart.quantity}
                          </span>
                        )}
                      </p>
                      {inCart && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart (read-only list) */}
        <div className="col-span-4 flex flex-col bg-amber-50/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-200 flex items-center gap-2">
            <FiShoppingCart className="text-amber-700 text-lg" />
            <h2 className="text-sm font-semibold text-amber-900">Cart</h2>
            {cartCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {cart.length === 0 ? (
              <p className="text-center text-sm text-amber-500 mt-16">
                Tap an item to add it here.
              </p>
            ) : (
              cart.map((line) => (
                <div
                  key={line.itemId}
                  className="rounded-lg border border-amber-200 bg-white px-4 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-amber-900 truncate">
                      {line.name}
                    </p>
                    <p className="text-xs text-amber-600">
                      {line.quantity} × ₱{line.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 shrink-0">
                    ₱{(line.price * line.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => removeFromCart(line.itemId)}
                    className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                    title="Remove"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout footer */}
          <div className="border-t border-amber-200 bg-white px-5 py-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-700">Total</span>
              <span className="text-xl font-bold text-amber-900">
                ₱{cartTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || processing}
              className="w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {processing
                ? "Processing..."
                : cart.length === 0
                  ? "Add items to cart"
                  : `Checkout (${cartCount} item${cartCount !== 1 ? "s" : ""})`}
            </button>
          </div>
        </div>
      </div>

      {/* Quantity popup modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
              <h3 className="text-base font-semibold text-amber-900">
                Add to Cart
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-amber-400 hover:text-amber-700 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div>
                <p className="text-lg font-bold text-amber-900">
                  {modal.item.name}
                </p>
                <p className="text-emerald-700 font-semibold">
                  ₱{modal.item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-amber-500 mt-1">
                  Available: {availableForModal}
                  {modal.existingQty > 0 && (
                    <span className="text-amber-700 font-medium">
                      {" "}(already {modal.existingQty} in cart)
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-amber-900">
                  Quantity
                </label>
                <input
                  ref={qtyInputRef}
                  type="number"
                  min={1}
                  max={availableForModal}
                  step={1}
                  value={modalQty}
                  onChange={(e) => setModalQty(Math.max(1, Number(e.target.value)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmAddToCart();
                  }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-amber-600">Subtotal</span>
                <span className="text-lg font-bold text-amber-900">
                  ₱{(modal.item.price * modalQty).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={confirmAddToCart}
                disabled={modalQty <= 0 || modalQty > availableForModal}
                className="w-full rounded-lg bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Add {modalQty} to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
