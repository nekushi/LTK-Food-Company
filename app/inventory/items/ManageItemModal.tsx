"use client";

import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ACCOUNTING_RECOGNITION,
  itemsFlowSchema,
  MEASUREMENTS,
  MONTH_NAMES,
  STOCK_TYPES,
  VAT_TYPES,
} from "@/schemas/items.schema";
import { addItems, addAdditionalStock } from "@/dal/inventory/add-item";
import {
  getApprovedRequestedItems,
  issueStock,
  MergedItemReturnTypeInventoryWithStore,
} from "@/dal/inventory/get-requested-items";
import { toast } from "react-toastify";
import type { ItemsReturnTypeInventory } from "@/dal/inventory/get-items";

export type ItemsFlowFormValues = z.infer<typeof itemsFlowSchema>;

function computeDerived(
  quantity: number,
  unitPrice: number,
  isVatRegistered: boolean,
) {
  const totalPrice = quantity * unitPrice;
  if (!isVatRegistered) {
    return {
      totalPrice,
      vatable: totalPrice,
      vat: 0,
      ewt: 0,
      netPay: totalPrice,
    };
  }
  const vatable = totalPrice / 1.12;
  const vat = totalPrice - vatable;
  const ewt = vatable * 0.01;
  const netPay = totalPrice - ewt;
  return { totalPrice, vatable, vat, ewt, netPay };
}

interface ManageItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItems: ItemsReturnTypeInventory[];
}

