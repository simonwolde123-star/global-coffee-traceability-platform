/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EudrPlotCompliance {
  isPolygonRequired: boolean; // Mandated for >= 4.0 hectares
  deforestationFreeBaseline: "Verified (Post-Dec 31, 2020)";
  riskClassification: "Negligible" | "Low" | "Standard" | "High";
  canopyDensityPercent: number; // e.g. 78.5%
  satelliteBaselineDate: string; // "2020-12-31"
  lastAuditDate: string; // e.g. "2026-04-15"
  nationalLandRegistryId?: string; // e.g. "ETH-SID-LND-9921"
  ddsReferenceNumber?: string; // EU Due Diligence Statement internal reference e.g. "EUDR-2026-DDS-ETH-8941"
  complianceStatus: "Compliant" | "Exempt (<4ha Point Geolocation)" | "Audit Pending" | "Non-Compliant";
}

export interface Farm {
  id: string;
  name: string;
  farmerName: string;
  cooperative: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  altitude: number; // m.a.s.l.
  sizeHectares: number;
  capacityBags: number; // 60kg bags
  soilType: string;
  climateZone: string;
  harvestStart: string; // e.g. "October"
  harvestEnd: string; // e.g. "December"
  certifications: string[]; // e.g. ["Organic", "Fairtrade", "Rainforest Alliance"]
  polygon?: Array<[number, number]>; // Array of [longitude, latitude] GeoJSON coordinate pairs
  eudrCompliance?: EudrPlotCompliance;
}

export type ProcessingMethod = "Washed" | "Natural" | "Honey" | "Experimental";

export type ProcessingStage = "Harvested" | "Processing" | "Drying" | "Dry Mill" | "Warehouse" | "Exported";

export interface ProcessingBatch {
  id?: string;
  lotNumber: string;
  farmId: string;
  washingStation: string;
  method: ProcessingMethod;
  variety: string;
  fermentationHours: number;
  dryingMethod: string;
  moistureContent: number; // percentage
  grade: "Grade AA" | "Grade AB" | "Grade PB" | "Grade C" | "Specialty Grade";
  cuppingScore: number; // e.g. 84.5
  status: ProcessingStage;
  harvestDate: string;
  dryMillDate?: string;
  exportDate?: string;
  buyerName?: string;
  weightKg: number;
}

export interface AuditingTransaction {
  id: string;
  lotNumber: string;
  batchId?: string;
  timestamp: string;
  auditorName: string;
  cooperativeId: string;
  basePricePaidUSD: number; // Price per lb paid to farmer
  premiumPaidUSD: number; // Fairtrade or quality premium
  childLaborFree: boolean;
  safeWorkingConditions: boolean;
  organicPractice: boolean;
  forestPreserved: boolean;
  auditScore: number; // 0 - 100
  inspectorComments: string;
  txHash?: string;
  blockIndex?: number;
  userId?: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  transactions: AuditingTransaction[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export interface CoffeeEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: "Expo" | "Competition" | "Conference" | "Training";
  description: string;
  organizer: string;
}

export interface MarketPrice {
  id: string;
  name: string;
  type: "NYC-C-Market" | "Fairtrade-Minimum" | "Organic-Premium" | "Specialty-Average";
  priceUSD: number; // per pound / bag
  unit: "per lb" | "per 60kg bag";
  changePercent: number;
  lastUpdated: string;
}

export interface MediaItem {
  id: string;
  farmId: string;
  title: string;
  mimeType: "image/jpeg" | "image/png" | "video/mp4";
  url: string; // fallback base64 or URL
  createdAt: string;
  caption: string;
  status: "synced" | "pending";
}

export type UserRole = 
  | "Farmer" 
  | "CooperativeManager" 
  | "Exporter" 
  | "Buyer" 
  | "Roaster" 
  | "QualityInspector" 
  | "Administrator";
