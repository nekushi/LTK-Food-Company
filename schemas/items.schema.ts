import z from "zod";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const STOCK_TYPES = [
  "Beginning Stocks",
  "Additional Stocks",
  "Issued Stocks",
] as const;
export const VAT_TYPES = ["VAT Registered", "Non-VAT"] as const;
export const ACCOUNTING_RECOGNITION = [
  "Office Supplies",
  "Operational Supplies",
  "Janitorials",
  "Marketing Supplies",
  "Food Supplies",
] as const;

/** For /admin/inventory/item-list: only 2 options (dry vs raw). */
export const ACCOUNTING_RECOGNITION_ITEM_LIST = [
  "Dry materials",
  "Raw materials",
] as const;
export const MEASUREMENTS = ["kg", "pc", "packs", "bundles", "g"];

export const itemsFlowSchema = z
  .object({
    periodMonth: z.string().min(1, "Required"),
    periodDate: z.string().min(1, "Required"),
    periodYear: z.string().min(1, "Required"),
    typeOfStocks: z.enum(STOCK_TYPES),
    typeOfVatTaxpayer: z.enum(VAT_TYPES).optional(),
    supplierName: z.string().min(1, "Required"),
    tinNo: z.string().optional(),
    productNameSpecific: z.string().min(1, "Required"),
    productNameGeneral: z.string().min(1, "Required"),
    itemCode: z.string().optional(),
    accountingRecognition: z.enum([
      ...ACCOUNTING_RECOGNITION,
      ...ACCOUNTING_RECOGNITION_ITEM_LIST,
    ]),
    measurement: z.string().min(1, "Required"),
    quantity: z.coerce.number().min(0.0001, "Must be greater than 0"),
    unitPrice: z.coerce.number().min(0, "Must be 0 or greater"),
    // totalPrice: z.number(),
    // vatable: z.number(),
    // vat: z.number(),
    // ewt: z.number(),
    // netPay: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.typeOfStocks !== "Issued Stocks") {
      if (!data.typeOfVatTaxpayer) {
        ctx.addIssue({
          path: ["typeOfVatTaxpayer"],
          message: "Required when not Issued stocks",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

/** Initial stock allocation: Issued Stocks only, no period (uses currentNow), store-targeted. No unit price, VAT type, supplier name, or product name specific. */
export const initialStockAllocationSchema = z.object({
  storeId: z.string().uuid("Select a store"),
  productNameGeneral: z.string().min(1, "Required"),
  itemCode: z.string().optional(),
  accountingRecognition: z.enum(ACCOUNTING_RECOGNITION),
  measurement: z.string().min(1, "Required"),
  quantity: z.coerce.number().min(0.0001, "Must be greater than 0"),
});
