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
