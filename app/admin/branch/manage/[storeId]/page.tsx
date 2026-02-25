import { getAdminStoreProfile } from "@/dal/admin/manage-branch";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiMapPin, FiCalendar } from "react-icons/fi";
import StoreTabs from "./store-tabs";

export const dynamic = "force-dynamic";

interface SalesReportItem {
  id: string;
  reportType: string;
  periodMonth: string;
  periodYear: string;
  totalSales: number;
}

interface RequestItemRecord {
  id: string;
  productNameGeneral: string;
  productNameSpecific: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  unitPrice: number;
  netPay: number;
  supplierName: string;
  isRequestApproved: boolean;
  status?: string | null;
  createdAt: Date;
}

interface InventoryItem {
  productNameGeneral: string;
  productNameSpecific: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  unitPrice: number;
  netPay: number;
  supplierName: string;
}

interface MergedInventory {
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  netPay: number;
}

interface AggregatedSales {
  label: string;
  totalSales: number;
}

function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function aggregateWeeklySales(dailyReports: SalesReportItem[]): AggregatedSales[] {
  const weekMap = new Map<string, { sunday: Date; total: number }>();

  for (const r of dailyReports) {
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
      return {
        label: `${fmt(sunday)} – ${fmt(sat)}, ${sunday.getFullYear()}`,
        totalSales: total,
      };
    });
}

function aggregateMonthlySales(dailyReports: SalesReportItem[]): AggregatedSales[] {
  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthMap = new Map<string, number>();

  for (const r of dailyReports) {
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

function mergeInventoryItems(items: InventoryItem[]): MergedInventory[] {
  const map = new Map<string, MergedInventory & { _totalSpend: number }>();

  for (const item of items) {
    const key = item.productNameGeneral;
    const existing = map.get(key);
    if (existing) {
      existing._totalSpend += item.quantity * item.unitPrice;
      existing.quantity += item.quantity;
    } else {
      map.set(key, {
        productName: item.productNameGeneral,
        accountRecognition: item.accountRecognition,
        unitOfMeasurement: item.unitOfMeasurement,
        quantity: item.quantity,
        netPay: 0,
        _totalSpend: item.quantity * item.unitPrice,
      });
    }
  }

  return Array.from(map.values()).map(({ _totalSpend, ...merged }) => {
    const unitPrice = merged.quantity > 0 ? _totalSpend / merged.quantity : 0;
    const totalPrice = merged.quantity * unitPrice;
    const isVat = true;
    const vatable = isVat ? totalPrice / 1.12 : totalPrice;
    const ewt = isVat ? vatable * 0.01 : 0;
    const netPay = isVat ? totalPrice - ewt : totalPrice;

    return { ...merged, netPay };
  });
}

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

  const dailyReports = profile.salesReports.filter(
    (r: SalesReportItem) => r.reportType === "Daily",
  );
  const computedWeekly = aggregateWeeklySales(dailyReports as SalesReportItem[]);
  const computedMonthly = aggregateMonthlySales(dailyReports as SalesReportItem[]);

  const approvedItems = profile.requestItems.filter(
    (i: RequestItemRecord) =>
      i.isRequestApproved &&
      i.status &&
      ["to be delivered", "on the way", "success"].includes(i.status),
  );
  const mergedInventory = mergeInventoryItems(approvedItems as InventoryItem[]);

  const lowStockCount = mergedInventory.filter(
    (i) => i.quantity > 0 && i.quantity <= 15,
  ).length;
  const outOfStockCount = mergedInventory.filter((i) => i.quantity <= 0).length;

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
            {profile.fullName} &bull; Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Sales Reports - Full Width */}
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
                  dailyReports
                    .slice(0, 4)
                    .map(
                      (r: {
                        id: string;
                        periodMonth: string;
                        periodYear: string;
                        totalSales: number;
                      }) => (
                        <tr key={r.id} className="hover:bg-amber-50/40">
                          <td className="py-2 px-1 text-amber-800">
                            {r.periodMonth} {r.periodYear}
                          </td>
                          <td className="py-2 px-1 text-right font-medium text-emerald-700">
                            ₱{r.totalSales.toLocaleString()}
                          </td>
                        </tr>
                      ),
                    )
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
          {/* Weekly Sales (auto-calculated from daily, Sunday start) */}
          <div>
            <h3 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
              Weekly Sales <span className="font-normal text-amber-600 text-[11px] ml-1">(auto-calculated)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-amber-200 text-amber-900">
                  <tr>
                    <th className="py-2 px-1 font-semibold">Week</th>
                    <th className="py-2 px-1 font-semibold text-right">Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {computedWeekly.length > 0 ? (
                    computedWeekly.slice(0, 5).map((w) => (
                      <tr key={w.label} className="hover:bg-amber-50/40">
                        <td className="py-2 px-1 text-amber-800 text-xs">{w.label}</td>
                        <td className="py-2 px-1 text-right font-medium text-emerald-700">
                          ₱{w.totalSales.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-amber-600/70 italic text-xs">
                        No daily reports to aggregate
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Sales (auto-calculated from daily) */}
          <div>
            <h3 className="text-sm font-semibold text-amber-800 mb-3 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
              Monthly Sales <span className="font-normal text-amber-600 text-[11px] ml-1">(auto-calculated)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-amber-200 text-amber-900">
                  <tr>
                    <th className="py-2 px-1 font-semibold">Month</th>
                    <th className="py-2 px-1 font-semibold text-right">Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {computedMonthly.length > 0 ? (
                    computedMonthly.slice(0, 5).map((m) => (
                      <tr key={m.label} className="hover:bg-amber-50/40">
                        <td className="py-2 px-1 text-amber-800">{m.label}</td>
                        <td className="py-2 px-1 text-right font-medium text-emerald-700">
                          ₱{m.totalSales.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-amber-600/70 italic text-xs">
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

      {/* Tabbed Inventory & Requests - Full Width */}
      <StoreTabs
        mergedInventory={mergedInventory}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        requestHistory={requestHistory.map(
          (req: {
            id: string;
            productNameSpecific: string;
            isRequestApproved: boolean;
            quantity: number;
            unitOfMeasurement: string;
            createdAt: Date;
          }) => ({
            id: req.id,
            productNameSpecific: req.productNameSpecific,
            isRequestApproved: req.isRequestApproved,
            quantity: req.quantity,
            unitOfMeasurement: req.unitOfMeasurement,
            createdAt: req.createdAt.toISOString(),
          }),
        )}
        inventoryReports={(profile.inventoryReports ?? []).map(
          (r: {
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
            createdAt: Date;
          }) => ({
            id: r.id,
            reportType: r.reportType,
            periodMonth: r.periodMonth,
            periodYear: r.periodYear,
            productName: r.productName,
            accountRecognition: r.accountRecognition,
            unitOfMeasurement: r.unitOfMeasurement,
            quantity: r.quantity,
            itemsUsed: r.itemsUsed,
            itemsLeft: r.itemsLeft,
            createdAt: r.createdAt.toISOString(),
          }),
        )}
      />
    </div>
  );
}
