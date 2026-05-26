/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserCheck, ShieldCheck, Ship, ShoppingBag, Flame, ClipboardCheck, Scale, Award, Database, Percent, Compass, ThermometerSun } from "lucide-react";
import { UserRole, Farm, ProcessingBatch, BlockchainBlock } from "../types";

interface EcomDashboardProps {
  farms: Farm[];
  batches: ProcessingBatch[];
  blockchainState: {
    chain: BlockchainBlock[];
    difficulty: number;
    isValid: boolean;
  };
}

export default function EcomDashboard({
  farms,
  batches,
  blockchainState
}: EcomDashboardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("CooperativeManager");

  const rolesList: { role: UserRole; name: string; desc: string; icon: any }[] = [
    { role: "Farmer", name: "Smallholder Farmer", desc: "Monitor disease warnings, compost multipliers, and regional climate scores.", icon: Compass },
    { role: "CooperativeManager", name: "Cooperative Admin", desc: "Oversee fairtrade ledger lock records, aggregated weights, and members.", icon: ShieldCheck },
    { role: "Exporter", name: "Bulk Exporter", desc: "Track shipping container bookings, custom clearings, and dry-mill statuses.", icon: Ship },
    { role: "Buyer", name: "Green Buyer", desc: "Purchase audited lots with immutable certificates and organic tracing metrics.", icon: ShoppingBag },
    { role: "Roaster", name: "Specialty Roaster", desc: "Log profiles, check moisture content distributions, and download stories.", icon: Flame },
    { role: "QualityInspector", name: "Quality Inspector", desc: "Scrutinize sensory profiles, input cupping scores, and certify child-labor bans.", icon: ClipboardCheck }
  ];

  // Aggregating statistics for dashboards
  const activeFarmsCount = farms.length;
  const activeBatchesCount = batches.length;
  const totalBagsProduced = farms.reduce((acc, curr) => acc + curr.capacityBags, 0);
  const averageCuppingScore = (batches.reduce((acc, curr) => acc + curr.cuppingScore, 0) / batches.length || 85).toFixed(1);

  return (
    <div id="role-dashboard-root" className="space-y-8 text-[#2D2926]">
      
      {/* 1. Header Role Selector */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl text-left space-y-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-[#C5A059] mb-1 font-bold">
            <UserCheck size={18} />
            <span className="text-[10px] uppercase font-mono tracking-wider">User Role Sandbox</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-sans">Customizable Governance Dashboards</h3>
          <p className="text-xs text-gray-500 font-medium">
            Select an ecosystem profile role to evaluate dedicated data interfaces, customized workflows, and secure logistics widgets.
          </p>
        </div>

        {/* Roles button tray */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
          {rolesList.map((itm) => {
            const IsSel = itm.role === selectedRole;
            const Icon = itm.icon;
            return (
              <button
                key={itm.role}
                onClick={() => setSelectedRole(itm.role)}
                id={`role-btn-${itm.role}`}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  IsSel 
                    ? "bg-[#FDF5E6] border-[#C5A059] text-gray-900 ring-1 ring-[#C5A059]/45 font-bold shadow-sm" 
                    : "bg-gray-50 border-gray-200 text-gray-450 hover:border-gray-300 hover:bg-gray-100/50"
                }`}
              >
                <Icon size={18} className={`mb-2 ${IsSel ? "text-[#C5A059]" : "text-gray-400"}`} />
                <span className="text-xs font-bold block leading-tight font-sans">{itm.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Aggregated Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 bg-white border border-gray-200 rounded-xl text-left shadow-sm">
          <span className="text-gray-400 text-[10px] uppercase block font-bold">Co-Op Members</span>
          <span className="text-lg font-bold text-gray-900 mt-1 block">{activeFarmsCount} Active Farms</span>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl text-left shadow-sm">
          <span className="text-gray-400 text-[10px] uppercase block font-bold">Season Batches</span>
          <span className="text-lg font-bold text-gray-900 mt-1 block">{activeBatchesCount} Lots Registered</span>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl text-left shadow-sm">
          <span className="text-gray-400 text-[10px] uppercase block font-bold">Tonnage Est</span>
          <span className="text-lg font-bold text-gray-900 mt-1 block">{totalBagsProduced} Bags (60kg)</span>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl text-left shadow-sm">
          <span className="text-gray-400 text-[10px] uppercase block font-bold">Specialty Cupping</span>
          <span className="text-lg font-bold text-gray-900 mt-1 block">{averageCuppingScore} SCA Average</span>
        </div>
      </div>

      {/* 3. DYNAMIC WORKFLOW COMPONENT CARDS */}
      <div className="p-6 bg-white rounded-2xl border border-gray-200 text-left min-h-[300px] flex flex-col justify-between shadow-sm">
        
        {/* ROLE 1: FARMER PANEL */}
        {selectedRole === "Farmer" && (
          <div className="space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                🌱 SMALLHOLDER FARMER DESK — CO-OP HUB
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Oversee localized agronomical indexes to maximize high-altitude premium coffee grades.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-450 uppercase block font-bold">Weather & Rainfall Warnings</span>
                <p className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                  <ThermometerSun size={14} className="text-[#C5A059] animate-pulse" />
                  Minor drought alert: Mulch actively
                </p>
                <p className="text-[10px] text-gray-500 font-sans mt-1 font-medium">Precipitation: 1,450mm. Water conservation canals currently optimal.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-450 uppercase block font-bold">Organic Compost Timelines</span>
                <p className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                  <Database size={14} className="text-emerald-700" />
                  Husk pulper bio-mix: 84% cured
                </p>
                <p className="text-[10px] text-gray-500 font-sans mt-1 font-medium">Curing cycle ends in 8 days. Nitrogen content targets 2.1%.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-450 uppercase block font-bold">Shade Agroforestry Rating</span>
                <p className="text-xs text-gray-800 font-bold flex items-center gap-1.5">
                  <Award size={14} className="text-[#C5A059]" />
                  Certified Grade A Shade Canopy
                </p>
                <p className="text-[10px] text-gray-500 font-sans mt-1 font-medium">36% Albizia canopy coverage registered via satellite overlay survey.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 2: COOPERATIVE MANAGER PANEL */}
        {selectedRole === "CooperativeManager" && (
          <div className="space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                🛡️ COOPERATIVE MANAGER OFFICE
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Acreage yields summaries, members registry ledger compliance, and Fairtrade premiums allocation counters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Ledger validation locked</span>
                <p className="text-xs text-[#3D5A40] font-bold flex items-center gap-1.5 font-mono">
                  <ShieldCheck size={14} /> Cryptography links matched
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Chain integrity validated on all nodes across volcanics coffee belts.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Fair-Trade Premium pool</span>
                <p className="text-xs text-gray-850 font-bold font-mono">
                  USD $14,240.40 Available
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Earmarked: $6,000 for local high-altitude clean-water spring filter pipelines.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Aggregate moisture stats</span>
                <p className="text-xs text-gray-855 font-bold flex items-center gap-1.5 font-mono">
                  <Percent size={14} className="text-[#C5A059]" />
                  11.1% Moisture Content Area Avg
                </p>
                <p className="text-[10px] text-gray-500 font-sans mt-1 font-medium">Curing levels match standard parameters for dry-mill deliveries.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 3: EXPORTER PANEL */}
        {selectedRole === "Exporter" && (
          <div className="space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                🚢 BULK LOGISTICS & EXPORT DESK
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Dry mills clearance status, customs booking registers, phytosanitary declarations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Djibouti/Mombasa Container Port Desk</span>
                <p className="text-xs text-gray-800 font-bold flex items-center gap-1">
                  <Ship size={14} className="text-[#C5A059]" /> Freight Booking: Confirmed
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Vessel: Rift Valley Express • Container: FT-COFFE-890 • departure: Jun 12.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Phytosanitary Clearance</span>
                <p className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 font-mono">
                  <ShieldCheck size={14} className="text-emerald-700" /> ICO Seal approved
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Phyto inspection passed. Zero pests spotted during customs dry mill check.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Transit container locked</span>
                <p className="text-xs text-gray-800 font-bold flex items-center gap-1 font-mono">
                  <Database size={14} className="text-gray-400" />
                  LOTS: 3 Secured
                </p>
                <p className="text-[10px] text-gray-550 mt-1 font-sans font-medium">Blockchain verification tags signed by Simon Wolde Balango on dispatch.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 4: BUYER PANEL */}
        {selectedRole === "Buyer" && (
          <div className="space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                💰 GREEN SPECIALTY SPECIALIST BUYER
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Acquire audited, high-altitude micro-lots directly from transparent smallholder cooperative ledgers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Direct Farmer Returns Index</span>
                <p className="text-xs text-[#3D5A40] font-bold font-mono">
                  92.4% direct payout tracking
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">By bypassing middlemen, funds flow straight into Sidama community bank cells.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">SCA Cupping Verification</span>
                <p className="text-xs text-gray-850 font-bold flex items-center gap-1.5">
                  <Award size={14} className="text-[#C5A059]" />
                  High Specialty Grade Average
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Sidama valley micro-lots certified under cupping index average of 88.5.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Blockchain Trace download</span>
                <p className="text-xs text-gray-850 font-bold flex items-center gap-1.5 font-mono">
                  <Database size={14} className="text-[#C5A059]" />
                  PDF certificates ready
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-sans font-medium">Download printable QR origin cards to place directly on retail shelves.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 5: ROASTER PANEL */}
        {selectedRole === "Roaster" && (
          <div className="space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                🔥 GREEN TO ROATED BEAN REGISTER
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Log roasters heating curve parameter metrics, origin story assets copy-tool, raw density profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Heating Curve parameters</span>
                <p className="text-xs text-gray-850 font-bold font-mono">
                  Medium-Light: 204°C Drop
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Roaster speed: 12.4 min. First crack at 9:15, development time ratio 14%.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 block font-bold">Origin marketing story card</span>
                <p className="text-xs text-[#C5A059] font-bold flex items-center gap-1 cursor-help uppercase text-[9px] border border-[#C5A059]/30 p-1.5 rounded bg-[#FAF0DD]/55 text-center leading-none">
                  Copy Farmer Simon's Story
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Copy verified story parameters directly to your packaging, printing, or website.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Cupper density profile check</span>
                <p className="text-xs text-gray-850 font-bold">
                  680 g/L Green Bean density
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium font-sans">High density beads require elevated heat application in the introductory phase.</p>
              </div>
            </div>
          </div>
        )}

        {/* ROLE 6: QUALITY INSPECTOR PANEL */}
        {selectedRole === "QualityInspector" && (
          <div className="space-y-6">
            <div className="border-b border-gray-150 pb-3">
              <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                📋 QUALITATIVE SENSORY CUPPING AUDIT
              </h4>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Sensory metrics logging matrix, moisture assessment counters, fairtrade ecological regulations checkboxes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold font-sans">Sensory Score Breakdown</span>
                <p className="text-xs text-gray-850 font-bold font-mono">
                  Acidity: 9.2 • Body: 8.5 • Clean Cup: 10
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium font-sans">Evaluation of Aleta Wondo wet mill lots. High altitude SL-28 acidic complexity.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Moisture verification checks</span>
                <p className="text-xs text-emerald-800 font-bold flex items-center gap-1 font-mono">
                  <Scale size={14} /> 11.2% Moisture Content OK
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium font-sans font-medium">Target meets green export requirements. Safe storage levels achieved.</p>
              </div>

              <div className="p-4 bg-[#F8F7F4]/65 border border-gray-200 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono text-gray-455 uppercase block font-bold">Fairtrade compliance seals</span>
                <p className="text-xs text-gray-800 font-bold flex items-center gap-1 text-[11px] font-semibold">
                  <ShieldCheck size={14} className="text-emerald-700" /> All ecology locks passed
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-medium font-sans leading-normal">Child-labor free, forest preserved, safe composting, social premiums paid.</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-150 pt-4 mt-6 flex justify-between text-[10px] font-mono text-gray-400 font-semibold">
          <span>Origina Governance Core V1.2</span>
          <span>Access Level: Verified Stakeholder</span>
        </div>

      </div>
    </div>
  );
}
