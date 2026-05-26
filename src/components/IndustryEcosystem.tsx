/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BookOpen, Calendar, TrendingUp, Award, ExternalLink, GraduationCap, ChevronRight, Check } from "lucide-react";
import { CoffeeEvent, MarketPrice } from "../types";

// Multi-chapter high-altitude coffee cultivation tutorial cards
const MANUAL_GUIDES = [
  {
    id: "guide-1",
    title: "High-Altitude Shade Ratios",
    duration: "4 min read",
    coopRank: "Essential",
    author: "Simon Wolde Balango",
    summary: "Maintaining a 40% canopy density using native nitrogen-fixing shady trees (Croton, Millettia) filters high-altitude solar radiation, preventing leaf rust outbreaks and buffering extreme temperature fluctuations at 1,900m+."
  },
  {
    id: "guide-2",
    title: "Organic Wet Mill Wastewater Filtering",
    duration: "6 min read",
    coopRank: "Eco-Grade A",
    author: "Sipi Training Board",
    summary: "Washed process runoff contains highly acidic organic load. Guide on building vetiver grass filter canals and sedimentation lagoons. Correcting pH from 4.2 back to 6.8 before releasing to public channels."
  },
  {
    id: "guide-3",
    title: "Sidama Cherry Picking Optimization",
    duration: "3 min read",
    coopRank: "SCA Specialist",
    author: "Yirgacheffe Union Board",
    summary: "Handpicking only cherries exceeding 20% Brix sweetness yields premium Grades (AA/AB). Simple water flotation density tests to float light insect-damaged cherries from heavy AAA micro-lots instantly."
  }
];

interface IndustryEcosystemProps {
  events: CoffeeEvent[];
  prices: MarketPrice[];
}

