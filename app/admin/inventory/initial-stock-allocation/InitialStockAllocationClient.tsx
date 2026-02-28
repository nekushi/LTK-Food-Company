"use client";

import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ACCOUNTING_RECOGNITION,
  initialStockAllocationSchema,
  MEASUREMENTS,
} from "@/schemas/items.schema";
import { addInitialStockAllocation } from "@/dal/inventory/add-item";
import { getAdminStores } from "@/dal/admin/manage-branch";
import { toast } from "react-toastify";

export type InitialStockAllocationFormValues = z.infer<
  typeof initialStockAllocationSchema
>;

type StoreOption = { id: string; storeName: string };

export function InitialStockAllocationClient() {
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InitialStockAllocationFormValues>({
    resolver: zodResolver(
      initialStockAllocationSchema,
    ) as Resolver<InitialStockAllocationFormValues>,
    defaultValues: {
      storeId: "",
      productNameGeneral: "",
      itemCode: "",
      accountingRecognition: "Office Supplies",
      measurement: "",
      quantity: 0,
    },
  });

  const accountingRecognition = watch("accountingRecognition");
  const isFoodSupplies = accountingRecognition === "Food Supplies";

  useEffect(() => {
    (async () => {
      const res = await getAdminStores();
      setStoresLoading(false);
      if (res.success && res.data?.length) {
        setStores(res.data.map((s) => ({ id: s.id, storeName: s.storeName })));
      }
    })();
  }, []);

  const onSubmit = async (data: InitialStockAllocationFormValues) => {
    const result = await addInitialStockAllocation(data);
    if (result.success === "success") {
      toast.success(result.message);
      reset({
        storeId: data.storeId,
        productNameGeneral: "",
        itemCode: "",
        accountingRecognition: "Office Supplies",
        measurement: "",
        quantity: 0,
      });
    } else if (result.success === "validation_error") {
      toast.error("Please fix the form errors.");
    } else {
      toast.error(result.message ?? "Something went wrong");
    }
  };

  const inputClass =
    "w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 placeholder:text-amber-500/60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClass = "mb-1 block text-sm font-medium text-amber-900";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">
          Inventory MGT — Initial Stock Allocation
        </h1>
        <p className="text-sm text-amber-700/80 mt-1">
          Allocate initial issued stock to a store. Period is set to current
          date automatically. No requested-item selection — free-fill only.
        </p>
      </div>

      <form
        id="initial-stock-allocation-form"
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-2xl space-y-6 rounded-xl border border-amber-200 bg-amber-50/30 p-6"
      >
        <div>
          <label className={labelClass}>Store (branch)</label>
          <select
            {...register("storeId")}
            className={inputClass}
            disabled={storesLoading}
          >
            <option value="">
              {storesLoading ? "Loading stores..." : "Select a store"}
            </option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.storeName}
              </option>
            ))}
          </select>
          {errors.storeId && (
            <p className="mt-1 text-xs text-red-600">
              {errors.storeId.message}
            </p>
          )}
        </div>

        <p className="text-xs text-amber-700 font-medium">
          Type of stocks: Issued Stocks (fixed). Period: current date. Store name is used as supplier.
        </p>

        <div>
          <span className={labelClass}>Account Recognition</span>
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
          {errors.accountingRecognition && (
            <p className="mt-1 text-xs text-red-600">
              {errors.accountingRecognition.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Product name (general)</label>
          <input
            type="text"
            {...register("productNameGeneral")}
            className={inputClass}
            placeholder="General product name"
          />
          {errors.productNameGeneral && (
            <p className="mt-1 text-xs text-red-600">
              {errors.productNameGeneral.message}
            </p>
          )}
        </div>

        <div className={`grid ${!isFoodSupplies ? "sm:grid-cols-2" : "grid-cols-1"} gap-4`}>
          {!isFoodSupplies && (
            <div>
              <label className={labelClass}>Item code (optional)</label>
              <input
                type="text"
                {...register("itemCode")}
                className={inputClass}
                placeholder="Item code"
              />
            </div>
          )}
          <div>
            <label className={labelClass}>Unit of measurement</label>
            <input
              list="measurements-list-initial"
              {...register("measurement")}
              className={inputClass}
              placeholder="e.g. kg, pc, packs"
            />
            <datalist id="measurements-list-initial">
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

        <div>
          <label className={labelClass}>Quantity</label>
          <input
            type="number"
            step="any"
            {...register("quantity")}
            className={inputClass}
            placeholder="0"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-lg border border-amber-200 text-sm font-medium text-amber-800 bg-white hover:bg-amber-50"
          >
            Reset
          </button>
          <button
            type="submit"
            form="initial-stock-allocation-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Allocate initial stock"}
          </button>
        </div>
      </form>
    </div>
  );
}
