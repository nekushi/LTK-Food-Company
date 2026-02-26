"use server";

import prisma from "@/lib/db";

export interface UpdateEmployeeDataInput {
  employeeId: string;
  dateHired?: string | null;
  sss?: string | null;
  pagIbig?: string | null;
  philhealth?: string | null;
  tin?: string | null;
  contactNo?: string | null;
  email?: string | null;
  address?: string | null;
}

export async function updateAdminEmployeeData(data: UpdateEmployeeDataInput) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      include: { employeeData: true },
    });

    if (!employee) {
      return { success: false, message: "Employee not found" };
    }

    const scalar = {
      sss: data.sss ?? null,
      pagIbig: data.pagIbig ?? null,
      philhealth: data.philhealth ?? null,
      tin: data.tin ?? null,
      contactNo: data.contactNo ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
    };

    if (employee.employeeData) {
      await prisma.employeeData.update({
        where: { id: employee.employeeData.id },
        data: {
          ...scalar,
          ...(data.dateHired != null && data.dateHired !== "" && { dateHired: new Date(data.dateHired) }),
        },
      });
    } else {
      await prisma.employeeData.create({
        data: {
          employeeId: employee.id,
          ...(data.dateHired != null && { dateHired: new Date(data.dateHired) }),
          ...scalar,
        },
      });
    }

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("updateAdminEmployeeData:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
