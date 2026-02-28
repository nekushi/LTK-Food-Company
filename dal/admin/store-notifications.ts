"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";

export async function createStoreNotification(
  storeId: string,
  type: string,
  message: string,
) {
  try {
    await prisma.storeNotification.create({
      data: {
        storeId,
        type,
        message,
        createdAt: new Date(currentNow()),
      },
    });
  } catch (error) {
    console.error("Failed to create store notification:", error);
  }
}

export async function createStoreNotificationByUserId(
  userId: string,
  type: string,
  message: string,
) {
  try {
    const store = await prisma.store.findUnique({ where: { userId } });
    if (!store) return;
    await prisma.storeNotification.create({
      data: {
        storeId: store.id,
        type,
        message,
        createdAt: new Date(currentNow()),
      },
    });
  } catch (error) {
    console.error("Failed to create store notification:", error);
  }
}

export async function deleteStoreNotification(id: string) {
  try {
    await prisma.storeNotification.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete store notification:", error);
    return { success: false };
  }
}

export async function deleteStoreNotificationsByStore(storeId: string) {
  try {
    await prisma.storeNotification.deleteMany({ where: { storeId } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete store notifications:", error);
    return { success: false };
  }
}

export async function getStoreNotifications() {
  try {
    const notifications = await prisma.storeNotification.findMany({
      include: {
        store: {
          include: {
            user: { select: { username: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return notifications;
  } catch (error) {
    console.error("Failed to fetch store notifications:", error);
    return [];
  }
}
