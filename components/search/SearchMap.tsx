"use client";

import React, { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface SearchMapMarker {
  /** Stable id used for hover/active highlighting and click matching. */
  id: string;
  lat: number;
  lng: number;
  rating: number;
  title: string;
  subtitle?: string;
  city?: string;
  address?: string;
}

export interface SearchMapProps {
  markers: SearchMapMarker[];
  hoveredId: string | null;
  activeId: string | null;
  focus: { id: string; nonce: number } | null;
  onMarkerClick: (id: string) => void;
}

function buildPinHtml(rating: number, highlighted: boolean): string {
  const bg = highlighted ? "#225D5C" : "#111827";
  const ring = highlighted
    ? "0 0 0 4px rgba(34,93,92,0.25)"
    : "0 4px 10px rgba(0,0,0,0.25)";
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
    const bounds = L.latLngBounds(
      markers.map((m) => [m.lat, m.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [markers, map]);
  return null;
}

function FlyToFocus({
  markers,
  focus,
}: {
  markers: SearchMapMarker[];
  focus: SearchMapProps["focus"];
}) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const m = markers.find((x) => x.id === focus.id);
    if (m) {
      map.flyTo([m.lat, m.lng], Math.max(map.getZoom(), 14), { duration: 0.7 });
    }
  }, [focus, markers, map]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [25.2048, 55.2708];

export default function SearchMap({
  markers,
  hoveredId,
  activeId,
  focus,
  onMarkerClick,
}: SearchMapProps) {
  const initialCenter = useMemo<[number, number]>(
    () => (markers[0] ? [markers[0].lat, markers[0].lng] : DEFAULT_CENTER),
    [markers]
  );

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
      <FlyToFocus markers={markers} focus={focus} />

      {markers.map((m, idx) => {
        const highlighted = hoveredId === m.id || activeId === m.id;
        return (
          <Marker
            key={`${m.id}-${idx}`}
            position={[m.lat, m.lng]}
            icon={buildIcon(m.rating, highlighted)}
            zIndexOffset={highlighted ? 1000 : 0}
            eventHandlers={{
              click: () => onMarkerClick(m.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <div className="text-sm font-semibold text-[#225D5C]">
                  {m.title}
                </div>
                {m.subtitle && (
                  <div className="text-xs font-medium text-gray-800">
                    {m.subtitle}
                  </div>
                )}
                {m.address && (
                  <div className="text-[11px] leading-snug text-gray-600">
                    {m.address}
                  </div>
                )}
                {m.city && (
                  <div className="text-[11px] text-gray-500">{m.city}</div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
