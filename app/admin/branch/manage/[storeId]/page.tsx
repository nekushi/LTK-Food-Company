import { getAdminStoreProfile } from "@/dal/admin/manage-branch";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiMapPin,
  FiCalendar,
  FiBox,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

export const dynamic = "force-dynamic";

export default async function ManageBranchProfilePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { success, data: profile } = await getAdminStoreProfile(storeId);

  if (!success || !profile) {
    notFound();
  }

  // Group sales reports by frequency
  const dailyReports = profile.salesReports.filter(
    (r: any) => r.reportType === "Daily",
  );
  const weeklyReports = profile.salesReports.filter(
    (r: any) => r.reportType === "Weekly",
  );
  const monthlyReports = profile.salesReports.filter(
    (r: any) => r.reportType === "Monthly",
  );
  const yearlyReports = profile.salesReports.filter(
    (r: any) => r.reportType === "Yearly",
  );

  // Separate completed requested items for "Inventory" versus pending/others for "Requests History"
  const inventoryItems = profile.requestItems.filter(
    (i: any) => i.status === "success" || i.deliveryStatus === "success",
  );
  const requestHistory = profile.requestItems;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          href="/admin/branch/manage"
          className="w-10 h-10 rounded-full border border-amber-200 flex items-center justify-center text-amber-700 hover:bg-amber-100 hover:text-amber-900 transition-colors"
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-3">
            <FiMapPin className="text-amber-700" />
            {profile.storeName}
          </h1>
          <p className="text-sm text-amber-700/80">
            @{profile.username} &bull; Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Sales Reports */}
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <FiCalendar className="text-amber-700" />
              Sales Reports
            </h2>

            {/* Daily Reports Table */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                Daily Sales
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-amber-200 text-amber-900">
                    <tr>
                      <th className="py-2 px-1 font-semibold">Date</th>
                      <th className="py-2 px-1 font-semibold text-right">
                        Total Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {dailyReports.length > 0 ? (
                      dailyReports.slice(0, 10).map((r: any) => (
                        <tr key={r.id} className="hover:bg-amber-50/40">
                          <td className="py-2 px-1 text-amber-800">
                            {r.periodMonth} {r.periodYear}
                          </td>
                          <td className="py-2 px-1 text-right font-medium text-emerald-700">
                            ₱{r.totalSales.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="py-4 text-center text-amber-600/70 italic text-xs"
                        >
                          No daily reports
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Weekly Reports Table */}
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                  Weekly Sales
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-amber-200 text-amber-900">
                      <tr>
                        <th className="py-2 px-1 font-semibold">Week</th>
                        <th className="py-2 px-1 font-semibold text-right">
                          Sales
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {weeklyReports.length > 0 ? (
                        weeklyReports.slice(0, 5).map((r: any) => (
                          <tr key={r.id} className="hover:bg-amber-50/40">
                            <td className="py-2 px-1 text-amber-800 text-xs">
                              {r.periodMonth}
                            </td>
                            <td className="py-2 px-1 text-right font-medium text-emerald-700">
                              ₱{r.totalSales.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="py-4 text-center text-amber-600/70 italic text-xs"
                          >
                            No reports
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Reports Table */}
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                  Monthly Sales
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-amber-200 text-amber-900">
                      <tr>
                        <th className="py-2 px-1 font-semibold">Month</th>
                        <th className="py-2 px-1 font-semibold text-right">
                          Sales
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {monthlyReports.length > 0 ? (
                        monthlyReports.slice(0, 5).map((r: any) => (
                          <tr key={r.id} className="hover:bg-amber-50/40">
                            <td className="py-2 px-1 text-amber-800">
                              {r.periodMonth} {r.periodYear}
                            </td>
                            <td className="py-2 px-1 text-right font-medium text-emerald-700">
                              ₱{r.totalSales.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="py-4 text-center text-amber-600/70 italic text-xs"
                          >
                            No reports
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory & Requests */}
        <div className="space-y-6">
          {/* Inventory Overview */}
          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <FiBox className="text-amber-700" />
              Store Inventory
            </h2>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b border-amber-100 pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800">
                        {item.productNameSpecific}
                      </h4>
                      <p className="text-xs text-amber-600/70">
                        {item.supplierName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-amber-900">
                        {item.quantity}
                      </span>
                      <span className="text-xs text-amber-700 ml-1">
                        {item.unitOfMeasurement}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-amber-600/70 italic text-center py-6">
                  No inventory data linked yet.
                </p>
              )}
            </div>
          </div>

          {/* Request History */}
          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <FiClock className="text-amber-700" />
              Request History
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {requestHistory.length > 0 ? (
                requestHistory.map((req: any) => (
                  <div
                    key={req.id}
                    className="group border border-amber-100 rounded-lg p-3 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">
                        {req.productNameSpecific}
                      </h4>
                      {req.isRequestApproved ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <FiCheckCircle /> Approved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-xs text-amber-600">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-medium text-amber-800">
                        Qty: {req.quantity} {req.unitOfMeasurement}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-amber-600/70 italic text-center py-6">
                  No requests made yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
