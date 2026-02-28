"use client";

import { useState, useCallback, useMemo } from "react";
import {
  FiBarChart2,
  FiBox,
  FiShoppingCart,
  FiClipboard,
  FiPrinter,
  FiSearch,
} from "react-icons/fi";
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
    lines: {
      itemName: string;
      quantity: number;
      price: number;
      total: number;
    }[];
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

function formatCurrency(n: number): string {
  return `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  inventoryReportSnapshots = [],
  storeName = "",
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
  inventoryReportSnapshots?: POSReportEntry[];
  storeName?: string;
}) {
  const [reportType, setReportType] = useState<
    "sales" | "stocks" | "pos_transactions" | "pos_stock"
  >("sales");
  const [txDateFilter, setTxDateFilter] = useState("");
  const [stockDateFilter, setStockDateFilter] = useState("");

  const filteredTransactions = useMemo(() => {
    if (!txDateFilter) return posTransactions;
    return posTransactions.filter((entry) => {
      const d = new Date(entry.reportDate);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return dateStr === txDateFilter;
    });
  }, [posTransactions, txDateFilter]);

  const filteredStock = useMemo(() => {
    if (!stockDateFilter) return posStockTracker;
    return posStockTracker.filter((entry) => {
      const d = new Date(entry.reportDate);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return dateStr === stockDateFilter;
    });
  }, [posStockTracker, stockDateFilter]);

  const printTransactions = useCallback(
    (entries: POSReportEntry[]) => {
      const rows = entries.map((entry) => {
        const data = entry.reportData as POSTransactionData;
        const dateLabel = new Date(entry.reportDate).toLocaleDateString(
          undefined,
          { dateStyle: "medium" },
        );
        const receiptRows = (data.receipts ?? []).flatMap((receipt) =>
          receipt.lines.map(
            (line, idx) => `
          <tr>
            <td style="padding:6px 10px;color:#92400e;font-size:12px">${idx === 0 ? receipt.receiptNo.split("-").slice(0, 2).join("-") : ""}</td>
            <td style="padding:6px 10px;color:#92400e;font-size:12px">${idx === 0 ? new Date(receipt.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : ""}</td>
            <td style="padding:6px 10px;color:#78350f">${line.itemName}</td>
            <td style="padding:6px 10px;text-align:center;font-weight:700">${line.quantity}</td>
            <td style="padding:6px 10px;text-align:right;font-weight:700;color:#047857">${formatCurrency(line.total)}</td>
          </tr>
        `,
          ),
        );
        return `
        <div style="margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="font-weight:700;color:#78350f;font-size:16px">${dateLabel}</h3>
            <span style="font-size:20px;font-weight:700;color:#047857">${formatCurrency(data.totalSales ?? 0)}</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr style="border-bottom:2px solid #fbbf24;color:#78350f;text-transform:uppercase;font-size:11px;letter-spacing:0.05em">
              <th style="padding:8px 10px;text-align:left">Receipt</th>
              <th style="padding:8px 10px;text-align:left">Time</th>
              <th style="padding:8px 10px;text-align:left">Item</th>
              <th style="padding:8px 10px;text-align:center">Qty</th>
              <th style="padding:8px 10px;text-align:right">Amount</th>
            </tr></thead>
            <tbody>${receiptRows.join("")}</tbody>
          </table>
        </div>
      `;
      });

      const html = `<!DOCTYPE html><html><head><title>POS Transactions Report${storeName ? ` - ${storeName}` : ""}</title></head>
      <body style="font-family:system-ui,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#78350f">
        <h1 style="font-size:22px;font-weight:800;margin-bottom:4px">POS Transactions Report</h1>
        ${storeName ? `<p style="color:#92400e;margin-bottom:24px">${storeName}</p>` : ""}
        <p style="color:#92400e;font-size:13px;margin-bottom:24px">Generated: ${new Date().toLocaleString()}</p>
        ${rows.join('<hr style="border:none;border-top:1px solid #fde68a;margin:20px 0">')}
      </body></html>`;
      const w = window.open("", "_blank", "width=750,height=800");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
    },
    [storeName],
  );

  const printStock = useCallback(
    (entries: POSReportEntry[]) => {
      const rows = entries.map((entry) => {
        const data = entry.reportData as { items: POSStockItem[] };
        const dateLabel = new Date(entry.reportDate).toLocaleDateString(
          undefined,
          { dateStyle: "medium" },
        );
        const itemRows = (data.items ?? []).map((item) => {
          const pct =
            item.initialStock > 0
              ? Math.round((item.remainingStock / item.initialStock) * 100)
              : 0;
          const color =
            item.remainingStock <= 0
              ? "#dc2626"
              : pct <= 25
                ? "#ea580c"
                : "#047857";
          return `
          <tr>
            <td style="padding:6px 10px;font-weight:500;color:#78350f">${item.itemName}</td>
            <td style="padding:6px 10px;text-align:right;font-weight:700">${item.initialStock}</td>
            <td style="padding:6px 10px;text-align:right;font-weight:700;color:#e11d48">${item.soldQty > 0 ? `-${item.soldQty}` : "0"}</td>
            <td style="padding:6px 10px;text-align:right;font-weight:700;color:${color}">${item.remainingStock} <span style="font-size:11px;color:#92400e">(${pct}%)</span></td>
          </tr>
        `;
        });
        return `
        <div style="margin-bottom:24px">
          <h3 style="font-weight:700;color:#78350f;font-size:16px;margin-bottom:12px">${dateLabel}</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr style="border-bottom:2px solid #fbbf24;color:#78350f;text-transform:uppercase;font-size:11px;letter-spacing:0.05em">
              <th style="padding:8px 10px;text-align:left">Item</th>
              <th style="padding:8px 10px;text-align:right">Initial Stock</th>
              <th style="padding:8px 10px;text-align:right">Sold</th>
              <th style="padding:8px 10px;text-align:right">Remaining</th>
            </tr></thead>
            <tbody>${itemRows.join("")}</tbody>
          </table>
        </div>
      `;
      });

      const html = `<!DOCTYPE html><html><head><title>POS Stock Tracker Report${storeName ? ` - ${storeName}` : ""}</title></head>
      <body style="font-family:system-ui,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#78350f">
        <h1 style="font-size:22px;font-weight:800;margin-bottom:4px">POS Stock Tracker Report</h1>
        ${storeName ? `<p style="color:#92400e;margin-bottom:24px">${storeName}</p>` : ""}
        <p style="color:#92400e;font-size:13px;margin-bottom:24px">Generated: ${new Date().toLocaleString()}</p>
        ${rows.join('<hr style="border:none;border-top:1px solid #fde68a;margin:20px 0">')}
      </body></html>`;
      const w = window.open("", "_blank", "width=750,height=800");
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
    },
    [storeName],
  );

  const tabs = [
    {
      key: "sales" as const,
      label: "Sales report",
      icon: <FiBarChart2 className="text-base" />,
    },
    {
      key: "stocks" as const,
      label: "Stocks report",
      icon: <FiBox className="text-base" />,
    },
    {
      key: "pos_transactions" as const,
      label: "POS Transactions",
      icon: <FiShoppingCart className="text-base" />,
    },
    {
      key: "pos_stock" as const,
      label: "POS Stock Tracker",
      icon: <FiClipboard className="text-base" />,
    },
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
                      <tr
                        key={r.id}
                        onClick={() => {
                          const parsed = new Date(r.periodMonth);
                          if (!isNaN(parsed.getTime())) {
                            const dateStr = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
                            setTxDateFilter(dateStr);
                          }
                          setReportType("pos_transactions");
                        }}
                        className="cursor-pointer hover:bg-amber-100/60 transition-colors"
                        title="View POS transactions for this date"
                      >
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  POS Transactions
                </h2>
                <p className="text-xs text-amber-600 mt-0.5">
                  Daily POS transaction reports sent by the store.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                  <input
                    type="date"
                    value={txDateFilter}
                    onChange={(e) => setTxDateFilter(e.target.value)}
                    className="rounded-lg border border-amber-200 bg-white py-1.5 pl-8 pr-3 text-xs text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
                  />
                  {txDateFilter && (
                    <button
                      onClick={() => setTxDateFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  onClick={() => printTransactions(filteredTransactions)}
                  disabled={filteredTransactions.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiPrinter className="text-sm" />
                  Print Report
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {filteredTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-amber-600/80">
                {txDateFilter
                  ? "No reports found for this date."
                  : "No POS transaction reports sent yet."}
              </p>
            ) : (
              <div className="divide-y divide-amber-100">
                {filteredTransactions.map((entry) => {
                  const data = entry.reportData as POSTransactionData;
                  const dateLabel = new Date(
                    entry.reportDate,
                  ).toLocaleDateString(undefined, { dateStyle: "medium" });
                  return (
                    <div key={entry.reportDate} className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-amber-900">
                          {dateLabel}
                        </h3>
                        <span className="text-lg font-bold text-emerald-700">
                          ₱
                          {(data.totalSales ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-amber-200">
                          <tr className="text-amber-900 text-xs uppercase tracking-wider">
                            <th className="px-3 py-2 font-semibold">Receipt</th>
                            <th className="px-3 py-2 font-semibold">Time</th>
                            <th className="px-3 py-2 font-semibold">Item</th>
                            <th className="px-3 py-2 font-semibold text-center">
                              Qty
                            </th>
                            <th className="px-3 py-2 font-semibold text-right">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50">
                          {(data.receipts ?? []).map((receipt) =>
                            receipt.lines.map((line, idx) => (
                              <tr
                                key={`${receipt.receiptNo}-${idx}`}
                                className="hover:bg-amber-50/50"
                              >
                                <td className="px-3 py-2 text-amber-700 text-xs">
                                  {idx === 0
                                    ? receipt.receiptNo
                                        .split("-")
                                        .slice(0, 2)
                                        .join("-")
                                    : ""}
                                </td>
                                <td className="px-3 py-2 text-amber-600 text-xs">
                                  {idx === 0
                                    ? new Date(
                                        receipt.createdAt,
                                      ).toLocaleTimeString(undefined, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </td>
                                <td className="px-3 py-2 text-amber-900">
                                  {line.itemName}
                                </td>
                                <td className="px-3 py-2 text-amber-800 font-bold text-center">
                                  {line.quantity}
                                </td>
                                <td className="px-3 py-2 text-emerald-700 font-bold text-right">
                                  ₱
                                  {line.total.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  POS Stock Tracker
                </h2>
                <p className="text-xs text-amber-600 mt-0.5">
                  Daily stock tracking reports sent by the store.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs" />
                  <input
                    type="date"
                    value={stockDateFilter}
                    onChange={(e) => setStockDateFilter(e.target.value)}
                    className="rounded-lg border border-amber-200 bg-white py-1.5 pl-8 pr-3 text-xs text-amber-900 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
                  />
                  {stockDateFilter && (
                    <button
                      onClick={() => setStockDateFilter("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  onClick={() => printStock(filteredStock)}
                  disabled={filteredStock.length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiPrinter className="text-sm" />
                  Print Report
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {filteredStock.length === 0 ? (
              <p className="p-8 text-center text-sm text-amber-600/80">
                {stockDateFilter
                  ? "No reports found for this date."
                  : "No stock tracker reports sent yet."}
              </p>
            ) : (
              <div className="divide-y divide-amber-100">
                {filteredStock.map((entry) => {
                  const data = entry.reportData as { items: POSStockItem[] };
                  const dateLabel = new Date(
                    entry.reportDate,
                  ).toLocaleDateString(undefined, { dateStyle: "medium" });
                  return (
                    <div key={entry.reportDate} className="p-5">
                      <h3 className="text-sm font-bold text-amber-900 mb-3">
                        {dateLabel}
                      </h3>
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-amber-200">
                          <tr className="text-amber-900 text-xs uppercase tracking-wider">
                            <th className="px-3 py-2 font-semibold">Item</th>
                            <th className="px-3 py-2 font-semibold text-right">
                              Initial Stock
                            </th>
                            <th className="px-3 py-2 font-semibold text-right">
                              Sold
                            </th>
                            <th className="px-3 py-2 font-semibold text-right">
                              Remaining
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50">
                          {(data.items ?? []).map((item) => {
                            const pct =
                              item.initialStock > 0
                                ? Math.round(
                                    (item.remainingStock / item.initialStock) *
                                      100,
                                  )
                                : 0;
                            return (
                              <tr
                                key={item.itemName}
                                className="hover:bg-amber-50/50"
                              >
                                <td className="px-3 py-2 text-amber-900 font-medium">
                                  {item.itemName}
                                </td>
                                <td className="px-3 py-2 text-amber-700 font-bold text-right">
                                  {item.initialStock}
                                </td>
                                <td className="px-3 py-2 text-rose-600 font-bold text-right">
                                  {item.soldQty > 0 ? `-${item.soldQty}` : "0"}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <span
                                    className={`font-bold ${item.remainingStock <= 0 ? "text-red-600" : pct <= 25 ? "text-orange-600" : "text-emerald-700"}`}
                                  >
                                    {item.remainingStock}
                                  </span>
                                  <span className="ml-1 text-[10px] text-amber-500">
                                    ({pct}%)
                                  </span>
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
          {inventoryReportSnapshots.length > 0 && (
            <div className="border-t border-amber-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-amber-900 mb-3">
                Submitted Inventory Reports (sent by store)
              </h3>
              <div className="divide-y divide-amber-100 space-y-4">
                {inventoryReportSnapshots.map((entry) => {
                  const data = entry.reportData as { reportDate?: string; reports?: InventoryReportItem[] };
                  const reports = (data?.reports ?? []) as InventoryReportItem[];
                  const dateLabel = data?.reportDate
                    ? new Date(data.reportDate).toLocaleDateString(undefined, { dateStyle: "medium" })
                    : new Date(entry.reportDate).toLocaleDateString(undefined, { dateStyle: "medium" });
                  return (
                    <div key={entry.reportDate + entry.createdAt} className="pt-3">
                      <h4 className="text-xs font-bold text-amber-800 mb-2">{dateLabel}</h4>
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-amber-200">
                          <tr className="text-amber-900 text-xs uppercase tracking-wider">
                            <th className="px-2 py-1.5 font-semibold text-right">Remaining</th>
                            <th className="px-2 py-1.5 font-semibold">Type</th>
                            <th className="px-2 py-1.5 font-semibold">Period</th>
                            <th className="px-2 py-1.5 font-semibold">Product</th>
                            <th className="px-2 py-1.5 font-semibold text-right">Qty</th>
                            <th className="px-2 py-1.5 font-semibold text-right">Used</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-50">
                          {reports.map((r) => (
                            <tr key={r.id} className="hover:bg-amber-50/50">
                              <td className="px-2 py-1.5 text-emerald-700 font-bold text-right">{r.itemsLeft}</td>
                              <td className="px-2 py-1.5 text-amber-700 text-xs">{r.reportType}</td>
                              <td className="px-2 py-1.5 text-amber-800 text-xs">{r.periodMonth} {r.periodYear}</td>
                              <td className="px-2 py-1.5 text-amber-900 font-medium">{r.productName}</td>
                              <td className="px-2 py-1.5 text-amber-800 text-right">{r.quantity} {r.unitOfMeasurement}</td>
                              <td className="px-2 py-1.5 text-rose-600 font-bold text-right">{r.itemsUsed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
