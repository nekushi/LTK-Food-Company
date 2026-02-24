"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { OnTheWayItemEntry } from "@/dal/inventory/get-requested-items";
import type {
  MapDeliveryRef,
  MapLocation,
  MapDeliveryProps,
} from "@/components/delivery-map/MapDelivery";
import type { ComponentRef } from "react";

const DeliveryMapComponent = dynamic(
  () => import("@/components/delivery-map/MapDelivery"),
  {
    ssr: false,
  },
) as React.ForwardRefExoticComponent<
  MapDeliveryProps & React.RefAttributes<MapDeliveryRef>
>;

/** Haversine distance in meters */
function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function groupByStore(
  items: OnTheWayItemEntry[],
): globalThis.Map<string, OnTheWayItemEntry[]> {
  const map = new globalThis.Map<string, OnTheWayItemEntry[]>();
  for (const item of items) {
    const key = item.storeId;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

const METERS_NEAR_DESTINATION = 200;

export default function DeliveryRunClient({
  onTheWayItems,
}: {
  onTheWayItems: OnTheWayItemEntry[];
}) {
  const router = useRouter();
  const [tracking, setTracking] = useState(false);
  const [withinRange, setWithinRange] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const mapDeliveryRef = useRef<MapDeliveryRef>(null);
  const watchIdRef = useRef<number | null>(null);

  const byStore = groupByStore(onTheWayItems);
  const storeEntries = Array.from(byStore.entries());
  const firstStore = storeEntries[0];
  const firstStoreItems = firstStore?.[1] ?? [];
  const destinationLat = firstStoreItems[0]?.storeLatitude ?? null;
  const destinationLng = firstStoreItems[0]?.storeLongitude ?? null;
  const hasDestination =
    destinationLat != null &&
    destinationLng != null &&
    Number.isFinite(destinationLat) &&
    Number.isFinite(destinationLng);
  const allItemIds = onTheWayItems.map((i) => i.id);
  const storeName = firstStoreItems[0]?.storeUsername ?? "—";

  const getLocation = useCallback(async (): Promise<MapLocation[]> => {
    const res = await fetch("/api/location/get-location");
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    const list = Array.isArray(data) ? data : [data];
    return list.map((item: { id?: string; lat?: number; lng?: number }) => ({
      id: item.id ?? "",
      lat: Number(item.lat) || 0,
      lng: Number(item.lng) || 0,
    }));
  }, []);

  const postLocation = useCallback(
    async (lat: number, lng: number): Promise<void> => {
      await fetch("/api/location/post-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
    },
    [],
  );

  const stopGps = useCallback(() => {
    console.log("stop tracking");

    mapDeliveryRef.current?.stopTracking();
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  }, []);

  const handleStartGps = () => {
    if (tracking) return;
    if (!hasDestination) {
      alert(
        "No destination set for this store. Add latitude and longitude to the store to use GPS.",
      );
      return;
    }
    setWithinRange(false);
    mapDeliveryRef.current?.startTracking();
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const dist = distanceMeters(lat, lng, destinationLat!, destinationLng!);
        if (dist <= METERS_NEAR_DESTINATION) {
          stopGps();
          setWithinRange(true);
          alert(
            "You are within 100 meters of the destination. Confirm delivery when ready.",
          );
        }
      },
      (err) => {
        console.error("Geolocation error", err);
        stopGps();
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    setTracking(true);
  };

  const handleConfirmDelivery = async () => {
    if (allItemIds.length === 0) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/inventory/set-delivery-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: allItemIds,
          deliveryStatus: "success",
        }),
      });
      if (res.ok) {
        setWithinRange(false);
        router.refresh();
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 gap-4 border-b border-amber-200 pb-4 lg:grid-cols-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <span className="text-sm font-medium text-amber-700">
            Destination
          </span>
          <p className="mt-1 font-semibold text-amber-900">
            {storeEntries.length === 0 ? "—" : "1 store"}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <span className="text-sm font-medium text-amber-700">Store name</span>
          <p className="mt-1 font-semibold text-amber-900">{storeName}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <span className="text-sm font-medium text-amber-700">Assignment</span>
          <p className="mt-1 font-semibold text-amber-900">
            Assigned by inventory
          </p>
        </div>
      </div>

      {onTheWayItems.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-8 text-center text-amber-800">
          No deliveries on the way. Assign items from Inventory → Delivery and
          mark &quot;Off for Delivery&quot; first.
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
              <span className="text-sm font-semibold text-amber-900">
                Items to deliver
              </span>
            </div>
            <ul className="divide-y divide-amber-100">
              {onTheWayItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 text-sm text-amber-900"
                >
                  <span className="font-medium">
                    {item.productNameGeneral} × {item.quantity}{" "}
                    {item.unitOfMeasurement}
                  </span>
                  {item.note && (
                    <span
                      className="text-xs text-amber-600 max-w-[200px] truncate"
                      title={item.note}
                    >
                      {item.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-amber-300 bg-amber-50/50 p-4">
            <button
              type="button"
              onClick={handleStartGps}
              disabled={tracking || !hasDestination}
              className="rounded-lg border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start GPS
            </button>
            <button
              type="button"
              onClick={stopGps}
              disabled={!tracking}
              className="rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Stop
            </button>
            {withinRange && (
              <button
                type="button"
                onClick={handleConfirmDelivery}
                disabled={confirming}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {confirming ? "Updating…" : "Confirm delivery (mark success)"}
              </button>
            )}
            {!hasDestination && onTheWayItems.length > 0 && (
              <p className="text-xs text-amber-700">
                Add store latitude/longitude for GPS and distance check.
              </p>
            )}
          </div>
        </>
      )}

      <div className="relative flex-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-4 min-h-[400px] flex flex-col">
        {/* {tracking ? (
          <div className="relative flex-1 min-h-[350px] w-full">
            <DeliveryMapComponent
              ref={mapDeliveryRef}
              getLocation={getLocation}
              postLocation={postLocation}
              destinationLat={destinationLat}
              destinationLng={destinationLng}
            />
          </div>
        ) : (
          <p className="text-center text-sm text-amber-700">
            Map placeholder — use Start GPS to track; you’ll be alerted when
            within 100 m of the destination.
          </p>
        )} */}
        <div className="relative flex-1 min-h-[350px] w-full">
          <DeliveryMapComponent
            ref={mapDeliveryRef}
            getLocation={getLocation}
            postLocation={postLocation}
            destinationLat={destinationLat}
            destinationLng={destinationLng}
          />
        </div>
      </div>
    </div>
  );
}
