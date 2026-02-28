"use client";

import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L, { latLng } from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import AutoFollow from "./AutoFollow";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type MapLocation = {
  id: string | number;
  lat: number;
  lng: number;
};

export type MapDeliveryRef = {
  startTracking: () => void;
  stopTracking: () => void;
};

export type MapDeliveryProps = {
  getLocation: () => Promise<MapLocation[]>;
  postLocation: (lat: number, lng: number) => Promise<void>;
  destinationLat?: number | null;
  destinationLng?: number | null;
};

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

const MapDelivery = forwardRef<MapDeliveryRef, MapDeliveryProps>(
  ({ getLocation, postLocation, destinationLat, destinationLng }, ref) => {
    const latlngLastRef = useRef({ lat: 0, lng: 0 });
    const latlngRef = useRef({ lat: 0, lng: 0 });
    const [latlng, setLatlng] = useState({ lat: 0, lng: 0 });
    const [tracking, setTracking] = useState<boolean>(false);
    const watchId = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const DEFAULT_CENTER = { lat: 14.087257412220977, lng: 121.17774785384329 };
    const [location, setLocation] = useState<MapLocation[]>([
      { id: 0, lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng },
    ]);

    const showPosition = async (position: GeolocationPosition) => {
      const newPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      latlngRef.current = newPos;
      setLatlng(newPos);

      await postLocation(newPos.lat, newPos.lng);
    };

    const startTracking = () => {
      if (tracking) return;

      watchId.current = navigator.geolocation.watchPosition(showPosition);
      setTracking(true);
    };

    const stopTracking = () => {
      if (watchId.current != null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setTracking(false);
    };

    useImperativeHandle(ref, () => ({
      startTracking,
      stopTracking,
    }));

    const fetchLocation = async () => {
      const locationData = await getLocation();
      setLocation(locationData);
    };

    useEffect(() => {
      fetchLocation();

      const channels = supabase
        .channel("custom-all-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "location" },
          (payload: RealtimePostgresChangesPayload<MapLocation>) => {
            console.log("Change received!", payload);
            fetchLocation();

            // const oldData = payload.old;
            // const newData = payload.new;

            // if (
            //   payload.eventType === "UPDATE" &&
            //   JSON.stringify(oldData) !== JSON.stringify(newData)
            // ) {
            //   // toastUpdate();
            // } else if (payload.eventType === "DELETE") {
            //   // toastDelete();
            // }
          },
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });

      // Fallback polling so the map still updates even if realtime fails
      if (timeoutRef.current == null) {
        timeoutRef.current = window.setInterval(() => {
          fetchLocation();
        }, 5000) as unknown as number;
      }

      return () => {
        console.log("unsubscribing");
        channels.unsubscribe();
        if (timeoutRef.current != null) {
          window.clearInterval(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, [getLocation]);

    // When tracking, use live latlng from device GPS for real-time map updates
    const trackingHasPosition =
      tracking &&
      Number.isFinite(latlng.lat) &&
      Number.isFinite(latlng.lng) &&
      (latlng.lat !== 0 || latlng.lng !== 0);
    const centerLat = trackingHasPosition
      ? latlng.lat
      : location?.[0]?.lat ?? DEFAULT_CENTER.lat;
    const centerLng = trackingHasPosition
      ? latlng.lng
      : location?.[0]?.lng ?? DEFAULT_CENTER.lng;
    const hasValidCenter =
      Number.isFinite(centerLat) &&
      Number.isFinite(centerLng) &&
      (centerLat !== 0 || centerLng !== 0);
    const mapCenter: [number, number] = hasValidCenter
      ? [centerLat, centerLng]
      : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
    const position = trackingHasPosition
      ? { lat: latlng.lat, lng: latlng.lng }
      : location?.[0]
        ? { lat: location[0].lat, lng: location[0].lng }
        : DEFAULT_CENTER;

    return (
      <div className="absolute inset-0 min-h-[300px] rounded-lg overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={hasValidCenter ? 16 : 10}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "300px",
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <AutoFollow
            position={position}
            destinationLat={destinationLat}
            destinationLng={destinationLng}
          />
        </MapContainer>
      </div>
    );
  },
);

MapDelivery.displayName = "MapDelivery";

export default MapDelivery;
