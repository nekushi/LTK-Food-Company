"use server";

import { TypeAttendanceCardGeo } from "@/index";
import prisma from "@/lib/db";

/**
 * Links approved card data to employees by employeeId (employee code).
 * Creates or updates EmployeeWorkData: appends each card payload to the
 * employee's data (JSON[]) so card data is owned by the matching Employee.
 */
export async function linkToEmployees(data: TypeAttendanceCardGeo[]) {
  try {
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
      }
    });

    return {
      success: true,
      message: "Card data linked to employees successfully",
    };
  } catch (error) {
    console.error("linkToEmployees error:", error);
    return {
      success: false,
      message: "Something went wrong. Try again.",
    };
  }
}
