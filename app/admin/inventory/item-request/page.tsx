export const dynamic = "force-dynamic";

import {
  getApprovedRequestedItems,
  getRequestedItemsHistoryForInventory,
} from "@/dal/inventory/get-requested-items";
import { getAdminStores } from "@/dal/admin/manage-branch";
import { ItemRequestClient } from "./ItemRequestClient";

export default async function AdminInventoryItemRequestPage() {
  const [incoming, history, storesResult] = await Promise.all([
    getApprovedRequestedItems(),
    getRequestedItemsHistoryForInventory(),
    getAdminStores(),
  ]);

  const storeTabs =
    storesResult.success && Array.isArray(storesResult.data)
      ? storesResult.data.map((s) => ({
          storeId: s.id,
          storeName: s.storeName,
        }))
      : [];

  return (
    <ItemRequestClient incoming={incoming} history={history} storeTabs={storeTabs} />
  );
}

