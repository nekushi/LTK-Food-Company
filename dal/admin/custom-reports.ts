"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function matchesMonth(periodMonth: string, targetMonth: string): boolean {
  if (periodMonth === targetMonth) return true;

  const parsed = new Date(periodMonth);
  if (!isNaN(parsed.getTime())) {
    return MONTH_NAMES[parsed.getMonth()] === targetMonth;
  }

  return false;
}

export async function getCustomSalesReport(storeId: string, month: string, year: string) {
  try {
    const where: {
      storeId?: string;
      periodYear: string;
    } = {
      periodYear: year,
    };

    if (storeId !== "all") {
      where.storeId = storeId;
    }

    const reports = await prisma.salesReport.findMany({
      where,
      orderBy: [{ reportType: "asc" }, { createdAt: "desc" }],
    });

    if (month === "All") {
      return { success: true, data: reports };
    }

    const filtered = reports.filter((r) => matchesMonth(r.periodMonth, month));
    return { success: true, data: filtered };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function getCustomInventoryReport(storeId: string, month: string, year: string) {
  try {
    const where: {
      storeId?: string;
      periodYear: string;
    } = {
      periodYear: year,
    };

    if (storeId !== "all") {
      where.storeId = storeId;
    }

    const reports = await prisma.inventoryReport.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });

    if (month === "All") {
      return { success: true, data: reports };
    }

    const filtered = reports.filter((r) => matchesMonth(r.periodMonth, month));
    return { success: true, data: filtered };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function getInventoryReportByRange(
  storeId: string,
  range: "today" | "yesterday" | "past7days",
) {
  try {
    const now = new Date(currentNow());
    let where: {
      storeId?: string;
      createdAt: { gte: Date; lte?: Date } | { gte: Date };
    };

    if (range === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      where = { createdAt: { gte: start } };
    } else if (range === "yesterday") {
      const start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      where = { createdAt: { gte: start, lte: end } };
    } else {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
      where = { createdAt: { gte: cutoff } };
    }

    if (storeId !== "all") {
      where.storeId = storeId;
    }

    const reports = await prisma.inventoryReport.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}
