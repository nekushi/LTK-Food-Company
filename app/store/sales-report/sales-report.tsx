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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function StoreSalesReportClient({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [formMonth, setFormMonth] = useState(MONTHS[new Date().getMonth()]);
  const [formYear, setFormYear] = useState(new Date().getFullYear().toString());
  const [formSales, setFormSales] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await upsertSalesReport({
      periodMonth: formMonth,
      periodYear: formYear,
      totalSales: Number(formSales),
    });

    if (result.success && result.data) {
      toast.success(result.message);
      
      // Update local state without full reload
      const existingIndex = reports.findIndex(
        r => r.periodMonth === result.data.periodMonth && r.periodYear === result.data.periodYear
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
          Update the store's total sales for each month. This data will be reflected on your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm h-fit">
          <h2 className="mb-4 text-sm font-semibold text-amber-900">
            Submit Monthly Sales
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              className="w-full mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Sales Report"}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 h-fit">
            <h2 className="text-sm font-semibold text-amber-900">
              Submitted Reports History
            </h2>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {reports.length === 0 ? (
              <p className="p-6 text-center text-sm text-amber-600/80">
                No sales reports submitted yet.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-10">
                  <tr className="border-b border-amber-100 text-amber-900">
                    <th className="px-6 py-3 font-medium">Period</th>
                    <th className="px-6 py-3 font-medium text-right">Total Sales</th>
                    <th className="px-6 py-3 font-medium text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                      <td className="px-6 py-3 text-amber-900 font-medium">
                        {report.periodMonth} {report.periodYear}
                      </td>
                      <td className="px-6 py-3 text-amber-900 text-right">
                        ₱{Number(report.totalSales).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3 text-amber-700/80 text-right text-xs">
                        {new Date(report.updatedAt).toLocaleDateString()}
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
