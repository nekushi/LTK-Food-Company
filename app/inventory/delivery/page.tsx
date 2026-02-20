import { getIssuedItemsForDelivery } from "@/dal/inventory/get-requested-items";
import type { RequestedItemHistoryEntry } from "@/dal/inventory/get-requested-items";

function groupByStore(
  items: RequestedItemHistoryEntry[],
): Map<string, RequestedItemHistoryEntry[]> {
  const map = new Map<string, RequestedItemHistoryEntry[]>();
  for (const item of items) {
    const key = item.storeId;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export default async function DeliveryPage() {
  const issuedItems = await getIssuedItemsForDelivery();
  const byStore = groupByStore(issuedItems);
  const storeEntries = Array.from(byStore.entries());

  return (
    <div className="flex min-h-screen flex-col bg-[var(--ltk-blue-white)]">
      <div className="border-b border-amber-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-amber-900">
          Delivery — Issued items to deliver
        </h1>
        <p className="mt-1 text-sm text-amber-800/80">
          Issued stocks by store. These are approved requests ready for delivery.
        </p>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: list of issued items by store */}
          <div className="lg:col-span-2 space-y-4">
            {storeEntries.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center text-amber-800">
                No issued items to deliver. Issue stocks from Items Flow first.
              </div>
            ) : (
              storeEntries.map(([storeId, items]) => {
                const storeName = items[0]?.storeUsername ?? "Store";
                return (
                  <div
                    key={storeId}
                    className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden"
                  >
                    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
                      <span className="text-sm font-semibold text-amber-900">
                        {storeName}
                      </span>
                      <span className="ml-2 text-xs text-amber-700">
                        · {items.length} item{items.length !== 1 ? "s" : ""} to deliver
                      </span>
                    </div>
                    <ul className="divide-y divide-amber-100">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between px-4 py-3 text-sm text-amber-900"
                        >
                          <span className="font-medium">
                            {item.productNameGeneral} × {item.quantity}{" "}
                            {item.unitOfMeasurement}
                          </span>
                          {item.note && (
                            <span className="text-xs text-amber-600 max-w-[200px] truncate" title={item.note}>
                              {item.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: summary / map placeholder */}
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-sm font-medium text-amber-700">
                Destination
              </span>
              <p className="mt-1 font-semibold text-amber-900">
                {storeEntries.length === 0
                  ? "—"
                  : `${storeEntries.length} store${storeEntries.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-sm font-medium text-amber-700">
                Store name
              </span>
              <p className="mt-1 font-semibold text-amber-900">
                {storeEntries.length === 0
                  ? "—"
                  : storeEntries.map(([, items]) => items[0]?.storeUsername).filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <span className="text-sm font-medium text-amber-700">
                Assignment
              </span>
              <p className="mt-1 font-semibold text-amber-900">
                Assigned by inventory
              </p>
            </div>
            <div className="flex-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-6 flex items-center justify-center min-h-[200px]">
              <p className="text-center text-sm text-amber-700">
                Map placeholder — react-leaflet routing can be added here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