export function ManageItemModal({
  isOpen,
  onClose,
  inventoryItems,
}: ManageItemModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemsFlowFormValues>({
    resolver: zodResolver(itemsFlowSchema) as Resolver<ItemsFlowFormValues>,
    defaultValues: {
      periodMonth: "",
      periodDate: "",
      periodYear: "",
      typeOfStocks: "Beginning Stocks",
      typeOfVatTaxpayer: "VAT Registered",
      supplierName: "",
      tinNo: "",
      productNameSpecific: "",
      productNameGeneral: "",
      itemCode: "",
      accountingRecognition: "Office Supplies",
      measurement: "",
      quantity: 0,
      unitPrice: 0,
    },
  });

  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");
  const typeOfStocks = watch("typeOfStocks");
  const typeOfVatTaxpayer = watch("typeOfVatTaxpayer");
  const accountingRecognition = watch("accountingRecognition");
  const showVatTin = typeOfStocks !== "Issued Stocks";
  const isVatRegistered = typeOfVatTaxpayer === "VAT Registered";
  const isIssuedStocks = typeOfStocks === "Issued Stocks";
  const isFoodSupplies = accountingRecognition === "Food Supplies";
  const derived = computeDerived(
    Number(quantity) || 0,
    Number(unitPrice) || 0,
    isVatRegistered,
  );

  const [requestedItems, setRequestedItems] = useState<
    MergedItemReturnTypeInventoryWithStore[]
  >([]);
  const [selectedRequestedItemId, setSelectedRequestedItemId] = useState<
    string | null
  >(null);
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<
    string | null
  >(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  const isAdditionalStocks = typeOfStocks === "Additional Stocks";

  const additionalStockBaseItems = inventoryItems.filter(
    (item) =>
      item.typeOfStocks === "Beginning Stocks" ||
      item.typeOfStocks === "Additional Stocks",
  );

  const handleTypeOfStocksChange = async (value: string) => {
    if (value === "Issued Stocks") {
      const items = await getApprovedRequestedItems();
      setRequestedItems(items);
      setSelectedInventoryItemId(null);
    } else if (value === "Additional Stocks") {
      setRequestedItems([]);
      setSelectedRequestedItemId(null);
      setSelectedInventoryItemId(null);
    } else {
      setRequestedItems([]);
      setSelectedRequestedItemId(null);
      setSelectedInventoryItemId(null);
    }
  };

  const onSubmit = async (data: ItemsFlowFormValues) => {
    if (isIssuedStocks && selectedRequestedItemId) {
      setIssueModalOpen(true);
      return;
    }

    if (isAdditionalStocks && selectedInventoryItemId) {
      const result = await addAdditionalStock(selectedInventoryItemId, data);

      if (result.success === "success") {
        toast.success(result.message);
        reset();
        onClose();
      } else if (result.success === "validation_error") {
        toast.error("Validation error when adding additional stock.");
      } else {
        toast.error(result.message ?? "Something went wrong");
      }
      return;
    }

    const payload = { ...data, ...derived };
    const row: z.infer<typeof itemsFlowSchema> = { ...data };
    console.log("Items flow submit", payload);
    const result = await addItems(row);

    if (result.success === "success") {
      toast.success(result.message);
      reset();
      onClose();
    }
  };

  const handleIssueStock = async () => {
    if (!selectedRequestedItemId) return;
    setIssueSubmitting(true);
    const result = await issueStock(selectedRequestedItemId, issueNote);
    setIssueSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      setIssueModalOpen(false);
      setIssueNote("");
      setSelectedRequestedItemId(null);
      reset();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const monthValues = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const dateValues = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  const inputClass =
    "w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-amber-900";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center bg-[var(--ltk-blue-100)] px-6 py-4 border-b border-amber-200 shrink-0">
          <h2 className="text-xl font-semibold text-amber-900">Manage Item</h2>
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

        {/* Form Body - Scrollable */}
        <div className="overflow-y-auto p-6" style={{ scrollbarWidth: "thin" }}>
          <form id="manage-item-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex gap-3 border-b border-amber-100 pb-4">
                  <div className="flex-1">
                    <label className={labelClass}>Month</label>
                    <select {...register("periodMonth")} className={inputClass}>
                      <option value="">Month</option>
                      {monthValues.map((m, i) => (
                        <option key={m} value={m}>
                          {MONTH_NAMES[i]}
                        </option>
                      ))}
                    </select>
                    {errors.periodMonth && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.periodMonth.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Date</label>
                    <select {...register("periodDate")} className={inputClass}>
                      <option value="">Date</option>
                      {dateValues.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    {errors.periodDate && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.periodDate.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>Year</label>
                    <select {...register("periodYear")} className={inputClass}>
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                    {errors.periodYear && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.periodYear.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-b border-amber-100 pb-4">
                  <span className={labelClass}>Type of Stocks:</span>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {STOCK_TYPES.map((value) => {
                      const { onChange, ...registerProps } =
                        register("typeOfStocks");
                      return (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center p-2 rounded border border-amber-100 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
                        >
                          <input
                            type="radio"
                            {...registerProps}
                            value={value}
                            onChange={(e) => {
                              onChange(e);
                              handleTypeOfStocksChange(e.target.value);
                            }}
                            className="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500 mr-2"
                          />
                          <span className="text-sm text-amber-900">{value}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Account Recognition:</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {ACCOUNTING_RECOGNITION.map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center text-sm text-amber-900"
                      >
                        <input
                          type="radio"
                          {...register("accountingRecognition")}
                          value={value}
                          className="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500 mr-2"
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <span className={labelClass}>Type of VAT-Taxpayer:</span>
                  <div className="mt-1.5 flex gap-6">
                    {VAT_TYPES.map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-amber-900"
                      >
                        <input
                          type="radio"
                          {...register("typeOfVatTaxpayer")}
                          value={value}
                          className="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                  {errors.typeOfVatTaxpayer && showVatTin && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.typeOfVatTaxpayer.message}
                    </p>
                  )}
                </div>

                {isIssuedStocks && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <label className={labelClass}>Select Requested Item:</label>
                    <select
                      value={selectedRequestedItemId || ""}
                      onChange={(e) => {
                        const itemId = e.target.value;
                        setSelectedRequestedItemId(itemId || null);
                        const item = requestedItems.find((i) => i.id === itemId);
                        if (item) {
                          setValue("supplierName", item.supplierName || "");
                          setValue("tinNo", item.tinNumber || "");
                          setValue("productNameSpecific", item.productNameSpecific || "");
                          setValue("productNameGeneral", item.productNameGeneral || "");
                          setValue("itemCode", item.itemCode || "");
                          setValue("measurement", item.unitOfMeasurement || "");
                          setValue("quantity", item.quantity || 0);
                          setValue("unitPrice", item.unitPrice || 0);

                          if (item.typeOfVatTaxpayer) {
                            const vatType = item.typeOfVatTaxpayer as (typeof VAT_TYPES)[number];
                            if (VAT_TYPES.includes(vatType)) setValue("typeOfVatTaxpayer", vatType);
                          }

                          if (
                            item.accountRecognition &&
                            ACCOUNTING_RECOGNITION.includes(
                              item.accountRecognition as (typeof ACCOUNTING_RECOGNITION)[number],
                            )
                          ) {
                            setValue(
                              "accountingRecognition",
                              item.accountRecognition as (typeof ACCOUNTING_RECOGNITION)[number],
                            );
                          }
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="">Select a requested item...</option>
                      {requestedItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.productNameGeneral} x{item.quantity}{" "}
                          {item.unitOfMeasurement} (Store: {item.storeUsername})
                        </option>
                      ))}
                    </select>
                    {selectedRequestedItemId && (
                      <p className="mt-1.5 text-xs text-amber-700 font-medium">
                        Selected item will be issued from inventory.
                      </p>
                    )}
                  </div>
                )}
                
                {isAdditionalStocks && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <label className={labelClass}>
                      Select Inventory Item (Beginning or Additional filter):
                    </label>
                    <select
                      value={selectedInventoryItemId || ""}
                      onChange={(e) => {
                        const itemId = e.target.value;
                        setSelectedInventoryItemId(itemId || null);
                        const item = additionalStockBaseItems.find(
                          (i) => i.id === itemId,
                        );
                        if (item) {
                          setValue("periodMonth", item.periodMonth || "");
                          // We might not have periodDate on existing records since it's newly added
                          setValue("periodDate", dateValues[0]);
                          setValue("periodYear", item.periodYear || "");
                          setValue("typeOfStocks", "Additional Stocks");
                          setValue("supplierName", item.supplierName || "");
                          setValue("tinNo", item.tinNumber || "");
                          setValue("productNameSpecific", item.productNameSpecific || "");
                          setValue("productNameGeneral", item.productNameGeneral || "");
                          setValue("itemCode", item.itemCode || "");
                          setValue("measurement", item.unitOfMeasurement || "");
                          setValue("quantity", 1);
                          setValue("unitPrice", item.unitPrice || 0);

                          if (item.typeOfVatTaxpayer) {
                            const vatType = item.typeOfVatTaxpayer as (typeof VAT_TYPES)[number];
                            if (VAT_TYPES.includes(vatType)) setValue("typeOfVatTaxpayer", vatType);
                          }

                          if (
                            item.accountRecognition &&
                            ACCOUNTING_RECOGNITION.includes(
                              item.accountRecognition as (typeof ACCOUNTING_RECOGNITION)[number],
                            )
                          ) {
                            setValue(
                              "accountingRecognition",
                              item.accountRecognition as (typeof ACCOUNTING_RECOGNITION)[number],
                            );
                          }
                        }
                      }}
                      className={inputClass}
                    >
                      <option value="">Select beginning or additional stock item...</option>
                      {additionalStockBaseItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.productNameGeneral} x{item.quantity}{" "}
                          {item.unitOfMeasurement}
                        </option>
                      ))}
                    </select>
                    {selectedInventoryItemId && (
                      <p className="mt-1.5 text-xs text-amber-700 font-medium">
                        Selected item will have its stock increased.
                      </p>
                    )}
                  </div>
                )}

                {!isAdditionalStocks && !isIssuedStocks && (
                  <div className={`grid ${showVatTin && !isFoodSupplies ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                    <div>
                      <label className={labelClass}>Supplier Name:</label>
                      <input
                        type="text"
                        {...register("supplierName")}
                        className={inputClass}
                        placeholder="Enter Supplier Name"
                      />
                      {errors.supplierName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.supplierName.message}
                        </p>
                      )}
                    </div>

                    {showVatTin && !isFoodSupplies && (
                      <div>
                        <label className={labelClass}>TIN no:</label>
                        <input
                          type="text"
                          {...register("tinNo")}
                          className={inputClass}
                          placeholder="Enter Tin no. (opt)"
                        />
                        {errors.tinNo && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.tinNo.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4 pt-4 lg:pt-0">
                {(isAdditionalStocks || isIssuedStocks) && (
                  <div className={`grid ${showVatTin && !isFoodSupplies ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                    <div>
                      <label className={labelClass}>
                        {isIssuedStocks ? "Branch:" : "Supplier Name:"}
                      </label>
                      <input
                        type="text"
                        {...register("supplierName")}
                        className={inputClass}
                        placeholder={isIssuedStocks ? "Enter Branch" : "Enter Supplier Name"}
                      />
                      {errors.supplierName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.supplierName.message}
                        </p>
                      )}
                    </div>

                    {showVatTin && !isFoodSupplies && (
                      <div>
                        <label className={labelClass}>TIN no:</label>
                        <input
                          type="text"
                          {...register("tinNo")}
                          className={inputClass}
                          placeholder="Enter Tin no. (opt)"
                        />
                        {errors.tinNo && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.tinNo.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!isIssuedStocks && !isAdditionalStocks && (
                  <>
                    <div>
                      <label className={labelClass}>Product Name (General):</label>
                      <input
                        type="text"
                        {...register("productNameGeneral")}
                        className={inputClass}
                        placeholder="Enter general product name"
                      />
                      {errors.productNameGeneral && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.productNameGeneral.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Product Name (Specific):</label>
                      <input
                        type="text"
                        {...register("productNameSpecific")}
                        className={inputClass}
                        placeholder="Enter specific product name"
                      />
                      {errors.productNameSpecific && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.productNameSpecific.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className={`grid ${!isFoodSupplies ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
                  {!isFoodSupplies && (
                    <div>
                      <label className={labelClass}>Item Code:</label>
                      <input
                        type="text"
                        {...register("itemCode")}
                        className={inputClass}
                        placeholder="Item code (opt)"
                      />
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Unit of Measurement:</label>
                    <input
                      list="measurements-list-modal"
                      {...register("measurement")}
                      className={inputClass}
                      placeholder="Enter unit"
                    />
                    <datalist id="measurements-list-modal">
                      {MEASUREMENTS.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                    {errors.measurement && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.measurement.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Quantity:</label>
                    <input
                      type="number"
                      step="any"
                      {...register("quantity")}
                      className={inputClass}
                      placeholder="0"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Unit Price (₱):</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("unitPrice")}
                      className={inputClass}
                      placeholder="0.00"
                    />
                    {errors.unitPrice && (
                      <p className="mt-1 text-xs text-red-600">{errors.unitPrice.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800 font-medium">Total Price:</span>
                    <span className="text-amber-900">{derived.totalPrice > 0 ? derived.totalPrice.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800 font-medium">Vatable:</span>
                    <span className="text-amber-900">{derived.vatable > 0 ? derived.vatable.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800 font-medium">VAT:</span>
                    <span className="text-amber-900">{derived.vat > 0 ? derived.vat.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-800 font-medium">EWT:</span>
                    <span className="text-amber-900">{derived.ewt > 0 ? derived.ewt.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                    <span className="text-amber-900 font-semibold">Net Pay:</span>
                    <span className="text-lg font-mono font-bold text-amber-900">{derived.netPay.toFixed(2)}</span>
                  </div>
                </div>
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
            form="manage-item-form"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
          >
            {isIssuedStocks ? "Issue Stock" : isAdditionalStocks ? "Add Additional Stock" : "Save Beginning Stock"}
          </button>
        </div>
      </div>

      {/* Internal Modal for Issue Note */}
      {issueModalOpen && selectedRequestedItemId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (!issueSubmitting) setIssueModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-amber-200 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              Confirm Issue Stock
            </h3>
            <p className="text-sm text-amber-700 mb-4">
              Add a note for this stock issuance (saved with the request).
            </p>
            <textarea
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="Note (optional)"
              rows={4}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="mt-5 flex gap-3 justify-end">
              <button
                type="button"
                disabled={issueSubmitting}
                className="px-4 py-2 rounded-lg border border-amber-200 text-sm font-medium text-gray-700 hover:bg-amber-50 transition-colors"
                onClick={() => {
                  setIssueModalOpen(false);
                  setIssueNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={issueSubmitting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                onClick={handleIssueStock}
              >
                {issueSubmitting ? "Issuing..." : "Confirm Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
