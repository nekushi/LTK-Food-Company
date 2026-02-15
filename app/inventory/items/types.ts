/** Same shape as a record added from items-flow */
export type InventoryItem = {
  id: string;
  periodMonth: string;
  periodYear: string;
  typeOfStocks: string;
  typeOfVatTaxpayer?: string;
  supplierName: string;
  tinNo?: string;
  productNameSpecific: string;
  productNameGeneral: string;
  itemCode?: string;
  accountingRecognition: string;
  measurement: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatable: number;
  vat: number;
  ewt: number;
  netPay: number;
};
