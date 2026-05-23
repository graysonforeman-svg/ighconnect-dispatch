"use client";

import { useEffect, useRef, useState } from "react";
import type { RidePublic } from "@igh-connect/shared";

type Driver = {
  driverId: string;
  email: string;
  lat: number;
  lng: number;
  vehiclePlate: string | null;
};

export function OpsMap({
  rides,
  drivers,
}: {
  rides: RidePublic[];
  drivers: Driver[];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{
    map: import("leaflet").Map;
    layerGroup: import("leaflet").LayerGroup;
  } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        const L = (await import("leaflet")).default;

        if (cancelled || !mapRef.current) return;

        const center: [number, number] =
          drivers[0]
            ? [drivers[0].lat, drivers[0].lng]
            : rides[0]
              ? [rides[0].pickup.lat, rides[0].pickup.lng]
              : [40.7128, -74.006];

        if (!mapInstance.current) {
          const map = L.map(mapRef.current).setView(center, 11);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
          }).addTo(map);
          const layerGroup = L.layerGroup().addTo(map);
          mapInstance.current = { map, layerGroup };
        }

        const { layerGroup } = mapInstance.current;
        layerGroup.clearLayers();

        drivers.forEach((d) => {
          L.circleMarker([d.lat, d.lng], {
            radius: 8,
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 0.8,
          })
            .addTo(layerGroup)
            .bindPopup(`Driver: ${d.email}<br/>${d.vehiclePlate ?? "WAV"}`);
        });

        rides.forEach((r) => {
          L.circleMarker([r.pickup.lat, r.pickup.lng], {
            radius: 7,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.85,
          })
            .addTo(layerGroup)
            .bindPopup(
              `${r.status}<br/>${r.pickup.address}<br/>→ ${r.dropoff.address}`
            );
        });

        setMapError(null);
      } catch (e) {
        setMapError(e instanceof Error ? e.message : "Map failed to load");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rides, drivers]);

  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.map.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  if (mapError) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-center text-sm text-slate-400">
        Map unavailable: {mapError}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="h-[400px] w-full rounded-xl border border-slate-700"
    />
  );
}
