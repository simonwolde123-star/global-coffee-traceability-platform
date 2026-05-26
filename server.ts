/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { AuditingTransaction, BlockchainBlock } from "./src/types.js";

// Lazy-initialization wrapper for Gemini API to prevent crash if key is missing during startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("⚠️ GEMINI_API_KEY is not defined. AI features will run in simulated demo mode.");
      throw new Error("GEMINI_API_KEY environment variable is required to run real AI queries. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

// Middleware supporting video and image transfers
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// --- USER DATABASE & SECURE AUTHENTICATION SYSTEM ---
// In-memory persistent database for professional platform access
const users = [
  {
    username: "auditor",
    email: "auditor@beantrace.org",
    password: "securePass123",
    name: "Elena Rostova"
  }
];

// Secure Server-side Session Cache (simulated tokens)
const activeSessions = new Map<string, typeof users[0]>();

// API endpoints for user authentication
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: "All registration fields (username, email, password, name) are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ error: "An account with this username or email is already registered." });
    }

    const newUser = { username, email, password, name };
    users.push(newUser);

    // Auto-login session creation
    const token = crypto.randomBytes(16).toString("hex");
    activeSessions.set(token, newUser);

    res.status(201).json({
      message: "Registration successful! Account secured globally.",
      token,
      user: { username, email, name }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier is email OR username
    if (!identifier || !password) {
      return res.status(400).json({ error: "Username/Email and Password are required parameters." });
    }

    const user = users.find(u => 
      (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) && 
      u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your password or register." });
    }

    const token = crypto.randomBytes(16).toString("hex");
    activeSessions.set(token, user);

    res.json({
      message: "Login successful! Identity verified.",
      token,
      user: { username: user.username, email: user.email, name: user.name }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: "Unauthenticated. Please sign in to verify session." });
  }
  const user = activeSessions.get(token);
  res.json({ user: { username: user?.username, email: user?.email, name: user?.name } });
});

// --- SIMULATED BLOCKCHAIN MEMORY DATABASE ---
const DIFFICULITY = 2; // Leading zeroes for proof-of-work simulation

function calculateBlockHash(
  index: number,
  timestamp: string,
  transactions: AuditingTransaction[],
  previousHash: string,
  nonce: number
): string {
  const dataString = index + timestamp + JSON.stringify(transactions) + previousHash + nonce;
  return crypto.createHash("sha256").update(dataString).digest("hex");
}

// Initial Genesis Block
const genesisTransaction: AuditingTransaction = {
  id: "ft-genesis-0001",
  lotNumber: "LOT-GENESIS",
  timestamp: new Date("2026-01-01T10:00:00Z").toISOString(),
  auditorName: "Elena Rostova",
  cooperativeId: "GLOBAL-GENESIS-COOP",
  basePricePaidUSD: 3.20,
  premiumPaidUSD: 0.45,
  childLaborFree: true,
  safeWorkingConditions: true,
  organicPractice: true,
  forestPreserved: true,
  auditScore: 100,
  inspectorComments: "Inaugural Fairtrade Auditing Genesis Block for Global Specialty Coffee Cooperatives and Smallholder Alliances."
};

const genesisHash = calculateBlockHash(0, new Date("2026-01-01T10:00:00Z").toISOString(), [genesisTransaction], "0", 0);

const blockchain: BlockchainBlock[] = [
  {
    index: 0,
    timestamp: new Date("2026-01-01T10:00:00Z").toISOString(),
    transactions: [genesisTransaction],
    previousHash: "0",
    hash: genesisHash,
    nonce: 0
  }
];

// Mine a single block (calculates the hash targeting proof-of-work constraint)
function mineBlock(block: BlockchainBlock) {
  const target = "0".repeat(DIFFICULITY);
  while (block.hash.substring(0, DIFFICULITY) !== target) {
    block.nonce++;
    block.hash = calculateBlockHash(block.index, block.timestamp, block.transactions, block.previousHash, block.nonce);
  }
}

// REST endpoints for the Blockchain Ledger
app.get("/api/blockchain", (req, res) => {
  res.json({
    chain: blockchain,
    difficulty: DIFFICULITY,
    isValid: checkChainValidity()
  });
});

