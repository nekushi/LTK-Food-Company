import { getAdminStoreProfile } from "@/dal/admin/manage-branch";
import { getPOSDailyReports } from "@/dal/store/pos-receipts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiMapPin, FiUser } from "react-icons/fi";
import BranchReportView from "./branch-report-view";
import StoreDetailsToggle from "./store-details-toggle";

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

function aggregateWeeklySales(
  dailyReports: SalesReportItem[],
): AggregatedSales[] {
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

function aggregateMonthlySales(
  dailyReports: SalesReportItem[],
): AggregatedSales[] {
  const MONTH_NAMES = [
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
  const computedWeekly = aggregateWeeklySales(
    dailyReports as SalesReportItem[],
  );
  const computedMonthly = aggregateMonthlySales(
    dailyReports as SalesReportItem[],
  );

  const approvedItems = profile.requestItems.filter(
    (i: RequestItemRecord) =>
      i.isRequestApproved &&
      i.status &&
      ["to be delivered", "on the way", "success"].includes(i.status),
  );
  const storeInventory = (profile as { inventory?: Array<{
    productNameGeneral: string;
    productNameSpecific: string;
    accountRecognition: string;
    unitOfMeasurement: string;
    quantity: number;
    unitPrice: number;
    netPay: number;
    supplierName: string;
  }> }).inventory ?? [];
  const dryRawKeywords = ["operational", "office", "janitorial", "marketing", "food", "dry", "raw"];
  const isDryOrRaw = (acc: string) => {
    const lower = (acc || "").toLowerCase();
    return dryRawKeywords.some((k) => lower.includes(k));
  };
  const storeInventoryDryRaw = storeInventory.filter((inv) => isDryOrRaw(inv.accountRecognition));
  const inventoryAsItems: InventoryItem[] = storeInventoryDryRaw.map((inv) => ({
    productNameGeneral: inv.productNameGeneral,
    productNameSpecific: inv.productNameSpecific,
    accountRecognition: inv.accountRecognition,
    unitOfMeasurement: inv.unitOfMeasurement,
    quantity: inv.quantity,
    unitPrice: inv.unitPrice,
    netPay: inv.netPay,
    supplierName: inv.supplierName,
  }));
  const approvedItemsDryRaw = approvedItems.filter((i: RequestItemRecord) =>
    isDryOrRaw(i.accountRecognition),
  );
  const mergedInventory = mergeInventoryItems([
    ...(approvedItemsDryRaw as InventoryItem[]),
    ...inventoryAsItems,
  ]);

  const lowStockCount = mergedInventory.filter(
    (i) => i.quantity > 0 && i.quantity <= 15,
  ).length;
  const outOfStockCount = mergedInventory.filter((i) => i.quantity <= 0).length;

  const requestHistory = profile.requestItems;
  const latitude = (profile as { latitude?: number | null }).latitude ?? null;
  const longitude =
    (profile as { longitude?: number | null }).longitude ?? null;
  const locationText =
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : "Not set";

  const requestHistorySerialized = requestHistory.map(
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
  );
  const posReports = await getPOSDailyReports(storeId);

  const inventoryReportsSerialized = (profile.inventoryReports ?? []).map(
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
  );

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="mb-2 flex items-center gap-4">
        <Link
          href="/admin/branch/manage"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 text-amber-700 transition-colors hover:bg-amber-100 hover:text-amber-900"
        >
          <FiArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-amber-900">
            <FiMapPin className="text-amber-700" />
            {profile.storeName}
          </h1>
          <p className="text-sm text-amber-700/80">
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <StoreDetailsToggle
        locationText={locationText}
        managedBy={profile.fullName || profile.storeName || "—"}
      />

      {/* Dropdown: Sales report | Stocks report */}
      <BranchReportView
        dailyReports={
          dailyReports as {
            id: string;
            periodMonth: string;
            periodYear: string;
            totalSales: number;
          }[]
        }
        computedWeekly={computedWeekly}
        computedMonthly={computedMonthly}
        mergedInventory={mergedInventory}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        requestHistory={requestHistorySerialized}
        inventoryReports={inventoryReportsSerialized}
        posTransactions={posReports.transactions}
        posStockTracker={posReports.stockTracker}
        storeName={profile.storeName}
      />
    </div>
  );
}
