"use server";

import { TypeAttendanceCardGeo } from "@/index";
import prisma from "@/lib/db";
import { createStoreNotificationByUserId } from "@/dal/admin/store-notifications";

/**
 * Links approved card data to employees by employeeId (employee code).
 * Creates or updates EmployeeWorkData: appends each card payload to the
 * employee's data (JSON[]) so card data is owned by the matching Employee.
 * Optionally sends a store notification if userId is provided.
 */
export async function linkToEmployees(data: TypeAttendanceCardGeo[], userId?: string) {
  try {
    let linkedCount = 0;

    await prisma.$transaction(async (ctx) => {
      for (const card of data) {
        const cardEmployeeId = card.id?.trim();
        if (!cardEmployeeId) continue;

        const employee = await ctx.employee.findUnique({
          where: { employeeId: cardEmployeeId },
          include: { employeeWorkData: true },
        });

        if (!employee) continue;

        const payload = card as unknown as Record<string, unknown>;
        const newDataItem = { ...payload };

        if (employee.employeeWorkData) {
          const existingData = Array.isArray(employee.employeeWorkData.data)
            ? employee.employeeWorkData.data
            : [];
          await ctx.employeeWorkData.update({
            where: { employeeId: employee.id },
            data: {
              data: [...existingData, newDataItem],
            },
          });
        } else {
          await ctx.employeeWorkData.create({
            data: {
              employeeId: employee.id,
              data: [newDataItem],
            },
          });
        }

        linkedCount++;
      }
    });

    if (linkedCount === 0) {
      return {
        success: false,
        linkedCount: 0,
        message: "No matching employees found. Cards were not linked.",
      };
    }

    if (userId) {
      await createStoreNotificationByUserId(
        userId,
        "attendance",
        `Linked ${linkedCount} attendance card${linkedCount !== 1 ? "s" : ""} to employees`,
      );
    }

    return {
      success: true,
      linkedCount,
      message: `Linked ${linkedCount} card${linkedCount !== 1 ? "s" : ""} to employees successfully`,
    };
  } catch (error) {
    console.error("linkToEmployees error:", error);
    return {
      success: false,
      linkedCount: 0,
      message: "Something went wrong. Try again.",
    };
  }
}
