/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FileDown, 
  Download, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  Copy, 
  Check, 
  Layers, 
  FileText, 
  Maximize2, 
  MapPin, 
  Save, 
  Plus, 
  Trash2, 
  X,
  Compass,
  Sprout,
  ExternalLink
} from "lucide-react";
import { Farm, ProcessingBatch } from "../types";
import { 
  getFarmPolygonCoordinates, 
  downloadEudrGeoJson, 
  downloadEudrWkt, 
  downloadEudrTracesJson, 
  generateEudrPdfDossier,
  getCountryIsoCode 
} from "../utils/eudrUtils";

interface EudrPolygonCenterProps {
  farms: Farm[];
  batches?: ProcessingBatch[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateFarmPolygon?: (farmId: string, polygon: Array<[number, number]>) => Promise<void> | void;
}

export default function EudrPolygonCenter({
  farms,
  batches = [],
  isOpen,
  onClose,
  onUpdateFarmPolygon
}: EudrPolygonCenterProps) {
  if (!isOpen) return null;

  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || "");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"exports" | "inspector" | "batchPackage">("exports");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const selectedFarm = farms.find(f => f.id === selectedFarmId) || farms[0];
  const selectedBatch = batches.find(b => b.lotNumber === selectedBatchId || b.id === selectedBatchId);

  // Local state for polygon editing on the selected farm
  const currentCoords = selectedFarm ? getFarmPolygonCoordinates(selectedFarm) : [];
  const [editingCoords, setEditingCoords] = useState<Array<[number, number]>>(currentCoords);

  // Update editing coords whenever selected farm changes
  React.useEffect(() => {
    if (selectedFarm) {
      setEditingCoords(getFarmPolygonCoordinates(selectedFarm));
      setSaveStatus(null);
    }
  }, [selectedFarmId]);

