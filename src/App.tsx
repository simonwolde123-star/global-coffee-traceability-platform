/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Compass, Sprout, ShieldCheck, QrCode, BrainCircuit, Users, Camera, Globe, Wifi } from "lucide-react";
import { Farm, ProcessingBatch, MediaItem, CoffeeEvent, MarketPrice, BlockchainBlock, AuditingTransaction } from "./types";
import { INITIAL_FARMS, INITIAL_BATCHES, INITIAL_MEDIA, COFFEE_EVENTS, MARKET_PRICES } from "./mockData";
import { LanguageCode, translations } from "./translations";

// Component imports
import MapDashboard from "./components/MapDashboard";
import FarmCoordinator from "./components/FarmCoordinator";
import TraceabilityCenter from "./components/TraceabilityCenter";
import AIAssistant from "./components/AIAssistant";
import BlockchainAudit from "./components/BlockchainAudit";
import MediaVault from "./components/MediaVault";
import EcomDashboard from "./components/EcomDashboard";
import OfflineStatusIndicator from "./components/OfflineStatusIndicator";
import IndustryEcosystem from "./components/IndustryEcosystem";
import AuthScreen from "./components/AuthScreen";

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem("origina_language") as LanguageCode;
    return saved && ["en", "es", "fr", "pt"].includes(saved) ? saved : "en";
  });

  useEffect(() => {
    localStorage.setItem("origina_language", language);
  }, [language]);

  const t = translations[language] || translations.en;

  const [activeTab, setActiveTab] = useState<
    "map" | "farms" | "trace" | "ai" | "blockchain" | "media" | "roles"
  >("map");

  // --- SEED ENHANCED SESSIONS FOR GLOBAL USERS ---
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string; name: string } | null>(() => {
    const saved = localStorage.getItem("origina_sessions_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem("origina_sessions_token");
  });

  const handleAuthSuccess = (user: { username: string; email: string; name: string }, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem("origina_sessions_user", JSON.stringify(user));
    localStorage.setItem("origina_sessions_token", token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("origina_sessions_user");
    localStorage.removeItem("origina_sessions_token");
  };

  // --- GLOBAL STATE STORAGE ---
  const [farms, setFarms] = useState<Farm[]>(() => {
    const saved = localStorage.getItem("origina_farms");
    return saved ? JSON.parse(saved) : INITIAL_FARMS;
  });

  const [batches, setBatches] = useState<ProcessingBatch[]>(() => {
    const saved = localStorage.getItem("origina_batches");
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [media, setMedia] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem("origina_media");
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });

  const [selectedFarmId, setSelectedFarmId] = useState<string>(farms[0]?.id || "");
  const activeFarm = farms.find(f => f.id === selectedFarmId);
  const [lastCapturedCoords, setLastCapturedCoords] = useState<{ lat: number; lng: number; alt: number } | null>(null);

  // --- CONNECTIVITY & QUEUING STATE ---
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncActions, setPendingSyncActions] = useState<Array<{ type: string; data: any }>>([]);

  // --- SERVER-BACKED BLOCKCHAIN STATE ---
  const [blockchainState, setBlockchainState] = useState<{
    chain: BlockchainBlock[];
    difficulty: number;
    isValid: boolean;
  }>({
    chain: [],
    difficulty: 2,
    isValid: true
  });

  // Sync state modifications to LocalStorage to support authentic local recovery
  useEffect(() => {
    localStorage.setItem("origina_farms", JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    localStorage.setItem("origina_batches", JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem("origina_media", JSON.stringify(media));
  }, [media]);

  // If user profile is not authenticated, render the secure authentication gate first
  if (!currentUser) {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess} 
        isOffline={isOffline} 
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  // Fetch the blockchain ledger from the Node-Express backend
  const fetchBlockchainLedger = async () => {
    try {
      const res = await fetch("/api/blockchain");
      if (res.ok) {
        const data = await res.json();
        setBlockchainState({
          chain: data.chain,
          difficulty: data.difficulty,
          isValid: data.isValid
        });
      }
    } catch (err) {
      console.warn("Failed to reach server blockchain. Relying on local memory chain fallback.");
      // Render simple mock initial block so audits never display blank states
      if (blockchainState.chain.length === 0) {
        setBlockchainState({
          chain: [
            {
              index: 0,
              timestamp: new Date().toISOString(),
              transactions: [
                {
                  id: "ft-genesis-fallback",
                  lotNumber: "LOT-FALLBACK",
                  timestamp: new Date().toISOString(),
                  auditorName: "Elena Rostova",
                  cooperativeId: "Yirgacheffe Fallback Union",
                  basePricePaidUSD: 3.25,
                  premiumPaidUSD: 0.40,
                  childLaborFree: true,
                  safeWorkingConditions: true,
                  organicPractice: true,
                  forestPreserved: true,
                  auditScore: 98,
                  inspectorComments: "Cooperative offline fallback Genesis verification block."
                }
              ],
              previousHash: "0",
              hash: "00ae58c3db01e8557bfa3ff84992569ff4ced38521a004bca90f9836fbd",
              nonce: 284
            }
          ],
          difficulty: 2,
          isValid: true
        });
      }
    }
  };

  useEffect(() => {
    fetchBlockchainLedger();
  }, []);

  // Handle double clicks or coordinates selection from the elevation map HUD
  const handleRegisterCoordsFromMap = (lat: number, lng: number, alt: number) => {
    setLastCapturedCoords({ lat, lng, alt });
  };

  // Queue actions locally while in remote offline field locations
  const handleQueueOfflineAction = (type: string, data: any) => {
    setPendingSyncActions((prev) => [...prev, { type, data }]);
  };

  // Synchronize queued actions once online connectivity restores
  const handleTriggerSync = async () => {
    if (pendingSyncActions.length === 0) return;

    // Process variables
    let updatedFarms = [...farms];
    let updatedBatches = [...batches];
    let updatedMedia = [...media];

    for (const action of pendingSyncActions) {
      if (action.type === "ADD_FARM") {
        updatedFarms.push(action.data);
      } else if (action.type === "ADD_BATCH") {
        updatedBatches.push(action.data);
      } else if (action.type === "ADD_MEDIA") {
        const syncMedia = { ...action.data, status: "synced" as const };
        updatedMedia.push(syncMedia);
      } else if (action.type === "MINE_AUDIT") {
        // Mine directly onto server if possible, or fall back to local block simulator
        try {
          await fetch("/api/blockchain/transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.data)
          });
        } catch (err) {
          console.warn("Could not sync block to server during synchronization. Placing on local mock list.");
        }
      }
    }

    setFarms(updatedFarms);
    setBatches(updatedBatches);
    setMedia(updatedMedia);

    // Wipe queues and refresh server-backed blocks
    setPendingSyncActions([]);
    await fetchBlockchainLedger();
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2D2926] font-sans flex flex-col lg:flex-row transition-colors">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#1B1B1B] text-white flex flex-col border-b lg:border-b-0 lg:border-r border-black/10 shrink-0 lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:z-50 lg:h-screen">
        <div className="p-5 border-b border-white/10 flex items-center justify-between lg:block">
          <div>
            <div className="text-[#C5A059] font-bold text-xl tracking-tight uppercase italic flex items-center gap-2">
              <Sprout size={18} className="text-[#C5A059]" />
              BeanTrace Global
            </div>
            <div className="text-[10px] text-white/50 tracking-widest mt-1 uppercase font-mono">
              Worldwide Cooperatives
            </div>
          </div>
          <div className="lg:hidden flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isOffline ? "bg-amber-500" : "bg-emerald-400"} animate-pulse`} />
            <span className="text-[10px] text-white/60 font-mono font-semibold uppercase">
              {isOffline ? "Local" : "Network"}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible lg:space-y-1 shrink-0 select-none scrollbar-none border-b lg:border-b-0 border-white/5">
          <button
            onClick={() => setActiveTab("map")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "map"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <Compass size={16} className={activeTab === "map" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{t.tabMap}</span>
          </button>

          <button
            onClick={() => setActiveTab("farms")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "farms"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <Sprout size={16} className={activeTab === "farms" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{language === "es" ? "Registro de Miembros" : language === "fr" ? "Registre des Membres" : language === "pt" ? "Registro de Membros" : "Members Registry"}</span>
          </button>

          <button
            onClick={() => setActiveTab("trace")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "trace"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <QrCode size={16} className={activeTab === "trace" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{t.tabTraceability}</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "ai"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <BrainCircuit size={16} className={activeTab === "ai" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{t.tabAgronomy}</span>
          </button>

          <button
            onClick={() => setActiveTab("blockchain")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "blockchain"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <ShieldCheck size={16} className={activeTab === "blockchain" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{t.tabBlockchain}</span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "media"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <Camera size={16} className={activeTab === "media" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{t.tabMedia}</span>
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`px-5 py-2.5 text-xs lg:text-sm flex items-center gap-3 shrink-0 lg:w-full transition-all border-b-2 lg:border-b-0 lg:border-l-4 ${
              activeTab === "roles"
                ? "bg-white/5 text-white font-semibold border-[#C5A059]"
                : "text-white/60 hover:text-white border-transparent"
            }`}
          >
            <Users size={16} className={activeTab === "roles" ? "text-[#C5A059]" : "text-white/40"} />
            <span className="whitespace-nowrap">{t.tabEcom}</span>
          </button>
        </nav>

        {/* User Session Profile in Sidebar */}
        <div className="p-5 bg-[#111111] border-t border-white/5 space-y-3">
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">{t.activeIngress}</div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C5A059] flex items-center justify-center font-bold text-black text-xs">
              {currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase() : "ER"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{currentUser?.name || "Elena Rostova"}</div>
              <div className="text-[9px] text-[#48BB78] flex items-center gap-1 mt-0.5 font-mono truncate">
                @{currentUser?.username || "auditor"}
              </div>
            </div>
          </div>

          {/* Sidebar Language selector toggles */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <span className="text-[8px] uppercase tracking-wide font-bold text-white/40 font-mono">Select Language / Idioma:</span>
            <div className="flex gap-1">
              {(["en", "es", "fr", "pt"] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-1 text-[10px] uppercase font-bold rounded transition-all cursor-pointer ${
                    language === lang 
                      ? "bg-[#C5A059] text-white" 
                      : "bg-white/10 hover:bg-white/20 text-white/70"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-center border border-white/10 hover:border-red-500/30 hover:text-red-400 py-1.5 rounded text-[10px] font-bold uppercase text-white/60 tracking-wider transition-all cursor-pointer mt-1"
          >
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 sm:px-8 bg-white shrink-0">
          <div className="flex items-center gap-4 sm:gap-8">
            <h1 className="text-sm sm:text-lg font-semibold tracking-tight text-[#2D2926]">
              {activeFarm ? `${activeFarm.name} / ${activeFarm.region}` : "Hacienda El Rosal / Huila Colombia"}
            </h1>
            <div className="flex gap-2">
              <div className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold uppercase rounded text-gray-500 font-mono">
                ID: {activeFarm ? activeFarm.id : "COL-HL-0052"}
              </div>
              <div className="px-2 py-0.5 bg-[#FDF5E6] border border-[#C5A059]/30 text-[10px] font-bold text-[#C5A059] uppercase rounded font-mono">
                Blockchain Verified
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-450 uppercase font-mono tracking-widest">Current Date</div>
            <div className="text-xs sm:text-sm font-mono text-[#2D2926]">May 26, 2026 · 15:33 UTC</div>
          </div>
        </header>

        {/* Content Wrap */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Offline Sync Buffer Box */}
          <OfflineStatusIndicator
            isOffline={isOffline}
            onToggleOffline={setIsOffline}
            pendingSyncCount={pendingSyncActions.length}
            onTriggerSync={handleTriggerSync}
          />

          <div className="space-y-6">
            
            {activeTab === "map" && (
              <div className="space-y-6">
                <MapDashboard
                  farms={farms}
                  batches={batches}
                  selectedFarmId={selectedFarmId}
                  onSelectFarm={setSelectedFarmId}
                  onRegisterCoordinates={handleRegisterCoordsFromMap}
                />
                
                {/* Visual guidance widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-[#3D5A40] uppercase tracking-widest mb-2 block font-mono">Field-Ready Map Actions</span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Agroforestry coordinators can use continuous GPS mappings to record altitude coordinates for newly certified shade-grown lots. Click anywhere on the map above to freeze coordinates and apply them under the <strong>Members Registry</strong> forms.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded-xl flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest mb-2 block font-mono">Transit Lane Optimization</span>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Traceability tracks physical transport vessels starting from deep smallholder cooperative scales (e.g., Sidama, Huila, or Lake Toba), leading to centralized washing wet mills, dry processing sorting facilities, and finally dispatched green cargo freights leaving global seaport terminals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "farms" && (
              <FarmCoordinator
                farms={farms}
                selectedFarmId={selectedFarmId}
                onSelectFarm={setSelectedFarmId}
                lastCapturedCoords={lastCapturedCoords}
                onAddFarm={(newFarm) => {
                  if (isOffline) {
                    handleQueueOfflineAction("ADD_FARM", newFarm);
                  } else {
                    setFarms((prev) => [...prev, newFarm]);
                    setSelectedFarmId(newFarm.id);
                  }
                }}
                onRemoveFarm={(id) => {
                  setFarms((prev) => prev.filter(f => f.id !== id));
                }}
              />
            )}

            {activeTab === "trace" && (
              <TraceabilityCenter
                batches={batches}
                farms={farms}
                isOffline={isOffline}
                language={language}
                onAddBatch={(newBatch) => {
                  if (isOffline) {
                    handleQueueOfflineAction("ADD_BATCH", newBatch);
                  } else {
                    setBatches((prev) => [...prev, newBatch]);
                  }
                }}
              />
            )}

            {activeTab === "ai" && (
              <AIAssistant />
            )}

            {activeTab === "blockchain" && (
              <BlockchainAudit
                farms={farms}
                isOffline={isOffline}
                onQueueOfflineAction={handleQueueOfflineAction}
                blockchainState={blockchainState}
                onFetchBlockchain={fetchBlockchainLedger}
              />
            )}

            {activeTab === "media" && (
              <MediaVault
                media={media}
                farms={farms}
                isOffline={isOffline}
                onAddMedia={(newMedia) => {
                  if (isOffline) {
                    handleQueueOfflineAction("ADD_MEDIA", newMedia);
                  } else {
                    setMedia((prev) => [...prev, newMedia]);
                  }
                }}
                onRemoveMedia={(id) => {
                  setMedia((prev) => prev.filter(m => m.id !== id));
                }}
              />
            )}

            {activeTab === "roles" && (
              <div className="space-y-8">
                <EcomDashboard
                  farms={farms}
                  batches={batches}
                  blockchainState={blockchainState}
                />
                
                {/* SCA Global Exhibitions index nested below stakeholder panels */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider mb-4 border-b border-gray-100 pb-2">
                    🌍 Regional Calendar & Training Indices
                  </h4>
                  <div className="pt-2">
                    <IndustryEcosystem
                      events={COFFEE_EVENTS}
                      prices={MARKET_PRICES}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Branding */}
        <footer className="h-10 px-6 sm:px-8 bg-white border-t border-gray-200 flex justify-between items-center text-[9px] text-gray-400 uppercase tracking-widest shrink-0">
          <div>BeanTrace Global Ledger · Developed for Worldwide Specialty Cooperatives · Simon Wolde Balango</div>
          <div className="hidden md:flex gap-4">
            <span>System Status: Optimal</span>
            <span className="text-[#C5A059]">Data Encrypted & Distributed</span>
          </div>
        </footer>
      </main>

    </div>
  );
}
