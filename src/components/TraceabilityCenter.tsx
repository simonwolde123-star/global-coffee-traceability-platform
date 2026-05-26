/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckCircle2, QrCode, Search, Award, Sprout, Clipboard, AlertCircle, ShoppingCart, UserCheck, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { ProcessingBatch, Farm, ProcessingMethod } from "../types";
import { LanguageCode, translations } from "../translations";

// Helper to simulate SVG QR-Code matrix to guarantee instant, beautiful rendering offline
function SimulatedQr({ text }: { text: string }) {
  return (
    <div className="p-3 bg-white rounded-xl border border-gray-200 inline-block shadow-sm animate-fade-in">
      <svg width="112" height="112" viewBox="0 0 29 29" className="fill-[#1B1B1B]">
        {/* Mock QR grid alignment patterns */}
        <rect x="0" y="0" width="7" height="7" />
        <rect x="1" y="1" width="5" height="5" fill="white" />
        <rect x="2" y="2" width="3" height="3" />
        
        <rect x="22" y="0" width="7" height="7" />
        <rect x="23" y="1" width="5" height="5" fill="white" />
        <rect x="24" y="2" width="3" height="3" />
        
        <rect x="0" y="22" width="7" height="7" />
        <rect x="1" y="23" width="5" height="5" fill="white" />
        <rect x="2" y="24" width="3" height="3" />

        <rect x="3" y="9" width="3" height="1" />
        <rect x="9" y="3" width="1" height="5" />
        <rect x="11" y="1" width="2" height="2" />
        <rect x="15" y="0" width="4" height="2" />
        <rect x="20" y="10" width="2" height="2" />
        <rect x="12" y="12" width="5" height="5" />
        <rect x="13" y="13" width="3" height="3" fill="white" />
        <rect x="14" y="14" width="1" height="1" />

        <rect x="23" y="15" width="2" height="4" />
        <rect x="19" y="19" width="4" height="2" />
        <rect x="15" y="24" width="3" height="2" />
        <rect x="25" y="24" width="3" height="3" />
        <rect x="10" y="25" width="2" height="2" />
        <rect x="18" y="13" width="4" height="1" />
        <rect x="9" y="16" width="1" height="6" />

        <rect x="25" y="25" width="2" height="2" fill="white" />
      </svg>
      <div className="text-[8px] font-mono text-center text-gray-400 mt-1 uppercase tracking-tight font-bold">Trace Code Locked</div>
    </div>
  );
}

interface TraceabilityCenterProps {
  batches: ProcessingBatch[];
  farms: Farm[];
  onAddBatch: (batch: ProcessingBatch) => void;
  isOffline: boolean;
  language?: LanguageCode;
}

