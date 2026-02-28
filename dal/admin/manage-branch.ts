"use server";

import prisma from "@/lib/db";

export async function getAdminStores() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        user: true,
      },
    });

    const formattedStores = stores.map((store) => ({
      id: store.id,
      storeName: store.user.username || `Store ${store.id.substring(0, 6)}`,
      username: store.user.username,
      fullName: `${store.user.firstName} ${store.user.lastName}`.trim(),
      createdAt: store.createdAt,
    }));

    formattedStores.sort((a, b) => a.storeName.localeCompare(b.storeName));

    return { success: true, data: formattedStores };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function getAdminStoreProfile(storeId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        user: true,
        salesReports: {
          orderBy: [
            { periodYear: "desc" },
            { periodMonth: "desc" },
          ],
        },
        requestItems: {
          orderBy: { createdAt: "desc" },
        },
        inventoryReports: {
          orderBy: [{ periodYear: "desc" }, { createdAt: "desc" }],
        },
        inventory: true,
      },
    });

    if (!store) {
      return { success: false, data: null };
    }

    return {
      success: true,
      data: {
        id: store.id,
        storeName: store.user.username || `Store ${store.id.substring(0, 6)}`,
        username: store.user.username,
        fullName: `${store.user.firstName} ${store.user.lastName}`.trim(),
        createdAt: store.createdAt,
        latitude: store.latitude,
        longitude: store.longitude,
        salesReports: store.salesReports,
        requestItems: store.requestItems,
        inventoryReports: store.inventoryReports,
        inventory: store.inventory,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, data: null };
  }
}
