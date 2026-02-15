/** Request history entry for a store */
export type StoreRequestHistoryEntry = {
  id: string;
  date: string;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unit: string;
  status: "Pending" | "Approved" | "Delivered" | "Cancelled";
  notes?: string;
};