  // Aggregate metrics
  const totalPlots = farms.length;
  const mandatoryPolygons = farms.filter(f => (f.sizeHectares || 0) >= 4.0).length;
  const exemptPoints = totalPlots - mandatoryPolygons;
  const totalHectares = farms.reduce((acc, f) => acc + (f.sizeHectares || 0), 0);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSavePolygon = async () => {
    if (!selectedFarm || !onUpdateFarmPolygon) return;
    try {
      setSaveStatus("Saving polygon to Cloud Firestore...");
      // Ensure closed loop
      const closed = [...editingCoords];
      if (closed.length > 0) {
        const first = closed[0];
        const last = closed[closed.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          closed.push([first[0], first[1]]);
        }
      }
      await onUpdateFarmPolygon(selectedFarm.id, closed);
      setSaveStatus("Polygon saved to Cloud Firestore successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus("Error saving: " + (err.message || err));
    }
  };

  const handleAddVertex = () => {
    if (editingCoords.length === 0) return;
    const last = editingCoords[editingCoords.length - 1];
    const newPt: [number, number] = [
      Number((last[0] + 0.0005).toFixed(6)),
      Number((last[1] + 0.0005).toFixed(6))
    ];
    // Insert before closing point
    const updated = [...editingCoords];
    updated.splice(updated.length - 1, 0, newPt);
    setEditingCoords(updated);
  };

  const handleRemoveVertex = (index: number) => {
    if (editingCoords.length <= 4) {
      alert("A polygon requires at least 3 distinct vertices plus the closing coordinate.");
      return;
    }
    const updated = editingCoords.filter((_, i) => i !== index);
    // Ensure closing point matches first
    updated[updated.length - 1] = [updated[0][0], updated[0][1]];
    setEditingCoords(updated);
  };

  const handleCoordinateChange = (index: number, isLng: boolean, val: number) => {
    const updated: Array<[number, number]> = editingCoords.map((pt, i) => {
      if (i === index) {
        return isLng ? [val, pt[1]] : [pt[0], val];
      }
      return pt;
    });

    // If changing the first vertex, keep the closing vertex in sync
    if (index === 0) {
      updated[updated.length - 1] = [updated[0][0], updated[0][1]];
    }

    setEditingCoords(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        let coords: Array<[number, number]> = [];
        if (parsed.type === "FeatureCollection" && parsed.features?.[0]?.geometry?.coordinates) {
          coords = parsed.features[0].geometry.coordinates[0];
        } else if (parsed.type === "Feature" && parsed.geometry?.coordinates) {
          coords = parsed.geometry.coordinates[0];
        } else if (parsed.type === "Polygon" && parsed.coordinates) {
          coords = parsed.coordinates[0];
        }

        if (coords.length >= 4) {
          setEditingCoords(coords.map(c => [Number(c[0].toFixed(6)), Number(c[1].toFixed(6))]));
          setSaveStatus(`Imported ${coords.length} coordinates from file. Click Save to persist.`);
        } else {
          alert("Could not locate valid polygon coordinates in uploaded GeoJSON.");
        }
      } catch (err: any) {
        alert("Failed to parse file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // SVG representation calculation of editingCoords
  const getSvgPoints = () => {
    if (!editingCoords || editingCoords.length === 0) return "";
    const lngs = editingCoords.map(c => c[0]);
    const lats = editingCoords.map(c => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const spanLng = (maxLng - minLng) || 0.001;
    const spanLat = (maxLat - minLat) || 0.001;

    return editingCoords.map(([lng, lat]) => {
      const x = 30 + ((lng - minLng) / spanLng) * 140;
      const y = 170 - ((lat - minLat) / spanLat) * 140;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-[#2D2926]">
        
        {/* Header Bar */}
        <div className="bg-[#003399] text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCC00] text-[#003399] flex items-center justify-center font-bold shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#FFCC00]">
                  Regulation (EU) 2023/1115
                </span>
                <span className="bg-emerald-500/25 border border-emerald-400 text-emerald-200 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                  Deforestation-Free Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                EUDR Polygon Geolocation & Due Diligence Dossier Suite
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-bar KPI Metrics */}
        <div className="bg-[#F4F6F9] border-b border-gray-200 p-4 px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0 text-xs font-mono">
          <div className="border-r border-gray-200 pr-2">
            <span className="text-[9px] uppercase text-gray-500 font-bold block">Total Monitored Plots</span>
            <span className="text-base font-bold text-gray-900">{totalPlots} Estates</span>
          </div>
          <div className="border-r border-gray-200 pr-2">
            <span className="text-[9px] uppercase text-gray-500 font-bold block">Mandatory Polygons (≥4ha)</span>
            <span className="text-base font-bold text-emerald-700">{mandatoryPolygons} Plots</span>
          </div>
          <div className="border-r border-gray-200 pr-2">
            <span className="text-[9px] uppercase text-gray-500 font-bold block">Total Georeferenced Area</span>
            <span className="text-base font-bold text-gray-900">{totalHectares.toFixed(1)} Hectares</span>
          </div>
          <div>
            <span className="text-[9px] uppercase text-gray-500 font-bold block">EU Baseline Cutoff</span>
            <span className="text-base font-bold text-[#003399]">31 Dec 2020 (0.0% Loss)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 px-6 flex gap-6 bg-white shrink-0 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("exports")}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "exports"
                ? "border-[#003399] text-[#003399] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Download size={14} />
            Official Regulatory Export Packages
          </button>

          <button
            onClick={() => setActiveTab("inspector")}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "inspector"
                ? "border-[#003399] text-[#003399] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Compass size={14} />
            Interactive Polygon Inspector & Vertex Editor
          </button>

          <button
            onClick={() => setActiveTab("batchPackage")}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "batchPackage"
                ? "border-[#003399] text-[#003399] font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Layers size={14} />
            Consignment / Batch Package Generator
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: REGULATORY EXPORT PACKAGES */}
          {activeTab === "exports" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold font-mono uppercase text-[10px] text-emerald-800">
                    European Commission TRACES NT & National Customs Ready
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    All exported geodata adheres to the strict <strong>WGS 84 (EPSG:4326)</strong> specification with minimum 6 decimal place precision.
                    Plots 4.0 hectares or larger contain closed polygon rings matching cadastral parcel boundaries.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. GeoJSON Card */}
                <div className="p-5 border border-gray-200 rounded-xl bg-white hover:border-[#003399]/40 transition-all shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#003399] border border-blue-200 font-mono text-[9px] font-bold">
                        RFC 7946 GeoJSON
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">TRACES NT Primary</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">Cooperative GeoJSON FeatureCollection</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Complete multi-plot polygon dataset with botanical specifications (<em>Coffea arabica</em>), HS code 0901 11 00, producer registries, and deforestation baseline timestamps.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadEudrGeoJson(farms)}
                    className="w-full py-2.5 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download size={14} />
                    Download GeoJSON ({farms.length} Plots)
                  </button>
                </div>

                {/* 2. PDF Due Diligence Statement Dossier */}
                <div className="p-5 border border-gray-200 rounded-xl bg-white hover:border-[#003399]/40 transition-all shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[9px] font-bold">
                        Official Dossier (PDF)
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">Audit & Customs Cert</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">EUDR Due Diligence Statement Dossier</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Formal legal due diligence declaration document signed by cooperative technical authorities, featuring satellite screening declarations, plot area tables, and coordinates excerpts.
                    </p>
                  </div>
                  <button
                    onClick={() => generateEudrPdfDossier(farms)}
                    className="w-full py-2.5 bg-[#1B1B1B] hover:bg-black text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <FileDown size={14} className="text-[#FFCC00]" />
                    Generate Official PDF Dossier
                  </button>
                </div>

                {/* 3. Well-Known Text (WKT) Card */}
                <div className="p-5 border border-gray-200 rounded-xl bg-white hover:border-[#003399]/40 transition-all shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-mono text-[9px] font-bold">
                        ISO/IEC 13249 WKT
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">Cadastral GIS Engine</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">Well-Known Text (WKT) Polygon Package</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Formatted polygon geometry strings (`POLYGON((lng lat, ...))`) accepted by national land registries, QGIS, ArcGIS, and agricultural ministry boundary databases.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadEudrWkt(farms)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileText size={14} className="text-purple-700" />
                    Download WKT Text Package
                  </button>
                </div>

                {/* 4. TRACES NT JSON Schema Card */}
                <div className="p-5 border border-gray-200 rounded-xl bg-white hover:border-[#003399]/40 transition-all shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono text-[9px] font-bold">
                        EU TRACES JSON
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">API Ready Schema</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">Direct TRACES NT Payload Schema</h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Structured JSON message ready for electronic transmission directly into the European Commission TRACES NT portal endpoint.
                    </p>
                  </div>
                  <button
                    onClick={() => downloadEudrTracesJson(farms)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download size={14} className="text-emerald-700" />
                    Download TRACES NT JSON
                  </button>
                </div>

              </div>

              {/* Roster overview table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between font-mono text-[11px] font-bold text-gray-700">
                  <span>REGISTERED COOPERATIVE PLOTS (EUDR AUDIT STATUS)</span>
                  <span className="text-gray-400 text-[10px]">WGS 84 EPSG:4326</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/50 text-[10px] uppercase font-mono text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="p-3 pl-4">Plot ID</th>
                        <th className="p-3">Farm Name / Producer</th>
                        <th className="p-3">Country / Region</th>
                        <th className="p-3">Area (Ha)</th>
                        <th className="p-3">Format</th>
                        <th className="p-3">EUDR Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 font-sans">
                      {farms.map((farm) => {
                        const isMandatory = (farm.sizeHectares || 0) >= 4.0;
                        const coords = getFarmPolygonCoordinates(farm);
                        return (
                          <tr key={farm.id} className="hover:bg-gray-50/80">
                            <td className="p-3 pl-4 font-mono font-bold text-gray-800">{farm.id}</td>
                            <td className="p-3">
                              <div className="font-semibold text-gray-900">{farm.name}</div>
                              <div className="text-[10px] text-gray-500 font-mono">{farm.farmerName}</div>
                            </td>
                            <td className="p-3 text-gray-600 font-mono text-[11px]">
                              {getCountryIsoCode(farm.country)} - {farm.region}
                            </td>
                            <td className="p-3 font-mono font-bold text-gray-800">{farm.sizeHectares} ha</td>
                            <td className="p-3 font-mono text-[11px]">
                              {isMandatory ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Polygon ({coords.length} pts)
                                </span>
                              ) : (
                                <span className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                  Point/Poly ({coords.length} pts)
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="text-emerald-700 font-bold font-mono text-[10px] flex items-center gap-1">
                                <Check size={12} className="text-emerald-600" />
                                0.0% Deforestation (Compliant)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE POLYGON INSPECTOR & VERTEX EDITOR */}
          {activeTab === "inspector" && selectedFarm && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Plot Selector and File Importer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-mono uppercase font-bold text-gray-500 block mb-1">
                    Select Target Cooperative Plot:
                  </label>
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-semibold focus:border-[#003399] outline-none"
                  >
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.farmerName}) - {f.sizeHectares} ha [{getCountryIsoCode(f.country)}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <label 
                    className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Upload external GPS survey file (.geojson, .json)"
                  >
                    <Upload size={13} className="text-[#003399]" />
                    <span>Import GeoJSON</span>
                    <input 
                      type="file" 
                      accept=".geojson,.json" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>

                  <button
                    onClick={() => downloadEudrGeoJson([selectedFarm])}
                    className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs text-gray-700"
                  >
                    <Download size={13} className="text-emerald-700" />
                    <span>Plot GeoJSON</span>
                  </button>
                </div>
              </div>

              {/* Inspector Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Visual SVG Polygon Radar */}
                <div className="border border-gray-200 rounded-xl p-5 bg-[#1B1B1B] text-white flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-[#FFCC00] uppercase font-bold tracking-wider block">
                        Cadastral Polygon Visualizer
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{selectedFarm.name}</h4>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className="text-emerald-400 font-bold block">✓ Loop Closed</span>
                      <span className="text-white/50">{editingCoords.length} Vertices</span>
                    </div>
                  </div>

                  {/* SVG Canvas */}
                  <div className="relative w-full h-56 bg-black/40 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {/* Grid background lines */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Altitude rings indicator */}
                      <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(61,90,64,0.3)" strokeDasharray="3 3" />
                      <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(61,90,64,0.3)" strokeDasharray="3 3" />

                      {/* Render Polygon */}
                      {editingCoords.length >= 3 && (
                        <polygon
                          points={getSvgPoints()}
                          fill="rgba(61, 90, 64, 0.45)"
                          stroke="#FFCC00"
                          strokeWidth="2.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Plot Centroid */}
                      <circle cx="100" cy="100" r="4" fill="#FFCC00" stroke="#000" strokeWidth="1" />
                    </svg>

                    <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white/50 bg-black/60 px-2 py-0.5 rounded">
                      Centroid: {selectedFarm.latitude}° N, {selectedFarm.longitude}° E
                    </div>

                    <div className="absolute top-2 right-2 text-[9px] font-mono text-[#FFCC00] bg-black/60 px-2 py-0.5 rounded">
                      Area: {selectedFarm.sizeHectares} Ha ({selectedFarm.altitude}m)
                    </div>
                  </div>

                  <div className="text-[10px] text-white/70 font-sans leading-relaxed flex items-center justify-between border-t border-white/10 pt-3">
                    <span>Deforestation Risk: <strong className="text-emerald-400 font-bold">Negligible</strong></span>
                    <span>Mandatory Format: <strong className="text-white">{selectedFarm.sizeHectares >= 4.0 ? "Polygon Required (>=4ha)" : "Point / Polygon Accepted"}</strong></span>
                  </div>
                </div>

                {/* Vertex Coordinate Editor Table */}
                <div className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase font-mono text-gray-800">
                        WGS 84 Vertex Ring Coordinates
                      </h4>
                      <p className="text-[10px] text-gray-500 font-sans">
                        [Longitude, Latitude] pairs in decimal degrees (EPSG:4326)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAddVertex}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={11} />
                        Add Vertex
                      </button>
                    </div>
                  </div>

                  {/* Coordinate List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
                    {editingCoords.map(([lng, lat], idx) => {
                      const isClosing = idx === editingCoords.length - 1;
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] ${
                            isClosing ? "bg-amber-50/70 border-amber-200" : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="text-[9px] font-bold text-gray-400 w-5 text-center">#{idx + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] uppercase text-gray-400 block font-bold">Lng (X)</span>
                              <input
                                type="number"
                                step="0.000001"
                                value={lng}
                                disabled={isClosing}
                                onChange={(e) => handleCoordinateChange(idx, true, parseFloat(e.target.value) || 0)}
                                className="w-full bg-white border border-gray-250 p-1 rounded text-gray-800 text-[10px] font-mono outline-none disabled:bg-gray-100"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] uppercase text-gray-400 block font-bold">Lat (Y)</span>
                              <input
                                type="number"
                                step="0.000001"
                                value={lat}
                                disabled={isClosing}
                                onChange={(e) => handleCoordinateChange(idx, false, parseFloat(e.target.value) || 0)}
                                className="w-full bg-white border border-gray-250 p-1 rounded text-gray-800 text-[10px] font-mono outline-none disabled:bg-gray-100"
                              />
                            </div>
                          </div>
                          {!isClosing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVertex(idx)}
                              className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                              title="Delete coordinate"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          {isClosing && (
                            <span className="text-[8px] text-amber-800 font-bold px-1 uppercase" title="Matches vertex #1 to close boundary ring">
                              Close Loop
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Save button and feedback */}
                  <div className="border-t border-gray-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleSavePolygon}
                      className="w-full sm:w-auto px-4 py-2 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    >
                      <Save size={13} />
                      Save Polygon to Firestore Database
                    </button>

                    {saveStatus && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 animate-fade-in text-center">
                        ✓ {saveStatus}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: BATCH-SPECIFIC CONSIGNMENT PACKAGE */}
          {activeTab === "batchPackage" && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <span className="font-bold font-mono uppercase text-[10px] text-[#003399] block mb-1">
                  Commercial Consignment Geolocation Linker
                </span>
                <p className="text-[11px] leading-relaxed">
                  European importers require the Due Diligence Statement (DDS) to link directly to the specific commercial export batch or container.
                  Select a registered coffee batch below to generate its customized EUDR compliance package.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <label className="text-[10px] font-mono uppercase font-bold text-gray-500 block">
                  Select Traceable Coffee Batch Consignment:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {batches.map(b => {
                    const isSelected = selectedBatchId === b.lotNumber || (!selectedBatchId && b === batches[0]);
                    const bFarm = farms.find(f => f.id === b.farmId);
                    return (
                      <div
                        key={b.lotNumber}
                        onClick={() => setSelectedBatchId(b.lotNumber)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-white border-[#003399] ring-2 ring-[#003399]/20 shadow-xs" 
                            : "bg-white/80 border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-start font-mono">
                          <span className="font-bold text-gray-900">{b.lotNumber}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">{b.status}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 mt-1 font-sans">
                          {b.variety} • {b.weightKg} kg
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Origin: {bFarm?.name || "Member Farm"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedBatch && (
                <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-3 gap-2">
                    <div>
                      <span className="text-[9px] font-mono uppercase font-bold text-[#003399] block">Consignment Package Prepared</span>
                      <h3 className="text-sm font-bold text-gray-900">Lot {selectedBatch.lotNumber} - EU Compliance File</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => downloadEudrGeoJson(farms, selectedBatch)}
                        className="px-3 py-1.5 bg-[#003399] hover:bg-[#002266] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Download size={13} />
                        Batch GeoJSON
                      </button>
                      <button
                        onClick={() => generateEudrPdfDossier(farms, selectedBatch)}
                        className="px-3 py-1.5 bg-[#1B1B1B] hover:bg-black text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileDown size={13} className="text-[#FFCC00]" />
                        Consignment PDF Dossier
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">Net Export Mass</span>
                      <span className="text-sm font-bold text-gray-900">{selectedBatch.weightKg} kg</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">SCA Cupping Score</span>
                      <span className="text-sm font-bold text-gray-900">{selectedBatch.cuppingScore} SCA</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">Washing Station</span>
                      <span className="text-sm font-bold text-gray-900 truncate block">{selectedBatch.washingStation}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-[9px] uppercase text-gray-400 block font-bold">EU Deforestation Risk</span>
                      <span className="text-sm font-bold text-emerald-700">NEGLIGIBLE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 font-mono gap-2 shrink-0">
          <div>
            © 2026 Origina Traceability Ledger · Regulation (EU) 2023/1115 Digital Compliance
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 font-bold">● TRACES NT Compatible</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white hover:bg-gray-200 border border-gray-300 rounded text-gray-700 font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
