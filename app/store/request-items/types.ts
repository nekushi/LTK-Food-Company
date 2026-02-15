/** Single line in the request (matches modal JSON) */
export type RequestLineItem = {
  productName: string;
  quantity: number;
  unitOfMeasurement: string;
};

/** Available item row (from inventory – product name general, quantity, uom) */
export type AvailableItemRow = {
  id: string;
  productNameGeneral: string;
  quantity: number;
  measurement: string;
};
