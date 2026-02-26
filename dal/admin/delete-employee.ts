"use server";

import prisma from "@/lib/db";

export async function deleteEmployee(employeeId: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return { success: false, message: "Employee not found" };
    }

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return { success: true, message: "Employee deleted successfully" };
  } catch (error) {
    console.error("deleteEmployee:", error);
    return { success: false, message: "Failed to delete employee" };
  }
}
