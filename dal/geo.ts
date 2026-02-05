"use server";

import prisma from "@/lib/db";

export async function postExcelFile(results: any, employeeId: string) {
  console.log("Handle employee work data here.");
  console.log(results[employeeId]);

  // const objectLength = Object.keys(results).length;
  // console.log(objectLength); // 52

  return "hello";
}

export async function linkToEmployee(data: any) {
  const getEmployee = await prisma.employee.findUnique({
    where: {
      employeeId: data.id,
    },
  });

  console.log(`Data from geo retrieved`);
  console.log(getEmployee);

  if (!getEmployee) {
    throw new Error("Employee not found — import must be resolved first");
  }

  const workData = await prisma.employeeWorkData.create({
    data: {
      employeeId: getEmployee.id,
      data: data,
    },
  });

  return workData;
}
