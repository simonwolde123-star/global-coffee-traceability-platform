/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Info, Layers, Navigation, Compass, Plus, Globe, TrendingUp, Flame, Activity, ThermometerSun, Sun, CloudSun, CloudFog, CloudRain, CloudLightning } from "lucide-react";
import { Farm, ProcessingBatch } from "../types";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ReferenceArea, ReferenceLine } from "recharts";

const WeatherIcon = ({ type, size = 16, className = "" }: { type: string; size?: number; className?: string }) => {
  switch (type) {
    case "Sun":
      return <Sun size={size} className={`text-amber-500 ${className}`} />;
    case "CloudSun":
      return <CloudSun size={size} className={`text-blue-450 ${className}`} />;
    case "CloudFog":
      return <CloudFog size={size} className={`text-gray-405 ${className}`} />;
    case "CloudRain":
      return <CloudRain size={size} className={`text-blue-505 ${className}`} />;
    case "CloudLightning":
      return <CloudLightning size={size} className={`text-purple-505 ${className}`} />;
    default:
      return <Sun size={size} className={`text-amber-550 ${className}`} />;
  }
};

interface MapDashboardProps {
  farms: Farm[];
  batches: ProcessingBatch[];
  onRegisterCoordinates?: (lat: number, lng: number, alt: number) => void;
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
}

