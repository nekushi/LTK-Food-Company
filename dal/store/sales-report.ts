"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function getSalesReports() {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) {
    return { success: false, data: [] };
  }

  const store = await prisma.store.findUnique({
    where: { userId: payload.userId as string },
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

export async function upsertSalesReport(data: {
  reportType: string;
  periodMonth: string;
  periodYear: string;
  totalSales: number;
}) {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) {
    return { success: false, message: "Unauthorized" };
  }

  const store = await prisma.store.findUnique({
    where: { userId: payload.userId as string },
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
      },
      create: {
        storeId: store.id,
        reportType: data.reportType,
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        totalSales: data.totalSales,
      },
    });

    return { success: true, message: "Sales report saved successfully", data: report };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to save sales report" };
  }
}
