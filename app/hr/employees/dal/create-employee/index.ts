"use server";

import prisma from "@/lib/db";
import { EmployeeFormValues } from "../../types";

export async function createEmployee(data: EmployeeFormValues) {
  try {
    const {
      firstName,
      lastName,
      employeeId,
      dateHired,
      sss,
      pagIbig,
      philhealth,
      tin,
      contactNo,
      email,
      address,
    } = data;

    // We create the employee and immediately create the related employeeData
    const newEmployee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        employeeId,
        // Prisma will handle createdAt and updatedAt defaults
        employeeData: {
          create: {
            dateHired: new Date(dateHired),
            sss,
            pagIbig,
            philhealth,
            tin,
            contactNo,
            email,
            address,
          },
        },
        // We can optionally create an empty WorkData entry right away, or let it be created later
        employeeWorkData: {
          create: {
            data: [],
          },
        },
      },
    });

    return { success: true, employee: newEmployee };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: "Failed to create employee" };
  }
}
