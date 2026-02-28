"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  getItemsForSaleToday,
  sellItemForSale,
  ItemForSaleRow,
} from "@/dal/store/items-for-sale";
import { savePOSReceipt } from "@/dal/store/pos-receipts";
import { getAuth } from "@/lib/auth-storage";
import { FiSearch, FiShoppingCart, FiTrash2, FiX, FiPrinter } from "react-icons/fi";

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

interface ReceiptData {
  lines: CartLine[];
  total: number;
  count: number;
  date: string;
  storeName: string;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function POSPage() {
  const [items, setItems] = useState<ItemForSaleRow[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [modal, setModal] = useState<QuantityModal | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const qtyInputRef = useRef<HTMLInputElement>(null);

  const userId =
    typeof window !== "undefined"
      ? getAuth("userId") || ""
      : "";

  const refreshItems = useCallback(() => {
    const uid = getAuth("userId") || "";
    if (!uid) return;
    getItemsForSaleToday(uid).then((res) => {
      if (res.success) setItems(res.data);
    });
  }, []);

  useEffect(() => {
    const uid = getAuth("userId") || "";
    getItemsForSaleToday(uid).then((res) => {
      if (res.success) setItems(res.data);
      setLoading(false);
    });

    const onFocus = () => refreshItems();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshItems();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const poll = setInterval(refreshItems, 30_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(poll);
    };
  }, [refreshItems]);

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

    const soldLines = [...cart];
    const soldTotal = cartTotal;
    const soldCount = cartCount;

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
        `Sale completed! ${soldCount} item${soldCount !== 1 ? "s" : ""} — ₱${formatCurrency(soldTotal)}`,
      );

      await savePOSReceipt(
        userId,
        soldLines.map((l) => ({
          itemName: l.name,
          quantity: l.quantity,
          price: l.price,
          total: l.price * l.quantity,
        })),
      );

      const storeName = getAuth("username") || "Store";
      setReceipt({
        lines: soldLines,
        total: soldTotal,
        count: soldCount,
        date: new Date().toLocaleString(),
        storeName,
      });
    } else {
      toast.warn(`${cart.length - failed}/${cart.length} items sold`);
    }

    setCart([]);
    const refreshed = await getItemsForSaleToday(userId);
    if (refreshed.success) setItems(refreshed.data);
    setProcessing(false);
  };

  const printReceipt = useCallback(() => {
    if (!receipt) return;
    const win = window.open("", "_blank", "width=650,height=800");
    if (!win) {
      toast.error("Pop-up blocked. Please allow pop-ups to print receipts.");
      return;
    }

    const rows = receipt.lines
      .map(
        (l) =>
          `<tr>
            <td style="padding:10px 0;font-size:18px">${l.name}</td>
            <td style="padding:10px 12px;font-size:18px;text-align:center">${l.quantity}</td>
            <td style="padding:10px 0;font-size:18px;text-align:right">₱${formatCurrency(l.price)}</td>
            <td style="padding:10px 0;font-size:18px;text-align:right;font-weight:600">₱${formatCurrency(l.price * l.quantity)}</td>
          </tr>`,
      )
      .join("");

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Receipt — ${receipt.storeName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width:580px; margin:0 auto; padding:40px 30px; color:#1a1a1a; }
    .header { text-align:center; margin-bottom:28px; }
    .header h1 { font-size:28px; font-weight:700; margin-bottom:4px; }
    .header .company { font-size:16px; color:#555; margin-bottom:2px; }
    .header .date { font-size:14px; color:#888; }
    .divider { border:none; border-top:2px dashed #bbb; margin:20px 0; }
    table { width:100%; border-collapse:collapse; }
    th { font-size:14px; text-transform:uppercase; letter-spacing:0.5px; color:#888; padding-bottom:10px; border-bottom:2px solid #ddd; }
    .total-section { background:#f9f5ef; border-radius:8px; padding:16px 20px; margin-top:8px; }
    .total-section table td { font-size:22px; font-weight:700; padding:4px 0; }
    .total-section .label { color:#555; }
    .footer { text-align:center; margin-top:32px; }
    .footer p { font-size:15px; color:#888; }
    .footer .end { font-size:13px; margin-top:8px; letter-spacing:1px; color:#aaa; }
    @media print {
      body { max-width:100%; padding:20px; }
      .total-section { background:#f5f5f5; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${receipt.storeName}</h1>
    <p class="company">LTK Food Company</p>
    <p class="date">${receipt.date}</p>
  </div>
  <hr class="divider"/>
  <table>
    <thead>
      <tr>
        <th style="text-align:left">Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <hr class="divider"/>
  <div class="total-section">
    <table>
      <tr>
        <td class="label">Total (${receipt.count} item${receipt.count !== 1 ? "s" : ""})</td>
        <td style="text-align:right">₱${formatCurrency(receipt.total)}</td>
      </tr>
    </table>
  </div>
  <div class="footer">
    <p>Thank you for your purchase!</p>
    <p class="end">— END OF RECEIPT —</p>
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
  }, [receipt]);

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
                    : "No items for today. Add today's items via Issue Food Stocks."}
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
                        ₱{formatCurrency(item.price)}
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
                      {line.quantity} × ₱{formatCurrency(line.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-700 shrink-0">
                    ₱{formatCurrency(line.price * line.quantity)}
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
                ₱{formatCurrency(cartTotal)}
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
                  ₱{formatCurrency(modal.item.price)}
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
                  ₱{formatCurrency(modal.item.price * modalQty)}
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

      {/* Receipt modal */}
      {receipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setReceipt(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
              <h3 className="text-base font-semibold text-amber-900">
                Receipt
              </h3>
              <button
                onClick={() => setReceipt(null)}
                className="text-amber-400 hover:text-amber-700 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="text-center">
                <p className="text-base font-bold text-amber-900">
                  {receipt.storeName}
                </p>
                <p className="text-[11px] text-amber-500">LTK Food Company</p>
                <p className="text-[11px] text-amber-500">{receipt.date}</p>
              </div>

              <div className="border-t border-dashed border-amber-300" />

              <div className="space-y-2">
                {receipt.lines.map((line) => (
                  <div key={line.itemId} className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-amber-900">{line.name}</p>
                      <p className="text-xs text-amber-500">
                        {line.quantity} × ₱{formatCurrency(line.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-amber-900 shrink-0">
                      ₱{formatCurrency(line.price * line.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-amber-300" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-amber-900">Total ({receipt.count} items)</span>
                <span className="text-lg font-bold text-amber-900">
                  ₱{formatCurrency(receipt.total)}
                </span>
              </div>

              <div className="border-t border-dashed border-amber-300" />

              <p className="text-center text-xs text-amber-500">
                Thank you for your purchase!
              </p>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => setReceipt(null)}
                className="flex-1 rounded-lg border border-amber-300 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <FiPrinter className="text-sm" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
