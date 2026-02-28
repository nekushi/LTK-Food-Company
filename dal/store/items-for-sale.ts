"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";
import { deductRecipeFromStoreInventory } from "./deduct-recipe-inventory";
import { syncInventoryReportFromPOS } from "./inventory-report";

/**
 * Store Issue Food Stocks flow: creates/updates ItemForSale only.
 * Does NOT create or modify Inventory—stores add items for sale (POS) freely here.
 */

export interface ItemForSaleRow {
  id: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
}

export async function getItemsForSale(userId: string): Promise<{
  success: boolean;
  data: ItemForSaleRow[];
}> {
  if (!userId) return { success: false, data: [] };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, data: [] };

  const items = await prisma.itemForSale.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      date: i.date.toISOString(),
    })),
  };
}

export async function getItemsForSaleToday(userId: string): Promise<{
  success: boolean;
  data: ItemForSaleRow[];
}> {
  if (!userId) return { success: false, data: [] };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, data: [] };

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const items = await prisma.itemForSale.findMany({
    where: {
      storeId: store.id,
      date: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: items.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      date: i.date.toISOString(),
    })),
  };
}

export async function upsertItemForSale(
  userId: string,
  data: { name: string; quantity: number; price: number },
): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: "Unauthorized" };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, message: "Store not found" };

  try {
    const now = new Date(currentNow());
    const existing = await prisma.itemForSale.findFirst({
      where: { storeId: store.id, name: data.name },
    });

    if (existing) {
      await prisma.itemForSale.update({
        where: { id: existing.id },
        data: {
          quantity: { increment: data.quantity },
          price: data.price,
          updatedAt: now,
        },
      });
    } else {
      await prisma.itemForSale.create({
        data: {
          storeId: store.id,
          name: data.name,
          quantity: data.quantity,
          price: data.price,
          date: now,
          createdAt: now,
        },
      });
    }

    return { success: true, message: "Item saved successfully" };
  } catch (error) {
    console.error("upsertItemForSale", error);
    return { success: false, message: "Failed to save item" };
  }
}

export async function sellItemForSale(
  userId: string,
  itemId: string,
  quantitySold: number,
): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: "Unauthorized" };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, message: "Store not found" };

  const item = await prisma.itemForSale.findFirst({
    where: { id: itemId, storeId: store.id },
  });

  if (!item) return { success: false, message: "Item not found" };
  if (item.quantity < quantitySold)
    return { success: false, message: `Only ${item.quantity} in stock` };

  try {
    const newQty = item.quantity - quantitySold;
    if (newQty <= 0) {
      await prisma.itemForSale.delete({ where: { id: itemId } });
    } else {
      await prisma.itemForSale.update({
        where: { id: itemId },
        data: { quantity: newQty, updatedAt: new Date(currentNow()) },
      });
    }
    await deductRecipeFromStoreInventory(store.id, item.name, quantitySold);
    await syncInventoryReportFromPOS(store.id, item.name, quantitySold);
    return { success: true, message: "Sale recorded" };
  } catch (error) {
    console.error("sellItemForSale", error);
    return { success: false, message: "Failed to process sale" };
  }
}

export async function deleteItemForSale(
  userId: string,
  itemId: string,
): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: "Unauthorized" };

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) return { success: false, message: "Store not found" };

  try {
    await prisma.itemForSale.deleteMany({
      where: { id: itemId, storeId: store.id },
    });
    return { success: true, message: "Item deleted" };
  } catch (error) {
    console.error("deleteItemForSale", error);
    return { success: false, message: "Failed to delete item" };
  }
}
