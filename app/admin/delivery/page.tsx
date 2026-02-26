import { getOnTheWayItemsForDelivery } from "@/dal/inventory/get-requested-items";
import DeliveryRunClient from "@/app/delivery/DeliveryRunClient";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const onTheWayItems = await getOnTheWayItemsForDelivery();
  return (
    <div className="p-4">
      <DeliveryRunClient onTheWayItems={onTheWayItems} showControls={false} />
    </div>
  );
}

