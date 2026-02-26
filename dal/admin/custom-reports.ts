"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

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
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);
  if (!payload?.userId) return { success: false, data: [] };

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
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);
  if (!payload?.userId) return { success: false, data: [] };

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

export async function getInventoryReportByRange(storeId: string, range: "daily" | "past7days") {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);
  if (!payload?.userId) return { success: false, data: [] };

  try {
    const cutoff = new Date();
    if (range === "daily") {
      cutoff.setHours(0, 0, 0, 0);
    } else {
      cutoff.setDate(cutoff.getDate() - 7);
      cutoff.setHours(0, 0, 0, 0);
    }

    const where: {
      storeId?: string;
      createdAt: { gte: Date };
    } = {
      createdAt: { gte: cutoff },
    };

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
