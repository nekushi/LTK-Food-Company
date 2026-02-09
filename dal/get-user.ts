"use server";

import prisma from "@/lib/db";

export async function getAllUsers() {
  const users = await prisma.user.findMany();

  return users;
}

// export async function getUser(id: string) {
//   const user = await prisma.employee.findFirst({
//     where: {
//       userId: id,
//     },
//     include: {
//       user: true,
//     },
//   });

//   return user;
// }

export async function getUser(id: string) {
  const user = await prisma.user.findFirst({ where: { id } });

  return {
    id: user?.id as string,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role,
  };
}

// export async function getUser(id: string) {
//   return await prisma.$transaction(async (ctx) => {
//     const user = await ctx.user.findFirst({
//       where: { id },
//     });

//     console.log(user);
//     console.log(user?.role);

//     return {
//       id: user?.id,
//       firstName: user?.firstName,
//       lastName: user?.lastName,
//       role: user?.role,
//     };

//     if (user?.role === "EMPLOYEE") {
//       const employee = await ctx.employee.findFirst({
//         where: {
//           userId: user.id,
//         },
//         include: {
//           user: true,
//         },
//       });

//       return employee;

//       // if (!employee) return;

//       const employeeWorkData = await ctx.employeeWorkData.findFirst({
//         where: {
//           employeeId: employee?.id,
//         },
//       });

//       return employeeWorkData;
//     } else if (user?.role === "STOCK_MANAGER") {
//       const stockManager = await ctx.stockManager.findFirst({
//         where: {
//           userId: user.id,
//         },
//         include: {
//           user: true,
//         },
//       });

//       return stockManager;
//     }

//     // switch (user?.role) {
//     //   case "EMPLOYEE": {
//     //     const employee = await ctx.employee.findFirst({
//     //       where: {
//     //         userId: id,
//     //       },
//     //       include: {
//     //         user: true,
//     //       },
//     //     });

//     //     if (!employee) return;

//     //     const employeeWorkData = await ctx.employeeWorkData.findFirst({
//     //       where: {
//     //         employeeId: employee?.id,
//     //       },
//     //     });

//     //     return employeeWorkData;

//     //     break;
//     //   }
//     //   case "STOCK_MANAGER":
//     //     const stockManager = await ctx.stockManager.findFirst({
//     //       where: {
//     //         userId: id,
//     //       },
//     //       include: {
//     //         user: true,
//     //       },
//     //     });

//     //     return stockManager;
//     //     break;
//     //   default:
//     //     break;
//     // }
//   });
// }

export async function getUserWorkData(id: string) {
  return await prisma.$transaction(async (ctx) => {
    const employee = await ctx.employee.findFirst({
      where: {
        employeeId: id,
      },
    });

    const userWorkData = await ctx.employeeWorkData.findFirst({
      where: {
        employeeId: employee?.id,
      },
    });

    return userWorkData;
  });
}

type TypeReturnedUser = {
  firstName: string;
  lastName: string;
  id: string;
  role: string;
};
