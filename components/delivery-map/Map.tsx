"use client";

import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L, { latLng } from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

import { useState, useEffect, useRef } from "react";
import AutoFollow from "./AutoFollow";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

function getUrl(src: string | { src: string }) {
  return typeof src === "string" ? src : src.src;
}

const DefaultIcon = L.icon({
  iconRetinaUrl: getUrl(iconRetinaUrl),
  iconUrl: getUrl(iconUrl),
  shadowUrl: getUrl(shadowUrl),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Map() {
  const [latlng, setLatlng] = useState({ lat: 0, lng: 0 });
  const [location, setLocation] = useState<MapLocation[]>([
    { id: "0", lat: 0, lng: 0 },
  ]);

  const getLocation = async () => {
    const res = await fetch("/api/get-location/");
    const locationData: MapLocation[] = await res.json();

    setLocation(locationData);
  };

  useEffect(() => {
    console.log("fetching data");

    getLocation();

    const channels = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "location" },
        (payload: RealtimePostgresChangesPayload<MapLocation>) => {
          console.log("Change received!", payload);
          getLocation();
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("unsubscribing");
      channels.unsubscribe();
    };
  }, [latlng.lat, latlng.lng]);
  //   }, [location.lat, location.lng]);

  return (
    <div>
      <MapContainer
        center={[location?.[0]?.lat ?? 0, location?.[0]?.lng ?? 0]}
        zoom={16}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AutoFollow position={location?.[0] ?? { lat: 0, lng: 0 }} />
      </MapContainer>

      {/* <div className="p-4 space-y-2">
        <p>Lat: {location?.[0]?.lat ?? 0}</p>
        <p>Lng: {location?.[0]?.lng ?? 0}</p>
      </div> */}
      {/* <br /> */}
      {/* <div className="pl-5">
        {location.length > 0
          ? location.map((loc: Location) => (
              <p key={loc.id}>
                {loc.lat} :: {loc.lng}
              </p>
            ))
          : "No locations yet. Start GPS first."}
      </div> */}
    </div>
  );
}

type MapLocation = {
  id: string;
  lat: number;
  lng: number;
};
