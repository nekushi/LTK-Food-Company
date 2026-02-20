import { getIssuedItemsForDelivery } from "@/dal/inventory/get-requested-items";
import DeliveryClient from "./DeliveryClient";

export default async function DeliveryPage() {
  const issuedItems = await getIssuedItemsForDelivery();
  return <DeliveryClient issuedItems={issuedItems} />;
}
