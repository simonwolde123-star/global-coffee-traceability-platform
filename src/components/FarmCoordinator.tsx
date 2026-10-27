/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Check, Clipboard, CloudSun, MapPin, Compass, Trash2, Sliders, Award, ShieldCheck, Globe, Sprout, Activity, Leaf, Coffee, Feather, CheckCircle2, Download, FileSpreadsheet, Shield, FileDown } from "lucide-react";
import { Farm, ProcessingBatch } from "../types";
import EudrPolygonCenter from "./EudrPolygonCenter";

const CertIcon = ({ type, size = 18, className = "" }: { type: string; size?: number; className?: string }) => {
  switch (type) {
    case "Sprout":
      return <Sprout size={size} className={className} />;
    case "Globe":
      return <Globe size={size} className={className} />;
    case "ShieldCheck":
      return <ShieldCheck size={size} className={className} />;
    case "Award":
      return <Award size={size} className={className} />;
    case "Activity":
      return <Activity size={size} className={className} />;
    case "Feather":
      return <Feather size={size} className={className} />;
    default:
      return <Award size={size} className={className} />;
  }
};

interface FarmCoordinatorProps {
  farms: Farm[];
  batches?: ProcessingBatch[];
  onAddFarm: (farm: Farm) => void;
  onRemoveFarm: (id: string) => void;
  selectedFarmId: string;
  onSelectFarm: (id: string) => void;
  lastCapturedCoords: { lat: number; lng: number; alt: number } | null;
  onUpdateFarmPolygon?: (farmId: string, polygon: Array<[number, number]>) => Promise<void> | void;
}

