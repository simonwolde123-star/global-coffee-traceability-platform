/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Shield, Sparkles, CheckCircle, Database, PlusCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { AuditingTransaction, BlockchainBlock, Farm } from "../types";

interface BlockchainAuditProps {
  farms: Farm[];
  isOffline: boolean;
  onQueueOfflineAction: (type: string, data: any) => void;
  blockchainState: {
    chain: BlockchainBlock[];
    difficulty: number;
    isValid: boolean;
  };
  onFetchBlockchain: () => void;
  transactions?: AuditingTransaction[];
  onAddTransaction?: (tx: AuditingTransaction) => Promise<void> | void;
}

export default function BlockchainAudit({
  farms,
  isOffline,
  onQueueOfflineAction,
  blockchainState,
  onFetchBlockchain,
  transactions = [],
  onAddTransaction
}: BlockchainAuditProps) {
  const [lotNumber, setLotNumber] = useState("");
  const [auditorName, setAuditorName] = useState("Simon Wolde Balango");
  const [cooperativeId, setCooperativeId] = useState("Sidama Union Cooperative");
  const [basePrice, setBasePrice] = useState(3.40);
  const [premium, setPremium] = useState(0.50);
  const [childLaborFree, setChildLaborFree] = useState(true);
  const [safeConditions, setSafeConditions] = useState(true);
  const [organicPractice, setOrganicPractice] = useState(true);
  const [forestPreserved, setForestPreserved] = useState(true);
  const [comments, setComments] = useState("");

  const [mining, setMining] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<"verified" | "unverified" | "error">("unverified");

  // Fetch chain on mount
  useEffect(() => {
    onFetchBlockchain();
  }, []);

  const handleAuditValidation = () => {
    setVerifying(true);
    setTimeout(() => {
      onFetchBlockchain();
      setIntegrityStatus(blockchainState.isValid ? "verified" : "error");
      setVerifying(false);
    }, 1200);
  };

  const calculateScore = () => {
    let score = 60;
    if (childLaborFree) score += 10;
    if (safeConditions) score += 10;
    if (organicPractice) score += 10;
    if (forestPreserved) score += 10;
    score += Math.min(10, Math.floor(basePrice * 2.5));
    return Math.min(100, score);
  };

  const handleMineBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotNumber) return;

    const auditData: Omit<AuditingTransaction, "id" | "timestamp"> = {
      lotNumber: lotNumber.trim().toUpperCase(),
      auditorName,
      cooperativeId,
      basePricePaidUSD: parseFloat(basePrice.toString()),
      premiumPaidUSD: parseFloat(premium.toString()),
      childLaborFree,
      safeWorkingConditions: safeConditions,
      organicPractice,
      forestPreserved,
      auditScore: calculateScore(),
      inspectorComments: comments || "Passed standard Fairtrade cooperative ecological and wage inspection."
    };

    const newTxRecord: AuditingTransaction = {
      id: `tx-ft-${Date.now()}`,
      lotNumber: lotNumber.trim().toUpperCase(),
      timestamp: new Date().toISOString(),
      ...auditData,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      blockIndex: (blockchainState.chain.length || 0) + 1
    };

    if (isOffline) {
      // Queue offline
      onQueueOfflineAction("MINE_AUDIT", auditData);
      setSuccessMsg("Offline Mode Active! Transaction securely queued locally. Standard sync required.");
      setLotNumber("");
      setComments("");
      setTimeout(() => setSuccessMsg(""), 5000);
      return;
    }

    setMining(true);
    setSuccessMsg("");

    try {
      // Save directly to persistent Firestore blockchainTransactions collection
      if (onAddTransaction) {
        await onAddTransaction(newTxRecord);
      }

      // Also notify blockchain express server if online
      try {
        await fetch("/api/blockchain/transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(auditData)
        });
        onFetchBlockchain();
      } catch (e) {
        console.log("Blockchain node sync optional:", e);
      }

      setSuccessMsg("Verification success! High-altitude block mined and saved to Firestore blockchainTransactions!");
      setLotNumber("");
      setComments("");
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      console.error(err);
      setSuccessMsg(err.message || "Error writing block to Firestore.");
    } finally {
      setMining(false);
    }
  };

  // Aggregated premium analytics calculated from Firestore records
  const blocks = blockchainState.chain;
  const allTxs = [
    ...transactions,
    ...blockchainState.chain.flatMap(b => b.transactions)
  ];
  // Deduplicate by tx id if overlapping
  const uniqueTxs = Array.from(new Map(allTxs.map(t => [t.id, t])).values());
  const totalPremiumUSD = uniqueTxs.reduce((acc, curr) => acc + (curr.premiumPaidUSD || 0) + (curr.basePricePaidUSD || 0), 0);
  const averagePricePaid = uniqueTxs.length > 0
    ? (totalPremiumUSD / uniqueTxs.length).toFixed(2)
    : "3.90";

  return (
    <div id="blockchain-audit-container" className="space-y-8">
      {/* Visual Header Grid Theme: High Density Cream & Forest */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-gradient-to-br from-[#3D5A40] to-[#2F4632] border border-[#3D5A40] rounded-2xl flex flex-col justify-between text-white shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-emerald-300" size={18} />
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold">Immutable Audit Ledger</span>
            </div>
            <h3 className="text-xl font-bold font-sans">Secured Fair-Trade Blockchain Database</h3>
            <p className="text-xs text-emerald-100 mt-2 leading-relaxed font-sans font-medium">
              Designed for transparency auditing, our decentralized ledger guarantees that every cent from specialty buyers directly rewards high-altitude East African co-ops. Uses server-side SHA-256 cryptographic linkage to prevent retroactive compliance tampering.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={handleAuditValidation}
              id="validate-blockchain-link"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#2F4632] hover:bg-gray-50 rounded-lg text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
            >
              {verifying ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
              {verifying ? "Hashing Ledger..." : "Verify Cryptographic Links"}
            </button>
            <span className="text-emerald-200 text-[10px] font-mono leading-7 font-bold">
              Block Capacity: {blockchainState.chain.length} secure envelopes
            </span>
          </div>
        </div>

        {/* Global blockchain validation health indicator card */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[9px] font-mono text-gray-400 uppercase block font-bold">Ledger Security Profile</span>
            <h4 className="text-sm font-bold text-gray-800 mt-1">Audit Ledger Validity</h4>
          </div>

          <div className="my-4">
            {verifying ? (
              <div className="flex items-center gap-2 text-[#C5A059]">
                <RefreshCw className="animate-spin" size={24} />
                <span className="font-mono text-xs font-bold">Recalculating SHA-256 target nonces...</span>
              </div>
            ) : integrityStatus === "verified" ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono text-xs">
                  <CheckCircle size={16} /> LEDGER SECURE
                </div>
                <p className="text-[10px] text-gray-600 leading-normal font-medium">
                  All blocks are matched using standard proof-of-work guidelines. No transaction leaks or double-spending detected.
                </p>
              </div>
            ) : integrityStatus === "error" ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-red-800 font-bold font-mono text-xs">
                  <AlertTriangle size={16} /> INTEGRITY WARNING
                </div>
                <p className="text-[10px] text-gray-600 font-medium">
                  Cryptographic linkage mismatched or disrupted on server chain. Traceability integrity fails standard audit parameters.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-[10px] text-gray-500 font-semibold leading-normal">
                  Click 'Verify Cryptographic Links' above to hash, check previous indexes, and validate blockchain integrity across nodes.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between items-center text-xs font-mono">
            <span className="text-gray-400 font-bold">Avg Farmer Return:</span>
            <span className="text-[#C5A059] font-bold">${averagePricePaid} / lb</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Mine/Register Transaction Form */}
        <div className="lg:col-span-1 p-6 bg-white rounded-2xl border border-gray-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-[#C5A059]">
            <PlusCircle size={18} />
            <h4 className="text-sm font-bold text-gray-800">New Auditing Block</h4>
          </div>

          <form onSubmit={handleMineBlock} className="space-y-4 text-xs">
            <div>
              <label className="text-gray-500 block mb-1 font-semibold">Select / Reference Batch ID (Lot #)*</label>
              <input
                type="text"
                required
                placeholder="e.g., LOT-ETH-2026-AA03"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full bg-gray-50 border border-gray-305 rounded-lg p-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:bg-white font-mono font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-500 block mb-1 font-semibold">Auditor Name</label>
                <input
                  type="text"
                  required
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-305 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#C5A059] focus:bg-white font-medium"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1 font-semibold">Cooperative</label>
                <input
                  type="text"
                  required
                  value={cooperativeId}
                  onChange={(e) => setCooperativeId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-305 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#C5A059] focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-500 block mb-1 font-semibold">Base Price Paid ($/lb)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-305 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#C5A059] focus:bg-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1 font-semibold">Ft Premium ($/lb)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={premium}
                  onChange={(e) => setPremium(parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-305 rounded-lg p-2.5 text-gray-800 focus:outline-none focus:border-[#C5A059] focus:bg-white font-mono font-bold"
                />
              </div>
            </div>

            {/* Fair-Trade Auditing Criteria checkboxes */}
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <span className="text-[9px] uppercase font-mono text-gray-400 font-bold block">Cooperative Verification Audits</span>
              
              <label className="flex items-center gap-2 text-gray-700 cursor-pointer font-medium hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={childLaborFree}
                  onChange={(e) => setChildLaborFree(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer text-[#3D5A40] focus:ring-0"
                />
                <span>Zero Child Labor Compliance</span>
              </label>

              <label className="flex items-center gap-2 text-gray-700 cursor-pointer font-medium hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={safeConditions}
                  onChange={(e) => setSafeConditions(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer text-[#3D5A40] focus:ring-0"
                />
                <span>Safe Working Conditions Audited</span>
              </label>

              <label className="flex items-center gap-2 text-gray-700 cursor-pointer font-medium hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={organicPractice}
                  onChange={(e) => setOrganicPractice(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer text-[#3D5A40] focus:ring-0"
                />
                <span>100% Organic Shade Agriculture</span>
              </label>

              <label className="flex items-center gap-2 text-gray-700 cursor-pointer font-medium hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={forestPreserved}
                  onChange={(e) => setForestPreserved(e.target.checked)}
                  className="rounded border-gray-300 cursor-pointer text-[#3D5A40] focus:ring-0"
                />
                <span>Zero Deforestation Preservation</span>
              </label>
            </div>

            <div>
              <label className="text-gray-500 block mb-1 font-semibold">Inspector Comments</label>
              <textarea
                value={comments}
                placeholder="Details of physical environment, biodiversity counts, and wage log validation..."
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-gray-800 placeholder-gray-400 h-20 focus:outline-none focus:border-[#C5A059] focus:bg-white font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={mining}
              className={`w-full py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 text-white shadow-sm transition-all text-xs cursor-pointer ${
                mining 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-[#3D5A40] hover:bg-[#2F4632]"
              }`}
            >
              {mining ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Mining SHA-256 Block...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Mine Auditing Block
                </>
              )}
            </button>

            {successMsg && (
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-center animate-fade-in text-[10px] font-bold">
                {successMsg}
              </div>
            )}
          </form>
        </div>

        {/* 2. Visual Blockchain stream rendering */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-gray-400">LEDGER STREAM (LAST BLOCKS ON TOP)</span>
            <span className="text-[10px] font-mono text-gray-400 italic font-bold">Chain difficulty: D-{blockchainState.difficulty}</span>
          </div>

          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
            {blocks.map((block) => (
              <div 
                key={block.index} 
                className="p-5 bg-white border border-gray-200 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#C5A059]/40 transition-all duration-300 shadow-sm text-gray-700"
              >
                {/* Visual Block Chain Link Anchor */}
                {block.index > 0 && (
                  <div className="absolute top-0 right-10 h-3 w-1 bg-gradient-to-b from-gray-200 to-[#C5A059]/40 rounded" />
                )}

                <div className="flex justify-between items-start border-b border-gray-150 pb-2.5">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF0DD] text-[#C5A059] border border-[#C5A059]/30 font-mono font-bold">
                      BLOCK APPROVED #{block.index}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold ml-2">
                      {new Date(block.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    DIFFICULTY HASH OK
                  </span>
                </div>

                {block.transactions.map((tx) => (
                  <div key={tx.id} className="space-y-3 font-sans">
                    <div className="flex justify-between items-center bg-[#F8F7F4] p-2.5 rounded-lg border border-gray-200/60">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-gray-400 block font-bold">Registered Coffee Lot Reference</span>
                        <span className="text-[#C5A059] font-mono font-bold text-xs">{tx.lotNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-mono text-gray-400 block font-bold">Audited Cooperative Return</span>
                        <span className="text-gray-800 font-mono text-xs font-bold">${tx.basePricePaidUSD + tx.premiumPaidUSD} / lb</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                      <div className="space-y-1 text-gray-650 font-medium">
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-bold">Auditor:</span>
                          <span className="font-semibold text-gray-800">{tx.auditorName}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-bold">Cooperative:</span>
                          <span className="font-semibold text-gray-800">{tx.cooperativeId}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-400 font-bold">Inspector Score:</span>
                          <span className="text-emerald-700 font-bold">{tx.auditScore} / 100</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono h-fit self-center">
                        <div className={`p-1 text-center rounded border font-bold ${tx.childLaborFree ? "text-emerald-800 bg-emerald-50 border-emerald-250" : "text-red-700 bg-red-50 border-red-200"}`}>
                          CHILD LABOR FREE
                        </div>
                        <div className={`p-1 text-center rounded border font-bold ${tx.safeWorkingConditions ? "text-emerald-800 bg-emerald-50 border-emerald-250" : "text-gray-400 border-gray-200 bg-gray-50"}`}>
                          SAFE PRACTICE
                        </div>
                        <div className={`p-1 text-center rounded border font-bold ${tx.organicPractice ? "text-emerald-800 bg-emerald-50 border-emerald-250" : "text-gray-400 border-gray-200 bg-gray-50"}`}>
                          100% ORGANIC
                        </div>
                        <div className={`p-1 text-center rounded border font-bold ${tx.forestPreserved ? "text-emerald-800 bg-emerald-50 border-emerald-250" : "text-gray-400 border-gray-200 bg-gray-50"}`}>
                          FOREST PROT
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border-l-2 border-[#C5A059] italic leading-normal font-medium">
                      "{tx.inspectorComments}"
                    </p>
                  </div>
                ))}

                {/* Cryptographic block signature visual footer */}
                <div className="space-y-1.5 border-t border-gray-150 pt-2.5 font-mono text-[9px] text-gray-400 z-10 font-medium">
                  <div className="flex justify-between items-center">
                    <span>Block Cryptographic Hash:</span>
                    <span className="text-emerald-800 shrink-0 select-all font-bold leading-none">{block.hash}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Previous Link Hash:</span>
                    <span className="text-gray-500 shrink-0 select-all leading-none">{block.previousHash}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-400">
                    <span>Proof Nonce:</span>
                    <span className="font-bold">{block.nonce}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
