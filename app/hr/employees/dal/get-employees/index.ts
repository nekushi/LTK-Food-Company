import prisma from "@/lib/db";

export async function getEmployees() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        employeeData: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return employees;
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    return [];
  }
}
