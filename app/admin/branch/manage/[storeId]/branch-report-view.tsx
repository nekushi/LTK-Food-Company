"use client";

import { useState } from "react";
import { FiBarChart2, FiBox, FiShoppingCart, FiClipboard } from "react-icons/fi";
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

interface POSReportEntry {
  reportData: unknown;
  reportDate: string;
  createdAt: string;
}

interface POSTransactionData {
  receipts: {
    receiptNo: string;
    lines: { itemName: string; quantity: number; price: number; total: number }[];
    grandTotal: number;
    createdAt: string;
  }[];
  totalSales: number;
}

interface POSStockItem {
  itemName: string;
  initialStock: number;
  soldQty: number;
  remainingStock: number;
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
  posTransactions = [],
  posStockTracker = [],
}: {
  dailyReports: SalesReportRow[];
  computedWeekly: AggregatedSales[];
  computedMonthly: AggregatedSales[];
  mergedInventory: MergedInventory[];
  lowStockCount: number;
  outOfStockCount: number;
  requestHistory: RequestItem[];
  inventoryReports: InventoryReportItem[];
  posTransactions?: POSReportEntry[];
  posStockTracker?: POSReportEntry[];
}) {
  const [reportType, setReportType] = useState<"sales" | "stocks" | "pos_transactions" | "pos_stock">("sales");

  const tabs = [
    { key: "sales" as const, label: "Sales report", icon: <FiBarChart2 className="text-base" /> },
    { key: "stocks" as const, label: "Stocks report", icon: <FiBox className="text-base" /> },
    { key: "pos_transactions" as const, label: "POS Transactions", icon: <FiShoppingCart className="text-base" /> },
    { key: "pos_stock" as const, label: "POS Stock Tracker", icon: <FiClipboard className="text-base" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-amber-800">Report:</span>
        <div className="flex flex-wrap rounded-lg border border-amber-200 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                reportType === tab.key
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
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

      {reportType === "pos_transactions" && (
        <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
            <h2 className="text-sm font-semibold text-amber-900">POS Transactions</h2>
            <p className="text-xs text-amber-600 mt-0.5">Daily POS transaction reports sent by the store.</p>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {posTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-amber-600/80">
                No POS transaction reports sent yet.
              </p>
            ) : (
              <div className="divide-y divide-amber-100">
                {posTransactions.map((entry) => {
                  const data = entry.reportData as POSTransactionData;
                  const dateLabel = new Date(entry.reportDate).toLocaleDateString(undefined, { dateStyle: "medium" });
                  return (
                    <div key={entry.reportDate} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-amber-900">{dateLabel}</h3>
                        <span className="text-lg font-bold text-emerald-700">
                          ₱{(data.totalSales ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-amber-200">
                          <tr className="text-amber-900 text-xs uppercase tracking-wider">
                            <th className="px-3 py-2 font-semibold">Receipt</th>
                            <th className="px-3 py-2 font-semibold">Time</th>
                            <th className="px-3 py-2 font-semibold">Item</th>
                            <th className="px-3 py-2 font-semibold text-center">Qty</th>
                            <th className="px-3 py-2 font-semibold text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50">
                          {(data.receipts ?? []).map((receipt) =>
                            receipt.lines.map((line, idx) => (
                              <tr key={`${receipt.receiptNo}-${idx}`} className="hover:bg-amber-50/50">
                                <td className="px-3 py-2 text-amber-700 text-xs">
                                  {idx === 0 ? receipt.receiptNo.split("-").slice(0, 2).join("-") : ""}
                                </td>
                                <td className="px-3 py-2 text-amber-600 text-xs">
                                  {idx === 0
                                    ? new Date(receipt.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                                    : ""}
                                </td>
                                <td className="px-3 py-2 text-amber-900">{line.itemName}</td>
                                <td className="px-3 py-2 text-amber-800 font-bold text-center">{line.quantity}</td>
                                <td className="px-3 py-2 text-emerald-700 font-bold text-right">
                                  ₱{line.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            )),
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {reportType === "pos_stock" && (
        <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
            <h2 className="text-sm font-semibold text-amber-900">POS Stock Tracker</h2>
            <p className="text-xs text-amber-600 mt-0.5">Daily stock tracking reports sent by the store.</p>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {posStockTracker.length === 0 ? (
              <p className="p-8 text-center text-sm text-amber-600/80">
                No stock tracker reports sent yet.
              </p>
            ) : (
              <div className="divide-y divide-amber-100">
                {posStockTracker.map((entry) => {
                  const data = entry.reportData as { items: POSStockItem[] };
                  const dateLabel = new Date(entry.reportDate).toLocaleDateString(undefined, { dateStyle: "medium" });
                  return (
                    <div key={entry.reportDate} className="p-5">
                      <h3 className="text-sm font-bold text-amber-900 mb-3">{dateLabel}</h3>
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-amber-200">
                          <tr className="text-amber-900 text-xs uppercase tracking-wider">
                            <th className="px-3 py-2 font-semibold">Item</th>
                            <th className="px-3 py-2 font-semibold text-right">Initial Stock</th>
                            <th className="px-3 py-2 font-semibold text-right">Sold</th>
                            <th className="px-3 py-2 font-semibold text-right">Remaining</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50">
                          {(data.items ?? []).map((item) => {
                            const pct = item.initialStock > 0
                              ? Math.round((item.remainingStock / item.initialStock) * 100)
                              : 0;
                            return (
                              <tr key={item.itemName} className="hover:bg-amber-50/50">
                                <td className="px-3 py-2 text-amber-900 font-medium">{item.itemName}</td>
                                <td className="px-3 py-2 text-amber-700 font-bold text-right">{item.initialStock}</td>
                                <td className="px-3 py-2 text-rose-600 font-bold text-right">
                                  {item.soldQty > 0 ? `-${item.soldQty}` : "0"}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <span className={`font-bold ${item.remainingStock <= 0 ? "text-red-600" : pct <= 25 ? "text-orange-600" : "text-emerald-700"}`}>
                                    {item.remainingStock}
                                  </span>
                                  <span className="ml-1 text-[10px] text-amber-500">({pct}%)</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
