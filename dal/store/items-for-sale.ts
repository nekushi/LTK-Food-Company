"use server";

import prisma from "@/lib/db";
import { getCurrentStore } from "@/dal/store/get-current-store";

export type ItemForSale = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

/** Existing helper: uses session to infer current store. */
export async function getItemsForSaleForStore(): Promise<ItemForSale[]> {
  const store = await getCurrentStore();
  if (!store) return [];

  const items = await prisma.itemsForSale.findMany({
    where: { storeId: store.id },
    orderBy: { name: "asc" },
  });

  return items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  }));
}

/** Existing helper: uses session to infer current store. */
export async function upsertItemForSale(input: {
  id?: string;
  name: string;
  quantity: number;
  price?: number;
}): Promise<{ success: boolean; message: string }> {
  const store = await getCurrentStore();
  if (!store) {
    return { success: false, message: "Store not found" };
  }

  const trimmedName = input.name.trim();
  if (!trimmedName) {
    return { success: false, message: "Name is required" };
  }

  const quantity = Number.isFinite(input.quantity)
    ? Math.max(0, Math.floor(input.quantity))
    : 0;
  const price = Number.isFinite(input.price ?? 0) ? Number(input.price) : 0;

  try {
    await prisma.itemsForSale.upsert({
      where: {
        storeId_name: {
          storeId: store.id,
          name: trimmedName,
        },
      },
      update: {
        quantity,
        price,
      },
      create: {
        storeId: store.id,
        name: trimmedName,
        quantity,
        price,
      },
    });

    return { success: true, message: "Item saved." };
  } catch (error) {
    console.error("upsertItemForSale", error);
    return { success: false, message: "Failed to save item." };
  }
}

/** New helpers: rely on explicit storeId (from localStorage on the client), not session. */
export async function getItemsForSaleByStoreId(
  storeId: string,
): Promise<ItemForSale[]> {
  if (!storeId) return [];

  const items = await prisma.itemsForSale.findMany({
    where: { storeId },
    orderBy: { name: "asc" },
  });

  return items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  }));
}

export async function upsertItemForSaleForStoreId(input: {
  storeId: string;
  name: string;
  quantity: number;
  price?: number;
}): Promise<{ success: boolean; message: string }> {
  const trimmedName = input.name.trim();
  if (!trimmedName || !input.storeId) {
    return { success: false, message: "Store and name are required" };
  }

  const quantity = Number.isFinite(input.quantity)
    ? Math.max(0, Math.floor(input.quantity))
    : 0;
  const price = Number.isFinite(input.price ?? 0) ? Number(input.price) : 0;

  try {
    await prisma.itemsForSale.upsert({
      where: {
        storeId_name: {
          storeId: input.storeId,
          name: trimmedName,
        },
      },
      update: {
        quantity,
        price,
      },
      create: {
        storeId: input.storeId,
        name: trimmedName,
        quantity,
        price,
      },
    });

    return { success: true, message: "Item saved." };
  } catch (error) {
    console.error("upsertItemForSaleForStoreId", error);
    return { success: false, message: "Failed to save item." };
  }
}

export type PosCheckoutLine = {
  id: string;
  quantity: number;
};

export async function checkoutItemsForSaleForStoreId(input: {
  storeId: string;
  lines: PosCheckoutLine[];
}): Promise<{ success: boolean; message: string }> {
  if (!input.storeId || input.lines.length === 0) {
    return { success: false, message: "Nothing to checkout." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const ids = input.lines.map((l) => l.id);
      const items = await tx.itemsForSale.findMany({
        where: {
          storeId: input.storeId,
          id: { in: ids },
        },
      });

      for (const item of items) {
        const line = input.lines.find((l) => l.id === item.id);
        if (!line) continue;
        const newQty = Math.max(0, item.quantity - line.quantity);
        await tx.itemsForSale.update({
          where: { id: item.id },
          data: { quantity: newQty },
        });
      }
    });

    return { success: true, message: "Checkout completed." };
  } catch (error) {
    console.error("checkoutItemsForSaleForStoreId", error);
    return { success: false, message: "Failed to checkout." };
  }
}


