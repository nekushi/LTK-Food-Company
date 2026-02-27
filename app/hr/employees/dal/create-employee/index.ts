"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";
import { EmployeeFormValues } from "../../types";

export async function createEmployee(data: EmployeeFormValues) {
  try {
    const {
      firstName,
      lastName,
      employeeId,
      branch,
      dateHired,
      sss,
      pagIbig,
      philhealth,
      tin,
      contactNo,
      email,
      address,
    } = data;

    const newEmployee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        employeeId,
        branch: branch || null,
        createdAt: new Date(currentNow()),
        updatedAt: new Date(currentNow()),
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
