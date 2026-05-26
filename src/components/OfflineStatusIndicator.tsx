/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";

interface OfflineStatusProps {
  isOffline: boolean;
  onToggleOffline: (val: boolean) => void;
  pendingSyncCount: number;
  onTriggerSync: () => void;
}

export default function OfflineStatusIndicator({
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onTriggerSync
}: OfflineStatusProps) {
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  const handleSyncClick = () => {
    if (pendingSyncCount === 0 || syncing) return;
    setSyncing(true);
    setTimeout(() => {
      onTriggerSync();
      setSyncing(false);
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 3000);
    }, 1800);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isOffline ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-[#3D5A40]"}`}>
          {isOffline ? <WifiOff size={20} className="animate-pulse" /> : <Wifi size={20} />}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#2D2926] font-sans">
            Connectivity Status: {isOffline ? "Offline Mode (Remote Cooperative)" : "Online / Connected"}
          </h4>
          <p className="text-xs text-gray-500 font-mono">
            {isOffline 
              ? "All modifications queue securely in LocalStorage for automated synchronization." 
              : "Direct secure access to Blockchain ledger and live Gemini AI Agronomy models."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {pendingSyncCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono">
            <span>{pendingSyncCount} action{pendingSyncCount > 1 ? "s" : ""} pending sync</span>
          </div>
        )}

        <button
          onClick={() => onToggleOffline(!isOffline)}
          id="toggle-offline-btn"
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
            isOffline 
              ? "bg-gray-155 hover:bg-gray-200 text-gray-750 border-gray-300" 
              : "bg-[#FDF5E6] hover:bg-[#FAF0DD] text-[#C5A059] border-[#C5A059]/30"
          }`}
        >
          {isOffline ? "Go Online" : "Work Offline"}
        </button>

        {isOffline ? (
          <button
            disabled
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-400 border border-gray-150 cursor-not-allowed flex items-center gap-1.5"
          >
            <RefreshCw size={14} /> Sync Pending
          </button>
        ) : (
          <button
            onClick={handleSyncClick}
            disabled={pendingSyncCount === 0 || syncing}
            id="sync-data-btn"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all text-white ${
              pendingSyncCount > 0
                ? "bg-[#3D5A40] hover:bg-[#2F4632] shadow-sm animate-shimmer"
                : "bg-gray-50 text-gray-400 border border-gray-150 cursor-not-allowed"
            }`}
          >
            {syncing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Synchronizing...
              </>
            ) : justSynced ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                Synchronized!
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Sync Queued
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
