/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Info, Layers, Navigation, Compass, Plus, Globe } from "lucide-react";
import { Farm, ProcessingBatch } from "../types";

interface MapDashboardProps {
  farms: Farm[];
  batches: ProcessingBatch[];
  onRegisterCoordinates?: (lat: number, lng: number, alt: number) => void;
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
}

export default function MapDashboard({
  farms,
  batches,
  onRegisterCoordinates,
  selectedFarmId,
  onSelectFarm
}: MapDashboardProps) {
  const [mapStyle, setMapStyle] = useState<"terrain" | "satellite">("terrain");
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<{ name: string; type: string; info: string } | null>(null);
  const [cursorCoords, setCursorCoords] = useState({ lat: 6.25, lng: 38.30, altitude: 1950 });
  const [pinnedMarker, setPinnedMarker] = useState<{ lat: number; lng: number; alt: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus on selected farm coordinates
  const activeFarm = farms.find(f => f.id === selectedFarmId);

  // Translate lat/lng to responsive SVG dimensions
  // East Africa Coffee Belt coordinates mapped to [100px - 700px] bounds
  // Lat ranges roughly from 1° to 8° North
  // Lng ranges roughly from 34° to 40° East
  const getSvgCoords = (lat: number, lng: number) => {
    // Map Lng 34 to 40 (6 degrees width) down to visual coordinates
    const minLng = 34.0;
    const maxLng = 40.0;
    // Map Lat 1 to 8 (7 degrees height) - invert Y since SVG goes top-down
    const minLat = 1.0;
    const maxLat = 8.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100; // percent
    const y = 100 - (((lat - minLat) / (maxLat - minLat)) * 100); // percent inverting Y
    return { x: `${x}%`, y: `${y}%`, numX: x, numY: y };
  };

  // Handle map clicks to simulate physical GPS coordinate capture
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Percentages
    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;

    // Convert back from percentages to Lat/Lng
    // Lng: x% = ((lng - 34) / 6) * 100 => lng = 34 + (pctX / 100) * 6
    const calculatedLng = 34.0 + (pctX / 100) * 6.0;
    // Lat: y% = 100 - (((lat - 1) / 7) * 100) => lat = 1 + ((100 - pctY) / 100) * 7
    const calculatedLat = 1.0 + ((100 - pctY) / 100) * 7.0;

    // Procedural altitude generation corresponding to coffee zones
    const elevationCenter = 2100;
    const distanceToMountain = Math.sqrt(Math.pow(pctX - 55, 2) + Math.pow(pctY - 45, 2));
    const calculatedAlt = Math.round(elevationCenter - (distanceToMountain * 20));

    setPinnedMarker({
      lat: parseFloat(calculatedLat.toFixed(4)),
      lng: parseFloat(calculatedLng.toFixed(4)),
      alt: Math.max(1200, calculatedAlt)
    });

    if (onRegisterCoordinates) {
      onRegisterCoordinates(
        parseFloat(calculatedLat.toFixed(4)),
        parseFloat(calculatedLng.toFixed(4)),
        Math.max(1200, calculatedAlt)
      );
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const calculatedLng = 34.0 + (x / 100) * 6.0;
    const calculatedLat = 1.0 + ((100 - y) / 100) * 7.0;
    const elevationCenter = 2100;
    const distanceToMountain = Math.sqrt(Math.pow(x - 55, 2) + Math.pow(y - 45, 2));
    const calculatedAlt = Math.max(1100, Math.round(elevationCenter - (distanceToMountain * 25)));

    setCursorCoords({
      lat: parseFloat(calculatedLat.toFixed(4)),
      lng: parseFloat(calculatedLng.toFixed(4)),
      altitude: calculatedAlt
    });
  };

  // Boundary shape definitions relative to farm seeds
  const getBoundaryPath = (farm: Farm) => {
    const central = getSvgCoords(farm.latitude, farm.longitude);
    const radius = 2.4; // visual size of boundary
    // Draw an organic agricultural plot boundary poly
    return `${central.numX - radius},${central.numY - radius} 
            ${central.numX + radius + 1},${central.numY - radius + 1.5} 
            ${central.numX + radius - 0.5},${central.numY + radius + 1} 
            ${central.numX - radius - 1},${central.numY + radius - 0.5}`;
  };

  // Station and dry mill infrastructure landmarks
  const infrastructureLandmarks = [
    { name: "Mombasa Port Core", lat: 4.0435, lng: 39.6682, type: "Maritime Port", info: "Primary global export hub for East African coffees." },
    { name: "Djibouti Port Transit", lat: 11.588, lng: 43.145, type: "Border Port", info: "High-altitude Ethiopian cargo exit port." },
    { name: "Yirgacheffe Central Sorting", lat: 6.162, lng: 38.204, type: "Dry Mill", info: "Grade AA mechanical gravity table sorting." },
    { name: "Addis Customs Terminal", lat: 9.012, lng: 38.745, type: "Custom Desk", info: "Phytosanitary inspection & ICO certification post." }
  ];

  return (
    <div id="map-dashboard-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-[#2D2926]">
      
      {/* 1. Left Control Panel */}
      <div className="lg:col-span-1 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="text-[#C5A059] animate-spin-slow" size={22} />
            <span className="text-xs uppercase tracking-wider font-mono text-[#C5A059] font-bold">Geo-Traceability System</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-sans">Interactive Coffee Map</h3>
          <p className="text-xs text-gray-600 mt-1 mb-4 leading-relaxed font-sans">
            Real-time elevation rendering model. Double-click or tap anywhere on the terrain to capture static cooperative GPS targets and elevation grades.
          </p>

          <div className="space-y-4 border-t border-gray-150 pt-4">
            {/* View Selectors */}
            <div>
              <span className="text-[10px] uppercase font-mono text-gray-400 block mb-2 font-bold">Map Aesthetics</span>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setMapStyle("terrain")}
                  className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                    mapStyle === "terrain" ? "bg-[#3D5A40] text-white font-bold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Elevation Bands
                </button>
                <button
                  onClick={() => setMapStyle("satellite")}
                  className={`px-2 py-1 text-[11px] font-bold rounded transition-all cursor-pointer ${
                    mapStyle === "satellite" ? "bg-[#3D5A40] text-white font-bold" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  High-Contrast Dark
                </button>
              </div>
            </div>

            {/* Overlay Toggles */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono text-gray-400 block font-bold">Active Overlays</span>
              
              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundaries}
                  onChange={(e) => setShowBoundaries(e.target.checked)}
                  className="rounded border-gray-300 text-[#3D5A40] bg-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-700 font-semibold font-sans">Agricultural Plot Outlines</span>
              </label>

              <label className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded border-gray-300 text-[#3D5A40] bg-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-700 font-semibold font-sans">Export Transportation Avenues</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live GPS Coordinates Readout */}
        <div className="p-3 bg-[#F8F7F4] border border-gray-250 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono font-bold">
            <span>ORBIT GPS SATELLITE HUD</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-550"></span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-gray-500 block text-[9px] uppercase font-bold">Latitude</span>
              <span className="text-gray-800 font-semibold">{cursorCoords.lat}° N</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[9px] uppercase font-bold">Longitude</span>
              <span className="text-gray-800 font-semibold">{cursorCoords.lng}° E</span>
            </div>
            <div className="col-span-2 border-t border-gray-200 pt-1 flex justify-between items-center">
              <div>
                <span className="text-gray-500 block text-[9px] uppercase font-bold">Altitude Profile</span>
                <span className={`font-semibold ${cursorCoords.altitude >= 1800 ? "text-[#3D5A40]" : "text-gray-600"}`}>
                  {cursorCoords.altitude} m.a.s.l.
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-bold">
                {cursorCoords.altitude >= 1800 ? "Specialty Belt" : "Standard Valley"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Farm Information Bubble */}
        {activeFarm && (
          <div className="p-3 bg-[#FDF5E6] border border-[#C5A059]/30 rounded-xl space-y-1 shadow-inner">
            <span className="text-[9px] text-[#C5A059] uppercase font-mono font-bold">Active Selection Focus</span>
            <h4 className="text-sm font-bold text-gray-800">{activeFarm.name}</h4>
            <div className="text-xs text-gray-600 space-y-1 font-sans">
              <p>Farmer: {activeFarm.farmerName}</p>
              <p className="font-mono text-[10px]">Altitude: {activeFarm.altitude} m.a.s.l.</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Visual Responsive Map Canvas */}
      <div className="lg:col-span-3 min-h-[400px] bg-[#F8F7F4] border border-gray-200 rounded-2xl overflow-hidden relative" ref={containerRef}>
        
        {/* Terrain/Satellite render backgrounds */}
        <div className="absolute inset-0 select-none opacity-40">
          {mapStyle === "terrain" ? (
            // Custom CSS grid resembling geological lines
            <div className="w-full h-full bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:16px_16px] bg-[#FDFCFB]">
              {/* Contours simulation */}
              <div className="absolute top-[20%] left-[30%] w-60 h-60 rounded-full border border-gray-300" />
              <div className="absolute top-[15%] left-[25%] w-[320px] h-[320px] rounded-full border border-gray-200" />
              <div className="absolute top-[40%] left-[50%] w-80 h-80 rounded-full border-t border-[#3D5A40]/20 rotate-45" />
            </div>
          ) : (
            // High-Contrast Dark Satellite layout -> turned into lovely Green Forest High contrast Grid
            <div className="w-full h-full bg-[radial-gradient(#3D5A40_1px,transparent_1px)] [background-size:24px_24px] bg-[#F3F1ED]">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 via-transparent to-transparent" />
            </div>
          )}
        </div>

        {/* SVG Overlays for outlines, transport paths, nodes, boundaries */}
        <svg
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        >
          {/* A. Elevation Altitude Bands Reference Legend (Horizontal lines) */}
          {mapStyle === "terrain" && (
            <>
              {/* High Altitude specialty belt color highlights */}
              <rect y="15%" width="100%" height="45%" fill="rgba(61, 90, 64, 0.05)" />
              <line x1="0" y1="15%" x2="100%" y2="15%" stroke="#C5A059" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
              <text x="12" y="14%" className="text-[10px] font-mono fill-[#C5A059] font-bold select-none">
                Specialty High-Altitude Belt Index (1,800m+)
              </text>
            </>
          )}

          {/* B. Agricultural Plot Boundaries */}
          {showBoundaries && farms.map((farm) => {
            const central = getSvgCoords(farm.latitude, farm.longitude);
            const isSelected = farm.id === selectedFarmId;
            return (
              <g key={farm.id}>
                {/* Boundary Polygon */}
                <polygon
                  points={getBoundaryPath(farm)}
                  className={`transition-all duration-300 ${
                    isSelected 
                      ? "fill-[#C5A059]/15 stroke-[#C5A059] stroke-2 animate-pulse" 
                      : "fill-[#3D5A40]/5 stroke-[#3D5A40]/40 hover:stroke-[#C5A059] hover:fill-[#C5A059]/10"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectFarm) onSelectFarm(farm.id);
                  }}
                  onMouseEnter={() => setHoveredNode({
                    name: farm.name,
                    type: "Specialty Farm Plot",
                    info: `Area: ${farm.sizeHectares} ha • Varieties: SL28 / Heirloom • Cooperative: ${farm.cooperative}`
                  })}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </g>
            );
          })}

          {/* C. Transport Avenues (Connecting farms with processing stations and Mombasa) */}
          {showRoutes && (
            <g opacity="0.6">
              {/* Route line 1: Yirgacheffe to Mombasa Marine lanes */}
              <path
                d="M 55,45 Q 65,70 85,90"
                fill="none"
                stroke="#C5A059"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              {/* Route line 2: Sidama to Mombasa Export mill */}
              <path
                d="M 59,58 Q 65,75 85,90"
                fill="none"
                stroke="#3D5A40"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
              {/* Route labels */}
              <text x="71%" y="82%" className="text-[9px] font-mono fill-gray-500 font-bold select-none bg-white">
                Mombasa Transport Av
              </text>
            </g>
          )}

          {/* D. Pinned Manual Geolocation targets */}
          {pinnedMarker && (
            <g>
              <circle
                cx={getSvgCoords(pinnedMarker.lat, pinnedMarker.lng).x}
                cy={getSvgCoords(pinnedMarker.lat, pinnedMarker.lng).y}
                r="12"
                className="fill-[#C5A059]/20 stroke-[#C5A059] animate-ping"
              />
              <circle
                cx={getSvgCoords(pinnedMarker.lat, pinnedMarker.lng).x}
                cy={getSvgCoords(pinnedMarker.lat, pinnedMarker.lng).y}
                r="4.5"
                className="fill-[#C5A059] stroke-white stroke-2"
              />
            </g>
          )}

          {/* E. Infrastructure Landmarks */}
          {infrastructureLandmarks.map((landmark) => {
            const central = getSvgCoords(landmark.lat, landmark.lng);
            return (
              <g
                key={landmark.name}
                transform={`translate(0, 0)`}
                onMouseEnter={() => setHoveredNode({ name: landmark.name, type: landmark.type, info: landmark.info })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <rect
                  x={`calc(${central.x} - 6px)`}
                  y={`calc(${central.y} - 6px)`}
                  width="12"
                  height="12"
                  className="fill-[#1B1B1B] stroke-[#C5A059] hover:fill-[#C5A059] transition-colors rounded cursor-help"
                />
              </g>
            );
          })}

          {/* F. Farm Nodes Indicators */}
          {farms.map((farm) => {
            const central = getSvgCoords(farm.latitude, farm.longitude);
            const isSelected = farm.id === selectedFarmId;
            return (
              <g
                key={`poi-${farm.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectFarm) onSelectFarm(farm.id);
                }}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode({
                  name: farm.name,
                  type: `Cooperative Member (Altitude ${farm.altitude}m)`,
                  info: `Capacity: ${farm.capacityBags} bags • Farmer: ${farm.farmerName} • Region: ${farm.region}`
                })}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={central.x}
                  cy={central.y}
                  r={isSelected ? "8" : "6"}
                  className={`${
                    isSelected ? "fill-[#C5A059] stroke-white text-white" : "fill-[#3D5A40] stroke-white"
                  } stroke-1.5 hover:fill-[#C5A059] transition-all shadow-md`}
                />
              </g>
            );
          })}
        </svg>

        {/* Compass card in top-right */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="p-2 bg-[#1B1B1B]/95 text-white border border-black/10 rounded-xl flex items-center gap-1.5 backdrop-blur-sm">
            <Globe size={14} className="text-[#C5A059]" />
            <span className="text-[10px] font-mono text-white/90 font-semibold">East Africa Rift</span>
          </div>
        </div>

        {/* Hover node information tooltip card */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 z-20 p-3 bg-[#1B1B1B]/95 text-white border border-white/15 rounded-xl shadow-2xl max-w-xs backdrop-blur-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <Info className="text-[#C5A059] mt-0.5 shrink-0" size={16} />
              <div>
                <h5 className="text-xs font-bold text-white">{hoveredNode.name}</h5>
                <span className="text-[9px] uppercase font-mono text-white/50 block mb-1">{hoveredNode.type}</span>
                <p className="text-[10px] text-white/70 font-sans leading-relaxed">{hoveredNode.info}</p>
              </div>
            </div>
          </div>
        )}

        {/* Coordinates capture trigger confirmation card */}
        {pinnedMarker && (
          <div className="absolute top-4 left-4 z-20 p-3 bg-[#FDF5E6]/95 border border-[#C5A059]/40 rounded-xl shadow-xl flex items-center justify-between gap-3 backdrop-blur-sm animate-fade-in-down">
            <div>
              <span className="text-[9px] font-mono text-[#C5A059] uppercase font-bold">GPS Target Caught</span>
              <p className="text-xs text-gray-800 font-semibold font-mono">
                {pinnedMarker.lat}° N, {pinnedMarker.lng}° E @ {pinnedMarker.alt}m
              </p>
            </div>
            <div className="p-1 px-2 rounded bg-[#C5A059] hover:bg-[#b08c4a] text-[10px] font-bold text-black uppercase cursor-help select-none">
              Registered
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
