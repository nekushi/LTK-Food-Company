import { getBranchDailyMetrics } from "@/dal/admin/branch-metrics";
import { FiArrowUpRight, FiArrowDownRight, FiMinus } from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function AdminBranchOverviewPage() {
  const { success, data: metrics } = await getBranchDailyMetrics();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-amber-900 mb-6">Branch Overview</h1>
      
      {/* Metric Cards Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-amber-800 mb-4">Daily Sales Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {success && metrics && metrics.length > 0 ? (
            metrics.map((metric) => (
              <div key={metric.storeId} className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm flex flex-col">
                <h3 className="text-sm font-semibold text-amber-700 mb-1 truncate" title={metric.storeName}>
                  {metric.storeName}
                </h3>
                
                {metric.hasData ? (
                  <>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-amber-900 truncate">
                        ₱{metric.latestSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-amber-600/80 whitespace-nowrap">
                        {metric.latestDate}
                      </span>
                    </div>
                    
                    {metric.hasComparison ? (
                      <div className="mt-4 flex items-center gap-1.5 text-sm">
                        {metric.percentageChange > 0 ? (
                          <div className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <FiArrowUpRight className="w-4 h-4 mr-0.5" />
                            <span className="font-semibold">{metric.percentageChange.toFixed(2)}%</span>
                          </div>
                        ) : metric.percentageChange < 0 ? (
                          <div className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md">
                            <FiArrowDownRight className="w-4 h-4 mr-0.5" />
                            <span className="font-semibold">{Math.abs(metric.percentageChange).toFixed(2)}%</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded-md">
                            <FiMinus className="w-4 h-4 mr-0.5" />
                            <span className="font-semibold">0.00%</span>
                          </div>
                        )}
                        <span className="text-amber-700/70 text-xs">vs previous day</span>
                      </div>
                    ) : (
                      <div className="mt-4 text-xs text-amber-600/70 italic">
                        No previous data for comparison
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-4 text-sm text-amber-600/70 italic">
                    No daily sales reports.
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-700">
              No branch data available.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-amber-800 mb-4">Branch List</h2>
        <p className="text-amber-700">Content for Branch List and Branch Profile will go here.</p>
      </div>
    </div>
  );
}
