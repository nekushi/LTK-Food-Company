import { getOnTheWayItemsForDelivery } from "@/dal/inventory/get-requested-items";
import DeliveryRunClient from "./DeliveryRunClient";

export default async function DeliveryPage() {
  const onTheWayItems = await getOnTheWayItemsForDelivery();
  return <DeliveryRunClient onTheWayItems={onTheWayItems} />;
}
