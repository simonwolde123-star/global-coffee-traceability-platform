/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserCheck, ShieldCheck, Ship, ShoppingBag, Flame, ClipboardCheck, Scale, Award, Database, Percent, Compass, ThermometerSun, TrendingUp, Copy, Check } from "lucide-react";
import { UserRole, Farm, ProcessingBatch, BlockchainBlock } from "../types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const getSensoryAttributes = (batch: ProcessingBatch) => {
  const base = batch.cuppingScore / 10;
  
  // Custom offsets depending on flavor & process to make it extremely realistic
  const isWashed = batch.method === "Washed";
  const isNatural = batch.method === "Natural";
  const isHoney = batch.method === "Honey";
  
  let acidity = base + (isWashed ? 0.35 : isNatural ? -0.25 : 0.05);
  let body = base + (isNatural ? 0.45 : isWashed ? -0.25 : 0.2);
  let aroma = base + (isNatural ? 0.25 : isWashed ? 0.15 : 0.1);
  let aftertaste = base + (isWashed ? 0.15 : isNatural ? 0.2 : 0.05);
  let flavor = base + (batch.fermentationHours > 36 ? 0.3 : 0.1);
  let sweetness = base + (isHoney ? 0.35 : isNatural ? 0.25 : 0.1);

  const clamp = (val: number) => Math.min(10, Math.max(6, Number(val.toFixed(2))));

  return [
    { subject: "Acidity", rating: clamp(acidity), fullMark: 10 },
    { subject: "Body", rating: clamp(body), fullMark: 10 },
    { subject: "Aroma", rating: clamp(aroma), fullMark: 10 },
    { subject: "Flavor", rating: clamp(flavor), fullMark: 10 },
    { subject: "Sweetness", rating: clamp(sweetness), fullMark: 10 },
    { subject: "Aftertaste", rating: clamp(aftertaste), fullMark: 10 },
  ];
};

interface EcomDashboardProps {
  farms: Farm[];
  batches: ProcessingBatch[];
  blockchainState: {
    chain: BlockchainBlock[];
    difficulty: number;
    isValid: boolean;
  };
}

