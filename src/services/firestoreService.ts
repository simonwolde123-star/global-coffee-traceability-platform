/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  serverTimestamp
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { Farm, ProcessingBatch, AuditingTransaction, BlockchainBlock } from "../types";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  role: string;
  cooperative?: string;
  createdAt: string;
}

export interface SupplyChainEventRecord {
  id: string;
  lotNumber: string;
  batchId?: string;
  title: string;
  stage: string;
  location: string;
  timestamp: string;
  details: string;
  operator: string;
  userId: string;
}

export interface FarmerRecord {
  id: string;
  name: string;
  cooperative: string;
  region: string;
  country: string;
  farmId?: string;
  phone?: string;
  userId: string;
  createdAt: string;
}

export interface CertificationRecord {
  id: string;
  name: string;
  authority: string;
  description: string;
  tagline: string;
  colorClass: string;
  icon: string;
  certNumber?: string;
  farmId?: string;
  status: string;
  userId: string;
}

// -------------------------------------------------------------
// USER PROFILES
// -------------------------------------------------------------
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, "users", user.uid), {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// FARMS
// -------------------------------------------------------------
export function subscribeFarms(
  onSuccess: (farms: Farm[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = "farms";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const farms: Farm[] = [];
      snapshot.forEach((doc) => {
        farms.push({ id: doc.id, ...doc.data() } as Farm);
      });
      onSuccess(farms);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function createFarm(farm: Farm): Promise<void> {
  const farmId = farm.id || `farm-${Date.now()}`;
  const path = `farms/${farmId}`;
  try {
    const userId = auth.currentUser?.uid || "system";
    await setDoc(doc(db, "farms", farmId), {
      ...farm,
      id: farmId,
      userId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateFarm(farmId: string, updates: Partial<Farm>): Promise<void> {
  const path = `farms/${farmId}`;
  try {
    await updateDoc(doc(db, "farms", farmId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFarm(farmId: string): Promise<void> {
  const path = `farms/${farmId}`;
  try {
    await deleteDoc(doc(db, "farms", farmId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// COFFEE BATCHES
// -------------------------------------------------------------
export function subscribeCoffeeBatches(
  onSuccess: (batches: ProcessingBatch[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = "coffeeBatches";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const batches: ProcessingBatch[] = [];
      snapshot.forEach((doc) => {
        batches.push(doc.data() as ProcessingBatch);
      });
      onSuccess(batches);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function getCoffeeBatchByLot(lotNumber: string): Promise<ProcessingBatch | null> {
  const path = `coffeeBatches/${lotNumber}`;
  try {
    // First try direct document key by lotNumber
    const directDoc = await getDoc(doc(db, "coffeeBatches", lotNumber));
    if (directDoc.exists()) {
      return directDoc.data() as ProcessingBatch;
    }
    // Fallback: Query by field lotNumber
    const q = query(collection(db, "coffeeBatches"), where("lotNumber", "==", lotNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as ProcessingBatch;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function createCoffeeBatch(batch: ProcessingBatch): Promise<void> {
  const docId = batch.lotNumber;
  const path = `coffeeBatches/${docId}`;
  try {
    const userId = auth.currentUser?.uid || "system";
    const newBatchData = {
      ...batch,
      id: docId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "coffeeBatches", docId), newBatchData);

    // Automatically record initial Supply Chain Milestone Event in Firestore
    await createSupplyChainEvent({
      id: `evt-${batch.lotNumber}-harvest`,
      lotNumber: batch.lotNumber,
      batchId: docId,
      title: "Crop Harvested",
      stage: "Harvested",
      location: batch.washingStation || "Origin Station",
      timestamp: batch.harvestDate || new Date().toISOString(),
      details: `Batch initial harvest registered: ${batch.variety} via ${batch.method} method. Estimated weight: ${batch.weightKg} kg.`,
      operator: auth.currentUser?.displayName || "Field Coordinator",
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateCoffeeBatch(
  lotNumber: string,
  updates: Partial<ProcessingBatch>
): Promise<void> {
  const path = `coffeeBatches/${lotNumber}`;
  try {
    await updateDoc(doc(db, "coffeeBatches", lotNumber), {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // If status changed, record a new supply chain milestone in Firestore
    if (updates.status) {
      const userId = auth.currentUser?.uid || "system";
      await createSupplyChainEvent({
        id: `evt-${lotNumber}-${updates.status.toLowerCase().replace(/\s+/g, "_")}-${Date.now()}`,
        lotNumber,
        batchId: lotNumber,
        title: `Status Transition: ${updates.status}`,
        stage: updates.status,
        location: updates.washingStation || "Cooperative Facility",
        timestamp: new Date().toISOString(),
        details: `Batch status advanced to ${updates.status}. Cupping score: ${updates.cuppingScore ?? "Unchanged"}.`,
        operator: auth.currentUser?.displayName || "Auditor / Quality Team",
        userId
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteCoffeeBatch(lotNumber: string): Promise<void> {
  const path = `coffeeBatches/${lotNumber}`;
  try {
    await deleteDoc(doc(db, "coffeeBatches", lotNumber));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// SUPPLY CHAIN EVENTS
// -------------------------------------------------------------
export function subscribeSupplyChainEvents(
  onSuccess: (events: SupplyChainEventRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = "supplyChainEvents";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const events: SupplyChainEventRecord[] = [];
      snapshot.forEach((doc) => {
        events.push(doc.data() as SupplyChainEventRecord);
      });
      // Sort in chronological order
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      onSuccess(events);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function createSupplyChainEvent(event: SupplyChainEventRecord): Promise<void> {
  const eventId = event.id || `evt-${Date.now()}`;
  const path = `supplyChainEvents/${eventId}`;
  try {
    const userId = auth.currentUser?.uid || "system";
    await setDoc(doc(db, "supplyChainEvents", eventId), {
      ...event,
      id: eventId,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// -------------------------------------------------------------
// BLOCKCHAIN TRANSACTIONS
// -------------------------------------------------------------
export function subscribeBlockchainTransactions(
  onSuccess: (txs: AuditingTransaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = "blockchainTransactions";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const txs: AuditingTransaction[] = [];
      snapshot.forEach((doc) => {
        txs.push(doc.data() as AuditingTransaction);
      });
      txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onSuccess(txs);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function createBlockchainTransaction(tx: AuditingTransaction): Promise<void> {
  const txId = tx.id || `tx-${Date.now()}`;
  const path = `blockchainTransactions/${txId}`;
  try {
    const userId = auth.currentUser?.uid || "system";
    await setDoc(doc(db, "blockchainTransactions", txId), {
      ...tx,
      id: txId,
      userId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// -------------------------------------------------------------
// FARMERS
// -------------------------------------------------------------
export function subscribeFarmers(
  onSuccess: (farmers: FarmerRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = "farmers";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const farmers: FarmerRecord[] = [];
      snapshot.forEach((doc) => {
        farmers.push(doc.data() as FarmerRecord);
      });
      onSuccess(farmers);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function createFarmer(farmer: FarmerRecord): Promise<void> {
  const farmerId = farmer.id || `farmer-${Date.now()}`;
  const path = `farmers/${farmerId}`;
  try {
    const userId = auth.currentUser?.uid || "system";
    await setDoc(doc(db, "farmers", farmerId), {
      ...farmer,
      id: farmerId,
      userId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// -------------------------------------------------------------
// CERTIFICATIONS
// -------------------------------------------------------------
export function subscribeCertifications(
  onSuccess: (certs: CertificationRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = "certifications";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const certs: CertificationRecord[] = [];
      snapshot.forEach((doc) => {
        certs.push(doc.data() as CertificationRecord);
      });
      onSuccess(certs);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function createCertification(cert: CertificationRecord): Promise<void> {
  const certId = cert.id || `cert-${Date.now()}`;
  const path = `certifications/${certId}`;
  try {
    const userId = auth.currentUser?.uid || "system";
    await setDoc(doc(db, "certifications", certId), {
      ...cert,
      id: certId,
      userId
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteSupplyChainEvent(eventId: string): Promise<void> {
  const path = `supplyChainEvents/${eventId}`;
  try {
    await deleteDoc(doc(db, "supplyChainEvents", eventId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function deleteBlockchainTransaction(txId: string): Promise<void> {
  const path = `blockchainTransactions/${txId}`;
  try {
    await deleteDoc(doc(db, "blockchainTransactions", txId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// -------------------------------------------------------------
// SEED INITIAL REAL FIRESTORE DATA HELPER
// Populates all 7 Firestore collections with real records if empty
// -------------------------------------------------------------
export async function seedInitialFirestoreData(): Promise<void> {
  const userId = auth.currentUser?.uid || "admin-system";

  // 1. Initial Real Farms
  const seedFarms: Farm[] = [
    {
      id: "farm-sidama",
      name: "Misty Mountain Estate",
      farmerName: "Simon Wolde Balango",
      cooperative: "Sidama Union Cooperative",
      region: "Sidama (Yirgalem District)",
      country: "Ethiopia",
      latitude: 6.7842,
      longitude: 38.3975,
      altitude: 1980,
      sizeHectares: 4.8,
      capacityBags: 110,
      soilType: "Acid Clay / Volcanic Nitisols",
      climateZone: "Tropical Wet-and-Dry (Highland)",
      harvestStart: "October",
      harvestEnd: "December",
      certifications: ["Organic", "Fairtrade", "UTZ Certified"],
      polygon: [
        [38.395120, 6.782840],
        [38.396240, 6.786150],
        [38.399450, 6.785890],
        [38.400210, 6.783450],
        [38.398100, 6.781980],
        [38.395120, 6.782840]
      ],
      eudrCompliance: {
        isPolygonRequired: true,
        deforestationFreeBaseline: "Verified (Post-Dec 31, 2020)",
        riskClassification: "Negligible",
        canopyDensityPercent: 82.4,
        satelliteBaselineDate: "2020-12-31",
        lastAuditDate: "2026-04-15",
        nationalLandRegistryId: "CAD-ET-SID-0992",
        ddsReferenceNumber: "EUDR-2026-DDS-ET-SIDAMA-01",
        complianceStatus: "Compliant"
      }
    },
    {
      id: "farm-huila",
      name: "Hacienda El Rosal",
      farmerName: "Carlos Delgado",
      cooperative: "Coocentral Huila Cooperative",
      region: "Huila (Pitalito District)",
      country: "Colombia",
      latitude: 1.8492,
      longitude: -76.0461,
      altitude: 1720,
      sizeHectares: 5.2,
      capacityBags: 125,
      soilType: "Volcanic Ash / Rich Humus",
      climateZone: "Andean Highland",
      harvestStart: "April",
      harvestEnd: "June",
      certifications: ["Organic", "Fairtrade", "Rainforest Alliance"],
      polygon: [
        [-76.048250, 1.847520],
        [-76.047120, 1.851210],
        [-76.044150, 1.850850],
        [-76.043920, 1.848120],
        [-76.046100, 1.846900],
        [-76.048250, 1.847520]
      ],
      eudrCompliance: {
        isPolygonRequired: true,
        deforestationFreeBaseline: "Verified (Post-Dec 31, 2020)",
        riskClassification: "Negligible",
        canopyDensityPercent: 79.1,
        satelliteBaselineDate: "2020-12-31",
        lastAuditDate: "2026-04-12",
        nationalLandRegistryId: "CAD-CO-HUI-4122",
        ddsReferenceNumber: "EUDR-2026-DDS-CO-HUILA-04",
        complianceStatus: "Compliant"
      }
    },
    {
      id: "farm-yirg-g1",
      name: "Aged Shaded Forest Farm",
      farmerName: "Astera Kassa",
      cooperative: "Yirgacheffe Coffee Farmers Cooperative Union",
      region: "Gedeo Zone (Kochere)",
      country: "Ethiopia",
      latitude: 5.9221,
      longitude: 38.2312,
      altitude: 2150,
      sizeHectares: 3.2,
      capacityBags: 75,
      soilType: "Deep Red Volcanic Clay",
      climateZone: "Subtropical Highland",
      harvestStart: "November",
      harvestEnd: "January",
      certifications: ["Organic", "Fairtrade", "Rainforest Alliance"],
      polygon: [
        [38.229500, 5.920800],
        [38.230450, 5.923400],
        [38.232850, 5.923100],
        [38.233200, 5.921200],
        [38.231100, 5.920100],
        [38.229500, 5.920800]
      ],
      eudrCompliance: {
        isPolygonRequired: false,
        deforestationFreeBaseline: "Verified (Post-Dec 31, 2020)",
        riskClassification: "Negligible",
        canopyDensityPercent: 88.0,
        satelliteBaselineDate: "2020-12-31",
        lastAuditDate: "2026-04-10",
        nationalLandRegistryId: "CAD-ET-YIRG-7711",
        ddsReferenceNumber: "EUDR-2026-DDS-ET-GEDEO-07",
        complianceStatus: "Compliant"
      }
    }
  ];

  for (const farm of seedFarms) {
    await createFarm(farm);
  }

  // 2. Initial Real Farmers
  const seedFarmers: FarmerRecord[] = [
    {
      id: "farmer-simon",
      name: "Simon Wolde Balango",
      cooperative: "Sidama Union Cooperative",
      region: "Sidama (Yirgalem District)",
      country: "Ethiopia",
      farmId: "farm-sidama",
      phone: "+251 91 123 4567",
      userId,
      createdAt: new Date().toISOString()
    },
    {
      id: "farmer-carlos",
      name: "Carlos Delgado",
      cooperative: "Coocentral Huila Cooperative",
      region: "Huila (Pitalito District)",
      country: "Colombia",
      farmId: "farm-huila",
      phone: "+57 312 456 7890",
      userId,
      createdAt: new Date().toISOString()
    },
    {
      id: "farmer-astera",
      name: "Astera Kassa",
      cooperative: "Yirgacheffe Coffee Farmers Cooperative Union",
      region: "Gedeo Zone (Kochere)",
      country: "Ethiopia",
      farmId: "farm-yirg-g1",
      phone: "+251 92 987 6543",
      userId,
      createdAt: new Date().toISOString()
    }
  ];

  for (const farmer of seedFarmers) {
    await createFarmer(farmer);
  }

  // 3. Initial Real Coffee Batches
  const seedBatches: ProcessingBatch[] = [
    {
      lotNumber: "LOT-ETH-2026-AA03",
      farmId: "farm-sidama",
      washingStation: "Aleta Wondo Washing Station",
      method: "Washed",
      variety: "Sidama Landraces (Heirloom)",
      fermentationHours: 36,
      dryingMethod: "African Raised Beds",
      moistureContent: 10.8,
      grade: "Grade AA",
      cuppingScore: 88.5,
      status: "Warehouse",
      harvestDate: "2026-05-10",
      weightKg: 1200
    },
    {
      lotNumber: "LOT-COL-2026-GS04",
      farmId: "farm-huila",
      washingStation: "San Agustin Micro-mill",
      method: "Honey",
      variety: "Pink Bourbon & Geisha",
      fermentationHours: 48,
      dryingMethod: "Parabolic Solar Dryer",
      moistureContent: 11.0,
      grade: "Specialty Grade",
      cuppingScore: 91.2,
      status: "Warehouse",
      harvestDate: "2026-05-14",
      weightKg: 1500
    },
    {
      lotNumber: "LOT-ETH-2026-NT07",
      farmId: "farm-yirg-g1",
      washingStation: "Kochere Dry Mill",
      method: "Natural",
      variety: "Yirgacheffe Heirloom (Moka family)",
      fermentationHours: 0,
      dryingMethod: "Sun-dried Bamboo Mats",
      moistureContent: 11.2,
      grade: "Specialty Grade",
      cuppingScore: 89.7,
      status: "Exported",
      harvestDate: "2026-04-22",
      dryMillDate: "2026-05-01",
      exportDate: "2026-05-18",
      buyerName: "Royal Coffee Importers Inc.",
      weightKg: 2400
    }
  ];

  for (const batch of seedBatches) {
    await createCoffeeBatch(batch);
  }

  // 4. Initial Real Supply Chain Events
  const seedEvents: SupplyChainEventRecord[] = [
    {
      id: "evt-init-01",
      lotNumber: "LOT-ETH-2026-AA03",
      batchId: "LOT-ETH-2026-AA03",
      title: "Crop Harvested",
      stage: "Harvested",
      location: "Aleta Wondo Farm, Sidama",
      timestamp: "2026-05-10T08:00:00.000Z",
      details: "Selective handpicking of ripe purple-red cherries at 1980m elevation. Average Brix: 21.5%.",
      operator: "Simon Wolde Balango",
      userId
    },
    {
      id: "evt-init-02",
      lotNumber: "LOT-ETH-2026-AA03",
      batchId: "LOT-ETH-2026-AA03",
      title: "Wet Mill Fermentation Complete",
      stage: "Washing",
      location: "Aleta Wondo Washing Station",
      timestamp: "2026-05-12T14:30:00.000Z",
      details: "Pulping completed with fresh mountain spring water. 36-hour aerobic fermentation. pH 4.4.",
      operator: "Wet Mill Quality Team",
      userId
    },
    {
      id: "evt-init-03",
      lotNumber: "LOT-ETH-2026-AA03",
      batchId: "LOT-ETH-2026-AA03",
      title: "Moisture Curing Target Met",
      stage: "Drying",
      location: "African Raised Beds, Sidama",
      timestamp: "2026-05-22T17:00:00.000Z",
      details: "Slow shade-cloth dried across 12 days. Stable 10.8% moisture content achieved.",
      operator: "Field Coordinator",
      userId
    },
    {
      id: "evt-init-04",
      lotNumber: "LOT-ETH-2026-AA03",
      batchId: "LOT-ETH-2026-AA03",
      title: "Cupping & Warehouse Acceptance",
      stage: "Warehouse",
      location: "Addis Ababa Central Storage",
      timestamp: "2026-05-25T11:00:00.000Z",
      details: "Official SCA grading: 88.5 points. Notes: Jasmine blossom, bergamot, candied peach. Sealed in GrainPro bags.",
      operator: "Certified SCA Q-Grader",
      userId
    }
  ];

  for (const evt of seedEvents) {
    await createSupplyChainEvent(evt);
  }

  // 5. Initial Blockchain Transaction in Firestore
  await createBlockchainTransaction({
    id: "tx-ft-init-001",
    lotNumber: "LOT-ETH-2026-AA03",
    timestamp: "2026-05-25T15:30:00.000Z",
    auditorName: "Simon Wolde Balango",
    cooperativeId: "Sidama Union Cooperative",
    basePricePaidUSD: 3.40,
    premiumPaidUSD: 0.50,
    childLaborFree: true,
    safeWorkingConditions: true,
    organicPractice: true,
    forestPreserved: true,
    auditScore: 98,
    inspectorComments: "Comprehensive Fairtrade and Organic compliance verified for Aleta Wondo smallholders."
  });

  // 6. Initial Certifications
  const seedCerts: CertificationRecord[] = [
    {
      id: "cert-organic",
      name: "Organic",
      authority: "USDA & EU Organic",
      description: "Cultivated without synthetic chemical pesticides using native bio-compost.",
      tagline: "Eco-Chemical Free",
      colorClass: "border-emerald-300 bg-emerald-50/80 text-emerald-900",
      icon: "Sprout",
      certNumber: "ORG-INT-2026-904",
      status: "Active",
      userId
    },
    {
      id: "cert-fairtrade",
      name: "Fairtrade",
      authority: "Fairtrade International (FLO-CERT)",
      description: "Guaranteed price floors plus direct social development community premiums.",
      tagline: "Social Equity Guaranteed",
      colorClass: "border-blue-300 bg-blue-50/80 text-blue-900",
      icon: "Globe",
      certNumber: "FLO-ID: 41829",
      status: "Active",
      userId
    },
    {
      id: "cert-rainforest",
      name: "Rainforest Alliance",
      authority: "Rainforest Alliance Certified",
      description: "Under-canopy shade agroforestry conserving wildlife & watershed hydrology.",
      tagline: "Biodiversity Restoring",
      colorClass: "border-teal-300 bg-teal-50/80 text-teal-900",
      icon: "ShieldCheck",
      certNumber: "RAC-2026-CANOPY",
      status: "Active",
      userId
    }
  ];

  for (const cert of seedCerts) {
    await createCertification(cert);
  }
}

/**
 * Checks if the Firestore database is empty on initial boot.
 * If no batches or farms exist, seeds initial real records.
 */
export async function ensureInitialData(): Promise<void> {
  const path = "coffeeBatches";
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      console.log("Firestore database is empty. Seeding initial real records...");
      await seedInitialFirestoreData();
      console.log("Initial real records seeded to Firestore successfully.");
    }
  } catch (err) {
    console.warn("Could not check/seed Firestore:", err);
  }
}
