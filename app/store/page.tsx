"use client";

import { useEffect, useState } from "react";
import { getSalesReports } from "@/dal/store/sales-report";
import Link from "next/link";

function computeFromDaily(
  dailyReports: { periodMonth: string; periodYear: string; totalSales: number }[],
) {
  const now = new Date();
  const currentYear = now.getFullYear().toString();

  const getSundayOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  let todaySales = 0;
  let weekSales = 0;
  let monthSales = 0;
  let yearSales = 0;
  const todayIso = now.toISOString().split("T")[0];

  const thisSunday = getSundayOfWeek(now);
  const nextSunday = new Date(thisSunday);
  nextSunday.setDate(nextSunday.getDate() + 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const r of dailyReports) {
    const parsed = new Date(r.periodMonth);
    if (isNaN(parsed.getTime())) continue;

    if (r.periodMonth === todayIso) todaySales += r.totalSales;
    if (r.periodYear === currentYear) {
      yearSales += r.totalSales;
      if (parsed >= monthStart && parsed <= now) monthSales += r.totalSales;
      if (parsed >= thisSunday && parsed < nextSunday) weekSales += r.totalSales;
    }
  }

  return { todaySales, weekSales, monthSales, yearSales };
}

export default function StoreDashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [salesReports, setSalesReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    getSalesReports(userId).then((result) => {
      if (result.success) setSalesReports(result.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-amber-900">Loading...</div>;
  }

  const dailyOnly = salesReports.filter((r) => r.reportType === "Daily");
  const { todaySales, weekSales, monthSales, yearSales } =
    computeFromDaily(dailyOnly);

  const todayReport = dailyOnly.find(
    (r) => r.periodMonth === new Date().toISOString().split("T")[0],
  );
  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Store Dashboard</h1>
        <p className="text-amber-800/80">
          Overview of your store&apos;s performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium text-amber-900/70 uppercase tracking-wider mb-1">
              Today&apos;s Sales
            </h2>
            <div className="text-3xl font-bold text-amber-900">
              ₱{todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-100 flex justify-between items-center">
            <span className="text-sm text-amber-700/70">
              {todayReport ? "Report submitted" : "No report today"}
            </span>
            <Link 
              href="/store/sales-report" 
              className="text-xs text-amber-600 font-medium hover:text-amber-800 transition-colors"
            >
              Add Daily
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium text-amber-900/70 uppercase tracking-wider mb-1">
              This Week
            </h2>
            <div className="text-3xl font-bold text-amber-900">
              ₱{weekSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className="mt-4 pt-4 border-t border-amber-100 text-xs text-amber-700/80">
            From daily reports (Sun–Sat)
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium text-amber-900/70 uppercase tracking-wider mb-1">
              This Month
            </h2>
            <div className="text-3xl font-bold text-amber-900">
              ₱{monthSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <p className="mt-4 pt-4 border-t border-amber-100 text-xs text-amber-700/80">
            From daily reports
          </p>
        </div>
        
        <div className="rounded-xl border border-amber-200 bg-amber-500 text-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-medium text-amber-100 uppercase tracking-wider mb-1">
              {currentYear} Total
            </h2>
            <div className="text-3xl font-bold">
              ₱{yearSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-400/30 flex justify-between items-center">
            <span className="text-sm text-amber-100">From daily reports</span>
            <Link 
              href="/store/sales-report" 
              className="text-xs bg-white text-amber-600 px-3 py-1.5 rounded-full font-medium hover:bg-amber-50 transition-colors"
            >
              Update Sales
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white shadow-sm mt-8">
        <div className="border-b border-amber-200 bg-amber-50 flex justify-between items-center px-6 py-4">
          <h2 className="text-base font-semibold text-amber-900">
            Recent Sales Reports
          </h2>
          <Link 
            href="/store/sales-report" 
            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
          >
            Manage Reports →
          </Link>
        </div>
        <div className="p-0">
          {dailyOnly.length === 0 ? (
            <div className="p-8 text-center text-amber-600/80">
              <p>No sales data available yet.</p>
              <Link 
                href="/store/sales-report" 
                className="inline-block mt-3 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200"
              >
                Submit First Report
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <colgroup>
                <col className="w-1/2" />
                <col className="w-1/2" />
              </colgroup>
              <thead className="bg-white">
                <tr className="border-b border-amber-100 text-amber-900">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Sales (₱)</th>
                </tr>
              </thead>
              <tbody>
                {dailyOnly.slice(0, 5).map((report) => (
                  <tr key={report.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="px-6 py-3 text-amber-900 font-medium whitespace-nowrap">
                      {new Date(report.periodMonth).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>
                    <td className="px-6 py-3 text-emerald-700 text-right font-bold">
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
  );
}
