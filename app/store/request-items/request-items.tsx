"use client";

import { Activity, useMemo, useState } from "react";
import {
  MergedItemReturnTypeInventory,
  requestItems,
} from "@/dal/inventory/request-items";
import { ItemsReturnTypeInventory } from "@/dal/inventory/get-items";
import { toast } from "react-toastify";
import { ACCOUNTING_RECOGNITION } from "@/schemas/items.schema";
import { getAuth } from "@/lib/auth-storage";

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

// type RestItemsReturnTypeInventory = {
//   periodMonth: string;
//   periodYear: string;
//   supplierName: string;
//   tinNumber: string | null;
//   typeOfVatTaxpayer: string | null;
//   typeOfStocks: string;
//   itemCode: string | null;
//   unitPrice: number;
//   totalPrice: number;
//   vatable: number;
//   vat: number;
//   ewt: number;
//   netPay: number;
// };

// interface MergedItemReturnTypeInventory extends RestItemsReturnTypeInventory {
//   id: string;
//   productNameGeneral: string;
//   accountRecognition: string;
//   unitOfMeasurement: string;
//   quantity: number;
// }

export default function StoreRequestItemPage({
  items,
}: {
  items: ItemsReturnTypeInventory[];
}) {
  const [cart, setCart] = useState<MergedItemReturnTypeInventory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAccRecognition, setFilterAccRecognition] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.productNameGeneral.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAcc = filterAccRecognition ? item.accountRecognition === filterAccRecognition : true;
      return matchSearch && matchAcc;
    });
  }, [items, searchQuery, filterAccRecognition]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState<ItemsReturnTypeInventory | null>(
    null,
  );
  const [formProductNameGeneral, setFormProductNameGeneral] = useState("");
  const [formProductNameSpecific, setFormProductNameSpecific] = useState("");
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUom, setFormUom] = useState("");
  const [formId, setFormId] = useState<string>("");
  const [formAccRecognition, setFormAccRecognition] = useState("");
  const [formPeriodMonth, setFormPeriodMonth] = useState("");
  const [formPeriodYear, setFormPeriodYear] = useState("");
  const [formSupplierName, setFormSupplierName] = useState("");
  const [formTinNumber, setFormTinNumber] = useState<string | null>();
  const [formTypeOfVatTaxpayer, setFormTypeOfVatTaxpayer] = useState<
    string | null
  >();
  const [formTypeOfStocks, setFormTypeOfStocks] = useState("");
  const [formItemCode, setFormItemCode] = useState<string | null>();
  const [formUnitPrice, setFormUnitPrice] = useState<number>(0);
  const [formTotalPrice, setFormTotalPrice] = useState<number>(0);
  const [formVatable, setFormVatable] = useState<number>(0);
  const [formVat, setFormVat] = useState<number>(0);
  const [formEwt, setFormEwt] = useState<number>(0);
  const [formNetPay, setFormNetPay] = useState<number>(0);

  // const openModal = (item: MergedItemReturnTypeInventory) => {
  const openModal = (item: ItemsReturnTypeInventory) => {
    setModalItem(item);
    setFormId(item.id);
    setFormProductNameGeneral(item.productNameGeneral);
    setFormAccRecognition(item.accountRecognition);
    setFormQuantity(1);
    setFormUom(item.unitOfMeasurement);
    setFormPeriodMonth(item.periodMonth);
    setFormPeriodYear(item.periodYear);
    setFormSupplierName(item.supplierName);
    setFormTinNumber(item.tinNumber || "");
    setFormTypeOfVatTaxpayer(item.typeOfVatTaxpayer || "");
    setFormTypeOfStocks(item.typeOfStocks);
    setFormItemCode(item.itemCode || "");
    setFormUnitPrice(item.unitPrice);
    setFormTotalPrice(item.totalPrice);
    setFormVatable(item.vatable);
    setFormVat(item.vat);
    setFormEwt(item.ewt);
    setFormNetPay(item.netPay);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalItem(null);
  };

  const addToCart = () => {
    const qty = Number(formQuantity);
    if (Number.isNaN(qty) || qty <= 0) return;

    setCart((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.id === formId);

      if (existingItemIndex !== -1) {
        // Item exists, just update the quantity
        const updatedCart = [...prev];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + qty,
        };
        return updatedCart;
      }

      // New item, add to array
      const line: MergedItemReturnTypeInventory = {
        id: formId,
        productNameGeneral:
          (formProductNameGeneral.trim() || modalItem?.productNameGeneral) ?? "",
        productNameSpecific:
          (formProductNameSpecific.trim() || modalItem?.productNameSpecific) ??
          "",
        quantity: qty,
        unitOfMeasurement: (formUom.trim() || modalItem?.unitOfMeasurement) ?? "",
        accountRecognition:
          (formAccRecognition.trim() || modalItem?.accountRecognition) ?? "",
        periodMonth: (formPeriodMonth.trim() || modalItem?.periodMonth) ?? "",
        periodYear: (formPeriodYear.trim() || modalItem?.periodYear) ?? "",
        supplierName: (formSupplierName.trim() || modalItem?.supplierName) ?? "",
        tinNumber: (formTinNumber?.trim() || modalItem?.tinNumber) ?? "",
        typeOfVatTaxpayer:
          (formTypeOfVatTaxpayer?.trim() || modalItem?.typeOfVatTaxpayer) ?? "",
        typeOfStocks: (formTypeOfStocks.trim() || modalItem?.typeOfStocks) ?? "",
        itemCode: (formItemCode?.trim() || modalItem?.itemCode) ?? "",
        unitPrice:
          (Number(formUnitPrice.toFixed(2)) || modalItem?.unitPrice) ?? 0,
        totalPrice:
          (Number(formTotalPrice.toFixed(2)) || modalItem?.totalPrice) ?? 0,
        vatable: (Number(formVatable.toFixed(2)) || modalItem?.vatable) ?? 0,
        vat: (Number(formVat.toFixed(2)) || modalItem?.vat) ?? 0,
        ewt: (Number(formEwt.toFixed(2)) || modalItem?.ewt) ?? 0,
        netPay: (Number(formNetPay.toFixed(2)) || modalItem?.netPay) ?? 0,
      };

      return [...prev, line];
    });

    toast.success("Added to cart");
    closeModal();
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const sendRequest = async () => {
    if (cart.length === 0) return;
    console.log("Send request", cart);
    const userId = getAuth("userId") || "";
    const result = await requestItems(cart, userId);

    if (result.success) {
      toast.success(result.message);
      setCart([]);
    }

    if (!result.success) {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50/50 p-4 lg:p-6 overflow-hidden">
      {/* Header Area */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Point of Sale</h1>
          <p className="text-sm text-amber-700/80 mt-1">
            Browse inventory and add items to your request cart.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-amber-200 bg-white pl-10 pr-4 py-2 text-sm text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-shadow"
            />
            <svg className="absolute left-3 top-2 h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={filterAccRecognition}
            onChange={(e) => setFilterAccRecognition(e.target.value)}
            className="w-full sm:w-48 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm text-amber-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-shadow appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {ACCOUNTING_RECOGNITION.map((rec) => (
              <option key={rec} value={rec}>
                {rec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Side: Product Grid (Takes up 8/12 cols on large screens) */}
        <div className="lg:col-span-8 xl:col-span-9 overflow-y-auto pr-2 rounded-xl" style={{ scrollbarWidth: "thin" }}>
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-amber-600 bg-white rounded-xl border border-amber-100 shadow-sm h-full">
              <svg className="w-16 h-16 text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1 text-amber-500">Try adjusting your search or filters.</p>
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
                     <span className="text-4xl">📦</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-1 line-clamp-1">
                      {item.accountRecognition}
                    </span>
                    <h3 className="text-sm font-bold text-amber-900 leading-tight mb-2 line-clamp-2">
                       {item.productNameGeneral}
                    </h3>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-medium">AVAILABLE</span>
                        <span className="text-sm font-semibold text-emerald-600">
                          {item.quantity} <span className="text-xs font-normal text-gray-500">{item.unitOfMeasurement}</span>
                        </span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-200">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Cart Sidebar (Takes up 4/12 cols on large screens) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-amber-200 shadow-xl flex flex-col overflow-hidden h-full min-h-[400px] lg:min-h-0 relative z-10">
          <div className="p-4 border-b border-amber-100 bg-amber-50/50 shrink-0">
            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
               <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
               Current Request
            </h2>
            <p className="text-xs text-amber-700/80 mt-1">{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30" style={{ scrollbarWidth: "none" }}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-amber-600/60 p-6 text-center">
                 <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                 </svg>
                 <p className="text-sm font-medium text-amber-800">Your cart is empty</p>
                 <p className="text-xs mt-1">Select products from the list to add them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((line, index) => (
                  <div key={index} className="bg-white border border-amber-100 rounded-xl p-3 shadow-sm relative group flex items-start justify-between">
                    <div className="pr-8">
                       <p className="text-sm font-bold text-amber-900 leading-tight mb-1">{line.productNameGeneral}</p>
                       <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mb-1.5">{line.accountRecognition}</p>
                       <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded text-xs font-medium text-amber-800 w-max">
                          <span>Qty: {line.quantity}</span>
                          <span className="text-amber-400">|</span>
                          <span>{line.unitOfMeasurement}</span>
                       </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-amber-100 shrink-0">
             <button
               type="button"
               onClick={sendRequest}
               disabled={cart.length === 0}
               className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
             >
               <span>Send Request</span>
               {cart.length > 0 && (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               )}
             </button>
          </div>
        </div>
      </div>

      {/* Modal form */}
      {modalOpen && (
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
                <label className={labelClass}>Product Name General</label>
                <input
                  type="text"
                  value={formProductNameGeneral}
                  readOnly
                  onChange={(e) => setFormProductNameGeneral(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Recognition</label>
                <input
                  type="text"
                  min="0.001"
                  step="any"
                  value={formAccRecognition}
                  readOnly
                  onChange={(e) => setFormAccRecognition(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Unit of measurement</label>
                <input
                  type="text"
                  value={formUom}
                  readOnly
                  onChange={(e) => setFormUom(e.target.value)}
                  className={inputClass}
                />
              </div>
              <Activity mode="hidden">
                <div>
                  <label className={labelClass}>Product Name Specific</label>
                  <input
                    type="text"
                    value={formProductNameSpecific}
                    readOnly
                    onChange={(e) => setFormProductNameGeneral(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Period Month</label>
                  <input
                    type="text"
                    value={formPeriodMonth}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Period Year</label>
                  <input
                    type="text"
                    value={formPeriodYear}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Supplier Name</label>
                  <input
                    type="text"
                    value={formSupplierName}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TIN Number</label>
                  <input
                    type="text"
                    value={formTinNumber as string}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type of Taxpayer</label>
                  <input
                    type="text"
                    value={formTypeOfVatTaxpayer as string}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type of Stocks</label>
                  <input
                    type="text"
                    value={formTypeOfStocks}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Item Code</label>
                  <input
                    type="text"
                    value={formItemCode as string}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Unit Price</label>
                  <input
                    type="text"
                    value={formUnitPrice}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Total Price</label>
                  <input
                    type="text"
                    value={formTotalPrice}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Vatable</label>
                  <input
                    type="text"
                    value={formVatable}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Vat</label>
                  <input
                    type="text"
                    value={formVat}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ewt</label>
                  <input
                    type="text"
                    value={formEwt}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Net Pay</label>
                  <input
                    type="text"
                    value={formNetPay}
                    readOnly
                    onChange={(e) => setFormUom(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </Activity>
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
