/** Single in/out movement for history */
export type InventoryHistoryEntry = {
  id: string;
  date: string;       // display e.g. "Jan 15, 2025"
  periodMonth: string;
  periodYear: string;
  type: "In" | "Out"; // In = beginning/additional, Out = issued
  stockType: string;  // Beginning Stocks, Additional Stocks, Issued Stocks
  productNameGeneral: string;
  productNameSpecific: string;
  quantity: number;
  measurement: string;
  notes: string;
};
