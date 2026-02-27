import { getCurrentStore } from "@/dal/store/get-current-store";
import { getOnTheWayItemsForStore } from "@/dal/inventory/get-requested-items";
import DeliveryRunClient from "@/app/delivery/DeliveryRunClient";

export const dynamic = "force-dynamic";

export default async function StoreDeliveryViewPage() {
  const store = await getCurrentStore();
  const onTheWayItems = store
    ? await getOnTheWayItemsForStore(store.id)
    : [];

  return (
    <div className="p-4">
      <DeliveryRunClient onTheWayItems={onTheWayItems} showControls={false} />
    </div>
  );
}
