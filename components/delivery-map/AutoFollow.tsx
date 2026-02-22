"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

type Props = {
  position: {
    lat: number;
    lng: number;
  };
};

// interface RefinedRoutingRef extends L.Routing.Control {
//   createMarker: () => void;
// }

export default function AutoFollow({ position }: Props) {
  const map = useMap();

  const markerRef = useRef<L.Marker | null>(null);
  //   const routingRef = useRef<L.Routing.Control | null>(null);
  const routingRef = useRef<L.Routing.Control | null>(null);

  const destination = L.latLng(14.10588, 121.15017);

  map.setView([position.lat, position.lng], map.getZoom(), {
    animate: true,
  });

  useEffect(() => {
    if (!position || position.lat === 0 || position.lng === 0) return;

    const userLatLng = L.latLng(position.lat, position.lng);

    if (!markerRef.current) {
      markerRef.current = L.marker(userLatLng).addTo(map);
      map.setView(userLatLng);
    } else {
      markerRef.current.setLatLng(userLatLng);
    }

    if (!routingRef.current) {
      routingRef.current = L.Routing.control({
        waypoints: [userLatLng, destination],
        show: false,
        addWaypoints: false,
        routeWhileDragging: false,
        router: L.Routing.osrmv1({
          serviceUrl: process.env.NEXT_PUBLIC_RAILWAY_SERVICE_URL!,
        }),
        createMarker: () => null,
        lineOptions: {
          styles: [
            {
              color: "red",
              weight: 6,
              opacity: 0.9,
            },
          ],
          extendToWaypoints: true,
          missingRouteTolerance: 30,
        },
      } as any).addTo(map);
    } else {
      routingRef.current.setWaypoints([userLatLng, destination]);
    }
  }, [position, map]);

  return null;
}
