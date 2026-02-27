"use server";

import prisma from "@/lib/db";

export async function getAdminOverviewCounts() {
  const [totalBranches, totalPersonnel, totalEmployees] = await Promise.all([
    prisma.store.count(),
    prisma.account.count(),
    prisma.employee.count(),
  ]);

  return { totalBranches, totalPersonnel, totalEmployees };
}

export async function getBranchDailyMetrics() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        user: true,
        salesReports: {
          where: { reportType: "Daily" },
        },
      },
    });

    const metrics = stores.map(store => {
      // sort daily reports by parsing periodMonth into Date (e.g., "3/15/2026")
      const sortedReports = [...store.salesReports].sort((a, b) => {
        return new Date(b.periodMonth).getTime() - new Date(a.periodMonth).getTime();
      });

      const storeName = `${store.user.firstName} ${store.user.lastName}`.trim() || `Store ${store.id.substring(0, 6)}`;

      if (sortedReports.length === 0) {
        return {
          storeId: store.id,
          storeName,
          latestSales: 0,
          latestDate: null,
          previousSales: 0,
          percentageChange: 0,
          hasData: false,
          hasComparison: false,
        };
      }

      const latest = sortedReports[0];
      const hasComparison = sortedReports.length > 1;
      const previous = hasComparison ? sortedReports[1] : null;

      let percentageChange = 0;
      if (hasComparison && previous!.totalSales > 0) {
        percentageChange = ((latest.totalSales - previous!.totalSales) / previous!.totalSales) * 100;
      } else if (hasComparison && previous!.totalSales === 0 && latest.totalSales > 0) {
        percentageChange = 100;
      } else if (hasComparison && previous!.totalSales === 0 && latest.totalSales === 0) {
        percentageChange = 0;
      }

      return {
        storeId: store.id,
        storeName,
        latestSales: latest.totalSales,
        latestDate: latest.periodMonth,
        previousSales: previous?.totalSales || 0,
        percentageChange,
        hasData: true,
        hasComparison,
      };
    });

    // Sort metrics by storeName alphabetically for consistent display
    metrics.sort((a, b) => a.storeName.localeCompare(b.storeName));

    return { success: true, data: metrics };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function getAggregatedDailySales() {
  try {
    const dailyReports = await prisma.salesReport.findMany({
      where: { reportType: "Daily" },
      orderBy: { createdAt: "desc" },
    });

    const dateMap = new Map<string, number>();
    for (const r of dailyReports) {
      const parsed = new Date(r.periodMonth);
      if (isNaN(parsed.getTime())) continue;
      const key = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
      dateMap.set(key, (dateMap.get(key) ?? 0) + r.totalSales);
    }

    const sortedDates = Array.from(dateMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]));

    const yesterdayTotal = sortedDates[0]?.[1] ?? 0;
    const dayBeforeTotal = sortedDates[1]?.[1] ?? 0;

    let percentageChange = 0;
    if (dayBeforeTotal > 0) {
      percentageChange = ((yesterdayTotal - dayBeforeTotal) / dayBeforeTotal) * 100;
    } else if (dayBeforeTotal === 0 && yesterdayTotal > 0) {
      percentageChange = 100;
    }

    const today = new Date();
    const generatePastDays = (count: number) => {
      const result: { date: string; label: string; total: number }[] = [];
      for (let i = count; i >= 1; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        result.push({ date: key, label, total: dateMap.get(key) ?? 0 });
      }
      return result;
    };

    return {
      success: true,
      data: {
        yesterdayTotal,
        dayBeforeTotal,
        percentageChange,
        past7Days: generatePastDays(7),
        past30Days: generatePastDays(30),
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, data: { yesterdayTotal: 0, dayBeforeTotal: 0, percentageChange: 0, past7Days: [], past30Days: [] } };
  }
}
