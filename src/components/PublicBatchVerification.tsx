/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckCircle2, ShieldCheck, Award, MapPin, QrCode, ArrowLeft, Copy, Check, Printer, FileDown, ExternalLink, Globe, Sprout, ShoppingBag, Coffee, Film } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ProcessingBatch, Farm, BlockchainBlock } from "../types";
import { jsPDF } from "jspdf";

interface PublicBatchVerificationProps {
  batch: ProcessingBatch;
  farm?: Farm;
  blockchainBlock?: BlockchainBlock;
  onEnterPortal?: () => void;
  onSelectAnotherLot?: (lot: string) => void;
  allBatches?: ProcessingBatch[];
  onWatchPromoVideo?: () => void;
}

export default function PublicBatchVerification({
  batch,
  farm,
  blockchainBlock,
  onEnterPortal,
  onSelectAnotherLot,
  allBatches = [],
  onWatchPromoVideo
}: PublicBatchVerificationProps) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://origina.net";
  const publicVerifyUrl = `${origin}/?verify=${encodeURIComponent(batch.lotNumber)}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(publicVerifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.warn("Copy failed:", e);
    }
  };

  const downloadVerificationPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(27, 27, 27);
    doc.rect(0, 0, 210, 36, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ORIGINA COFFEE PUBLIC TRACEABILITY CERTIFICATE", 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(197, 160, 89);
    doc.text("VERIFIED CRYPTOGRAPHIC RECORD FOR SPECIALTY COFFEE SUPPLY CHAIN", 14, 22);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`VERIFIED BATCH: ${batch.lotNumber}`, 14, 48);
    doc.text(`PRODUCER: ${farm?.farmerName || "Simon Wolde"} - ${farm?.name || "Misty Mountain Estate"}`, 14, 55);
    doc.text(`ALTITUDE: ${farm?.altitude || 1950} m.a.s.l. | SCA SCORE: ${batch.cuppingScore}/100`, 14, 62);
    doc.text(`PROCESSING: ${batch.method} | VARIETY: ${batch.variety}`, 14, 69);
    doc.text(`COOPERATIVE: ${farm?.cooperative || "Sidama Union Cooperative"}`, 14, 76);
    doc.text(`CERTIFICATIONS: ${(farm?.certifications || ["Fairtrade", "Organic"]).join(", ")}`, 14, 83);
    doc.text(`VERIFICATION URL: ${publicVerifyUrl}`, 14, 90);

    doc.save(`Public_Verification_${batch.lotNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2D2926] p-4 sm:p-8 font-sans selection:bg-[#C5A059]/30">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 px-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D5A40] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Coffee size={20} className="text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-mono text-[#C5A059] font-bold">Public Verification Portal</span>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified
                </span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Origina Coffee Trust Ledger</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyLink}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-250 bg-gray-50 hover:bg-white text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? "Link Copied!" : "Copy Verification Link"}
            </button>
            {onWatchPromoVideo && (
              <button
                onClick={onWatchPromoVideo}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#C5A059]/40 bg-[#FAF0DD] hover:bg-[#F4E3C1] text-[#8e7135] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Film size={13} className="text-[#C5A059]" />
                <span>🎬 Promo Film (42s)</span>
              </button>
            )}
            <button
              onClick={downloadVerificationPDF}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#C5A059]/40 bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown size={13} />
              PDF Seal
            </button>
            {onEnterPortal && (
              <button
                onClick={onEnterPortal}
                className="text-xs font-bold px-4 py-1.5 rounded-xl bg-[#3D5A40] hover:bg-[#2F4632] text-white transition-colors cursor-pointer"
              >
                Co-op Staff Login
              </button>
            )}
          </div>
        </div>

        {/* Verification Hero Badge */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1E2E20] via-[#2F4632] to-[#1E2E20] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#3D5A40]">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <ShieldCheck size={220} />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-[#C5A059]/20 text-[#E8C882] text-[10px] font-mono font-bold px-3 py-1 rounded-full border border-[#C5A059]/40 uppercase tracking-wider">
                <ShieldCheck size={12} />
                Cryptographically Audited Batch
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
                Lot {batch.lotNumber}
              </h2>
              <p className="text-sm text-gray-200 font-sans max-w-xl leading-relaxed">
                This single-origin coffee batch has been independently certified by the BeanTrace Cooperative Network. 
                Every kilogram is tracked from high-altitude harvest trees through washing station, moisture curing, and fair pricing compensation.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono border border-white/10">
                  Cupping: <strong className="text-[#E8C882]">{batch.cuppingScore} SCA</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono border border-white/10">
                  Grade: <strong className="text-white">{batch.grade}</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono border border-white/10">
                  Weight: <strong className="text-white">{batch.weightKg} kg</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-400/30 font-bold">
                  Status: {batch.status}
                </span>
              </div>
            </div>

            {/* QR Verification Card */}
            <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-2xl flex flex-col items-center text-center space-y-2 border border-gray-100">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">Scan to Verify Batch</span>
              <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-inner">
                <QRCodeSVG value={publicVerifyUrl} size={130} level="M" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-gray-700 block">{batch.lotNumber}</span>
                <span className="text-[8.5px] font-mono text-emerald-700 uppercase font-bold">SHA-256 Ledger Token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Origin Farm & Terroir Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="text-[#C5A059]" size={18} />
                <h3 className="font-bold text-gray-900 text-base">Farm Origin & Agro-Terroir</h3>
              </div>
              <span className="text-xs font-mono text-[#3D5A40] font-bold bg-[#EDF3EE] px-2.5 py-0.5 rounded-full">
                {farm?.altitude || 1980} m.a.s.l.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-gray-400 font-bold">Producer</span>
                <p className="font-bold text-gray-900 text-sm">{farm?.farmerName || "Simon Wolde Balango"}</p>
                <p className="text-[10px] text-gray-500">{farm?.name || "Misty Mountain Estate"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-gray-400 font-bold">Region & Origin</span>
                <p className="font-bold text-gray-900 text-sm">{farm?.region || "Sidama Zone"}</p>
                <p className="text-[10px] text-gray-500">{farm?.country || "Ethiopia"}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-gray-400 font-bold">Cooperative Union</span>
                <p className="font-bold text-gray-900 text-sm">{farm?.cooperative || "Sidama Union Cooperative"}</p>
                <p className="text-[10px] text-gray-500">Fair-Trade Certified Member</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-gray-400 font-bold">Specialty Variety</span>
                <p className="font-bold text-gray-800">{batch.variety}</p>
                <p className="text-[10px] text-gray-500">Native Highland Cultivar</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-gray-400 font-bold">Processing Method</span>
                <p className="font-bold text-gray-800">{batch.method}</p>
                <p className="text-[10px] text-gray-500">{batch.dryingMethod}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase text-gray-400 font-bold">Fermentation & Moisture</span>
                <p className="font-bold text-gray-800">{batch.fermentationHours} Hours</p>
                <p className="text-[10px] text-gray-500">Moisture: {batch.moistureContent}% Target</p>
              </div>
            </div>

            {/* Dynamic Certifications Badges */}
            <div className="border-t border-gray-150 pt-4">
              <span className="text-[9.5px] font-mono uppercase text-gray-400 font-bold block mb-2">Verified Independent Certifications</span>
              <div className="flex flex-wrap gap-2">
                {(farm?.certifications || ["Fairtrade", "Organic", "Rainforest Alliance"]).map(cert => (
                  <div key={cert} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/70 text-gray-800 text-xs font-semibold">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{cert}</span>
                    <span className="text-[9px] font-mono text-gray-400 uppercase ml-1">Seal Verified</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Sustainability & Fair Premium Guarantee */}
          <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#C5A059]/30 shadow-sm flex flex-col justify-between space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-2 text-[#886C32] font-bold text-sm mb-3">
                <Award size={18} className="text-[#C5A059]" />
                <h4>Fair-Trade Equity Guarantee</h4>
              </div>
              <p className="text-gray-650 leading-relaxed font-sans mb-3">
                100% transparent economic ledger. Producers receive guaranteed fair floor pricing plus direct community quality premiums.
              </p>

              <div className="space-y-2 bg-white/80 p-3 rounded-xl border border-[#C5A059]/20 font-mono text-[11px]">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Base Price Paid:</span>
                  <strong className="text-gray-900">$3.20 / lb</strong>
                </div>
                <div className="flex justify-between items-center text-[#886C32]">
                  <span>Quality / Fair Premium:</span>
                  <strong className="text-[#886C32]">+$0.45 / lb</strong>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between items-center text-gray-900 font-bold">
                  <span>Total Producer Net:</span>
                  <strong className="text-[#3D5A40] text-xs">$3.65 / lb FOB</strong>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[10px] text-gray-500 font-sans border-t border-[#C5A059]/20 pt-3">
              <p className="flex items-center gap-1 text-emerald-800 font-medium">
                ✓ Child Labor Free Guarantee: Verified Compliant
              </p>
              <p className="flex items-center gap-1 text-emerald-800 font-medium">
                ✓ 100% Shade-Canopy Forestry Preserved
              </p>
              <p className="flex items-center gap-1 text-emerald-800 font-medium">
                ✓ Organic Bio-Compost Soil Management
              </p>
            </div>
          </div>
        </div>

        {/* Other Verified Batches Selector */}
        {allBatches.length > 1 && onSelectAnotherLot && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-mono text-gray-500 font-bold uppercase text-[10px]">
              Browse other verified cooperative batches:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allBatches.map(b => (
                <button
                  key={b.lotNumber}
                  onClick={() => onSelectAnotherLot(b.lotNumber)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                    b.lotNumber === batch.lotNumber 
                      ? "bg-[#3D5A40] text-white font-bold" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                  }`}
                >
                  {b.lotNumber}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 text-center text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest border-t border-gray-250">
          © 2026 Origina Traceability Ledger · Lead Developer: Simon Wolde Balango
        </div>

      </div>
    </div>
  );
}
