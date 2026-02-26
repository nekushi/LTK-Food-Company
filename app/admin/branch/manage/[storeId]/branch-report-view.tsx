"use client";

import { useState } from "react";
import { FiBarChart2, FiBox } from "react-icons/fi";
import StoreTabs from "./store-tabs";

interface SalesReportRow {
  id: string;
  periodMonth: string;
  periodYear: string;
  totalSales: number;
}

interface AggregatedSales {
  label: string;
  totalSales: number;
}

interface MergedInventory {
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  netPay: number;
}

interface RequestItem {
  id: string;
  productNameSpecific: string;
  isRequestApproved: boolean;
  quantity: number;
  unitOfMeasurement: string;
  createdAt: string;
}

interface InventoryReportItem {
  id: string;
  reportType: string;
  periodMonth: string;
  periodYear: string;
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  itemsUsed: number;
  itemsLeft: number;
  createdAt: string;
}

export default function BranchReportView({
  dailyReports,
  computedWeekly,
  computedMonthly,
  mergedInventory,
  lowStockCount,
  outOfStockCount,
  requestHistory,
  inventoryReports,
}: {
  dailyReports: SalesReportRow[];
  computedWeekly: AggregatedSales[];
  computedMonthly: AggregatedSales[];
  mergedInventory: MergedInventory[];
  lowStockCount: number;
  outOfStockCount: number;
  requestHistory: RequestItem[];
  inventoryReports: InventoryReportItem[];
}) {
  const [reportType, setReportType] = useState<"sales" | "stocks">("sales");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-amber-800">Report:</span>
        <div className="flex rounded-lg border border-amber-200 bg-white p-1">
          <button
            onClick={() => setReportType("sales")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              reportType === "sales"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <FiBarChart2 className="text-base" />
            Sales report
          </button>
          <button
            onClick={() => setReportType("stocks")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              reportType === "stocks"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <FiBox className="text-base" />
            Stocks report
          </button>
        </div>
      </div>

      {reportType === "sales" && (
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-900">
            <FiBarChart2 className="text-amber-700" />
            Sales Reports
          </h2>

          <div className="mb-8">
            <h3 className="mb-3 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
              Daily Sales
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-amber-200 text-amber-900">
                  <tr>
                    <th className="px-1 py-2 font-semibold">Date</th>
                    <th className="px-1 py-2 text-right font-semibold">
                      Total Sales
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {dailyReports.length > 0 ? (
                    dailyReports.slice(0, 4).map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/40">
                        <td className="px-1 py-2 text-amber-800">
                          {r.periodMonth} {r.periodYear}
                        </td>
                        <td className="px-1 py-2 text-right font-medium text-emerald-700">
                          ₱{r.totalSales.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-1 py-4 text-center text-xs italic text-amber-600/70"
                      >
                        No daily reports
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                Weekly Sales{" "}
                <span className="ml-1 text-[11px] font-normal text-amber-600">
                  (auto-calculated)
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-amber-200 text-amber-900">
                    <tr>
                      <th className="px-1 py-2 font-semibold">Week</th>
                      <th className="px-1 py-2 text-right font-semibold">
                        Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {computedWeekly.length > 0 ? (
                      computedWeekly.slice(0, 5).map((w) => (
                        <tr key={w.label} className="hover:bg-amber-50/40">
                          <td className="px-1 py-2 text-xs text-amber-800">
                            {w.label}
                          </td>
                          <td className="px-1 py-2 text-right font-medium text-emerald-700">
                            ₱{w.totalSales.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-1 py-4 text-center text-xs italic text-amber-600/70"
                        >
                          No daily reports to aggregate
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-3 rounded-md border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                Monthly Sales{" "}
                <span className="ml-1 text-[11px] font-normal text-amber-600">
                  (auto-calculated)
                </span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-amber-200 text-amber-900">
                    <tr>
                      <th className="px-1 py-2 font-semibold">Month</th>
                      <th className="px-1 py-2 text-right font-semibold">
                        Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {computedMonthly.length > 0 ? (
                      computedMonthly.slice(0, 5).map((m) => (
                        <tr key={m.label} className="hover:bg-amber-50/40">
                          <td className="px-1 py-2 text-amber-800">
                            {m.label}
                          </td>
                          <td className="px-1 py-2 text-right font-medium text-emerald-700">
                            ₱{m.totalSales.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-1 py-4 text-center text-xs italic text-amber-600/70"
                        >
                          No daily reports to aggregate
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === "stocks" && (
        <StoreTabs
          mergedInventory={mergedInventory}
          lowStockCount={lowStockCount}
          outOfStockCount={outOfStockCount}
          requestHistory={requestHistory}
          inventoryReports={inventoryReports}
        />
      )}
    </div>
  );
}