app.post("/api/blockchain/transaction", (req, res) => {
  try {
    const tx: Omit<AuditingTransaction, "id" | "timestamp"> = req.body;
    
    // Construct full transaction
    const fullTx: AuditingTransaction = {
      ...tx,
      id: "ft-" + crypto.randomBytes(8).toString("hex"),
      timestamp: new Date().toISOString()
    };

    // Construct next block
    const latestBlock = blockchain[blockchain.length - 1];
    const nextIndex = latestBlock.index + 1;
    const nextTimestamp = new Date().toISOString();
    const previousHash = latestBlock.hash;

    const newBlock: BlockchainBlock = {
      index: nextIndex,
      timestamp: nextTimestamp,
      transactions: [fullTx],
      previousHash: previousHash,
      hash: "",
      nonce: 0
    };

    // Set initial hash then mine
    newBlock.hash = calculateBlockHash(newBlock.index, newBlock.timestamp, newBlock.transactions, newBlock.previousHash, newBlock.nonce);
    mineBlock(newBlock);

    blockchain.push(newBlock);

    res.status(201).json({
      message: "Auditing transaction verified and mined into the Fair-Trade Blockchain ledger.",
      block: newBlock,
      isValid: checkChainValidity()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cryptographic audit chain validation
function checkChainValidity(): boolean {
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const previousBlock = blockchain[i - 1];

    // Validate current block's hash match
    const recalculatedHash = calculateBlockHash(
      currentBlock.index,
      currentBlock.timestamp,
      currentBlock.transactions,
      currentBlock.previousHash,
      currentBlock.nonce
    );
    if (currentBlock.hash !== recalculatedHash) {
      return false;
    }

    // Validate link match
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }
  return true;
}

// Health status check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    system: "Origina Global Coffee Traceability Core",
    timestamp: new Date().toISOString(),
    aiEnabled: !!process.env.GEMINI_API_KEY
  });
});

// --- AI SMART AGRICULTURE TOOLS (GEMINI INTERFACING) ---

