"use server";

import prisma from "@/lib/db";
import type { RequestedItemHistoryEntry } from "@/dal/inventory/get-requested-items";

export type DeliveryHistoryEntry = RequestedItemHistoryEntry & {
  createdAt: Date;
};

export async function getDeliveryHistoryLast30Days(): Promise<DeliveryHistoryEntry[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  cutoff.setHours(0, 0, 0, 0);

  const items = await prisma.requestedItems.findMany({
    where: {
      NOT: { note: null },
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        select: { user: { select: { username: true } } },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    productNameGeneral: item.productNameGeneral,
    quantity: item.quantity,
    unitOfMeasurement: item.unitOfMeasurement,
    storeId: item.storeId,
    storeUsername: item.store.user.username,
    isRequestApproved: item.isRequestApproved,
    note: item.note,
    status: item.status,
    deliveryStatus: item.status,
    createdAt: item.createdAt,
  }));
}

