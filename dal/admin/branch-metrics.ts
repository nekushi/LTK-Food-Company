"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function getBranchDailyMetrics() {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) {
    return { success: false, data: [] };
  }

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
