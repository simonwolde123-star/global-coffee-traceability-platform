/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Check, Clipboard, CloudSun, MapPin, Compass, Trash2, Sliders } from "lucide-react";
import { Farm } from "../types";

interface FarmCoordinatorProps {
  farms: Farm[];
  onAddFarm: (farm: Farm) => void;
  onRemoveFarm: (id: string) => void;
  selectedFarmId: string;
  onSelectFarm: (id: string) => void;
  lastCapturedCoords: { lat: number; lng: number; alt: number } | null;
}

export default function FarmCoordinator({
  farms,
  onAddFarm,
  onRemoveFarm,
  selectedFarmId,
  onSelectFarm,
  lastCapturedCoords
}: FarmCoordinatorProps) {
  const [name, setName] = useState("");
  const [farmer, setFarmer] = useState("");
  const [cooperative, setCooperative] = useState("Sidama Union Cooperative");
  const [region, setRegion] = useState("Sidama Zone");
  const [country, setCountry] = useState("Ethiopia");
  const [latitude, setLatitude] = useState(6.4520);
  const [longitude, setLongitude] = useState(38.2910);
  const [altitude, setAltitude] = useState(1950);
  const [hectares, setHectares] = useState(3.0);
  const [capacity, setCapacity] = useState(80);
  const [soil, setSoil] = useState("Volcanic Clay Sols");
  const [climate, setClimate] = useState("Temperate Highland wet");
  const [harvestStart, setHarvestStart] = useState("October");
  const [harvestEnd, setHarvestEnd] = useState("December");
  const [selectedCerts, setSelectedCerts] = useState<string[]>(["Organic", "Fairtrade"]);

  const [formMsg, setFormMsg] = useState("");

  const handleApplyCapturedCoords = () => {
    if (!lastCapturedCoords) return;
    setLatitude(lastCapturedCoords.lat);
    setLongitude(lastCapturedCoords.lng);
    setAltitude(lastCapturedCoords.alt);
  };

  const handleCertToggle = (cert: string) => {
    if (selectedCerts.includes(cert)) {
      setSelectedCerts(prev => prev.filter(c => c !== cert));
    } else {
      setSelectedCerts(prev => [...prev, cert]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !farmer) return;

    const newFarm: Farm = {
      id: "farm-" + Math.floor(100 + Math.random() * 900),
      name,
      farmerName: farmer,
      cooperative,
      region,
      country,
      latitude: parseFloat(latitude.toString()),
      longitude: parseFloat(longitude.toString()),
      altitude: parseInt(altitude.toString()),
      sizeHectares: parseFloat(hectares.toString()),
      capacityBags: parseInt(capacity.toString()),
      soilType: soil,
      climateZone: climate,
      harvestStart,
      harvestEnd,
      certifications: selectedCerts
    };

    onAddFarm(newFarm);
    setFormMsg("Farm registered successfully! Registered coordinates have updated the visual elevation map.");
    setName("");
    setFarmer("");
    setTimeout(() => setFormMsg(""), 4000);
  };

  return (
    <div id="farm-coordinator-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#2D2926]">
      {/* 1. Left Farm Registry Roster */}
      <div className="lg:col-span-1 space-y-4 text-left">
        <span className="text-[10px] font-mono text-gray-400 uppercase font-bold block mb-1">COOPERATIVE MEMBERS DIRECTORY</span>
        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
          {farms.map((f) => {
            const isSelected = f.id === selectedFarmId;
            return (
              <div
                key={f.id}
                onClick={() => onSelectFarm(f.id)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-[#FDF5E6] border-[#C5A059] text-gray-900 ring-1 ring-[#C5A059]/40 shadow-sm" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{f.name}</h4>
                    <span className="text-[10px] text-[#C5A059] font-mono font-bold block mt-0.5">{f.farmerName}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFarm(f.id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-150 transition-all cursor-pointer"
                    title="Deregister Farm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-gray-500 border-t border-gray-150 pt-2 font-mono">
                  <div>
                    <span className="text-gray-400 block text-[8px] uppercase font-bold">Terrain profile</span>
                    <span>{f.altitude}m • {f.region}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[8px] uppercase font-bold">Sizing capacity</span>
                    <span>{f.sizeHectares} ha • {f.capacityBags} bags</span>
                  </div>
                  <div className="col-span-2 border-t border-gray-150 pt-1.5 flex flex-wrap gap-1">
                    {f.certifications.map(crt => (
                      <span key={crt} className="px-1.5 py-0.5 rounded bg-[#FAF0DD] text-[#C5A059] border border-[#C5A059]/20 font-bold select-none text-[8px]">
                        {crt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Middle Farm Registration Wizard Form */}
      <div className="lg:col-span-2 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-150 pb-3">
          <div className="flex items-center gap-1.5 text-gray-800">
            <Clipboard size={18} className="text-[#C5A059]" />
            <h3 className="text-md font-bold font-sans">Cooperative Farm Registration Wizard</h3>
          </div>
          {lastCapturedCoords && (
            <button
              onClick={handleApplyCapturedCoords}
              id="apply-last-geo-catch"
              className="px-2 py-1 bg-amber-50 border border-[#C5A059]/30 hover:bg-[#FAF0DD] text-[#C5A059] font-mono text-[9px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Compass size={11} className="animate-pulse" />
              Apply Terrain GPS Capture
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-600 block mb-1 font-bold">Agricultural Estate / Farm Name*</label>
              <input
                type="text"
                required
                placeholder="e.g. Abyssinia Premium Highlands"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="text-gray-600 block mb-1 font-bold">Farmer / Operator Full Name*</label>
              <input
                type="text"
                required
                placeholder="e.g. Simon Wolde Balango"
                value={farmer}
                onChange={(e) => setFarmer(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 block mb-1 font-bold">Territory / State</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-850 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-gray-600 block mb-1 font-bold">Union Cooperative</label>
                <input
                  type="text"
                  value={cooperative}
                  onChange={(e) => setCooperative(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-850 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div>
                <label className="text-gray-500 block text-[10px] mb-1 font-bold">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2 rounded focus:outline-none cursor-ew-resize focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-gray-500 block text-[10px] mb-1 font-bold">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2 rounded focus:outline-none cursor-ew-resize focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-gray-500 block text-[10px] mb-1 font-bold">Altitude (masl)</label>
                <input
                  type="number"
                  required
                  value={altitude}
                  onChange={(e) => setAltitude(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2 rounded focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 block mb-1 font-bold">Plot Area (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  value={hectares}
                  onChange={(e) => setHectares(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-gray-600 block mb-1 font-bold">Capacity (60Kg bags)</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 block mb-1 font-bold">Soil Geo-matrix</label>
                <input
                  type="text"
                  value={soil}
                  onChange={(e) => setSoil(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-2.5 rounded-lg focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-gray-600 block mb-1 font-bold">Harvest cycle</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={harvestStart}
                    onChange={(e) => setHarvestStart(e.target.value)}
                    className="w-1/2 bg-gray-50 border border-gray-300 text-center text-gray-700 p-2 rounded focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                  <span className="self-center text-gray-400 font-mono">/</span>
                  <input
                    type="text"
                    value={harvestEnd}
                    onChange={(e) => setHarvestEnd(e.target.value)}
                    className="w-1/2 bg-gray-50 border border-gray-300 text-center text-gray-700 p-2 rounded focus:outline-none focus:border-[#C5A059] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Certifications Choice selectors */}
            <div>
              <span className="text-gray-500 block mb-2 font-bold uppercase text-[9px] tracking-wider">Active Cooperative Certifications</span>
              <div className="flex flex-wrap gap-2">
                {["Organic", "Fairtrade", "Rainforest Alliance", "UTZ Certified", "Biodynamic"].map(cert => {
                  const isChecked = selectedCerts.includes(cert);
                  return (
                    <button
                      type="button"
                      key={cert}
                      onClick={() => handleCertToggle(cert)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked 
                          ? "bg-[#FDF5E6] text-[#C5A059] border-[#C5A059]/40 shadow-inner" 
                          : "bg-[#F8F7F4] text-gray-500 border-gray-200 hover:border-gray-350 hover:text-gray-800 hover:bg-white"
                      }`}
                    >
                      {isChecked ? "✓ " : ""} {cert}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3D5A40] hover:bg-[#2F4632] text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer mt-2"
            >
              <Plus size={15} />
              Commit Farm Profile to Database
            </button>
          </div>

          <div className="md:col-span-2 border-t border-gray-150 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 font-bold">
              <CloudSun size={13} className="text-gray-400" />
              Climate Engine active (Temperate Rift Valley models)
            </span>
            {formMsg && (
              <p className="p-2 px-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-center animate-fade-in text-[10px] font-bold">
                {formMsg}
              </p>
            )}
          </div>

        </form>
      </div>

    </div>
  );
}
