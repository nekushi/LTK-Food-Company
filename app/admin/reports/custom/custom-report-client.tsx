"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { getCustomSalesReport, getCustomInventoryReport, getInventoryReportByRange } from "@/dal/admin/custom-reports";
import { IoChevronDown } from "react-icons/io5";
import { FiFileText, FiSearch, FiPrinter } from "react-icons/fi";

interface Store {
  id: string;
  storeName: string;
  username: string;
}

interface SalesRow {
  id: string;
  storeId?: string;
  reportType: string;
  periodMonth: string;
  periodYear: string;
  totalSales: number;
}

interface InventoryRow {
  id: string;
  storeId?: string;
  reportType: string;
  periodMonth: string;
  periodYear: string;
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  itemsUsed: number;
  itemsLeft: number;
}

interface AggregatedSales {
  label: string;
  totalSales: number;
}

const MONTHS = [
  "All",
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const REPORT_TYPES = [
  { value: "sales", label: "Sales Report" },
  { value: "inventory", label: "Inventory Report" },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]["value"];

function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function aggregateWeekly(dailyReports: SalesRow[]): AggregatedSales[] {
  const weekMap = new Map<string, { sunday: Date; total: number }>();
  for (const r of dailyReports) {
    if (r.reportType !== "Daily") continue;
    const parsed = new Date(r.periodMonth);
    if (isNaN(parsed.getTime())) continue;
    const sunday = getSundayOfWeek(parsed);
    const key = sunday.toISOString().split("T")[0];
    const existing = weekMap.get(key);
    if (existing) {
      existing.total += r.totalSales;
    } else {
      weekMap.set(key, { sunday, total: r.totalSales });
    }
  }
  return Array.from(weekMap.values())
    .sort((a, b) => b.sunday.getTime() - a.sunday.getTime())
    .map(({ sunday, total }) => {
      const sat = new Date(sunday);
      sat.setDate(sat.getDate() + 6);
      const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
      return { label: `${fmt(sunday)} – ${fmt(sat)}, ${sunday.getFullYear()}`, totalSales: total };
    });
}

function aggregateMonthly(dailyReports: SalesRow[]): AggregatedSales[] {
  const monthMap = new Map<string, number>();
  for (const r of dailyReports) {
    if (r.reportType !== "Daily") continue;
    const parsed = new Date(r.periodMonth);
    if (isNaN(parsed.getTime())) continue;
    const key = `${parsed.getFullYear()}-${String(parsed.getMonth()).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + r.totalSales);
  }
  return Array.from(monthMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, total]) => {
      const [y, m] = key.split("-");
      return { label: `${MONTH_NAMES[parseInt(m)]} ${y}`, totalSales: total };
    });
}

type ReportMode = "both" | "sales" | "inventory";

interface CustomReportClientProps {
  stores: Store[];
  mode?: ReportMode;
  initialType?: ReportType;
}

export default function CustomReportClient({
  stores,
  mode = "both",
  initialType = "sales",
}: CustomReportClientProps) {
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedStore, setSelectedStore] = useState(
    stores.find((s) => s.id === "all") ? "all" : "",
  );
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [invRange, setInvRange] = useState<"today" | "yesterday" | "past7days">("today");
  const [loading, setLoading] = useState(false);

  const [salesData, setSalesData] = useState<SalesRow[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryRow[]>([]);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!selectedStore) return;
    setLoading(true);
    setGenerated(false);

    if (reportType === "sales") {
      const result = await getCustomSalesReport(selectedStore, selectedMonth, selectedYear);
      setSalesData(result.success ? (result.data as SalesRow[]) : []);
      setInventoryData([]);
    } else {
      const result = await getInventoryReportByRange(selectedStore, invRange);
      setInventoryData(result.success ? (result.data as InventoryRow[]) : []);
      setSalesData([]);
    }

    setGenerated(true);
    setLoading(false);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Report — ${selectedStore === "all" ? "All Branches" : selectedStoreName}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #451a03; }
            h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
            h2 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #92400e; }
            .meta { font-size: 0.75rem; color: #92400e; margin-bottom: 1.5rem; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1.5rem; }
            th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #fde68a; }
            th { font-weight: 600; border-bottom: 2px solid #d97706; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            tfoot td { font-weight: 700; border-top: 2px solid #d97706; }
            .badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 9999px; border: 1px solid #fde68a; background: #fffbeb; }
            .print-branch-section { page-break-after: always; }
            .print-branch-section:last-child { page-break-after: auto; }
            @media print { body { padding: 1rem; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const selectedStoreName = stores.find((s) => s.id === selectedStore)?.storeName ?? "";
  const activeLabel = REPORT_TYPES.find((r) => r.value === reportType)?.label ?? "";

  const branchIdsForAll = useMemo(() => stores.filter((s) => s.id !== "all").map((s) => s.id), [stores]);

  const salesByBranch = useMemo(() => {
    if (selectedStore !== "all") return [{ storeId: selectedStore, rows: salesData }];
    const map = new Map<string, SalesRow[]>();
    for (const r of salesData) {
      const sid = r.storeId ?? "unknown";
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(r);
    }
    return branchIdsForAll.map((storeId) => ({ storeId, rows: map.get(storeId) ?? [] }));
  }, [salesData, selectedStore, branchIdsForAll]);

  const inventoryByBranch = useMemo(() => {
    if (selectedStore !== "all") return [{ storeId: selectedStore, rows: inventoryData }];
    const map = new Map<string, InventoryRow[]>();
    for (const r of inventoryData) {
      const sid = r.storeId ?? "unknown";
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(r);
    }
    return branchIdsForAll.map((storeId) => ({ storeId, rows: map.get(storeId) ?? [] }));
  }, [inventoryData, selectedStore, branchIdsForAll]);

  const dailySales = useMemo(() => salesData.filter((r) => r.reportType === "Daily"), [salesData]);
  const computedWeekly = useMemo(() => aggregateWeekly(salesData), [salesData]);
  const computedMonthly = useMemo(() => aggregateMonthly(salesData), [salesData]);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">
          {mode === "sales" ? "Sales Reports" : mode === "inventory" ? "Inventory Reports" : "Custom Reports"}
        </h1>
        <p className="text-sm text-amber-700/80">
          {mode === "sales"
            ? "Generate sales reports for all branches or a specific branch."
            : mode === "inventory"
            ? "Generate inventory reports for all branches or a specific branch."
            : "Generate sales or inventory reports for a specific branch and period."}
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm max-w-2xl">
        <div className="space-y-5">
          {/* Report Type Dropdown (only when both modes are allowed) */}
          {mode === "both" && (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Report Type</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 hover:border-amber-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FiFileText className="text-amber-600" />
                    {activeLabel}
                  </span>
                  <IoChevronDown className={`text-amber-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-amber-200 bg-white shadow-lg overflow-hidden">
                    {REPORT_TYPES.map((rt) => (
                      <button
                        key={rt.value}
                        onClick={() => {
                          setReportType(rt.value);
                          setDropdownOpen(false);
                          setGenerated(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          reportType === rt.value
                            ? "bg-amber-100 text-amber-900 font-medium"
                            : "text-amber-800 hover:bg-amber-50"
                        }`}
                      >
                        {rt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Branch Picker */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Branch</label>
            <select
              value={selectedStore}
              onChange={(e) => { setSelectedStore(e.target.value); setGenerated(false); }}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Branches</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.storeName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker - Month & Year (sales only) */}
          {reportType === "sales" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => { setSelectedMonth(e.target.value); setGenerated(false); }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">Year</label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setGenerated(false); }}
                  className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-1">Date Range</label>
              <select
                value={invRange}
                onChange={(e) => { setInvRange(e.target.value as "today" | "yesterday" | "past7days"); setGenerated(false); }}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="past7days">Past 7 days</option>
              </select>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedStore || loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSearch className="text-base" />
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report Results */}
      {generated && (
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-amber-900">
                {activeLabel} — {selectedStoreName}
              </h2>
              <p className="text-xs text-amber-600">
                {reportType === "inventory"
                  ? invRange === "today" ? "Today" : invRange === "yesterday" ? "Yesterday" : "Past 7 days"
                  : `${selectedMonth === "All" ? "All months" : selectedMonth} ${selectedYear}`}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <FiPrinter className="text-base" />
              Print
            </button>
          </div>

          <div ref={printRef}>
            <h1 style={{ display: "none" }}>{activeLabel} — {selectedStore === "all" ? "All Branches" : selectedStoreName}</h1>
            <p className="meta" style={{ display: "none" }}>{reportType === "inventory" ? (invRange === "today" ? "Today" : invRange === "yesterday" ? "Yesterday" : "Past 7 days") : `${selectedMonth === "All" ? "All months" : selectedMonth} ${selectedYear}`}</p>

            {reportType === "sales" &&
              salesByBranch.map(({ storeId: bid, rows }, branchIndex) => {
                const branchName = stores.find((s) => s.id === bid)?.storeName ?? bid;
                const daily = rows.filter((r) => r.reportType === "Daily");
                const weekly = aggregateWeekly(rows);
                const monthly = aggregateMonthly(rows);
                const isLastBranch = branchIndex === salesByBranch.length - 1;
                return (
                  <div key={bid} className={selectedStore === "all" ? "print-branch-section space-y-8" : "space-y-8"} style={selectedStore === "all" && !isLastBranch ? { pageBreakAfter: "always" } : undefined}>
                    {selectedStore === "all" && <h2 className="text-base font-semibold text-amber-900 border-b border-amber-200 pb-2">{branchName}</h2>}
                    <div>
                      <h2 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">Daily Sales</h2>
                      <div className="overflow-x-auto">
                        {daily.length > 0 ? (
                          <table className="w-full text-left text-sm">
                            <thead className="border-b border-amber-200 text-amber-900"><tr><th className="py-2 px-2 font-semibold">Date</th><th className="py-2 px-2 font-semibold text-right">Total Sales</th></tr></thead>
                            <tbody className="divide-y divide-amber-100">
                              {daily.map((r) => (
                                <tr key={r.id} className="hover:bg-amber-50/40">
                                  <td className="py-2 px-2 text-amber-800">{r.periodMonth} {r.periodYear}</td>
                                  <td className="py-2 px-2 text-right font-medium text-emerald-700">₱{r.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="border-t border-amber-300"><tr><td className="py-2 px-2 font-semibold text-amber-900">Total</td><td className="py-2 px-2 text-right font-bold text-emerald-700">₱{daily.reduce((sum, r) => sum + r.totalSales, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr></tfoot>
                          </table>
                        ) : <p className="text-sm text-amber-600/70 italic text-center py-6">No daily sales found.</p>}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">Weekly Sales <span className="font-normal text-amber-600 text-[11px] ml-1">(auto-calculated)</span></h2>
                      <div className="overflow-x-auto">
                        {weekly.length > 0 ? (
                          <table className="w-full text-left text-sm">
                            <thead className="border-b border-amber-200 text-amber-900"><tr><th className="py-2 px-2 font-semibold">Week</th><th className="py-2 px-2 font-semibold text-right">Total Sales</th></tr></thead>
                            <tbody className="divide-y divide-amber-100">
                              {weekly.map((w) => (
                                <tr key={w.label} className="hover:bg-amber-50/40"><td className="py-2 px-2 text-amber-800 text-xs">{w.label}</td><td className="py-2 px-2 text-right font-medium text-emerald-700">₱{w.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
                              ))}
                            </tbody>
                            <tfoot className="border-t border-amber-300"><tr><td className="py-2 px-2 font-semibold text-amber-900">Total</td><td className="py-2 px-2 text-right font-bold text-emerald-700">₱{weekly.reduce((s, w) => s + w.totalSales, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr></tfoot>
                          </table>
                        ) : <p className="text-sm text-amber-600/70 italic text-center py-6">No daily data to aggregate.</p>}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">Monthly Sales <span className="font-normal text-amber-600 text-[11px] ml-1">(auto-calculated)</span></h2>
                      <div className="overflow-x-auto">
                        {monthly.length > 0 ? (
                          <table className="w-full text-left text-sm">
                            <thead className="border-b border-amber-200 text-amber-900"><tr><th className="py-2 px-2 font-semibold">Month</th><th className="py-2 px-2 font-semibold text-right">Total Sales</th></tr></thead>
                            <tbody className="divide-y divide-amber-100">
                              {monthly.map((m) => (
                                <tr key={m.label} className="hover:bg-amber-50/40"><td className="py-2 px-2 text-amber-800">{m.label}</td><td className="py-2 px-2 text-right font-medium text-emerald-700">₱{m.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
                              ))}
                            </tbody>
                            <tfoot className="border-t border-amber-300"><tr><td className="py-2 px-2 font-semibold text-amber-900">Total</td><td className="py-2 px-2 text-right font-bold text-emerald-700">₱{monthly.reduce((s, m) => s + m.totalSales, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr></tfoot>
                          </table>
                        ) : <p className="text-sm text-amber-600/70 italic text-center py-6">No daily data to aggregate.</p>}
                      </div>
                    </div>
                  </div>
                );
              })}

            {reportType === "inventory" &&
              inventoryByBranch.map(({ storeId: bid, rows }, branchIndex) => {
                const branchName = stores.find((s) => s.id === bid)?.storeName ?? bid;
                const isLastBranch = branchIndex === inventoryByBranch.length - 1;
                return (
                  <div key={bid} className={selectedStore === "all" ? "print-branch-section" : ""} style={selectedStore === "all" && !isLastBranch ? { pageBreakAfter: "always" } : undefined}>
                    {selectedStore === "all" && <h2 className="text-base font-semibold text-amber-900 border-b border-amber-200 pb-2 mb-4">{branchName}</h2>}
                    <div className="overflow-x-auto">
                      {rows.length > 0 ? (
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-amber-200 text-amber-900">
                            <tr>
                              <th className="py-2 px-2 font-semibold">Product</th>
                              <th className="py-2 px-2 font-semibold">Category</th>
                              <th className="py-2 px-2 font-semibold">Period</th>
                              <th className="py-2 px-2 font-semibold text-center">Qty</th>
                              <th className="py-2 px-2 font-semibold text-center">Used</th>
                              <th className="py-2 px-2 font-semibold text-center">Left</th>
                              <th className="py-2 px-2 font-semibold text-right">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100">
                            {rows.map((r) => {
                              const usagePercent = r.quantity > 0 ? (r.itemsUsed / r.quantity) * 100 : 0;
                              return (
                                <tr key={r.id} className="hover:bg-amber-50/40">
                                  <td className="py-2 px-2 text-amber-900 font-medium">{r.productName}<span className="text-[11px] text-amber-500 ml-1">({r.unitOfMeasurement})</span></td>
                                  <td className="py-2 px-2 text-amber-700 text-xs">{r.accountRecognition}</td>
                                  <td className="py-2 px-2 text-amber-700 text-xs">{r.periodMonth} {r.periodYear}</td>
                                  <td className="py-2 px-2 text-center text-amber-900 font-medium">{r.quantity}</td>
                                  <td className="py-2 px-2 text-center"><span className={`font-medium ${usagePercent > 80 ? "text-red-600" : usagePercent > 50 ? "text-amber-600" : "text-emerald-600"}`}>{r.itemsUsed}</span></td>
                                  <td className="py-2 px-2 text-center"><span className={`font-medium ${r.itemsLeft <= 5 ? "text-red-600" : r.itemsLeft <= 15 ? "text-amber-600" : "text-emerald-600"}`}>{r.itemsLeft}</span></td>
                                  <td className="py-2 px-2 text-right"><span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{r.reportType}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm text-amber-600/70 italic text-center py-8">No inventory reports found for this period.</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
