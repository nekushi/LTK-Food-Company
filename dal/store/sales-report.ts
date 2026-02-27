"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";

export async function getSalesReports(userId: string) {
  if (!userId) {
    return { success: false, data: [] };
  }

  const store = await prisma.store.findUnique({
    where: { userId },
  });

  if (!store) {
    return { success: false, data: [] };
  }

  try {
    const reports = await prisma.salesReport.findMany({
      where: { storeId: store.id },
      orderBy: [
        { periodYear: "desc" },
        { periodMonth: "desc" }, // NOTE: String sort might not be chronologically perfect for month names, but OK for now.
      ],
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function upsertSalesReport(userId: string, data: {
  reportType: string;
  periodMonth: string;
  periodYear: string;
  totalSales: number;
}) {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const store = await prisma.store.findUnique({
    where: { userId },
  });

  if (!store) {
    return { success: false, message: "Store not found" };
  }

  try {
    const report = await prisma.salesReport.upsert({
      where: {
        storeId_periodMonth_periodYear_reportType: {
          storeId: store.id,
          reportType: data.reportType,
          periodMonth: data.periodMonth,
          periodYear: data.periodYear,
        },
      },
      update: {
        totalSales: data.totalSales,
        updatedAt: new Date(currentNow()),
      },
      create: {
        storeId: store.id,
        reportType: data.reportType,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        totalSales: data.totalSales,
        createdAt: new Date(currentNow()),
      },
    });

    return { success: true, message: "Sales report saved successfully", data: report };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to save sales report" };
  }
}