interface TooltipPayload {
  name: string;
  value: any;
  stroke: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-lg font-mono text-[11px] space-y-1.5 text-[#2D2926]">
        <p className="font-bold border-b border-gray-150 pb-1 text-gray-800 text-[10px] uppercase font-sans tracking-wider">{label}</p>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-4 justify-between">
            <span style={{ color: entry.stroke }} className="font-semibold">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomTooltipTimeline = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-lg font-mono text-[11px] space-y-1.5 text-[#2D2926]">
        <p className="font-bold border-b border-gray-150 pb-1 text-gray-800 text-[10px] uppercase font-sans tracking-wider">Harvested: {label}</p>
        <div className="text-[10px] text-gray-500 mb-1">
          <span>Farm: <strong>{data.farmName}</strong></span> | <span>Lot: <strong>{data.lot}</strong></span>
        </div>
        {payload.map((entry: TooltipPayload, index: number) => (
          <div key={index} className="flex items-center gap-4 justify-between">
            <span style={{ color: entry.stroke }} className="font-semibold">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EcomDashboard({
  farms,
  batches,
  blockchainState
}: EcomDashboardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>("CooperativeManager");
  const [chartView, setChartView] = useState<"comparison" | "timeline">("comparison");
  const [selectedRoasterLot, setSelectedRoasterLot] = useState<string>(
    batches.length > 0 ? batches[0].lotNumber : ""
  );
  const [copiedStory, setCopiedStory] = useState(false);

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

  // Preparing chart data for farm-by-farm comparison
  const chartData = farms.map(farm => {
    const farmBatches = batches.filter(b => b.farmId === farm.id);
    const actualBags = farmBatches.reduce((acc, b) => acc + (b.weightKg / 60), 0);
    const avgCuppingScore = farmBatches.length > 0 
      ? Number((farmBatches.reduce((acc, b) => acc + b.cuppingScore, 0) / farmBatches.length).toFixed(1))
      : 80; // Baseline default fallback
    return {
      name: farm.name.replace(" Estate", "").replace(" Heights", "").replace(" Organics", "").replace(" Farm", ""),
      capacity: farm.capacityBags,
      actual: Number(actualBags.toFixed(1)),
      cuppingScore: avgCuppingScore,
    };
  });

  // Preparing chronological trend chart data
  const timelineData = [...batches]
    .sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime())
    .map(batch => {
      const farm = farms.find(f => f.id === batch.farmId);
      return {
        date: new Date(batch.harvestDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        bags: Number((batch.weightKg / 60).toFixed(1)),
        cuppingScore: batch.cuppingScore,
        farmName: farm ? farm.name.split(" ")[0] : "Co-op",
        lot: batch.lotNumber.substring(batch.lotNumber.lastIndexOf("-") + 1),
      };
    });

  const currentBatch = batches.find(b => b.lotNumber === selectedRoasterLot) || batches[0];
  const currentFarm = currentBatch ? farms.find(f => f.id === currentBatch.farmId) : undefined;
  const sensoryData = currentBatch ? getSensoryAttributes(currentBatch) : [];

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

      {/* 2.5 Visual Yield Trend Line Chart */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl text-left space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[#C5A059] mb-1 font-bold">
              <TrendingUp size={16} />
              <span className="text-[10px] uppercase font-mono tracking-wider">Harvest Analytics Registry</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 font-sans">Farm Yield Output & Quality Trends</h3>
            <p className="text-xs text-gray-500 font-medium">
              Analyze yield consistency and historical cupping performance across cooperative locations.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setChartView("comparison")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                chartView === "comparison"
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Farm Yield Comparison
            </button>
            <button
              onClick={() => setChartView("timeline")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                chartView === "timeline"
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-gray-500 hover:text-gray-905"
              }`}
            >
              Chronological Batch Output
            </button>
          </div>
        </div>

        {/* The recharts container */}
        <div className="w-full h-72 md:h-80 bg-gray-50/50 p-4 border border-gray-150 rounded-xl relative">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === "comparison" ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }} 
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
                  label={{ value: 'Bags (60kg)', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#6B7280', fontFamily: 'JetBrains Mono' } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
                  label={{ value: 'SCA Score', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#6B7280', fontFamily: 'JetBrains Mono' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: 10, fontFamily: 'Inter', paddingTop: 10 }}
                  iconType="circle"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="capacity" 
                  name="Target Est. Capacity (Bags)" 
                  stroke="#C5A059" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="actual" 
                  name="Actual Harvested Lots (Bags)" 
                  stroke="#3D5A40" 
                  strokeWidth={2.5}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cuppingScore" 
                  name="Avg SCA Cupping Score" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            ) : (
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }} 
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
                  label={{ value: 'Batch Weight (Bags)', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#6B7280', fontFamily: 'JetBrains Mono' } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
                  label={{ value: 'SCA Cupping Score', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#6B7280', fontFamily: 'JetBrains Mono' } }}
                />
                <Tooltip content={<CustomTooltipTimeline />} />
                <Legend 
                  wrapperStyle={{ fontSize: 10, fontFamily: 'Inter', paddingTop: 10 }}
                  iconType="circle"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="bags" 
                  name="Batch Size (Bags)" 
                  stroke="#3D5A40" 
                  strokeWidth={2.5}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cuppingScore" 
                  name="Batch SCA Cupping Score" 
                  stroke="#2563EB" 
                  strokeWidth={2}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Analysis Notes Footnote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] bg-gray-50 p-4 rounded-xl border border-gray-150 font-sans">
          <div className="space-y-1">
            <h5 className="font-bold text-gray-800">📊 Harvest Volume Consistency Insight</h5>
            <p className="text-gray-500 leading-normal">
              Most registered co-op members (such as Carlos Delgado at <strong>Hacienda El Rosal</strong> and Siti Simanjuntak at <strong>Raja Toba</strong>) demonstrate a tight clustering in current lot sizes, aligning organically to environmental capacity buffers. Sipi Falls exhibits a high buffer target capacity.
            </p>
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-gray-800">⭐ Quality Scoring Consistency</h5>
            <p className="text-gray-500 leading-normal">
              Cupping scores remain exceptional across all altitude regions, consistently exceeding the <strong>85.0 SCA</strong> specialty cutoff line. Misty Mountain and Hacienda El Rosal currently lead quality thresholds with premium lots.
            </p>
          </div>
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
            <div className="border-b border-gray-150 pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#C5A059] uppercase font-mono tracking-wide">
                  🔥 SPECIALTY ROASTER SENSORY PROFILE LAB
                </h4>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Deconstruct SCA cupping scores, select verified lots, download package origin stories, and analyze roasting metrics.
                </p>
              </div>
            </div>

            {/* Lot selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 border border-gray-150 p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-mono text-[#C5A059] uppercase block font-bold mb-1">Active Batch Registry</span>
                <p className="text-xs text-gray-700 font-semibold font-sans">Select audited lot to load profiles</p>
              </div>
              <div className="relative">
                <select
                  value={selectedRoasterLot}
                  onChange={(e) => {
                    setSelectedRoasterLot(e.target.value);
                    setCopiedStory(false);
                  }}
                  className="bg-white border border-gray-200 text-xs font-mono rounded-xl px-3 py-2 text-[#2D2926] font-bold focus:ring-1 focus:ring-[#C5A059] outline-none cursor-pointer"
                >
                  {batches.map(b => {
                    const fName = farms.find(f => f.id === b.farmId)?.name || "Unlisted";
                    return (
                      <option key={b.lotNumber} value={b.lotNumber}>
                        {b.lotNumber} ({fName.replace(" Estate", "").replace(" Farm", "")}) - Score: {b.cuppingScore}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Profile Grid: Radar Chart + Parameter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
              
              {/* Left Side: Radar/Spider-web Chart */}
              <div className="lg:col-span-5 p-4 border border-gray-150 bg-[#FBFBFA]/60 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-gray-150 pb-2 mb-2">
                    <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">SENSORY SPIDER CHART</span>
                    <span className="text-xs font-bold text-[#C5A059] font-mono bg-[#FFF8EB] border border-[#C5A059]/20 px-2 py-0.5 rounded-lg">
                      SCA: {currentBatch?.cuppingScore.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Normalized 10-point cupping parameters representing specialty traits of <strong>{currentBatch?.lotNumber}</strong>.
                  </p>
                </div>

                {/* Recharts Spider-web Chart */}
                <div className="w-full h-60 relative flex items-center justify-center">
                  {sensoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={sensoryData}>
                        <PolarGrid stroke="#E5E7EB" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fontSize: 9, fontFamily: "JetBrains Mono", fill: "#4B5563" }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[6, 10]} 
                          tick={{ fontSize: 7, fontFamily: "JetBrains Mono", fill: "#9CA3AF" }} 
                        />
                        <Radar 
                          name="Cup Profile" 
                          dataKey="rating" 
                          stroke="#C5A059" 
                          fill="#C5A059" 
                          fillOpacity={0.25} 
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const entry = payload[0];
                              return (
                                <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-md font-mono text-[10px] text-[#2D2926]">
                                  <span className="font-bold text-gray-450">{entry.name}:</span> <span className="font-bold text-[#C5A059]">{entry.value}/10</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-gray-400 font-mono">No sensory parameters computed</span>
                  )}
                </div>

                {/* Micro Details Table */}
                <div className="text-[10px] font-mono p-3 bg-white border border-gray-150 rounded-xl space-y-1 text-gray-550">
                  <div className="flex justify-between">
                    <span>Botanical Variety:</span>
                    <span className="font-bold text-black">{currentBatch?.variety}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Process Format:</span>
                    <span className="font-bold text-black">{currentBatch?.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lot Grade Classification:</span>
                    <span className="font-bold text-black">{currentBatch?.grade}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Thermal profiles and marketing stories */}
              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Roast Profile parameter recommendations */}
                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-1.5 shadow-sm text-left">
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase block font-bold">Roast recommendation</span>
                    <p className="text-xs text-gray-900 font-bold font-mono">
                      {currentBatch?.method === "Natural" 
                        ? "Light-Medium Roast: 202°C Drop" 
                        : currentBatch?.method === "Honey" 
                        ? "Medium Profile: 203.5°C Drop" 
                        : "Light/Filter Roast: 200°C Drop"}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Suggested Roaster cycle: {currentBatch?.method === "Natural" ? "11.2 min, drying cycle phase 5 min." : "12.4 min. First crack at 9:15."} Charge temperature estimated at 195°C based on {currentBatch?.moistureContent}% moisture target.
                    </p>
                  </div>

                  {/* Cupper density check mapping moisture */}
                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-1.5 shadow-sm text-left">
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase block font-bold">Density & moisture content</span>
                    <p className="text-xs text-gray-950 font-bold font-mono">
                      {currentBatch?.moistureContent}% Moisture Content
                    </p>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Green density profile calculated at {currentBatch?.method === "Natural" ? "690 g/L" : "675 g/L"}. Verified safe moisture range (<span className="text-[#3D5A40] font-bold">PASSED</span>) complying with Specialty storage rules.
                    </p>
                  </div>
                </div>

                {/* Origin story card */}
                <div className="p-5 border border-amber-200/50 bg-[#FDFBF7] rounded-2xl relative text-left space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-[#C5A059]" />
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#C5A059]">Package Origin Asset Copywriter</span>
                    </div>
                    <button
                      onClick={() => {
                        const storyText = `${currentFarm?.name || "Premium Co-Op Farm"} - Managed by ${currentFarm?.farmerName || "Cooperative Grower"} in ${currentFarm?.region || "Highlands"}, ${currentFarm?.country || "Ethiopia"}. Crop variety: ${currentBatch?.variety}. Processed via sensory-certified ${currentBatch?.method} fermentation. Cupping score of ${currentBatch?.cuppingScore.toFixed(1)} parsed on the blockchain network of Origina.`;
                        navigator.clipboard.writeText(storyText);
                        setCopiedStory(true);
                        setTimeout(() => setCopiedStory(false), 2000);
                      }}
                      className="text-[10px] font-mono border border-gray-200 hover:bg-gray-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer bg-white"
                    >
                      {copiedStory ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                      {copiedStory ? "Copied!" : "Copy Story"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-sans italic font-medium">
                    "This lot is harvested at {currentFarm?.altitude || 1900}m altitude by {currentFarm?.farmerName || "Cooperative Members"} on the soils of the {currentFarm?.name || "Misty Mountain"} in {currentFarm?.region || "Sidama Zone"}, {currentFarm?.country || "Ethiopia"}. Formulated with traditional {currentBatch?.variety} cultivars and carefully dry-crafted using a precise {currentBatch?.method} method. Cupping panels registered an extraordinary SCA rating of {currentBatch?.cuppingScore}, with distinctive sensory metrics of {sensoryData.slice(0, 4).map(d => `${d.subject} (${d.rating})`).join(", ")}."
                  </p>

                  <div className="text-[10px] text-gray-400 font-mono flex items-center justify-between border-t border-gray-150 pt-2.5">
                    <span>Producer: {currentFarm?.farmerName || "Simon Wolde"}</span>
                    <span>Washing Station: {currentBatch?.washingStation || "Local cooperative"}</span>
                  </div>
                </div>
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
