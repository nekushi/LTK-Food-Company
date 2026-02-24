"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { upsertSalesReport } from "@/dal/store/sales-report";
import { upsertInventoryReport } from "@/dal/store/inventory-report";
import { IoChevronDown } from "react-icons/io5";

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const REPORT_TYPES = ["Daily", "Weekly", "Monthly", "Yearly"];

const REPORT_VIEWS = [
  { value: "sales", label: "Sales Report" },
  { value: "inventory", label: "Inventory Report" },
] as const;

type ReportView = (typeof REPORT_VIEWS)[number]["value"];

const ACCOUNT_RECOGNITIONS = [
  "Office Supplies",
  "Operational Supplies",
  "Janitorial Supplies",
  "Marketing Supplies",
  "Food Supplies",
];

const UNITS = ["pcs", "kg", "g", "L", "mL", "packs", "boxes", "rolls", "bottles", "bags"];

interface BranchInventoryItem {
  id: string;
  productNameGeneral: string;
  productNameSpecific: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  unitPrice: number;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StoreSalesReportClient({
  initialReports,
  initialInventoryReports,
  branchInventory = [],
}: {
  initialReports: any[];
  initialInventoryReports: any[];
  branchInventory?: BranchInventoryItem[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [inventoryReports, setInventoryReports] = useState(initialInventoryReports);
  const [reportType, setReportType] = useState("Monthly");

  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [formWeek, setFormWeek] = useState("");
  const [formMonth, setFormMonth] = useState(MONTHS[new Date().getMonth()]);
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());

  const [formSales, setFormSales] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const [invProductName, setInvProductName] = useState("");
  const [invAccountRecognition, setInvAccountRecognition] = useState(ACCOUNT_RECOGNITIONS[0]);
  const [invUnit, setInvUnit] = useState(UNITS[0]);
  const [invQuantity, setInvQuantity] = useState<number>(0);
  const [invItemsUsed, setInvItemsUsed] = useState<number>(0);
  const [invItemsLeft, setInvItemsLeft] = useState<number>(0);
  const [invSubmitting, setInvSubmitting] = useState(false);
  const [invReportType, setInvReportType] = useState("Monthly");
  const [invFormDate, setInvFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [invFormWeek, setInvFormWeek] = useState("");
  const [invFormMonth, setInvFormMonth] = useState(MONTHS[new Date().getMonth()]);
  const [invFormYear, setInvFormYear] = useState(new Date().getFullYear().toString());

  const [activeView, setActiveView] = useState<ReportView>("sales");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mergedProducts = useMemo(() => {
    const map = new Map<string, { productName: string; accountRecognition: string; unitOfMeasurement: string; totalQuantity: number }>();

    for (const item of branchInventory) {
      const key = item.productNameGeneral;
      const existing = map.get(key);
      if (existing) {
        existing.totalQuantity += item.quantity;
      } else {
        map.set(key, {
          productName: item.productNameGeneral,
          accountRecognition: item.accountRecognition,
          unitOfMeasurement: item.unitOfMeasurement,
          totalQuantity: item.quantity,
        });
      }
    }
    return Array.from(map.values());
  }, [branchInventory]);

  const isProductFromInventory = useMemo(
    () => mergedProducts.some((p) => p.productName === invProductName),
    [mergedProducts, invProductName],
  );

  const handleProductSelect = (productName: string) => {
    setInvProductName(productName);
    const match = mergedProducts.find((p) => p.productName === productName);
    if (match) {
      setInvAccountRecognition(match.accountRecognition);
      setInvUnit(match.unitOfMeasurement);
      setInvQuantity(match.totalQuantity);
      setInvItemsLeft(Math.max(0, match.totalQuantity - invItemsUsed));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getWeekString = (weekVal: string) => {
    if (!weekVal) return "";
    const [year, week] = weekVal.split("-W");
    return `Week ${week} (${year})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let finalMonth = "";
    let finalYear = "";

    if (reportType === "Daily") {
      finalMonth = new Date(formDate).toLocaleDateString();
      finalYear = new Date(formDate).getFullYear().toString();
    } else if (reportType === "Weekly") {
      finalMonth = getWeekString(formWeek);
      finalYear = formWeek.split("-W")[0] || formYear;
    } else if (reportType === "Monthly") {
      finalMonth = formMonth;
      finalYear = formYear;
    } else if (reportType === "Yearly") {
      finalMonth = "All Year";
      finalYear = formYear;
    }

    const result = await upsertSalesReport({
      reportType,
      periodMonth: finalMonth,
      periodYear: finalYear,
      totalSales: Number(formSales),
    });

    if (result.success && result.data) {
      toast.success(result.message);

      const existingIndex = reports.findIndex(
        (r) =>
          r.periodMonth === result.data.periodMonth &&
          r.periodYear === result.data.periodYear &&
          r.reportType === result.data.reportType,
      );

      if (existingIndex >= 0) {
        const newReports = [...reports];
        newReports[existingIndex] = result.data;
        setReports(newReports);
      } else {
        setReports([result.data, ...reports]);
      }

      setFormSales(0);
    } else {
      toast.error(result.message || "Failed to save sales report");
    }

    setSubmitting(false);
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvSubmitting(true);

    let finalMonth = "";
    let finalYear = "";

    if (invReportType === "Daily") {
      finalMonth = new Date(invFormDate).toLocaleDateString();
      finalYear = new Date(invFormDate).getFullYear().toString();
    } else if (invReportType === "Weekly") {
      finalMonth = getWeekString(invFormWeek);
      finalYear = invFormWeek.split("-W")[0] || invFormYear;
    } else if (invReportType === "Monthly") {
      finalMonth = invFormMonth;
      finalYear = invFormYear;
    } else if (invReportType === "Yearly") {
      finalMonth = "All Year";
      finalYear = invFormYear;
    }

    const result = await upsertInventoryReport({
      reportType: invReportType,
      periodMonth: finalMonth,
      periodYear: finalYear,
      productName: invProductName,
      accountRecognition: invAccountRecognition,
      unitOfMeasurement: invUnit,
      quantity: invQuantity,
      itemsUsed: invItemsUsed,
      itemsLeft: invItemsLeft,
    });

    if (result.success && result.data) {
      toast.success(result.message);

      const existingIndex = inventoryReports.findIndex(
        (r) =>
          r.periodMonth === result.data.periodMonth &&
          r.periodYear === result.data.periodYear &&
          r.reportType === result.data.reportType &&
          r.productName === result.data.productName,
      );

      if (existingIndex >= 0) {
        const updated = [...inventoryReports];
        updated[existingIndex] = result.data;
        setInventoryReports(updated);
      } else {
        setInventoryReports([result.data, ...inventoryReports]);
      }

      setInvProductName("");
      setInvQuantity(0);
      setInvItemsUsed(0);
      setInvItemsLeft(0);
    } else {
      toast.error(result.message || "Failed to save inventory report");
    }

    setInvSubmitting(false);
  };

  const currentViewLabel =
    REPORT_VIEWS.find((v) => v.value === activeView)?.label ?? "Sales Report";

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-amber-900">
            {currentViewLabel}
          </h1>
          <p className="text-amber-800/80">
            {activeView === "sales"
              ? "Update the store's total sales. Choose your reporting frequency. This data will be reflected on your dashboard."
              : "Submit inventory usage reports for your branch."}
          </p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 transition-colors"
          >
            {currentViewLabel}
            <IoChevronDown
              className={`h-4 w-4 text-amber-600 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-lg border border-amber-200 bg-white shadow-lg ring-1 ring-black/5">
              {REPORT_VIEWS.map((view) => (
                <button
                  key={view.value}
                  type="button"
                  onClick={() => {
                    setActiveView(view.value);
                    setDropdownOpen(false);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    activeView === view.value
                      ? "bg-amber-100 font-semibold text-amber-900"
                      : "text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeView === "sales" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm h-fit">
            <h2 className="mb-4 text-sm font-semibold text-amber-900">
              Submit Sales Reference
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Frequency</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className={inputClass}
                >
                  {REPORT_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reportType === "Daily" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}

                {reportType === "Weekly" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Week</label>
                    <input
                      type="week"
                      required
                      value={formWeek}
                      onChange={(e) => setFormWeek(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}

                {reportType === "Monthly" && (
                  <>
                    <div>
                      <label className={labelClass}>Month</label>
                      <select
                        value={formMonth}
                        onChange={(e) => setFormMonth(e.target.value)}
                        className={inputClass}
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Year</label>
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {reportType === "Yearly" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Year</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Total Sales (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formSales === 0 ? "" : formSales}
                  placeholder="0.00"
                  onChange={(e) => setFormSales(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Saving..." : `Save ${reportType} Sales Report`}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col h-[600px]">
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 shrink-0">
              <h2 className="text-sm font-semibold text-amber-900">
                Submitted Reports History
              </h2>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
              {reports.length === 0 ? (
                <p className="p-6 text-center text-sm text-amber-600/80 mt-10">
                  No sales reports submitted yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white shadow-sm border-b border-amber-200 z-10">
                    <tr className="text-amber-900 text-xs uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold">Type</th>
                      <th className="px-6 py-3 font-semibold">Period</th>
                      <th className="px-6 py-3 font-semibold text-right">
                        Added Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="px-6 py-3 text-amber-700 font-medium">
                          <span className="bg-amber-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                            {report.reportType || "Monthly"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-amber-900 font-medium whitespace-nowrap">
                          {report.reportType === "Yearly"
                            ? report.periodYear
                            : `${report.periodMonth} ${report.periodYear}`}
                        </td>
                        <td className="px-6 py-3 text-emerald-700 font-bold text-right">
                          ₱
                          {Number(report.totalSales).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm h-fit">
            <h2 className="mb-4 text-sm font-semibold text-amber-900">
              Submit Inventory Report
            </h2>
            <form onSubmit={handleInventorySubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Frequency</label>
                <select
                  value={invReportType}
                  onChange={(e) => setInvReportType(e.target.value)}
                  className={inputClass}
                >
                  {REPORT_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invReportType === "Daily" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      required
                      value={invFormDate}
                      onChange={(e) => setInvFormDate(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}

                {invReportType === "Weekly" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Week</label>
                    <input
                      type="week"
                      required
                      value={invFormWeek}
                      onChange={(e) => setInvFormWeek(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}

                {invReportType === "Monthly" && (
                  <>
                    <div>
                      <label className={labelClass}>Month</label>
                      <select
                        value={invFormMonth}
                        onChange={(e) => setInvFormMonth(e.target.value)}
                        className={inputClass}
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Year</label>
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={invFormYear}
                        onChange={(e) => setInvFormYear(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </>
                )}

                {invReportType === "Yearly" && (
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Year</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={invFormYear}
                      onChange={(e) => setInvFormYear(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  list="branch-inventory-products"
                  required
                  placeholder="Select or type a product name"
                  value={invProductName}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className={inputClass}
                />
                <datalist id="branch-inventory-products">
                  {mergedProducts.map((p) => (
                    <option key={p.productName} value={p.productName} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Account Recognition</label>
                  <select
                    value={invAccountRecognition}
                    onChange={(e) => setInvAccountRecognition(e.target.value)}
                    disabled={isProductFromInventory}
                    className={`${inputClass} ${isProductFromInventory ? "bg-amber-50/50 cursor-not-allowed" : ""}`}
                  >
                    {ACCOUNT_RECOGNITIONS.map((ar) => (
                      <option key={ar} value={ar}>
                        {ar}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Unit of Measurement</label>
                  <select
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    disabled={isProductFromInventory}
                    className={`${inputClass} ${isProductFromInventory ? "bg-amber-50/50 cursor-not-allowed" : ""}`}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Total Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="Total quantity received"
                  readOnly={isProductFromInventory}
                  value={invQuantity === 0 ? "" : invQuantity}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setInvQuantity(qty);
                    setInvItemsLeft(Math.max(0, qty - invItemsUsed));
                  }}
                  className={`${inputClass} ${isProductFromInventory ? "bg-amber-50/50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Items Used</label>
                  <input
                    type="number"
                    min="0"
                    max={invQuantity || undefined}
                    step="1"
                    required
                    placeholder="How many were used"
                    value={invItemsUsed === 0 ? "" : invItemsUsed}
                    onChange={(e) => {
                      const used = Number(e.target.value);
                      setInvItemsUsed(used);
                      setInvItemsLeft(Math.max(0, invQuantity - used));
                    }}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Items Left</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="Auto-calculated"
                    value={invItemsLeft === 0 ? "" : invItemsLeft}
                    onChange={(e) => setInvItemsLeft(Number(e.target.value))}
                    className={`${inputClass} bg-amber-50/50`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={invSubmitting}
                className="w-full mt-4 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {invSubmitting
                  ? "Saving..."
                  : `Save ${invReportType} Inventory Report`}
              </button>
            </form>
          </div>

          <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col h-[600px]">
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 shrink-0">
              <h2 className="text-sm font-semibold text-amber-900">
                Submitted Inventory Reports
              </h2>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
              {inventoryReports.length === 0 ? (
                <p className="p-6 text-center text-sm text-amber-600/80 mt-10">
                  No inventory reports submitted yet.
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white shadow-sm border-b border-amber-200 z-10">
                    <tr className="text-amber-900 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Period</th>
                      <th className="px-4 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold text-right">Qty</th>
                      <th className="px-4 py-3 font-semibold text-right">Used</th>
                      <th className="px-4 py-3 font-semibold text-right">Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50">
                    {inventoryReports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-amber-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-amber-700 font-medium">
                          <span className="bg-amber-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                            {report.reportType || "Monthly"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-amber-900 font-medium whitespace-nowrap text-xs">
                          {report.reportType === "Yearly"
                            ? report.periodYear
                            : `${report.periodMonth} ${report.periodYear}`}
                        </td>
                        <td className="px-4 py-3 text-amber-900 font-medium">
                          <div>{report.productName}</div>
                          <div className="text-[10px] text-amber-500">
                            {report.accountRecognition}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-amber-800 font-bold text-right">
                          {report.quantity}{" "}
                          <span className="text-[10px] font-normal text-amber-500">
                            {report.unitOfMeasurement}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-rose-600 font-bold text-right">
                          {report.itemsUsed}
                        </td>
                        <td className="px-4 py-3 text-emerald-700 font-bold text-right">
                          {report.itemsLeft}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