interface CustomScatterTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomScatterTooltip = ({ active, payload }: CustomScatterTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1b1b1b] border border-[#C5A059]/40 p-3 rounded-xl shadow-2xl font-mono text-[10px] space-y-1 text-white w-56">
        <p className="font-bold border-b border-white/10 pb-1 text-[#C5A059] uppercase tracking-wider">{data.name}</p>
        <div className="space-y-0.5 text-white/90">
          <p>Producer: <strong className="text-white">{data.farmer}</strong></p>
          <p>Altitude: <strong className="text-white">{data.altitude} m.a.s.l.</strong></p>
          <p>Volume: <strong className="text-white">{data.capacity} bags (60kg)</strong></p>
          <p>Plot Size: <strong className="text-white">{data.size} Ha</strong></p>
          <p>Avg SCA: <strong className="text-white bg-[#C5A059]/20 px-1 py-0.2 rounded text-[9px] font-sans inline-block">{data.cuppingScore} Score</strong></p>
        </div>
        <div className="pt-1 border-t border-white/10 text-[9px] text-white/45 flex justify-between">
          <span>{data.region}</span>
          <span>{data.country}</span>
        </div>
      </div>
    );
  }
  return null;
};

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
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [onlyHighYieldZones, setOnlyHighYieldZones] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{ name: string; type: string; info: string } | null>(null);
  const [cursorCoords, setCursorCoords] = useState({ lat: 6.25, lng: 38.30, altitude: 1950 });
  const [pinnedMarker, setPinnedMarker] = useState<{ lat: number; lng: number; alt: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus on selected farm coordinates
  const activeFarm = farms.find(f => f.id === selectedFarmId);

  const [weather, setWeather] = useState<{
    farmName: string;
    latitude: number;
    longitude: number;
    altitude: number;
    daily: Array<{
      date: string;
      dayName: string;
      maxTemp: number;
      minTemp: number;
      rain: number;
      condition: string;
      icon: string;
    }>;
    insight: string;
    searchGrounded?: boolean;
    searchSources?: Array<{ title: string; url: string }>;
    searchQueries?: string[];
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeFarm) {
      setWeather(null);
      return;
    }

    let active = true;
    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const res = await fetch(
          `/api/weather?lat=${activeFarm.latitude}&lng=${activeFarm.longitude}&alt=${activeFarm.altitude}&farmName=${encodeURIComponent(
            activeFarm.name
          )}`
        );
        if (!res.ok) {
          throw new Error("Local telemetry satellite link offline.");
        }
        const data = await res.json();
        if (active) {
          setWeather(data);
        }
      } catch (err: any) {
        console.error("Telemetry forecast syncing failed:", err);
        if (active) {
          setWeatherError(err.message || "Coordinate tracking error.");
        }
      } finally {
        if (active) {
          setWeatherLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      active = false;
    };
  }, [activeFarm]);

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

  // Boundary shape definitions relative to farm seeds and EUDR polygons
  const getBoundaryPath = (farm: Farm) => {
    if (farm.polygon && farm.polygon.length >= 3) {
      return farm.polygon.map(([lng, lat]) => {
        const pt = getSvgCoords(lat, lng);
        return `${pt.numX.toFixed(2)},${pt.numY.toFixed(2)}`;
      }).join(" ");
    }
    const central = getSvgCoords(farm.latitude, farm.longitude);
    const radius = Math.max(1.8, Math.min(3.8, (farm.sizeHectares || 3) * 0.55));
    // Draw an organic agricultural plot boundary poly
    return `${central.numX - radius},${central.numY - radius} 
            ${central.numX + radius + 1},${central.numY - radius + 1.2} 
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
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded border-gray-300 text-[#C5A059] bg-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-800 font-bold font-sans flex items-center gap-1.5">
                  <Flame size={13} className="text-[#C5A059]" />
                  Altitude-Yield Thermal Heatmap
                </span>
              </label>

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

              <label className="flex items-center gap-2 py-1 cursor-pointer pt-1 border-t border-gray-200">
                <input
                  type="checkbox"
                  checked={onlyHighYieldZones}
                  onChange={(e) => setOnlyHighYieldZones(e.target.checked)}
                  className="rounded border-gray-300 text-[#C5A059] bg-white focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] text-[#8e7135] font-bold font-mono">
                  Highlight High-Altitude High-Yield (≥1800m, ≥100 Bags)
                </span>
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
        {activeFarm ? (
          <div className="p-3 bg-[#FDF5E6] border border-[#C5A059]/30 rounded-xl space-y-1.5 shadow-inner">
            <span className="text-[9px] text-[#C5A059] uppercase font-mono font-bold">Active Selection Focus</span>
            <h4 className="text-sm font-bold text-gray-800">{activeFarm.name}</h4>
            <div className="text-xs text-gray-650 space-y-0.5 font-sans leading-tight">
              <p>Farmer: <strong className="text-gray-800">{activeFarm.farmerName}</strong></p>
              <p className="font-mono text-[10px]">Altitude: {activeFarm.altitude} m.a.s.l.</p>
            </div>

            {/* 5-Day Weather Forecast Sub-panel */}
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs font-sans">
                  <ThermometerSun size={15} className="text-[#C5A059]" />
                  <span>Microclimate Forecast (5-Day)</span>
                </div>
                {weatherLoading && <span className="text-[9px] font-mono text-[#C5A059] animate-pulse font-bold">Syncing...</span>}
              </div>

              {weatherLoading && (
                <div className="p-3 bg-gray-50 border border-gray-150 rounded-lg flex flex-col items-center justify-center space-y-1.5 py-4 animate-pulse">
                  <Globe className="text-[#3D5A40]/40 animate-spin-slow" size={16} />
                  <p className="text-[9px] text-gray-400 font-mono">Retrieving satellite telemetry...</p>
                </div>
              )}

              {weatherError && !weatherLoading && (
                <div className="p-2 bg-red-50 text-red-700 text-[10px] border border-red-200 rounded-lg font-mono">
                  ⚠️ {weatherError}
                </div>
              )}

              {weather && !weatherLoading && !weatherError && (
                <div className="space-y-2 text-left">
                  {/* Daily list / scroll horizontal grid */}
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {weather.daily.map((day, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-1 text-center flex flex-col items-center justify-between shadow-xs hover:border-[#C5A059]/45 transition-all">
                        <span className="text-[8.5px] font-bold text-gray-550 uppercase tracking-tight font-mono leading-none">{day.dayName.substring(0, 3)}</span>
                        <div className="my-1 flex justify-center">
                          <WeatherIcon type={day.icon} size={14} />
                        </div>
                        <div className="text-[9.5px] font-bold text-gray-850 space-y-0.5 leading-none">
                          <div>{Math.round(day.maxTemp)}°</div>
                          <div className="text-[8.5px] text-gray-400 font-semibold">{Math.round(day.minTemp)}°</div>
                        </div>
                        {day.rain > 0 && (
                          <div className="text-[7.5px] text-blue-500 font-extrabold font-mono mt-0.5 leading-none">
                            {day.rain}mm
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Gemini AI advisory insight block with Google Search Grounding */}
                  {weather.insight && (
                    <div className="p-2.5 bg-[#FAF6EE] border-l-2 border-[#C5A059] rounded-r-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center justify-center bg-[#C5A059]/15 text-[#886C32] text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                          AI Climate Analysis
                        </span>
                        {weather.searchGrounded && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-mono font-bold text-[#3D5A40] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <Globe size={9} /> Google Search Grounded
                          </span>
                        )}
                      </div>
                      <p className="text-[9.5px] text-gray-700 leading-normal font-sans text-left">
                        {weather.insight}
                      </p>
                      {weather.searchSources && weather.searchSources.length > 0 && (
                        <div className="pt-1 border-t border-[#C5A059]/20 space-y-0.5">
                          <span className="text-[7.5px] font-mono text-gray-400 block font-bold uppercase">Telemetry Sources:</span>
                          <div className="flex flex-wrap gap-1">
                            {weather.searchSources.slice(0, 2).map((s, idx) => (
                              <a
                                key={idx}
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[8px] font-mono text-[#886C32] hover:underline bg-white/70 px-1.5 py-0.2 rounded border border-[#C5A059]/30 truncate max-w-[140px]"
                                title={s.title}
                              >
                                ↗ {s.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-center shadow-xs">
            <ThermometerSun className="text-gray-400 mx-auto animate-pulse" size={24} />
            <h5 className="text-xs font-bold text-gray-700 font-sans">Microclimate Weather Telemetry</h5>
            <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
              Select any coffee cooperative plot outline on the interactive map to query 5-day crop weather details and AI-grounded ripening analysis.
            </p>
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
          {/* SVG Definitions for Thermal Heatmap Gradients */}
          <defs>
            <radialGradient id="highYieldHeatGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#EA580C" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="highAltHeatGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#D97706" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="midAltHeatGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3D5A40" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#3D5A40" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3D5A40" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="standardHeatGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#64748B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Altitude-Yield Thermal Heatmap Overlay */}
          {showHeatmap && (
            <g id="heatmap-thermal-layer" className="transition-opacity duration-300">
              {farms.map((farm) => {
                const central = getSvgCoords(farm.latitude, farm.longitude);
                const isHighBelt = farm.altitude >= 1800 && farm.capacityBags >= 100;
                const isHighAlt = farm.altitude >= 1800;
                const isMidAlt = farm.altitude >= 1650;
                
                // Radius proportional to harvest volume capacity
                const radius = Math.max(18, Math.min(48, Math.round((farm.capacityBags / 140) * 44)));
                const gradientId = isHighBelt 
                  ? "url(#highYieldHeatGlow)" 
                  : isHighAlt 
                    ? "url(#highAltHeatGlow)" 
                    : isMidAlt 
                      ? "url(#midAltHeatGlow)" 
                      : "url(#standardHeatGlow)";

                const isDimmed = onlyHighYieldZones && !isHighBelt;

                return (
                  <g key={`heat-${farm.id}`} opacity={isDimmed ? 0.15 : 1} className="transition-all duration-300">
                    {/* Thermal aura */}
                    <circle
                      cx={central.x}
                      cy={central.y}
                      r={radius}
                      fill={gradientId}
                      className={isHighBelt ? "animate-pulse" : ""}
                    />
                    {/* Pulsating ring for high-yield high-altitude champion zones */}
                    {isHighBelt && (
                      <circle
                        cx={central.x}
                        cy={central.y}
                        r={radius * 1.15}
                        fill="none"
                        stroke="#C5A059"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        className="animate-spin-slow opacity-60"
                      />
                    )}
                  </g>
                );
              })}
            </g>
          )}

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

      {/* 3. Altitude vs Harvest Volume Heatmap Analytics Matrix & Distribution Grid */}
      <div className="col-span-1 lg:col-span-4 border-t border-gray-150 pt-6 mt-2 space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#C5A059] mb-1 font-bold">
              <ThermometerSun size={16} className="animate-pulse" />
              <span className="text-[10px] uppercase font-mono tracking-wider">Meteorological Yield Analysis</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 font-sans">Altitude vs. Harvest Volume Correlation Heatmap</h3>
            <p className="text-xs text-gray-500 font-medium">
              Geological overlay identifying premium growing zones and offtake capacity volumes (60kg bags) by altitude range.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyHighYieldZones(false)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                !onlyHighYieldZones 
                  ? "bg-[#3D5A40] text-white border-[#3D5A40] font-bold" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Microclimates ({farms.length})
            </button>
            <button
              onClick={() => setOnlyHighYieldZones(true)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyHighYieldZones 
                  ? "bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-sm" 
                  : "bg-amber-50 text-[#8e7135] border-[#C5A059]/40 hover:bg-[#FAF0DD]"
              }`}
            >
              <Flame size={12} className={onlyHighYieldZones ? "animate-pulse" : ""} />
              High-Yield High-Altitude Zone (≥1800m, ≥100 Bags)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-1">
          {/* Left Side: 2D Heatmap Matrix */}
          <div className="xl:col-span-5 p-5 border border-gray-200 bg-[#FBFBFA]/60 rounded-2xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-gray-150 pb-2.5 mb-3">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">2D DENSITY CORRELATION MATRIX</span>
                <span className="text-[10px] text-[#3D5A40] font-mono bg-[#EDF3EE] p-1 px-2 rounded-lg font-bold">Heat Value: Cooperatives</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-normal mb-1">
                Visual matrix grouping farms by altitude range (X) and capacity volume threshold (Y). Populated sectors reflect local cluster concentrations.
              </p>
            </div>

            {/* Direct CSS Grid Matrix representation */}
            <div className="grid grid-cols-4 gap-2">
              {/* Col list/legends */}
              <div className="text-[9px] font-mono font-bold text-gray-400 uppercase flex items-center justify-center text-center">
                Volume / Alt
              </div>
              <div className="text-[9px] font-mono font-bold text-gray-500 uppercase text-center bg-gray-55/60 py-1.5 rounded-lg">
                Low &lt;1650m
              </div>
              <div className="text-[9px] font-mono font-bold text-gray-500 uppercase text-center bg-gray-55/60 py-1.5 rounded-lg">
                Mid 1650-1900m
              </div>
              <div className="text-[9px] font-mono font-bold text-gray-500 uppercase text-center bg-gray-55/60 py-1.5 rounded-lg">
                High 1900m+
              </div>

              {/* Rows top down: Volume Large, Med, Small */}
              {/* Row 1: Large Volume (120+ Bags) */}
              <div className="text-[9px] font-mono font-bold text-gray-400 uppercase flex items-center justify-start pr-1">
                Large (120+)
              </div>
              {/* Low & Large */}
              <div className="p-2 bg-gray-50/40 border border-gray-150 border-dashed rounded-xl h-20 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-bold text-gray-350">0</span>
              </div>
              {/* Mid & Large */}
              <div className="p-2 bg-[#EDF2EE] border border-[#3D5A40]/35 hover:border-[#3D5A40] rounded-xl h-20 flex flex-col justify-between transition-colors shadow-sm cursor-help relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-[#3D5A40] uppercase">M-L ZONE</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 hover:scale-125 transition-transform" />
                </div>
                <div className="text-center font-bold text-base text-gray-900 select-none">
                  {farms.filter(f => f.altitude >= 1650 && f.altitude < 1900 && f.capacityBags >= 120).length}
                </div>
                <span className="text-[7.5px] font-mono font-semibold text-gray-500 truncate block text-center">
                  {farms.filter(f => f.altitude >= 1650 && f.altitude < 1900 && f.capacityBags >= 120).map(f => f.name.replace(" Organics", "").replace(" Estate", "")).join(", ") || "None"}
                </span>
                {/* Tooltip trigger */}
                <div className="absolute inset-0 bg-white/0 select-none" title="Farms in this tier demonstrate remarkable yields inside the Mid-Altitude envelope." />
              </div>
              {/* High & Large */}
              <div className="p-2 bg-[#FEF9EC] border border-[#C5A059]/40 hover:border-[#C5A059] rounded-xl h-20 flex flex-col justify-between transition-colors shadow-sm cursor-help relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-[#C5A059] uppercase">H-L ZONE</span>
                  <Flame size={10} className="text-[#C5A059] animate-pulse" />
                </div>
                <div className="text-center font-bold text-base text-amber-950 select-none">
                  {farms.filter(f => f.altitude >= 1900 && f.capacityBags >= 120).length}
                </div>
                <span className="text-[7.5px] font-mono font-semibold text-amber-900/60 truncate block text-center">
                  {farms.filter(f => f.altitude >= 1900 && f.capacityBags >= 120).map(f => f.name.replace(" Estate", "")).join(", ") || "None"}
                </span>
                <div className="absolute inset-0 bg-white/0 select-none" title="Highly rare niche: Peak microclimates with extraordinary capacity scores." />
              </div>

              {/* Row 2: Medium Volume (90-120 Bags) */}
              <div className="text-[9px] font-mono font-bold text-gray-400 uppercase flex items-center justify-start pr-1">
                Mid (90-120)
              </div>
              {/* Low & Med */}
              <div className="p-2 bg-gray-50/40 border border-gray-150 border-dashed rounded-xl h-20 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-bold text-gray-350">0</span>
              </div>
              {/* Mid & Med */}
              <div className="p-2 bg-gray-50/40 border border-gray-150 border-dashed rounded-xl h-20 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-bold text-gray-350">0</span>
              </div>
              {/* High & Med */}
              <div className="p-2 bg-[#FEF9EC] border border-[#C5A059]/30 hover:border-[#C5A059] rounded-xl h-20 flex flex-col justify-between transition-colors shadow-sm cursor-help relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-[#C5A059] uppercase">H-M BELT</span>
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                </div>
                <div className="text-center font-bold text-base text-amber-950 select-none">
                  {farms.filter(f => f.altitude >= 1900 && f.capacityBags >= 90 && f.capacityBags < 120).length}
                </div>
                <span className="text-[7.5px] font-mono font-semibold text-amber-900/75 truncate block text-center font-sans font-bold">
                  {farms.filter(f => f.altitude >= 1900 && f.capacityBags >= 90 && f.capacityBags < 120).map(f => f.name.replace(" Estate", "")).join(", ") || "None"}
                </span>
                <div className="absolute inset-0 bg-white/0 select-none" title="The classic specialty profile: High altitudes coupled with solid cooperative target volumes." />
              </div>

              {/* Row 3: Small Volume (<90 Bags) */}
              <div className="text-[9px] font-mono font-bold text-gray-400 uppercase flex items-center justify-start pr-1">
                Small (&lt;90)
              </div>
              {/* Low & Small */}
              <div className="p-2 bg-[#F4F5F7] border border-gray-200 hover:border-gray-350 rounded-xl h-20 flex flex-col justify-between transition-colors shadow-sm cursor-help relative">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">L-S PLOT</span>
                  <span className="h-2 w-2 rounded-full bg-slate-350" />
                </div>
                <div className="text-center font-bold text-base text-gray-700 select-none">
                  {farms.filter(f => f.altitude < 1650 && f.capacityBags < 90).length}
                </div>
                <span className="text-[7.5px] font-mono font-semibold text-gray-500 truncate block text-center">
                  {farms.filter(f => f.altitude < 1650 && f.capacityBags < 90).map(f => f.name.replace(" Estate", "")).join(", ") || "None"}
                </span>
                <div className="absolute inset-0 bg-white/0 select-none" title="Lower altitude, micro-yield plots targeting regional baseline varieties." />
              </div>
              {/* Mid & Small */}
              <div className="p-2 bg-gray-50/40 border border-gray-150 border-dashed rounded-xl h-20 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono font-bold text-gray-350">0</span>
              </div>
              {/* High & Small */}
              <div className="p-2 bg-[#EDF2EE]/80 border border-[#3D5A40]/25 hover:border-[#3D5A40] rounded-xl h-20 flex flex-col justify-between transition-colors shadow-sm cursor-help relative">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono font-bold text-[#3D5A40] uppercase">H-S PLOT</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-350" />
                </div>
                <div className="text-center font-bold text-base text-gray-800 select-none">
                  {farms.filter(f => f.altitude >= 1900 && f.capacityBags < 90).length}
                </div>
                <span className="text-[7.5px] font-mono font-semibold text-gray-550 truncate block text-center">
                  {farms.filter(f => f.altitude >= 1900 && f.capacityBags < 90).map(f => f.name.replace(" Farm", "").replace(" Aged ", "")).join(", ") || "None"}
                </span>
                <div className="absolute inset-0 bg-white/0 select-none" title="Extremely high altitude but highly boutique yields. Yield density is high, volume is boutique." />
              </div>
            </div>

            <div className="text-[10px] bg-amber-50/45 p-3 rounded-lg border border-amber-200/35 text-amber-900 leading-normal font-sans font-medium">
              ⚡ <strong>Zone Highlight:</strong> The shaded high-altitude density bands represent microclimates with extraordinary capacity scores, capturing optimal solar radiation patterns.
            </div>
          </div>

          {/* Right Side: Recharts Scatter Plot */}
          <div className="xl:col-span-7 border border-gray-200 bg-white rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm text-left font-sans">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">HIGH-RESOLUTION ALTITUDE VS DENSITY SCATTER</span>
              <span className="text-[10px] text-gray-500 font-mono">X: Altitude (m) | Y: Volume (Bags)</span>
            </div>

            <div className="w-full h-64 md:h-72 relative bg-gray-50/25 border border-gray-150 rounded-xl p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: -5, left: -25 }}>
                  <XAxis 
                    type="number" 
                    dataKey="altitude" 
                    name="Altitude" 
                    unit="m" 
                    domain={[1400, 2300]}
                    tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="capacity" 
                    name="Volume" 
                    unit=" Bags" 
                    domain={[50, 160]}
                    tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="size" 
                    range={[60, 320]} 
                    name="Hectares" 
                  />
                  
                  {/* Reference Golden Zone Boundary Lines */}
                  <ReferenceLine 
                    x={1800} 
                    stroke="#C5A059" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4" 
                  />
                  <ReferenceLine 
                    y={100} 
                    stroke="#C5A059" 
                    strokeWidth={1.5} 
                    strokeDasharray="4 4" 
                  />
                  
                  <RechartsTooltip content={<CustomScatterTooltip />} />
                  
                  <Scatter 
                    name="Members" 
                    data={farms.map(f => {
                      const fBatches = batches.filter(b => b.farmId === f.id);
                      const avgCuppingScore = fBatches.length > 0 
                        ? Number((fBatches.reduce((acc, b) => acc + b.cuppingScore, 0) / fBatches.length).toFixed(1))
                        : 85; 
                      return {
                        id: f.id,
                        name: f.name,
                        farmer: f.farmerName,
                        altitude: f.altitude,
                        capacity: f.capacityBags,
                        size: f.sizeHectares,
                        cooperative: f.cooperative,
                        region: f.region,
                        country: f.country,
                        cuppingScore: avgCuppingScore
                      };
                    })} 
                    fill="#3D5A40"
                    onClick={(n: any) => {
                      if (onSelectFarm && n?.id) {
                        onSelectFarm(n.id);
                      }
                    }}
                    cursor="pointer"
                  >
                    {farms.map((f, index) => {
                      const isHighBelt = f.altitude >= 1800 && f.capacityBags >= 100;
                      const opacity = onlyHighYieldZones 
                        ? (isHighBelt ? 1.0 : 0.15) 
                        : (f.id === selectedFarmId ? 1.0 : 0.85);
                      const strokeW = isHighBelt ? 2.5 : (f.id === selectedFarmId ? 3 : 1);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isHighBelt ? "#C5A059" : "#3D5A40"}
                          stroke={isHighBelt ? "#9c7c3d" : "#243c2b"}
                          strokeWidth={strokeW}
                          fillOpacity={opacity}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              
              {/* Inline Watermark label for golden zone */}
              <div className="absolute top-5 right-5 text-[8.5px] font-mono text-[#C5A059] bg-[#FEF9EC] border border-[#C5A059]/35 px-2 py-0.5 rounded font-bold pointer-events-none select-none">
                Optimal Specialty Canopy (1800m+)
              </div>
            </div>

            <div className="text-[10.5px] font-sans text-gray-550 leading-relaxed font-semibold">
              ⭐ <strong>Bubble Size Note:</strong> Nodes represent co-op members. The bubble radius scales proportionally to plot size (Hectares). Clicking any node automatically focuses map geolocation and loads altitude boundaries.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
