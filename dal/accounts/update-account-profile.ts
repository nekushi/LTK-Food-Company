"use server";

import prisma from "@/lib/db";
import { currentNow } from "@/lib/current-now";

interface UpdateProfileData {
  accountId: string;
  firstName: string;
  lastName: string;
  username: string;
  sss?: string;
  pagIbig?: string;
  philhealth?: string;
  tin?: string;
  contactNo?: string;
  email?: string;
  address?: string;
}

export async function updateAccountProfile(data: UpdateProfileData) {
  try {
    const account = await prisma.account.update({
      where: { id: data.accountId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      },
    });

    const employee = await prisma.employee.findFirst({
      where: {
        OR: [
          { firstName: account.firstName, lastName: account.lastName },
          { firstName: data.firstName, lastName: data.lastName },
        ],
      },
      include: { employeeData: true },
    });

    if (employee) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { firstName: data.firstName, lastName: data.lastName },
      });

      if (employee.employeeData) {
        await prisma.employeeData.update({
          where: { id: employee.employeeData.id },
          data: {
            sss: data.sss || null,
            pagIbig: data.pagIbig || null,
            philhealth: data.philhealth || null,
            tin: data.tin || null,
            contactNo: data.contactNo || null,
            email: data.email || null,
            address: data.address || null,
          },
        });
      } else {
        await prisma.employeeData.create({
          data: {
            employeeId: employee.id,
            dateHired: new Date(currentNow()),
            sss: data.sss || null,
            pagIbig: data.pagIbig || null,
            philhealth: data.philhealth || null,
            tin: data.tin || null,
            contactNo: data.contactNo || null,
            email: data.email || null,
            address: data.address || null,
          },
        });
      }
    }

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update profile" };
  }
}
