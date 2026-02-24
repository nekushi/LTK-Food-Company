import { getSalesReports } from "@/dal/store/sales-report";
import Link from "next/link";

export default async function StoreDashboardPage() {
  const result = await getSalesReports();
  const salesReports = result.success ? result.data : [];

  // Get current year
  const currentYear = new Date().getFullYear().toString();
  const currentYearReports = salesReports.filter(r => r.periodYear === currentYear);
  const totalYearSales = currentYearReports.reduce((sum, r) => sum + r.totalSales, 0);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Store Dashboard</h1>
        <p className="text-amber-800/80">
          Overview of your store's performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm flex flex-col justify-between hidden">
          {/* Other potential metrics can go here */}
        </div>
        
        <div className="rounded-xl border border-amber-200 bg-amber-500 text-white p-6 shadow-sm flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-1">
          <div>
            <h2 className="text-sm font-medium text-amber-100 uppercase tracking-wider mb-1">
              {currentYear} Total Sales
            </h2>
            <div className="text-3xl font-bold">
              ₱{totalYearSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-400/30 flex justify-between items-center">
            <span className="text-sm text-amber-100">{currentYearReports.length} months reported</span>
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
          {salesReports.length === 0 ? (
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
              <thead className="bg-white">
                <tr className="border-b border-amber-100 text-amber-900">
                  <th className="px-6 py-3 font-medium">Period</th>
                  <th className="px-6 py-3 font-medium text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {salesReports.slice(0, 5).map((report) => (
                  <tr key={report.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="px-6 py-3 text-amber-900 font-medium whitespace-nowrap">
                      {report.periodMonth} {report.periodYear}
                    </td>
                    <td className="px-6 py-3 text-amber-900 text-right font-medium">
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
