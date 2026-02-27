"use server";

import prisma from "@/lib/db";
import { MergedItemReturnTypeInventory } from "./request-items";

export type RequestedItemPersistent = {
  id: string;
  productNameGeneral: string;
  quantity: number;
  accountRecognition: string;
  unitOfMeasurement: string;
  storeId: string;
  storeUsername: string;
  isRequestApproved: boolean;
  note: string | null;
};

/** Pending requests only (note is null). Use for inventory dashboard. */
export async function getRequestedItemsWithStore(): Promise<
  RequestedItemPersistent[]
> {
  const requestedItems = await prisma.requestedItems.findMany({
    where: { note: null },
    orderBy: { id: "desc" },
    include: {
      store: {
        select: {
          id: true,
          user: { select: { username: true } },
        },
      },
    },
  });

  return requestedItems.map((item) => ({
    id: item.id,
    productNameGeneral: item.productNameGeneral,
    quantity: item.quantity,
    accountRecognition: item.accountRecognition,
    unitOfMeasurement: item.unitOfMeasurement,
    storeId: item.storeId,
    storeUsername: item.store.user.username,
    isRequestApproved: item.isRequestApproved,
    note: item.note,
  }));
}

export type ApproveRejectResult = {
  success: boolean;
  message: string;
};

/** Approve a request (set of item ids from one store). Notifies store via persistence (visible in /store/history). */
export async function approveRequest(
  itemIds: string[],
  note: string,
): Promise<ApproveRejectResult> {
  try {
    await prisma.requestedItems.updateMany({
      where: { id: { in: itemIds } },
      data: { isRequestApproved: true, note: note.trim() || null },
    });
    return { success: true, message: "Request approved." };
  } catch (error) {
    console.error("approveRequest", error);
    return { success: false, message: "Something went wrong." };
  }
}

/** Reject a request. Notifies store via persistence (visible in /store/history). */
export async function rejectRequest(
  itemIds: string[],
  note: string,
): Promise<ApproveRejectResult> {
  try {
    await prisma.requestedItems.updateMany({
      where: { id: { in: itemIds } },
      data: { isRequestApproved: false, note: note.trim() || null },
    });
    return { success: true, message: "Request rejected." };
  } catch (error) {
    console.error("rejectRequest", error);
    return { success: false, message: "Something went wrong." };
  }
}

export type RequestedItemHistoryEntry = {
  id: string;
  productNameGeneral: string;
  quantity: number;
  unitOfMeasurement: string;
  storeId: string;
  storeUsername: string;
  isRequestApproved: boolean;
  note: string | null;
  status: string | null;
  deliveryStatus: string | null;
};

export type OnTheWayItemEntry = RequestedItemHistoryEntry & {
  storeLatitude: number | null;
  storeLongitude: number | null;
};

/** Items with deliveryStatus "on the way" for a specific store (store delivery view). */
export async function getOnTheWayItemsForStore(
  storeId: string,
): Promise<OnTheWayItemEntry[]> {
  const items = await prisma.requestedItems.findMany({
    where: {
      storeId,
      isRequestApproved: true,
      NOT: { note: null },
      status: "on the way",
    },
    orderBy: { id: "desc" },
    include: {
      store: {
        select: {
          user: { select: { username: true } },
          latitude: true,
          longitude: true,
        },
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
    storeLatitude: item.store.latitude,
    storeLongitude: item.store.longitude,
  }));
}

/** Items with deliveryStatus "on the way" for /delivery page (driver view). */
export async function getOnTheWayItemsForDelivery(): Promise<
  OnTheWayItemEntry[]
> {
  const items = await prisma.requestedItems.findMany({
    where: {
      isRequestApproved: true,
      NOT: { note: null },
      status: "on the way",
    },
    orderBy: { id: "desc" },
    include: {
      store: {
        select: {
          user: { select: { username: true } },
          latitude: true,
          longitude: true,
        },
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
    storeLatitude: item.store.latitude,
    storeLongitude: item.store.longitude,
  }));
}

/** Issued items (approved, with note) for delivery page. Only "to be delivered" or null status. */
export async function getIssuedItemsForDelivery(): Promise<
  RequestedItemHistoryEntry[]
> {
  const items = await prisma.requestedItems.findMany({
    where: {
      isRequestApproved: true,
      NOT: { note: null },
      OR: [
        { status: null },
        { status: "to be delivered" },
      ],
    },
    orderBy: { id: "desc" },
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
  }));
}

/** Decided requests (note set) for inventory history page. */
export async function getRequestedItemsHistoryForInventory(): Promise<
  RequestedItemHistoryEntry[]
> {
  const items = await prisma.requestedItems.findMany({
    where: { NOT: { note: null } },
    orderBy: { id: "desc" },
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
  }));
}

/** Decided requests for one store (for /store/history). Uses session to resolve store. */
export async function getRequestedItemsHistoryForStore(): Promise<
  RequestedItemHistoryEntry[]
> {
  const { cookies } = await import("next/headers");
  const { decrypt } = await import("@/lib/session");
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);
  const store = await prisma.store.findUnique({
    where: { userId: payload?.userId },
    select: { id: true },
  });
  if (!store) return [];
  const items = await prisma.requestedItems.findMany({
    where: { storeId: store.id, NOT: { note: null } },
    orderBy: { id: "desc" },
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
  }));
}

export interface MergedItemReturnTypeInventoryWithStore extends MergedItemReturnTypeInventory {
  storeId: string;
  storeUsername: string;
}

