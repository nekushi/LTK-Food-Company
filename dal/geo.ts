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
  // const workData = await prisma.$transaction(async (ctx) => {

  for (const singleData of data) {
    await prisma.$transaction(async (ctx) => {
      const getEmployee = await ctx.employee.findUnique({
        where: {
          employeeId: singleData.id,
        },
      });

      // if (!getEmployee) return;

      console.log(`Data from geo retrieved`);
      console.log(getEmployee);
      // console.log(singleData);

      if (!getEmployee) {
        throw new Error("Employee not found — import must be resolved first");
      }

      const workData = await ctx.employeeWorkData.create({
        data: {
          employeeId: getEmployee.id,
          data: singleData,
        },
      });

      console.log(workData);

      // return workData;
    });
  }
  // });

  // return workData;
}