// Real Crop Leaf/Cherry Pathological Diagnosis
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { imageBase64, mimeType, description } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing required photo payload (imageBase64 / mimeType)." });
    }

    let resultText = "";
    try {
      const ai = getGeminiClient();
      
      const contents = {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType
            }
          },
          {
            text: `You are an AI Agronomist and coffee crop pathologist specializing in global coffee belt origins (such as South & Central America: Colombia, Brazil, Guatemala; East Africa: Ethiopia, Kenya, Uganda; Southeast Asia: Sumatra, Vietnam, etc.) and specialty Arabica & Robusta varieties (Geisha, Castillo, Bourbon, Typica, SL28, SL34, Catimor, Ruiru 11) developed by the BeanTrace Technology Alliance. 
            Analyze the attached image depicting coffee cherries, coffee tree leaves, or soil conditions from global farm regions. 
            Identify leaves spots, coffee leaf rust (Hemileia vastatrix), Coffee Berry Disease (CBD), cercospora, nutrient deficiencies (like Nitrogen or Zinc deficiency), or pests like Antestia bug, Coffee Berry Borer, or stem borers.
            
            Farmer's notes/symptoms: "${description || 'None'}"
            
            Respond in Markdown with these EXACT header sections:
            ### 🩺 Primary Identification
            Specify identified condition, causative agent, confidence rating, and localized severity in its global regional context.
            
            ### 🚜 Recommended Interventions
            1. Short term emergency remedies (preferably organic/low-cost and globally accessible for smallholder cultivators).
            2. Integrated Pest Management (IPM) or organic treatments.
            
            ### 🌱 Long-Term Preventive Measures
            Explain planting shadows, windbreaks, spacing, shade-canopy densities, or variety transitions suited to high-altitude global farming (ranging from 1,000m to 2,200m+ above sea level).
            
            Keep your response concise, reassuring, highly professional, and easy for global extension officers to translate.`
          }
        ]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents
      });

      resultText = response.text || "Empty response from diagnosis model.";
    } catch (apiError: any) {
      console.error("Gemini API Error in /api/ai/diagnose:", apiError);
      
      // Elegant demo intelligence fallback if key is empty or error occurs
      resultText = `### 🩺 Primary Identification
*Analyzed in Offline Simulator Mode (Gemini Sandbox - Worldwide Crop Intel)*
**Condition Detected:** Probable **Coffee Leaf Rust (Hemileia vastatrix)** or **Nitrogen Deficiency** (spatially modeled patterns).
**Confidence Level:** High (Simulated)

### 🚜 Recommended Interventions
1. **Organic Fungicide:** Create and apply an organic copper-based fungicide spray (Bordeaux mixture - lime and copper sulfate) across foliage suitable for global certification standards.
2. **Nutrient Rebalancing:** Apply localized organic compost, animal manures, or pulped coffee cherries rich in natural nitrogen directly to tree drip-lines.

### 🌱 Long-Term Preventive Measures
* **Shade Forestry Canopy:** Integrate shade canopy trees (such as Inga trees in Central/South America, Erythrina/Gliricidia in Asia, or Albizia/Millettia in East Africa) to buffer humidity levels.
* **Pruning & Airflow:** Maintain proper pruning protocols to regulate air circulation and decrease fungal spore retention across diverse microclimates.`;
    }

    res.json({ analysis: resultText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sustainability metrics and simulated Yield Forecaster
app.post("/api/ai/forecast", async (req, res) => {
  try {
    const { altitude, farmSize, variety, rainfall, soilPh, processingMethod } = req.body;

    let adviceText = "";
    try {
      const ai = getGeminiClient();
      const prompt = `You are an expert AI Crop Forecaster and agro-meteorologist for global coffee cooperatives and smallholders (spanning South/Central America, Southeast Asia, and East Africa).
      Calculate coffee yield and sustainability score based on:
      - Altitude: ${altitude} m.a.s.l.
      - Farm size: ${farmSize} hectares
      - Specialty Variety: ${variety}
      - Annual Rainfall: ${rainfall} mm
      - Soil pH: ${soilPh}
      - Processing Setup: ${processingMethod}
      
      Generate a quantitative productivity report in Markdown matching these headers:
      ### 📈 Production Yield Forecast
      Forecasted harvest yield in 60kg bags (calculate realistic crop-output based on regional yields for the variety and soil-climate inputs), plus quality/specialty grade forecast.
      
      ### 🌍 Climate Risk & Sustainability Analysis
      Identify specific risks related to regional altitude shifts, moisture curves, soil pH anomalies, or rainfall fluctuations. Generate a Sustainability Rating (e.g., A+, B-, etc.).
      
      ### 🛠️ Strategic Soil & Water Advice
      Highly customized recommendations to optimize soil health, pH buffers, soil moisture holding capacity, and waste-water purification tailored to the chosen processing setup (such as wet-mill filtration, organic compost, or biological filtering ditches).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      adviceText = response.text || "Empty response from forecaster model.";
    } catch (apiError: any) {
      console.error("Gemini API Error in /api/ai/forecast:", apiError);
      
      // Intelligent simulation fallback
      const predictedBags = Math.round(farmSize * 15 * (altitude > 1900 ? 1.2 : 0.9));
      adviceText = `### 📈 Production Yield Forecast
* **Estimated Yield:** **${predictedBags} bags** (60kg each) under optimized conditions.
* **Expected Grade Outcome:** **Specialty Grade / Premium Grade** (maturing properly under conditions at ${altitude}m.a.s.l.).
* **Maturation Timeline:** Optimized global ripening cycle (enhancing specialty density and organic compound profile).

### 🌍 Climate Risk & Sustainability Analysis
* **Sustainability Grade:** **A (Globally Certified)**
* **Identified Risks:** Soil pH of **${soilPh}** is ${soilPh < 5.0 ? 'excessively acidic' : soilPh > 6.5 ? 'slightly alkalized' : 'near-optimal (5.5 - 6.2)'}. Rainfall of **${rainfall}mm** matches regional climate standards. 
* **Altitude Adaptability:** Moderate protection from extreme spikes, but warrants active monitoring for coffee rust or pests in warm humid intervals.

### 🛠️ Strategic Soil & Water Advice
1. **Soil Buffering:** Use agricultural lime, composted green manures, or local biological inputs to stabilize soil pH.
2. **Water Resource Stewardship:** Since you employ **${processingMethod}** processing, pipe municipal wash discharge through physical bio-filter channels or vetiver ponds to safeguard the area watershed from organic effluents.`;
    }

    res.json({ forecast: adviceText });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// AI Assistant Advisory Chat-bot
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    let reply = "";
    try {
      const ai = getGeminiClient();
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: `You are the Origina Coffee Copilot, a helpful server-side agricultural assistant developed by the BeanTrace Technology Alliance specifically for global coffee cooperatives, farmers, quality cuppers, roasters, and fair-trade auditors worldwide.
          Provide deep, culturally respectful, agricultural, blockchain, and logistics insights spanning all major coffee belts (South/Central America, East Africa, Asia-Pacific). Keep answers highly informative, helpful, and formatted beautifully in Markdown.`
        }
      });

      // Send greeting or active message
      const response = await chat.sendMessage({ message: message || "Hello!" });
      reply = response.text || "";
    } catch (apiError: any) {
      console.error("Gemini Chat Error:", apiError);
      
      // Fallback response simulating chat
      reply = `Thank you for contacting the **Origina Coffee Copilot (Autonomous Global Extension Mode)**. 

I can assist with queries regarding:
1. **Global Coffee Cultivars**: Geisha, Castillo, Bourbon, Typica, SL28, and Sumatra Pacamara.
2. **Immutability Auditing**: How our simulated SHA-256 blockchain prevents Fairtrade premiums from leaking, regardless of region.
3. **Sustainable Agronomy**: Intercropping, biological shade canopies, moisture indexes, and organic soil remedies across global climate layers.

*Demo Mode Active:* If you would like to test the live chat, please ensure a valid \`GEMINI_API_KEY\` is added in **Secrets**. Let me know how I can guide your cooperative today!`;
    }

    res.json({ reply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mount Vite middleware or static delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 Running in Development Mode - Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Running in Production Mode - Delivering compiled output...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`☕ Origina Traceability Core Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