export default function FarmCoordinator({
  farms,
  batches = [],
  onAddFarm,
  onRemoveFarm,
  selectedFarmId,
  onSelectFarm,
  lastCapturedCoords,
  onUpdateFarmPolygon
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
  const [showEudrCenter, setShowEudrCenter] = useState(false);

  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0] || null;

  const ALL_CERTIFICATIONS = [
    {
      name: "Organic",
      authority: "USDA & EU Organic",
      description: "Cultivated without synthetic chemical pesticides using native bio-compost.",
      tagline: "Eco-Chemical Free",
      colorClass: "border-emerald-300 bg-emerald-50/80 text-emerald-900",
      icon: "Sprout",
      certNumber: "ORG-INT-2026-904"
    },
    {
      name: "Fairtrade",
      authority: "Fairtrade International (FLO-CERT)",
      description: "Guaranteed price floors plus direct social development community premiums.",
      tagline: "Social Equity Guaranteed",
      colorClass: "border-blue-300 bg-blue-50/80 text-blue-900",
      icon: "Globe",
      certNumber: "FLO-ID: 41829"
    },
    {
      name: "Rainforest Alliance",
      authority: "Rainforest Alliance Certified",
      description: "Under-canopy shade agroforestry conserving wildlife & watershed hydrology.",
      tagline: "Biodiversity Restoring",
      colorClass: "border-teal-300 bg-teal-50/80 text-teal-900",
      icon: "ShieldCheck",
      certNumber: "RAC-2026-CANOPY"
    },
    {
      name: "UTZ Certified",
      authority: "UTZ Sustainable Farming",
      description: "Strict chain-of-custody verifying agricultural efficiency & worker standards.",
      tagline: "High Quality Traceable",
      colorClass: "border-amber-300 bg-amber-50/80 text-amber-900",
      icon: "Award",
      certNumber: "UTZ-TRACE-771"
    },
    {
      name: "Bird Friendly",
      authority: "Smithsonian Migratory Bird Center",
      description: "100% organic agroforestry canopy serving as habitat for native migratory birds.",
      tagline: "Bird Habitat Protected",
      colorClass: "border-orange-300 bg-orange-50/80 text-orange-900",
      icon: "Feather",
      certNumber: "SMBC-HABITAT-09"
    },
    {
      name: "Biodynamic",
      authority: "Demeter Biodynamic",
      description: "Holistic self-sustaining crop cycles synced with seasonal regenerative biology.",
      tagline: "Living Soil Preserved",
      colorClass: "border-indigo-300 bg-indigo-50/80 text-indigo-900",
      icon: "Activity",
      certNumber: "DEM-BIO-662"
    }
  ];

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

  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (farms.length === 0) {
      setExportMsg("No farm records available to export.");
      setTimeout(() => setExportMsg(null), 3000);
      return;
    }

    const headers = [
      "Farm ID",
      "Farm Name",
      "Farmer / Operator",
      "Union Cooperative",
      "Territory / Region",
      "Country",
      "Latitude",
      "Longitude",
      "Altitude (masl)",
      "Plot Area (Hectares)",
      "Annual Capacity (60kg Bags)",
      "Soil Type",
      "Climate Zone",
      "Harvest Start",
      "Harvest End",
      "Active Certifications"
    ];

    const rows = farms.map(f => [
      f.id,
      f.name,
      f.farmerName,
      f.cooperative,
      f.region,
      f.country,
      f.latitude,
      f.longitude,
      f.altitude,
      f.sizeHectares,
      f.capacityBags,
      f.soilType,
      f.climateZone,
      f.harvestStart,
      f.harvestEnd,
      (f.certifications || []).join("; ")
    ]);

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `cooperative_members_registry_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportMsg(`Exported ${farms.length} farm records to CSV.`);
    setTimeout(() => setExportMsg(null), 3500);
  };

  const handleExportJSON = () => {
    if (farms.length === 0) {
      setExportMsg("No farm records available to export.");
      setTimeout(() => setExportMsg(null), 3000);
      return;
    }

    const exportData = {
      registryTitle: "Cooperative Members Registry Export",
      exportTimestamp: new Date().toISOString(),
      standardsCompliance: ["EUDR", "FLO-CERT", "SCA-Traceability"],
      totalFarms: farms.length,
      developer: "Simon Wolde Balango",
      farms: farms
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `cooperative_members_registry_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportMsg(`Exported ${farms.length} farm records to JSON.`);
    setTimeout(() => setExportMsg(null), 3500);
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
      {/* 1. Left Farm Registry Roster & Dynamic Certification Hub */}
      <div className="lg:col-span-1 space-y-5 text-left">
        
        {/* Dynamic Certification lens */}
        {activeFarm && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#C5A059] uppercase tracking-widest block">Active Certification Lens</span>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight mt-0.5 truncate">{activeFarm.name}</h3>
                <p className="text-[10px] text-gray-500 font-sans mt-0.5">Operator: <strong className="text-gray-700">{activeFarm.farmerName}</strong></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono font-bold bg-[#FAF0DD] text-[#8e7135] px-2 py-0.5 rounded-full border border-[#C5A059]/30 block">
                  {activeFarm.certifications.length} Active Seals
                </span>
                <span className="text-[8px] font-mono text-emerald-700 font-bold block mt-0.5">
                  ✓ Validated 2026/27
                </span>
              </div>
            </div>

            <div id="active-farm-cert-grid" className="space-y-2 mt-2">
              {ALL_CERTIFICATIONS.map(cert => {
                const isCertified = activeFarm.certifications.includes(cert.name);
                return (
                  <div 
                    key={cert.name}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      isCertified 
                        ? `${cert.colorClass} shadow-xs border-opacity-70 font-semibold` 
                        : "bg-gray-50/70 border-gray-150 text-gray-400 opacity-55"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isCertified ? "bg-white/95 shadow-sm" : "bg-gray-200/80 text-gray-400/80"}`}>
                      <CertIcon type={cert.icon} size={15} className={isCertified ? "" : "text-gray-450"} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between leading-none">
                        <span className="text-[10.5px] font-bold">{cert.name}</span>
                        <span className={`text-[7.5px] font-mono uppercase font-bold px-1.5 py-0.2 rounded border ${
                          isCertified 
                            ? "bg-white/90 border-black/10 text-emerald-900" 
                            : "bg-gray-100 border-transparent text-gray-400"
                        }`}>
                          {isCertified ? "Verified Seal" : "Pending Audit"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[7.5px] font-mono text-gray-400 mt-0.5 leading-none">
                        <span>{cert.authority}</span>
                        {isCertified && <span className="text-gray-600 font-bold">{cert.certNumber}</span>}
                      </div>
                      {isCertified && (
                        <p className="text-[9px] text-gray-650 mt-1 leading-snug font-sans">
                          {cert.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-wider">
              MEMBERS REGISTRY ({farms.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowEudrCenter(true)}
                title="European Union Deforestation Regulation (EU 2023/1115) Polygon & Dossier Suite"
                className="px-2 py-1 bg-[#003399] hover:bg-[#002266] text-white rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <ShieldCheck size={11} className="text-[#FFCC00]" />
                EUDR Polygons
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                title="Download CSV for EUDR / FLO-CERT regulatory reporting"
                className="px-2 py-1 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-800 rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <Download size={10} className="text-emerald-700" />
                CSV
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                title="Download JSON schema for cooperative auditing"
                className="px-2 py-1 bg-white hover:bg-amber-50 border border-gray-200 hover:border-[#C5A059] text-gray-700 hover:text-[#8e7135] rounded text-[9px] font-mono font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <Download size={10} className="text-[#C5A059]" />
                JSON
              </button>
            </div>
          </div>

          {/* EUDR Quick-Audit Status Card */}
          <div 
            onClick={() => setShowEudrCenter(true)}
            className="mb-2.5 p-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/80 hover:border-blue-300 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#003399] text-[#FFCC00] flex items-center justify-center font-bold text-[9px] shadow-2xs shrink-0 font-mono">
                EU
              </span>
              <div>
                <span className="text-[9px] font-mono font-bold text-[#003399] uppercase block leading-tight">
                  EUDR (EU 2023/1115) Compliance Suite
                </span>
                <span className="text-[8px] font-mono text-emerald-800 font-semibold block mt-0.5">
                  ✓ {farms.filter(f => (f.sizeHectares || 0) >= 4.0).length} Polygons Required | 100% Deforestation-Free
                </span>
              </div>
            </div>
            <span className="text-[8.5px] font-mono text-[#003399] font-bold underline shrink-0">
              Open Suite →
            </span>
          </div>

          {exportMsg && (
            <div className="mb-2 p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-mono font-bold animate-fade-in flex items-center justify-between">
              <span>✓ {exportMsg}</span>
              <button onClick={() => setExportMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
            </div>
          )}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
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
                {["Organic", "Fairtrade", "Rainforest Alliance", "UTZ Certified", "Bird Friendly", "Biodynamic"].map(cert => {
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

      {/* EUDR Polygon Compliance Suite Modal */}
      <EudrPolygonCenter
        farms={farms}
        batches={batches}
        isOpen={showEudrCenter}
        onClose={() => setShowEudrCenter(false)}
        onUpdateFarmPolygon={onUpdateFarmPolygon}
      />

    </div>
  );
}
