"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })
    ._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

type LocationEntry = {
  id: string;
  lat: number;
  lng: number;
  createdAt: string;
};

const DEFAULT_CENTER: [number, number] = [14.121, 121.16];
const DEFAULT_ZOOM = 12;

function MapContent({ locations }: { locations: LocationEntry[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(
      locations.map((loc) => [loc.lat, loc.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [locations, map]);
  return null;
}

export default function DeliveryMap() {
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerId, setTimerId] = useState<number | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/location");
      if (res.ok) {
        const data = await res.json();
        setLocations(Array.isArray(data) ? data : []);
      }
    } catch {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    const id = window.setInterval(fetchLocations, 5000);
    setTimerId(id as unknown as number);
    return () => {
      if (id) {
        window.clearInterval(id);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border-2 border-amber-300 bg-amber-50/50">
        <p className="text-sm text-amber-700">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50/30 overflow-hidden">
      <MapContainer
        center={
          locations[0] ? [locations[0].lat, locations[0].lng] : DEFAULT_CENTER
        }
        zoom={DEFAULT_ZOOM}
        style={{ height: "280px", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapContent locations={locations} />
        {locations.map((loc) => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]}>
            <Popup>
              <span className="text-amber-900">
                {loc.lat}, {loc.lng}
              </span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="flex items-center justify-between border-t border-amber-200 bg-amber-50/70 px-3 py-2">
        <p className="text-xs text-amber-700">
          {locations.length === 0
            ? "No locations. POST to /api/location to add."
            : `${locations.length} location${locations.length !== 1 ? "s" : ""}`}
        </p>
        <button
          type="button"
          onClick={fetchLocations}
          className="rounded border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
