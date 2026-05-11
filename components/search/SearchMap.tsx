"use client";

import React, { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { CenterDetailData, Branch } from "@/lib/apiEndpoints";

export interface SearchMapMarker {
  center: CenterDetailData;
  branch: Branch;
  lat: number;
  lng: number;
  rating: number;
}

export interface SearchMapProps {
  centers: CenterDetailData[];
  hoveredCenterId: number | null;
  activeCenterId: number | null;
  focusBranch: { centerId: number; branchId: number; nonce: number } | null;
  onMarkerClick: (centerId: number, branchId: number) => void;
}

function buildPinHtml(rating: number, highlighted: boolean): string {
  const bg = highlighted ? "#225D5C" : "#111827";
  const ring = highlighted ? "0 0 0 4px rgba(34,93,92,0.25)" : "0 4px 10px rgba(0,0,0,0.25)";
  const scale = highlighted ? "scale(1.12)" : "scale(1)";
  return `
    <div style="
      display:inline-flex;align-items:center;justify-content:center;
      min-width:42px;height:30px;padding:0 10px;
      border-radius:9999px;background:${bg};color:#fff;
      font-weight:700;font-size:12px;letter-spacing:0.2px;
      box-shadow:${ring};transform:${scale};
      transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
      white-space:nowrap;
    ">${rating.toFixed(1)}</div>
  `;
}

function buildIcon(rating: number, highlighted: boolean): L.DivIcon {
  return L.divIcon({
    className: "luzori-pin",
    html: buildPinHtml(rating, highlighted),
    iconSize: [50, 30],
    iconAnchor: [25, 30],
    popupAnchor: [0, -28],
  });
}

function FitBounds({ markers }: { markers: SearchMapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (!markers.length) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 13, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [markers, map]);
  return null;
}

function FlyToBranch({
  markers,
  focusBranch,
}: {
  markers: SearchMapMarker[];
  focusBranch: SearchMapProps["focusBranch"];
}) {
  const map = useMap();
  useEffect(() => {
    if (!focusBranch) return;
    const m = markers.find(
      (x) => x.center.id === focusBranch.centerId && x.branch.id === focusBranch.branchId
    );
    if (m) {
      map.flyTo([m.lat, m.lng], Math.max(map.getZoom(), 14), { duration: 0.7 });
    }
  }, [focusBranch, markers, map]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708]; // Dubai fallback

export default function SearchMap({
  centers,
  hoveredCenterId,
  activeCenterId,
  focusBranch,
  onMarkerClick,
}: SearchMapProps) {
  const markers = useMemo<SearchMapMarker[]>(() => {
    const out: SearchMapMarker[] = [];
    for (const c of centers) {
      for (const b of c.branches || []) {
        const lat = Number(b.latitude);
        const lng = Number(b.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
          out.push({ center: c, branch: b, lat, lng, rating: 4.8 });
        }
      }
    }
    return out;
  }, [centers]);

  const initialCenter: [number, number] = markers[0]
    ? [markers[0].lat, markers[0].lng]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={markers[0] ? 12 : 4}
      scrollWheelZoom
      zoomControl
      className="h-full w-full"
      style={{ height: "100%", width: "100%", background: "#eef2f4" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds markers={markers} />
      <FlyToBranch markers={markers} focusBranch={focusBranch} />

      {markers.map((m) => {
        const highlighted =
          hoveredCenterId === m.center.id || activeCenterId === m.center.id;
        return (
          <Marker
            key={`${m.center.id}-${m.branch.id}`}
            position={[m.lat, m.lng]}
            icon={buildIcon(m.rating, highlighted)}
            zIndexOffset={highlighted ? 1000 : 0}
            eventHandlers={{
              click: () => onMarkerClick(m.center.id, m.branch.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <div className="text-sm font-semibold text-[#225D5C]">
                  {m.center.name}
                </div>
                <div className="text-xs font-medium text-gray-800">{m.branch.name}</div>
                {m.branch.address && (
                  <div className="text-[11px] leading-snug text-gray-600">
                    {m.branch.address}
                  </div>
                )}
                {m.branch.city && (
                  <div className="text-[11px] text-gray-500">{m.branch.city}</div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
