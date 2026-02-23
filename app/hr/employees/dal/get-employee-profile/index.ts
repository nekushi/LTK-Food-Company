import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export async function getEmployeeProfile(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        employeeData: true,
        employeeWorkData: true,
      },
    });

    if (!employee) {
      return null;
    }

    return employee;
  } catch (error) {
    console.error("Failed to fetch employee profile:", error);
    return null;
  }
}
