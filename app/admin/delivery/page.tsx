import { getIssuedItemsForDelivery } from "@/dal/inventory/get-requested-items";
import DeliveryClient from "@/app/inventory/delivery/DeliveryClient";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const issuedItems = await getIssuedItemsForDelivery();
  return <DeliveryClient issuedItems={issuedItems} />;
}

