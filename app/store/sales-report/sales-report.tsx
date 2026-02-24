"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { upsertSalesReport } from "@/dal/store/sales-report";

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const REPORT_TYPES = ["Daily", "Weekly", "Monthly", "Yearly"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StoreSalesReportClient({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [reportType, setReportType] = useState("Monthly");
  
  // Input states based on type
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]); // For daily
  const [formWeek, setFormWeek] = useState(""); // For weekly
  const [formMonth, setFormMonth] = useState(MONTHS[new Date().getMonth()]); // For monthly
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString()); // Used across multiple
  
  const [formSales, setFormSales] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Helper to format week string cleanly from `<input type="week">`
  const getWeekString = (weekVal: string) => {
    if (!weekVal) return "";
    const [year, week] = weekVal.split('-W');
    return `Week ${week} (${year})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let finalMonth = "";
    let finalYear = "";

    // Parse the inputs into standard DB fields based on report type
    if (reportType === "Daily") {
      finalMonth = new Date(formDate).toLocaleDateString(); // e.g. "3/15/2026"
      finalYear = new Date(formDate).getFullYear().toString();
    } else if (reportType === "Weekly") {
      finalMonth = getWeekString(formWeek);
      finalYear = formWeek.split('-W')[0] || formYear;
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
      
      // Update local state without full reload
      const existingIndex = reports.findIndex(
        r => r.periodMonth === result.data.periodMonth && 
             r.periodYear === result.data.periodYear &&
             r.reportType === result.data.reportType
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

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Sales Report</h1>
        <p className="text-amber-800/80">
          Update the store's total sales. Choose your reporting frequency. This data will be reflected on your dashboard.
        </p>
      </div>

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
                {REPORT_TYPES.map(rt => (
                  <option key={rt} value={rt}>{rt}</option>
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
                      {MONTHS.map(m => (
                        <option key={m} value={m}>{m}</option>
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
                    <th className="px-6 py-3 font-semibold text-right">Added Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-6 py-3 text-amber-700 font-medium">
                        <span className="bg-amber-100 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200">
                          {report.reportType || "Monthly"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-amber-900 font-medium whitespace-nowrap">
                        {report.reportType === "Yearly" ? report.periodYear : `${report.periodMonth} ${report.periodYear}`}
                      </td>
                      <td className="px-6 py-3 text-emerald-700 font-bold text-right">
                        ₱{Number(report.totalSales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