export default function IndustryEcosystem({
  events,
  prices
}: IndustryEcosystemProps) {
  const [selectedGuideId, setSelectedGuideId] = useState<string>("guide-1");
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);

  const handleToggleJoinEvent = (id: string) => {
    if (joinedEvents.includes(id)) {
      setJoinedEvents(prev => prev.filter(e => e !== id));
    } else {
      setJoinedEvents(prev => [...prev, id]);
    }
  };

  const activeGuide = MANUAL_GUIDES.find(g => g.id === selectedGuideId) || MANUAL_GUIDES[0];

  return (
    <div id="industry-ecosystem-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* 1. Market Price Ticker Cards */}
      <div className="lg:col-span-1 space-y-6 text-left">
        <div>
          <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block mb-1">GLOBAL TRADING INDEX</span>
          <h3 className="text-md font-bold text-stone-200">Arabica Market Price Indices</h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Real-time visual futures. Fairtrade auditing guarantees a minimum payout index to protect against market crashes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {prices.map((m) => {
            const isNegative = m.changePercent < 0;
            return (
              <div key={m.id} className="p-4 bg-stone-900 border border-stone-850 rounded-xl relative overflow-hidden flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-mono text-stone-550 block">{m.type}</span>
                  <h4 className="text-xs font-bold text-stone-200 mt-0.5">{m.name}</h4>
                  <span className="text-[10px] font-mono text-stone-450 block mt-1">Updated {m.lastUpdated}</span>
                </div>
                
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-amber-500 block">
                    ${m.priceUSD.toFixed(2)}
                  </span>
                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isNegative ? "bg-red-950/40 text-red-400 border border-red-900/30" : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                  }`}>
                    {isNegative ? "" : "+"}
                    {m.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small educational market index card */}
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-stone-300">
            <TrendingUp size={14} className="text-amber-500" />
            <span className="text-xs font-bold font-sans">Simon's Fairtrade Audit Impact</span>
          </div>
          <p className="text-[10px] text-stone-400 leading-normal">
            By auditing cooperatives under transparent SHA-256 blocks, smallholders capture an average 25% price premium over traditional middle-agent auction channels.
          </p>
        </div>
      </div>

      {/* 2. Expo Integration & Global Events Calendar */}
      <div className="lg:col-span-1 space-y-6 text-left">
        <div>
          <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block mb-1">CONFERENCES & EXPOSITIONS</span>
          <h3 className="text-md font-bold text-stone-200">Global Events Calendar</h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Connect regional East African cooperative lots with top-tier international green buyers, roasters, and SCA experts.
          </p>
        </div>

        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {events.map((evt) => {
            const isJoined = joinedEvents.includes(evt.id);
            return (
              <div key={evt.id} className="p-4 bg-stone-900 border border-stone-850 rounded-xl space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950/60 border border-amber-900/30 text-amber-500 font-mono font-bold">
                      {evt.category}
                    </span>
                    <h4 className="text-xs font-bold text-stone-200 mt-1.5">{evt.title}</h4>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 leading-normal">{evt.description}</p>

                <div className="flex items-center justify-between border-t border-stone-850 pt-2.5 text-[10px] font-mono text-stone-450">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-stone-500" />
                    {new Date(evt.date).toDateString()}
                  </span>
                  <span>{evt.location}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleJoinEvent(evt.id)}
                    className={`flex-1 py-1 px-3 text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isJoined 
                        ? "bg-stone-800 text-stone-500 border border-stone-750" 
                        : "bg-amber-800/30 border border-amber-800/60 text-amber-400 hover:bg-amber-800/50"
                    }`}
                  >
                    {isJoined ? <Check size={11} className="text-emerald-400" /> : ""}
                    {isJoined ? "Interested" : "Mark Interest"}
                  </button>
                  <a
                    href="https://sca.coffee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 px-2 border border-stone-800 rounded bg-stone-950 hover:bg-stone-900 text-stone-400 flex items-center justify-center"
                    title="Visit Official SCA Site"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Education Portal / Smallholder Field Handbook */}
      <div className="lg:col-span-1 space-y-6 text-left border-t lg:border-t-0 lg:border-l lg:border-stone-850 lg:pl-6 pt-6 lg:pt-0">
        <div>
          <span className="text-[10px] font-mono text-stone-500 uppercase font-bold block mb-1">SMALLHOLDER HANDBOOK</span>
          <h3 className="text-md font-bold text-stone-200">Extension Handbooks</h3>
          <p className="text-[11px] text-stone-400 mt-1">
            Agronomy training modules published by local regional field agronomists to upgrade cooperative farming yields.
          </p>
        </div>

        {/* Directory links */}
        <div className="space-y-2">
          {MANUAL_GUIDES.map(guide => {
            const isSel = guide.id === selectedGuideId;
            return (
              <button
                key={guide.id}
                onClick={() => setSelectedGuideId(guide.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSel 
                    ? "bg-amber-950/20 border-amber-800/50 text-amber-200 ring-1 ring-amber-800/35" 
                    : "bg-stone-950 border-stone-900 text-stone-400 hover:border-stone-800 hover:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={15} className={isSel ? "text-amber-500" : "text-stone-500"} />
                  <span className="text-xs font-bold truncate max-w-[180px] font-sans">{guide.title}</span>
                </div>
                <ChevronRight size={14} className={isSel ? "text-amber-500" : "text-stone-600"} />
              </button>
            );
          })}
        </div>

        {/* Display Active Handbook Chapter */}
        <div className="p-5 bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-2xl space-y-3 relative overflow-hidden">
          <span className="text-[8px] font-mono font-bold tracking-widest text-amber-500 uppercase px-2 py-0.5 rounded bg-amber-950/60 inline-block border border-amber-900/30">
            {activeGuide.coopRank} HANDBOOK
          </span>
          <h4 className="text-xs font-bold text-stone-100 font-sans mt-2">{activeGuide.title}</h4>
          
          <p className="text-[11px] text-stone-300 leading-relaxed font-sans">{activeGuide.summary}</p>

          <div className="border-t border-stone-850 pt-3 flex justify-between items-center text-[10px] font-mono text-stone-500">
            <span>By: {activeGuide.author}</span>
            <span>Est: {activeGuide.duration}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
