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
import { addItems } from "@/dal/inventory/add-item";
import {
  getApprovedRequestedItems,
  issueStock,
  type RequestedItemPersistent,
} from "@/dal/inventory/get-requested-items";
import { toast } from "react-toastify";

export type ItemsFlowFormValues = z.infer<typeof itemsFlowSchema>;

function computeDerived(
  quantity: number,
  unitPrice: number,
  isVatRegistered: boolean,
): {
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
} {
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

export function ItemsFlowForm() {
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
  const showVatTin = typeOfStocks !== "Issued Stocks";
  const isVatRegistered = typeOfVatTaxpayer === "VAT Registered";
  const isIssuedStocks = typeOfStocks === "Issued Stocks";
  const derived = computeDerived(
    Number(quantity) || 0,
    Number(unitPrice) || 0,
    isVatRegistered,
  );

  const [requestedItems, setRequestedItems] = useState<
    RequestedItemPersistent[]
  >([]);
  const [selectedRequestedItemId, setSelectedRequestedItemId] = useState<
    string | null
  >(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [issueSubmitting, setIssueSubmitting] = useState(false);

  // Fetch requested items when issued stocks is selected
  const handleTypeOfStocksChange = async (value: string) => {
    if (value === "Issued Stocks") {
      const items = await getApprovedRequestedItems();
      setRequestedItems(items);
    } else {
      setRequestedItems([]);
      setSelectedRequestedItemId(null);
    }
  };

  const onSubmit = async (data: ItemsFlowFormValues) => {
    if (isIssuedStocks && selectedRequestedItemId) {
      setIssueModalOpen(true);
      return;
    }

    const payload = { ...data, ...derived };
    const row: z.infer<typeof itemsFlowSchema> = {
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      supplierName: data.supplierName,
      tinNo: data.tinNo,
      typeOfVatTaxpayer: data.typeOfVatTaxpayer,
      typeOfStocks: data.typeOfStocks,
      productNameSpecific: data.productNameSpecific,
      productNameGeneral: data.productNameGeneral,
      itemCode: data.itemCode,
      accountingRecognition: data.accountingRecognition,
      measurement: data.measurement,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    };
    console.log("Items flow submit", payload);
    const result = await addItems(row);

    if (result.success === "success") {
      toast.success(result.message);
      reset();
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
      getApprovedRequestedItems().then(setRequestedItems);
    } else {
      toast.error(result.message);
    }
  };

  const onStoreForBatch = () => {
    const data = {
      quantity: watch("quantity"),
      unitPrice: watch("unitPrice"),
      ...derived,
    };
    console.log("Store for batch save", data);
    alert("Stored for batch save (UI only).");
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const monthValues = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  const inputClass =
    "w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-amber-900";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-start bg-[var(--ltk-blue-white)] py-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Header banner */}
        <div className="bg-[var(--ltk-blue-100)] px-6 py-3">
          <h1 className="text-center text-lg font-semibold text-amber-900">
            Inventory Flow (In-and-Out)
          </h1>
        </div>

        <form
          onSubmit={handleSubmit(
            (data) => {
              console.log("VALID SUBMIT", data);
              onSubmit(data);
            },
            (errors) => {
              console.log("INVALID SUBMIT", errors);
            },
          )}
          className="p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0">
            {/* Left column */}
            <div className="space-y-4 border-amber-200 pr-0 md:border-r md:pr-8">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="sr-only">Month</label>
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
                  <label className="sr-only">Year</label>
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

              <div>
                <span className={labelClass}>Type of Stocks:</span>
                <div className="mt-1.5 space-y-1.5">
                  {STOCK_TYPES.map((value) => {
                    const { onChange, ...registerProps } = register("typeOfStocks");
                    return (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-amber-900"
                      >
                        <input
                          type="radio"
                          {...registerProps}
                          value={value}
                          onChange={(e) => {
                            onChange(e);
                            handleTypeOfStocksChange(e.target.value);
                          }}
                          className="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        {value}
                      </label>
                    );
                  })}
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

              {showVatTin && (
                <div>
                  <label className={labelClass}>TIN no:</label>
                  <input
                    type="text"
                    {...register("tinNo")}
                    className={inputClass}
                    placeholder="Enter Tin no."
                  />
                  {errors.tinNo && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.tinNo.message}
                    </p>
                  )}
                </div>
              )}

              {isIssuedStocks ? (
                <div>
                  <label className={labelClass}>Select Requested Item:</label>
                  <select
                    value={selectedRequestedItemId || ""}
                    onChange={(e) => {
                      const itemId = e.target.value;
                      setSelectedRequestedItemId(itemId || null);
                      const item = requestedItems.find((i) => i.id === itemId);
                      if (item) {
                        setValue("productNameGeneral", item.productNameGeneral);
                        setValue("quantity", item.quantity);
                        setValue("measurement", item.unitOfMeasurement);
                        if (
                          ACCOUNTING_RECOGNITION.includes(
                            item.accountRecognition as typeof ACCOUNTING_RECOGNITION[number],
                          )
                        ) {
                          setValue(
                            "accountingRecognition",
                            item.accountRecognition as typeof ACCOUNTING_RECOGNITION[number],
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
                    <p className="mt-1 text-xs text-amber-600">
                      Selected item will be issued from inventory.
                    </p>
                  )}
                </div>
              ) : (
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
              )}

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

              <div>
                <label className={labelClass}>Item Code:</label>
                <input
                  type="text"
                  {...register("itemCode")}
                  className={inputClass}
                  placeholder="Enter item code (optional)"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4 pl-0 pt-6 md:pl-8 md:pt-0">
              <div>
                <span className={labelClass}>Account Recognition:</span>
                <div className="mt-1.5 space-y-1.5">
                  {ACCOUNTING_RECOGNITION.map((value) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 text-sm text-amber-900"
                    >
                      <input
                        type="radio"
                        {...register("accountingRecognition")}
                        value={value}
                        className="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Unit of Measurement:</label>
                <input
                  list="measurements-list"
                  {...register("measurement")}
                  className={inputClass}
                  placeholder="Enter or choose unit"
                />
                <datalist id="measurements-list">
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

              <div>
                <label className={labelClass}>Quantity:</label>
                <input
                  type="number"
                  step="any"
                  {...register("quantity")}
                  className={inputClass}
                  placeholder="00"
                />
                {errors.quantity && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Unit Price:</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("unitPrice")}
                  className={inputClass}
                  placeholder="in peso (₱)"
                />
                {errors.unitPrice && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.unitPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-amber-200 pt-4">
                {/* <div>
                  <label className={labelClass}>Total price:</label>
                  <input
                    type="number"
                    step="any"
                    {...register("totalPrice")}
                    className={inputClass}
                    placeholder="00"
                    defaultValue={
                      derived.totalPrice > 0
                        ? derived.totalPrice.toFixed(2)
                        : "auto generated"
                    }
                  />
                  {errors.totalPrice && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.totalPrice.message}
                    </p>
                  )}
                </div> */}

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-amber-900">
                    Total Price:
                  </span>
                  <span className="text-sm text-amber-600/90">
                    {derived.totalPrice > 0
                      ? derived.totalPrice.toFixed(2)
                      : "auto generated"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-amber-900">
                    Vatable:
                  </span>
                  <span className="text-sm text-amber-600/90">
                    {derived.vatable > 0
                      ? derived.vatable.toFixed(2)
                      : "auto generated"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-amber-900">
                    VAT:
                  </span>
                  <span className="text-sm text-amber-600/90">
                    {derived.vat > 0
                      ? derived.vat.toFixed(2)
                      : "auto generated"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-amber-900">
                    EWT:
                  </span>
                  <span className="text-sm text-amber-600/90">
                    {derived.ewt > 0
                      ? derived.ewt.toFixed(2)
                      : "auto generated"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-amber-900">
                    Net Pay:
                  </span>
                  <span className="font-mono text-sm font-semibold text-amber-900">
                    {derived.netPay.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons - full width, stacked */}
          <div className="mt-8 flex flex-col gap-3 border-t border-amber-200 pt-6">
            {/* <button
              type="button"
              onClick={onStoreForBatch}
              className="w-full rounded-md bg-amber-500 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Store for batch save
            </button> */}
            <button
              type="submit"
              className="w-full rounded-md bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {isIssuedStocks ? "Issue stock" : "Save item"}
            </button>
          </div>
        </form>
      </div>

      {/* Issue stock modal */}
      {issueModalOpen && selectedRequestedItemId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!issueSubmitting) {
              setIssueModalOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Issue Stock
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add a note for this stock issuance (will be saved with the
              request).
            </p>
            <textarea
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="Note (optional)"
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                disabled={issueSubmitting}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                onClick={handleIssueStock}
              >
                {issueSubmitting ? "Issuing..." : "Issue Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