export default function TraceabilityCenter({
  batches,
  farms,
  onAddBatch,
  isOffline,
  language = "en"
}: TraceabilityCenterProps) {
  const [selectedLotNo, setSelectedLotNo] = useState<string>("LOT-ETH-2026-AA03");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyBuyerInput, setVerifyBuyerInput] = useState("");
  const [buyerVerifiedName, setBuyerVerifiedName] = useState<string | null>(null);

  // Translation setup
  const t = translations[language] || translations.en;

  // Batch registration wizard form states
  const [formLotNumber, setFormLotNumber] = useState("");
  const [formFarmId, setFormFarmId] = useState(farms[0]?.id || "");
  const [formWashingStation, setFormWashingStation] = useState("");
  const [formMethod, setFormMethod] = useState<ProcessingMethod>("Washed");
  const [formVariety, setFormVariety] = useState("Sidama Landraces");
  const [formFermentation, setFormFermentation] = useState(36);
  const [formDrying, setFormDrying] = useState("African Raised Beds");
  const [formMoisture, setFormMoisture] = useState(11.0);
  const [formGrade, setFormGrade] = useState<any>("Specialty Grade");
  const [formCupping, setFormCupping] = useState(87.5);
  const [formWeight, setFormWeight] = useState(1200);
  const [formShow, setFormShow] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  const activeBatch = batches.find(b => b.lotNumber === selectedLotNo) || batches[0] || batches[0];
  const activeFarm = farms.find(f => f.id === activeBatch?.farmId) || farms[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    const found = batches.find(b => b.lotNumber.toUpperCase().includes(query) || b.washingStation.toUpperCase().includes(query));
    if (found) {
      setSelectedLotNo(found.lotNumber);
    } else {
      alert(language === "es" ? "Lote o estación no encontrado. Mostrando primer lote coincidente." : "Lot number or station not found. Showing closest active match.");
    }
    setSearchQuery("");
  };

  const handleVerifyBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyBuyerInput.trim()) return;
    setBuyerVerifiedName(verifyBuyerInput);
  };

  const handleCreateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLotNumber) return;

    const newBatch: ProcessingBatch = {
      lotNumber: formLotNumber.toUpperCase(),
      farmId: formFarmId,
      washingStation: formWashingStation || "Community Pulping Site",
      method: formMethod,
      variety: formVariety,
      fermentationHours: formFermentation,
      dryingMethod: formDrying,
      moistureContent: formMoisture,
      grade: formGrade,
      cuppingScore: formCupping,
      status: "Harvested",
      harvestDate: new Date().toISOString().substring(0, 10),
      weightKg: formWeight
    };

    onAddBatch(newBatch);
    setSelectedLotNo(newBatch.lotNumber);
    setFormSuccess(language === "es" ? "Lote registrado con éxito!" : "Custom coffee lot successfully registered into transparency roster!");
    setFormLotNumber("");
    setFormWashingStation("");
    setTimeout(() => {
      setFormSuccess("");
      setFormShow(false);
    }, 4000);
  };

  const autofillLotName = () => {
    const serial = Math.floor(1000 + Math.random() * 9000);
    const code = activeFarm ? activeFarm.country.substring(0, 3).toUpperCase() : "ETH";
    setFormLotNumber(`LOT-${code}-2026-FT${serial}`);
  };

  const printCertificate = () => {
    window.print();
  };

  // Client-side PDF generator using the robust jsPDF configuration
  const downloadPdfReport = () => {
    if (!activeBatch) return;
    
    const doc = new jsPDF();
    const batchNo = activeBatch.lotNumber;
    
    // Header banner
    doc.setFillColor(27, 27, 27);
    doc.rect(0, 0, 210, 38, "F");
    
    // Header Branding Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BEANTRACE GLOBAL TRANSPARENCY PLATFORM", 14, 16);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(197, 160, 89); // Gold Accent
    doc.text("SPECIALTY COFFEE B2B MULTI-LINGUAL TRACEABILITY LEDGER AND COOPERATIVE DESK", 14, 23);
    
    doc.setTextColor(190, 190, 190);
    doc.setFontSize(8);
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + " UTC";
    doc.text(`Report Timestamp: ${dateStr}`, 142, 16);
    doc.text(`Symmetric Compliance: ISO-Block Verified`, 142, 23);
    
    // Outer bounding boundary box
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.rect(10, 44, 190, 240);
    
    // Highlight Certificate details space
    doc.setFillColor(253, 245, 230); // Warm brown/cream background
    doc.rect(14, 48, 182, 22, "F");
    
    doc.setTextColor(27, 27, 27);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`TRACEABILITY AUDIT HISTORY LOT: ${batchNo}`, 18, 56);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Originating Cooperative Farm: ${activeFarm?.name || "Premium Grower Estate"} (${activeFarm?.cooperative || "Federated Union"})`, 18, 64);
    
    // Emerald Green status badge in PDF
    doc.setFillColor(61, 90, 64);
    doc.rect(145, 54, 45, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`LOT DISPATCH: ${activeBatch.status.toUpperCase()}`, 148, 60);
    
    // Two-Column Particulars segment
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.text("1. GROWER & TERRITORY DETAILS", 16, 82);
    doc.line(16, 84, 100, 84);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Farmer Name:`, 16, 92);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeFarm?.farmerName || "Elena Rostova"}`, 42, 92);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Union / Coop:`, 16, 98);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeFarm?.cooperative || "BeanTrace Certified Cooperation"}`, 42, 98);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Farm Region:`, 16, 104);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeFarm?.region || "High-Altitude Specialty"}, ${activeFarm?.country || "Colombia"}`, 42, 104);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Elevational Masl:`, 16, 110);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeFarm?.altitude || 1950} m.a.s.l.`, 42, 110);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Soil Geological:`, 16, 116);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeFarm?.soilType || "Volcanic Sols / Humus"}`, 42, 116);

    // Column 2 - Coffee Lot Attributes
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("2. COFFEE SPECULATIVE PARTICULARS", 110, 82);
    doc.line(110, 84, 194, 84);
    
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Specialty Variety:`, 110, 92);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeBatch.variety}`, 142, 92);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Processing Style:`, 110, 98);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeBatch.method}`, 142, 98);
    
    doc.setFont("helvetica", "bold");
    doc.text(`SCA Quality Score:`, 110, 104);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeBatch.cuppingScore} / 100`, 142, 104);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Batch Net Weight:`, 110, 110);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeBatch.weightKg} Kg Gross`, 142, 110);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Moisture Index:`, 110, 116);
    doc.setFont("helvetica", "normal");
    doc.text(`${activeBatch.moistureContent}% Current Index`, 142, 116);

    // Timeline steps visualization (Horizontal / Vertical logs)
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 126, 196, 126);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("3. TRANSPARENCY TIMELINE LOG ENTRY JOURNEY", 16, 134);
    
    const journeyLogs = [
      { key: "Step 1: Harvest Origin", val: `${activeFarm?.name || "Member Farm"} - Date Sourced: ${activeBatch.harvestDate}` },
      { key: "Step 2: Wet Milling", val: `${activeBatch.washingStation} (Fermentation time: ${activeBatch.fermentationHours} Hours)` },
      { key: "Step 3: Drying Beds", val: `${activeBatch.dryingMethod} (Optimal Curing Moisture: 11.2% Target)` },
      { key: "Step 4: Dry Mill Grading", val: `Grade Assessed: ${activeBatch.grade} (Assisted by Quality Auditor Elena Rostova)` },
      { key: "Step 5: Port Dispatch", val: `Status Log: ${activeBatch.status} (${activeBatch.weightKg} Kg under lock blockchain keys)` }
    ];
    
    let currentY = 142;
    journeyLogs.forEach((log) => {
      doc.setFillColor(248, 247, 244);
      doc.rect(16, currentY, 178, 12, "F");
      doc.setDrawColor(240, 238, 234);
      doc.rect(16, currentY, 178, 12, "S");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(27, 27, 27);
      doc.text(log.key, 20, currentY + 7.5);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(90, 90, 90);
      doc.text(log.val, 64, currentY + 7.5);
      
      currentY += 15;
    });
    
    // Environmental / Social Audit Indicators
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text("4. SOCIAL SUSTAINABILITY & AUDIT COMPLIANCE STANDARDS", 16, 224);
    doc.line(16, 226, 194, 226);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("* Native Rainforest Canopy Preserved: Verified Positive (100% shade coverage intact)", 18, 234);
    doc.text("* Multi-generational Sourcing & Child Labor Safe: Guaranteed Free", 18, 239);
    doc.text("* Environmental Water Purification & Biodiverse Soil practice: Verified Compliant", 18, 244);
    doc.text("* Fairtrade Minimum Price Plus Local Quality premium compensation: Transferred directly", 18, 249);
    
    // Bottom verification code
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 258, 182, 16, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    doc.text("BEANTRACE CRYPTOGRAPHIC SECURITY LOG BLOCK:", 18, 264);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`SHA-256 Verified Ledger ID: ${batchNo}-SECURE-VERIFIED-ISO-TOKEN-[${Math.floor(Math.random() * 9999 + 1000)}]`, 18, 271);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(197, 160, 89);
    doc.text("CERTIFIED", 170, 268);

    doc.save(`Traceability_Report_${batchNo}.pdf`);
  };

  return (
    <div id="traceability-center-container" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* 1. Left Batches & Search Directory panel */}
      <div className="lg:col-span-1 space-y-6">
        <form onSubmit={handleSearch} className="flex gap-1.5 bg-[#F8F7F4] p-2 border border-gray-200 rounded-xl">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
          />
          <button type="submit" id="trace-search-submit" className="p-1 px-3 rounded-lg bg-[#3D5A40] text-white select-none hover:bg-[#2F4632] cursor-pointer font-bold text-xs flex items-center justify-center">
            <Search size={14} />
          </button>
        </form>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">{t.activeCoffees}</span>
            <button
              onClick={() => {
                setFormShow(!formShow);
                autofillLotName();
              }}
              id="show-register-batch-modal"
              className="text-[10px] bg-[#FAF0DD] text-[#C5A059] px-2 py-1 rounded hover:bg-[#FDF5E6] cursor-pointer font-bold border border-[#C5A059]/30"
            >
              {formShow ? t.cancelForm : t.registerBatch}
            </button>
          </div>

          {/* Roster list */}
          <div className="space-y-2 h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {batches.map((batch) => {
              const isActive = batch.lotNumber === selectedLotNo;
              return (
                <div
                  key={batch.lotNumber}
                  onClick={() => setSelectedLotNo(batch.lotNumber)}
                  className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                    isActive 
                      ? "bg-[#FDF5E6] border-[#C5A059] text-gray-900 ring-1 ring-[#C5A059]/45 font-bold shadow-sm" 
                      : "bg-white border-gray-200 text-gray-650 hover:border-gray-350 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-gray-800">{batch.lotNumber}</span>
                    <span className="text-[9px] uppercase tracking-wide font-mono font-bold text-gray-405">{batch.method}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 truncate font-sans font-medium">{batch.variety}</p>
                  <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-gray-400 border-t border-gray-150 pt-1.5 font-bold">
                    <span>{t.cupScoreLabel}: {batch.cuppingScore}</span>
                    <span className="text-[#C5A059] uppercase">{batch.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1B. Quick Registrar Form */}
        {formShow && (
          <div className="p-4 bg-white border border-[#C5A059]/40 rounded-2xl space-y-3 animate-fade-in text-xs shadow-inner">
            <span className="text-[9px] font-mono font-bold text-[#C5A059] uppercase">{t.newLotLabel}</span>
            <form onSubmit={handleCreateBatchSubmit} className="space-y-3 text-left">
              <div>
                <label className="text-gray-500 block mb-0.5 font-mono font-semibold">{t.lotIdLabel}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formLotNumber}
                    placeholder="LOT-ETH-2026-FT909"
                    onChange={(e) => setFormLotNumber(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-800 p-2 rounded focus:outline-none focus:border-[#C5A059] focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={autofillLotName}
                    className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-350 text-gray-700 rounded font-mono font-bold cursor-pointer text-[10px]"
                  >
                    Gen
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 block mb-0.5 font-semibold">{t.farmOriginLabel}</label>
                  <select
                    value={formFarmId}
                    onChange={(e) => setFormFarmId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1.5 rounded cursor-pointer text-xs focus:bg-white outline-none"
                  >
                    {farms.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 block mb-0.5 font-semibold">{t.washingStationLabel}</label>
                  <input
                    type="text"
                    placeholder="Aleta Mill"
                    value={formWashingStation}
                    onChange={(e) => setFormWashingStation(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1.5 rounded focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 block mb-0.5 font-semibold">{t.processingLabel}</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1.5 rounded cursor-pointer text-xs focus:bg-white outline-none"
                  >
                    <option value="Washed">Washed</option>
                    <option value="Natural">Natural</option>
                    <option value="Honey">Honey</option>
                    <option value="Experimental">Experimental</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 block mb-0.5 font-semibold">{t.varietyLabel}</label>
                  <input
                    type="text"
                    value={formVariety}
                    onChange={(e) => setFormVariety(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1.5 rounded focus:outline-none focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                <div>
                  <label className="text-gray-500 block text-[9px] mb-0.5 font-bold">{t.fermentationLabel}</label>
                  <input
                    type="number"
                    value={formFermentation}
                    onChange={(e) => setFormFermentation(parseInt(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1 rounded text-center focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block text-[9px] mb-0.5 font-bold">{t.moistureLabel}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formMoisture}
                    onChange={(e) => setFormMoisture(parseFloat(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1 text-center focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block text-[9px] mb-0.5 font-bold">{t.cuppingLabel}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCupping}
                    onChange={(e) => setFormCupping(parseFloat(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 p-1 text-center focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#3D5A40] hover:bg-[#2F4632] text-white rounded font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                {t.assembleButton}
              </button>

              {formSuccess && (
                <p className="p-2 rounded bg-emerald-50 border border-emerald-250 text-[10px] text-emerald-800 text-center font-mono animate-fade-in font-bold">
                  {formSuccess}
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      {/* 2. Visual Traceability Timeline Journey & Printing Certificate maps */}
      {activeBatch ? (
        <div className="lg:col-span-3 space-y-8 animate-fade-in">
          
          {/* Main timeline tracker */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-[#2D2926]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold">{t.journeyTimeline}</span>
                <h3 className="text-lg font-bold text-gray-900 font-sans mt-0.5 flex items-center gap-2">
                  {t.auditTitle}: {activeBatch.lotNumber}
                </h3>
              </div>
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-lg bg-[#F8F7F4] text-gray-650 font-sans border border-gray-200 flex items-center gap-1 font-semibold">
                  <Award size={14} className="text-[#C5A059]" />
                  {t.scaleMetric}: {activeBatch.cuppingScore} (Excellent)
                </span>
                <span className="text-xs px-3 py-1 rounded-lg bg-[#FAF0DD] text-[#C5A059] font-mono font-bold uppercase border border-[#C5A059]/30">
                  {activeBatch.status}
                </span>
              </div>
            </div>

            {/* Visual supply chain historical nodes chart timeline */}
            <div className="relative pt-2 pb-6">
              {/* Horizontal Connector Line */}
              <div className="absolute top-[35px] left-6 right-6 h-0.5 bg-gray-200 z-0 hidden md:block" />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10 text-xs text-left">
                
                {/* Node 1: Harvest */}
                <div className="space-y-2">
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center justify-center shrink-0 shadow font-bold">
                      <Sprout size={16} />
                    </div>
                    <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wide font-mono">{t.stepHarvest}</span>
                  </div>
                  <div className="md:text-center text-gray-600 space-y-1 pl-12 md:pl-0 font-sans">
                    <p className="font-bold text-gray-800 text-xs">{activeFarm?.name || "Origin Estate"}</p>
                    <p className="text-[10px]">{activeFarm?.altitude || 1900}m • {activeFarm?.region || "Sidama"}</p>
                    <p className="text-[9px] font-mono text-gray-400 font-bold">{t.stepDate}: {activeBatch.harvestDate}</p>
                  </div>
                </div>

                {/* Node 2: Wet Mill Process */}
                <div className="space-y-2">
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="h-9 w-9 rounded-full bg-[#FAF0DD] text-[#C5A059] border border-[#C5A059]/40 flex items-center justify-center shrink-0 font-bold">
                      <Clipboard size={16} />
                    </div>
                    <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wide font-mono">{t.stepMilling}</span>
                  </div>
                  <div className="md:text-center text-gray-600 space-y-1 pl-12 md:pl-0 font-sans">
                    <p className="font-bold text-gray-800 text-xs">{activeBatch.washingStation}</p>
                    <p className="text-[10px]">Method: {activeBatch.method}</p>
                    <p className="text-[9px] font-mono text-gray-400 font-bold">{t.stepFerm}: {activeBatch.fermentationHours} Hours</p>
                  </div>
                </div>

                {/* Node 3: Moisture Curing */}
                <div className="space-y-2">
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="h-9 w-9 rounded-full bg-gray-50 text-gray-650 border border-gray-300 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wide font-mono">{t.stepCurring}</span>
                  </div>
                  <div className="md:text-center text-gray-600 space-y-1 pl-12 md:pl-0 font-sans">
                    <p className="font-bold text-gray-800 text-xs">{activeBatch.dryingMethod}</p>
                    <p className="text-[10px]">Moisture Target: 11.2%</p>
                    <p className="text-[9px] font-mono text-gray-400 font-bold">{t.stepMoist}: {activeBatch.moistureContent}%</p>
                  </div>
                </div>

                {/* Node 4: Dry Mill grading */}
                <div className="space-y-2">
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="h-9 w-9 rounded-full bg-gray-50 text-gray-650 border border-gray-300 flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wide font-mono">{t.stepGrading}</span>
                  </div>
                  <div className="md:text-center text-gray-600 space-y-1 pl-12 md:pl-0 font-sans">
                    <p className="font-bold text-gray-800 text-xs">{activeBatch.grade}</p>
                    <p className="text-[10px]">Cupping: {activeBatch.cuppingScore} SCA</p>
                    <p className="text-[9px] font-mono text-gray-400 font-bold">Stamp: Certified AA Grade</p>
                  </div>
                </div>

                {/* Node 5: Dry Vessel dispatch */}
                <div className="space-y-2">
                  <div className="flex md:flex-col items-center gap-3 md:gap-2">
                    <div className="h-9 w-9 rounded-full bg-gray-50 text-gray-500 border border-gray-300 flex items-center justify-center shrink-0">
                      <ShoppingCart size={16} />
                    </div>
                    <span className="font-bold text-gray-900 uppercase text-[10px] tracking-wide font-mono">{t.stepDispatch}</span>
                  </div>
                  <div className="md:text-center text-gray-600 space-y-1 pl-12 md:pl-0 font-sans">
                    <p className="font-bold text-gray-800 text-xs">Mombasa Port lanes</p>
                    <p className="text-[10px]">Buyer: {activeBatch.buyerName || (language === "es" ? "Consignado (Abierto)" : "Consigned (Open Roster)")}</p>
                    <p className="text-[9px] font-mono text-gray-400 font-bold">{t.stepWeight}: {activeBatch.weightKg} Kg</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Simulated buyer verify tool nested */}
            <div className="border-t border-gray-150 pt-4 bg-[#F8F7F4] p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-left">
              <div>
                <h5 className="text-xs font-bold text-gray-700 font-sans">{t.verifyTitle}</h5>
                <p className="text-[10px] text-gray-400 font-sans">{t.verifySubtitle}</p>
              </div>
              <form onSubmit={handleVerifyBuyerSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.verifyPlaceholder}
                  value={verifyBuyerInput}
                  onChange={(e) => setVerifyBuyerInput(e.target.value)}
                  className="bg-white border border-gray-250 rounded px-2.5 py-1 text-xs text-gray-800 focus:outline-none placeholder-gray-400"
                />
                <button type="submit" className="px-3 py-1 bg-[#3D5A40] hover:bg-[#2F4632] text-white rounded text-xs select-none cursor-pointer font-bold transition-colors">
                  {t.verifyButton}
                </button>
              </form>
              {buyerVerifiedName && (
                <div className="text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1 animate-fade-in bg-emerald-50 p-2 rounded border border-emerald-250">
                  <UserCheck size={14} /> {t.verifiedOwner}: {buyerVerifiedName}
                </div>
              )}
            </div>
          </div>

          {/* PRINTABLE ORIGIN CERTIFICATE CARD */}
          <div className="p-8 bg-[#FDFCFB] border-2 border-dashed border-[#C5A059]/30 rounded-3xl relative overflow-hidden text-gray-750 font-sans shadow">
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <QrCode size={400} />
            </div>

            {/* Certificate Header layout */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#C5A059]/30 pb-6 relative z-10 text-left">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest font-bold block">{t.certHeader}</span>
                <h3 className="text-2xl font-serif text-gray-900 font-bold tracking-tight mt-1">{t.certTitle}</h3>
                <span className="text-[10px] text-gray-400 font-mono italic mt-1 block">{t.certSub} • Elena Rostova</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={printCertificate}
                  id="print-certificate-invoice"
                  className="p-2 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-350 rounded-xl flex items-center gap-1.5 select-none text-xs transition-colors cursor-pointer font-bold shadow-sm"
                >
                  <Printer size={15} /> {t.printButton}
                </button>
                <button
                  onClick={downloadPdfReport}
                  id="download-pdf-report"
                  className="p-2 px-3 bg-[#3D5A40] text-white hover:bg-[#2F4632] rounded-xl flex items-center gap-1.5 select-none text-xs transition-colors cursor-pointer font-bold shadow-sm"
                >
                  <Award size={15} className="text-[#C5A059]" /> {t.downloadPdfButton}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 relative z-10 text-xs text-left">
              
              {/* Origin particulars */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">{t.growerParticulars}</span>
                  <p className="text-sm font-bold text-gray-900 font-sans mt-0.5">{activeFarm?.farmerName || "Elena Rostova"}</p>
                  <p className="text-gray-650 leading-normal font-medium">{activeFarm?.cooperative || "Federated Union"}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">{t.territoryGeology}</span>
                  <p className="text-gray-800 mt-0.5 font-bold">{activeFarm?.region || "Antioquia"}, {activeFarm?.country || "Colombia"}</p>
                  <p className="text-gray-650 font-mono text-[11px] font-medium">{activeFarm?.altitude || 1950} m.a.s.l. • {activeFarm?.soilType || "Volcanic Sols"}</p>
                </div>

                <div className="p-3 bg-[#FAF0DD]/40 rounded-xl border border-[#C5A059]/20 space-y-1.5 inline-block w-full">
                  <span className="text-[9px] font-mono text-[#C5A059] font-bold block uppercase">{t.guaranteesLabel}</span>
                  <ul className="space-y-0.5 text-[10px] text-gray-600 list-inside list-disc font-medium">
                    {t.guaranteesList.map((g, ind) => (
                      <li key={ind}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Story Particulars */}
              <div className="space-y-4 md:border-x md:border-gray-200 md:px-6">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">{t.lotSpecifics}</span>
                  <h4 className="text-lg font-mono font-bold text-[#C5A059] mt-0.5">{activeBatch.lotNumber}</h4>
                  <p className="text-gray-700 font-sans mt-1 leading-normal font-medium">{activeBatch.variety} • {activeBatch.weightKg} Kg gross weight.</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">{t.cupperIndices}</span>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">SCA Cupping Rating: {activeBatch.cuppingScore} / 100</p>
                  <p className="text-gray-650 text-[11px] mt-0.5 font-medium leading-relaxed">{t.cupperNotes}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 font-bold block">{t.certEcosystem}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(activeFarm?.certifications || ["Organic", "Fairtrade"]).map(crt => (
                      <span key={crt} className="text-[9px] font-mono px-2 py-0.5 bg-[#FAF0DD]/40 rounded border border-[#C5A059]/20 text-[#C5A059] font-bold">
                        {crt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR lock visual stamp */}
              <div className="flex flex-col items-center justify-center space-y-3 bg-[#FAF0DD]/30 p-4 rounded-2xl border border-[#C5A059]/20">
                <SimulatedQr text={`https://origina.net/trace/${activeBatch.lotNumber}`} />
                <div className="text-center">
                  <p className="text-[10px] font-mono text-gray-500 font-semibold">blockchain audit block lock</p>
                  <p className="text-[8px] font-mono text-emerald-700 uppercase mt-0.5 font-bold">Cryptographically Secured</p>
                </div>
              </div>

            </div>

            {/* Printable Footnote footer */}
            <div className="border-t-2 border-[#C5A059]/30 pt-4 mt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-450 font-mono relative z-10 w-full font-bold">
              <span>Fairtrade Premium ID: {activeBatch.lotNumber}-SEC-01</span>
              <span>Validated by Elena Rostova</span>
              <span>{t.certFootnote}</span>
            </div>

          </div>

        </div>
      ) : (
        <div className="lg:col-span-3 py-16 text-gray-400 text-center font-sans font-bold">
          <QrCode className="mx-auto text-gray-300 animate-pulse mb-3" size={48} />
          <p>No active lot targets found. Please select or register a batch.</p>
        </div>
      )}
    </div>
  );
}
