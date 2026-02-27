import { getAggregatedDailySales, getAdminOverviewCounts } from "@/dal/admin/branch-metrics";
import { FiTrendingUp, FiTrendingDown, FiUsers, FiMapPin, FiBriefcase } from "react-icons/fi";
import BranchSalesCharts from "./branch-sales-charts";
import AdminLiveRequests from "./admin-live-requests";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [salesResult, overview] = await Promise.all([
    getAggregatedDailySales(),
    getAdminOverviewCounts(),
  ]);

  const sales = salesResult.success ? salesResult.data : { yesterdayTotal: 0, dayBeforeTotal: 0, percentageChange: 0, past7Days: [], past30Days: [] };
  const isPositive = sales.percentageChange >= 0;

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Admin Dashboard</h1>
        <p className="text-amber-800/80">
          Welcome to the admin panel. Use the sidebar to navigate to the various management pages.
        </p>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-amber-100 p-2.5 text-amber-700">
            <FiMapPin className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Total Branches</p>
            <p className="text-2xl font-bold text-amber-900 mt-0.5">{overview.totalBranches}</p>
            <p className="text-[11px] text-amber-500 mt-0.5">Store accounts</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-blue-100 p-2.5 text-blue-700">
            <FiUsers className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Total Personnel</p>
            <p className="text-2xl font-bold text-amber-900 mt-0.5">{overview.totalPersonnel}</p>
            <p className="text-[11px] text-amber-500 mt-0.5">All accounts</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
            <FiBriefcase className="text-xl" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Total Employees</p>
            <p className="text-2xl font-bold text-amber-900 mt-0.5">{overview.totalEmployees}</p>
            <p className="text-[11px] text-amber-500 mt-0.5">Employee records</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className={`rounded-lg p-2.5 ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
            {isPositive ? <FiTrendingUp className="text-xl" /> : <FiTrendingDown className="text-xl" />}
          </div>
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Latest Daily Sales</p>
            <p className="text-2xl font-bold text-amber-900 mt-0.5">
              ₱{sales.yesterdayTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[11px] font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}{sales.percentageChange.toFixed(1)}%
              </span>
              <span className="text-[11px] text-amber-500">
                vs ₱{sales.dayBeforeTotal.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Item Requests Section */}
      <AdminLiveRequests />

      {/* Branch Sales Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-amber-900">Branch Sales Performance</h2>
        <BranchSalesCharts past7Days={sales.past7Days} past30Days={sales.past30Days} />
      </div>
    </div>
  );
}
