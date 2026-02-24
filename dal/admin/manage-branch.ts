"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function getAdminStores() {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  // Quick check for standard admin logic (optional for your schema, but basic safety measure)
  if (!payload?.userId) {
    return { success: false, data: [] };
  }

  try {
    const stores = await prisma.store.findMany({
      include: {
        user: true,
      },
    });

    const formattedStores = stores.map((store) => ({
      id: store.id,
      storeName: `${store.user.firstName} ${store.user.lastName}`.trim() || `Store ${store.id.substring(0, 6)}`,
      username: store.user.username,
      createdAt: store.createdAt,
    }));

    // Sort alphabetically by name
    formattedStores.sort((a, b) => a.storeName.localeCompare(b.storeName));

    return { success: true, data: formattedStores };
  } catch (error) {
    console.error(error);
    return { success: false, data: [] };
  }
}

export async function getAdminStoreProfile(storeId: string) {
  const myCookies = (await cookies()).get("session")?.value;
  const payload = await decrypt(myCookies);

  if (!payload?.userId) {
    return { success: false, data: null };
  }

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
      },
    });

    if (!store) {
      return { success: false, data: null };
    }

    return {
      success: true,
      data: {
        id: store.id,
        storeName: `${store.user.firstName} ${store.user.lastName}`.trim() || `Store ${store.id.substring(0, 6)}`,
        username: store.user.username,
        createdAt: store.createdAt,
        salesReports: store.salesReports,
        requestItems: store.requestItems,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, data: null };
  }
}