/** Get requested items available for issuing stocks — matches the dashboard filter. */
export async function getApprovedRequestedItems(): Promise<
  (MergedItemReturnTypeInventoryWithStore & { availableStock: number })[]
> {
  const requestedItems = await prisma.requestedItems.findMany({
    where: { note: null },
    orderBy: { id: "desc" },
    include: {
      store: {
        select: {
          id: true,
          user: { select: { username: true } },
        },
      },
    },
  });

  const productNames = [
    ...new Set(requestedItems.map((i) => i.productNameGeneral)),
  ];
  const inventoryItems = await prisma.inventory.findMany({
    where: {
      productNameGeneral: { in: productNames },
      typeOfStocks: { not: "Issued Stocks" },
      quantity: { gt: 0 },
    },
    select: { productNameGeneral: true, quantity: true },
  });

  const stockMap: Record<string, number> = {};
  for (const inv of inventoryItems) {
    stockMap[inv.productNameGeneral] =
      (stockMap[inv.productNameGeneral] || 0) + inv.quantity;
  }

  return requestedItems.map((item) => ({
    id: item.id,
    productNameGeneral: item.productNameGeneral,
    productNameSpecific: item.productNameSpecific,
    quantity: item.quantity,
    accountRecognition: item.accountRecognition,
    unitOfMeasurement: item.unitOfMeasurement,
    periodMonth: item.periodMonth,
    periodYear: item.periodYear,
    supplierName: item.supplierName,
    tinNumber: item.tinNumber || "",
    typeOfVatTaxpayer: item.typeOfVatTaxpayer || "",
    typeOfStocks: item.typeOfStocks,
    itemCode: item.itemCode || "",
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    vatable: item.vatable,
    vat: item.vat,
    ewt: item.ewt,
    netPay: item.netPay,
    storeId: item.storeId,
    storeUsername: item.store.user.username,
    isRequestApproved: item.isRequestApproved,
    note: item.note,
    availableStock: stockMap[item.productNameGeneral] || 0,
  }));
}

export type IssueStockResult = {
  success: boolean;
  message: string;
};

/** Issue stock: reduce inventory quantity and mark request as approved/issued. */
export async function issueStock(
  requestedItemId: string,
  note: string,
): Promise<IssueStockResult> {
  try {
    const requestedItem = await prisma.requestedItems.findUnique({
      where: { id: requestedItemId },
    });

    if (!requestedItem) {
      return { success: false, message: "Requested item not found." };
    }

    const inventoryItems = await prisma.inventory.findMany({
      where: {
        productNameGeneral: requestedItem.productNameGeneral,
        typeOfStocks: { not: "Issued Stocks" },
      },
      orderBy: { id: "asc" },
    });

    const totalAvailable = inventoryItems.reduce((sum, i) => sum + i.quantity, 0);
    if (totalAvailable < requestedItem.quantity) {
      return {
        success: false,
        message: `Insufficient stock for "${requestedItem.productNameGeneral}". Available: ${totalAvailable}, Requested: ${requestedItem.quantity}.`,
      };
    }

    let remainingToIssue = requestedItem.quantity;

    for (const invItem of inventoryItems) {
      if (remainingToIssue <= 0) break;

      const toDeduct = Math.min(remainingToIssue, invItem.quantity);
      const newQuantity = invItem.quantity - toDeduct;

      if (newQuantity <= 0) {
        await prisma.inventory.delete({
          where: { id: invItem.id },
        });
      } else {
        const ratio = newQuantity / invItem.quantity;
        await prisma.inventory.update({
          where: { id: invItem.id },
          data: {
            quantity: newQuantity,
            totalPrice: invItem.totalPrice * ratio,
            vatable: invItem.vatable * ratio,
            vat: invItem.vat * ratio,
            ewt: invItem.ewt * ratio,
            netPay: invItem.netPay * ratio,
          },
        });
      }
      remainingToIssue -= toDeduct;
    }

    await prisma.requestedItems.update({
      where: { id: requestedItemId },
      data: {
        isRequestApproved: true,
        note: note.trim() || "Stock issued",
        status: "to be delivered",
      },
    });

    return { success: true, message: "Stock issued successfully." };
  } catch (error) {
    console.error("issueStock", error);
    return { success: false, message: "Something went wrong." };
  }
}

export async function getStoreUsername(
  storeId: string,
): Promise<string | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { user: { select: { username: true } } },
  });

  return store?.user.username ?? null;
}

/** Set deliveryStatus for requested items (e.g. "on the way" when Off for Delivery). */
export async function setDeliveryStatus(
  requestedItemIds: string[],
  deliveryStatus: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    if (requestedItemIds.length === 0) {
      return { success: true };
    }
    await prisma.requestedItems.updateMany({
      where: { id: { in: requestedItemIds } },
      data: { status: deliveryStatus },
    });
    return { success: true };
  } catch (error) {
    console.error("setDeliveryStatus", error);
    return { success: false, message: "Failed to update delivery status." };
  }
}

export type RequestedItemsGroupedByStore = Record<
  string,
  RequestedItemPersistent[]
>;

export async function getRequestedItemsGroupedByStore(): Promise<RequestedItemsGroupedByStore> {
  const items = await getRequestedItemsWithStore();
  const grouped: RequestedItemsGroupedByStore = {};
  for (const item of items) {
    const list = grouped[item.storeId] ?? [];
    list.push(item);
    grouped[item.storeId] = list;
  }
  return grouped;
}
