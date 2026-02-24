"use server";

import prisma from "@/lib/db";
import { redirect } from "next/navigation";
// import { redirect } from "next/dist/server/api-utils";
import z, { success } from "zod";

import bcrypt from "bcrypt";

import { itemsFlowSchema } from "@/schemas/items.schema";

type ItemFlowSchema = z.infer<typeof itemsFlowSchema>;

// export async function getUser(data: UserData) {
//   console.log(`Logging in`);
// }

// type Login =
//   | { success: boolean; message: string }
//   | { success: string; errors: any | undefined };

type TypeDerived = {
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
};

function computeDerived(
  quantity: number,
  unitPrice: number,
  isVatRegistered: string | undefined,
): {
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
} {
  const totalPrice = quantity * unitPrice;
  if (isVatRegistered === "Non-VAT") {
    return {
      totalPrice,
      vatable: totalPrice,
      vat: 0,
      ewt: 0,
      netPay: totalPrice,
    };
  }
  const vatable = totalPrice / 1.12;
  const vat = totalPrice - vatable;
  const ewt = vatable * 0.01;
  const netPay = totalPrice - ewt;
  return { totalPrice, vatable, vat, ewt, netPay };
}

export async function addItems(data: ItemFlowSchema) {
  console.log(`Add items`);

  const result = itemsFlowSchema.safeParse(data);

  console.log(result);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    // console.log(tree);

    return {
      success: "validation_error",
      errors: tree,
    };
  }

  try {
    const extras = computeDerived(
      data.quantity,
      data.unitPrice,
      data.typeOfVatTaxpayer,
    );
    const itemData = {
      // username: data.username,
      // password: data.password,
      periodMonth: data.periodMonth,
      periodYear: data.periodYear,
      supplierName: data.supplierName,
      tinNumber: data.tinNo,
      typeOfVatTaxpayer: data.typeOfVatTaxpayer,
      typeOfStocks: data.typeOfStocks,
      productNameSpecific: data.productNameSpecific,
      productNameGeneral: data.productNameGeneral,
      itemCode: data.itemCode,
      accountRecognition: data.accountingRecognition,
      unitOfMeasurement: data.measurement,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice: extras.totalPrice,
      vatable: extras.vatable,
      vat: extras.vat,
      ewt: extras.ewt,
      netPay: extras.netPay,
      createdAt: new Date(`${data.periodYear}-${data.periodMonth}-${data.periodDate}T00:00:00.000Z`),
    };

    const item = await prisma.inventory.create({
      data: itemData,
    });
    //
    return {
      success: "success",
      item: itemData,
      message: "Item added successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function addAdditionalStock(id: string, data: ItemFlowSchema) {
  console.log(`Add additional stock`);

  const result = itemsFlowSchema.safeParse(data);

  if (!result.success) {
    const tree = z.treeifyError(result.error);
    return {
      success: "validation_error",
      errors: tree,
    };
  }

  try {
    const existing = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        message: "Base inventory item not found",
      };
    }

    const extras = computeDerived(
      data.quantity,
      data.unitPrice,
      data.typeOfVatTaxpayer,
    );

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        periodMonth: data.periodMonth,
        periodYear: data.periodYear,
        supplierName: data.supplierName,
        tinNumber: data.tinNo,
        typeOfVatTaxpayer: data.typeOfVatTaxpayer,
        typeOfStocks: data.typeOfStocks,
        productNameSpecific: data.productNameSpecific,
        productNameGeneral: data.productNameGeneral,
        itemCode: data.itemCode,
        accountRecognition: data.accountingRecognition,
        unitOfMeasurement: data.measurement,
        quantity: existing.quantity + data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: existing.totalPrice + extras.totalPrice,
        vatable: existing.vatable + extras.vatable,
        vat: existing.vat + extras.vat,
        ewt: existing.ewt + extras.ewt,
        netPay: existing.netPay + extras.netPay,
        createdAt: new Date(`${data.periodYear}-${data.periodMonth}-${data.periodDate}T00:00:00.000Z`),
      },
    });

    return {
      success: "success",
      item: updated,
      message: "Additional stock added successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}
