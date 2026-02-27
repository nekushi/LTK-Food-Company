"use server";

import prisma from "@/lib/db";

export interface POSReceiptLine {
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface POSReceiptGroup {
  receiptNo: string;
  lines: POSReceiptLine[];
  grandTotal: number;
  createdAt: string;
}

export async function savePOSReceipt(
  userId: string,
  lines: POSReceiptLine[],
): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: "Unauthorized" };
  if (lines.length === 0) return { success: false, message: "No items" };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, message: "Store not found" };

  const receiptNo = `POS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await prisma.pOSReceipt.createMany({
      data: lines.map((l) => ({
        storeId: store.id,
        receiptNo,
        itemName: l.itemName,
        quantity: l.quantity,
        price: l.price,
        total: l.total,
      })),
    });
    return { success: true, message: "Receipt saved" };
  } catch (error) {
    console.error("savePOSReceipt", error);
    return { success: false, message: "Failed to save receipt" };
  }
}

export async function getTodayPOSReceipts(userId: string): Promise<{
  success: boolean;
  data: POSReceiptGroup[];
  totalSales: number;
}> {
  if (!userId) return { success: false, data: [], totalSales: 0 };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, data: [], totalSales: 0 };

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const rows = await prisma.pOSReceipt.findMany({
    where: {
      storeId: store.id,
      createdAt: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<string, { lines: POSReceiptLine[]; createdAt: Date }>();
  let totalSales = 0;

  for (const row of rows) {
    totalSales += row.total;
    const existing = grouped.get(row.receiptNo);
    if (existing) {
      existing.lines.push({
        itemName: row.itemName,
        quantity: row.quantity,
        price: row.price,
        total: row.total,
      });
    } else {
      grouped.set(row.receiptNo, {
        lines: [
          {
            itemName: row.itemName,
            quantity: row.quantity,
            price: row.price,
            total: row.total,
          },
        ],
        createdAt: row.createdAt,
      });
    }
  }

  const data: POSReceiptGroup[] = Array.from(grouped.entries()).map(
    ([receiptNo, { lines, createdAt }]) => ({
      receiptNo,
      lines,
      grandTotal: lines.reduce((s, l) => s + l.total, 0),
      createdAt: createdAt.toISOString(),
    }),
  );

  return { success: true, data, totalSales };
}

export interface POSInventoryItem {
  itemName: string;
  initialStock: number;
  soldQty: number;
  remainingStock: number;
}

export async function getTodayPOSInventory(userId: string): Promise<{
  success: boolean;
  data: POSInventoryItem[];
}> {
  if (!userId) return { success: false, data: [] };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, data: [] };

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const [todayItems, receiptRows] = await Promise.all([
    prisma.itemForSale.findMany({
      where: {
        storeId: store.id,
        date: { gte: startOfDay, lt: endOfDay },
      },
    }),
    prisma.pOSReceipt.findMany({
      where: {
        storeId: store.id,
        createdAt: { gte: startOfDay, lt: endOfDay },
      },
    }),
  ]);

  const soldMap = new Map<string, number>();
  for (const row of receiptRows) {
    soldMap.set(row.itemName, (soldMap.get(row.itemName) ?? 0) + row.quantity);
  }

  const data: POSInventoryItem[] = todayItems.map((item) => {
    const soldQty = soldMap.get(item.name) ?? 0;
    return {
      itemName: item.name,
      initialStock: item.quantity + soldQty,
      soldQty,
      remainingStock: item.quantity,
    };
  });

  for (const [itemName, soldQty] of soldMap) {
    if (!todayItems.some((i) => i.name === itemName)) {
      data.push({
        itemName,
        initialStock: soldQty,
        soldQty,
        remainingStock: 0,
      });
    }
  }

  data.sort((a, b) => a.itemName.localeCompare(b.itemName));

  return { success: true, data };
}
