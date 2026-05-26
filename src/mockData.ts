/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Farm, ProcessingBatch, CoffeeEvent, MarketPrice, MediaItem } from "./types.js";

export const INITIAL_FARMS: Farm[] = [
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
    certifications: ["Organic", "Fairtrade", "UTZ Certified"]
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
    certifications: ["Organic", "Fairtrade", "Rainforest Alliance"]
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
    certifications: ["Organic", "Fairtrade", "Rainforest Alliance"]
  },
  {
    id: "farm-sumatra",
    name: "Raja Toba Estate",
    farmerName: "Siti Simanjuntak",
    cooperative: "Ketiara Cooperative",
    region: "Lake Toba (Lintong)",
    country: "Indonesia",
    latitude: 2.2741,
    longitude: 98.9865,
    altitude: 1540,
    sizeHectares: 3.8,
    capacityBags: 80,
    soilType: "Deep Humic Clay / Volcanic Inceptisols",
    climateZone: "Equatorial Rainforest",
    harvestStart: "October",
    harvestEnd: "December",
    certifications: ["Organic", "Fairtrade"]
  },
  {
    id: "farm-elgon-heights",
    name: "Sipi Falls Organics",
    farmerName: "Okurut Daniel",
    cooperative: "Mount Elgon Agroforestry Cooperative",
    region: "Kapchorwa District",
    country: "Uganda",
    latitude: 1.3341,
    longitude: 34.4128,
    altitude: 1850,
    sizeHectares: 6.5,
    capacityBags: 140,
    soilType: "Andosols / Volcanic Ash",
    climateZone: "Temperate Highland",
    harvestStart: "September",
    harvestEnd: "December",
    certifications: ["Fairtrade", "Rainforest Alliance"]
  }
];

export const INITIAL_BATCHES: ProcessingBatch[] = [
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
    fermentationHours: 0, // Natural sun-dried
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
  },
  {
    lotNumber: "LOT-IDN-2026-SM02",
    farmId: "farm-sumatra",
    washingStation: "Lintong Wet-Hulling Facility",
    method: "Experimental", // Giling Basah
    variety: "Sumatra Mandheling (Lasuna)",
    fermentationHours: 12,
    dryingMethod: "Concrete Drying Patios",
    moistureContent: 12.0,
    grade: "Specialty Grade",
    cuppingScore: 86.5,
    status: "Processing",
    harvestDate: "2026-05-23",
    weightKg: 1800
  },
  {
    lotNumber: "LOT-UGA-2026-HY12",
    farmId: "farm-elgon-heights",
    washingStation: "Sipi Central Wet Mill",
    method: "Honey",
    variety: "SL28 & Nyasaland",
    fermentationHours: 18,
    dryingMethod: "Raised Beds under Canopy",
    moistureContent: 11.5,
    grade: "Grade AB",
    cuppingScore: 85.0,
    status: "Processing",
    harvestDate: "2026-05-20",
    weightKg: 950
  }
];

export const COFFEE_EVENTS: CoffeeEvent[] = [
  {
    id: "evt-0",
    title: "World Coffee Expo 2026",
    date: "2026-06-22",
    location: "Amsterdam, Netherlands",
    category: "Expo",
    description: "The world's preeminent coffee exhibition featuring the World Barista Championships and coffee sourcing exhibitions.",
    organizer: "Specialty Coffee Association (SCA)"
  },
  {
    id: "evt-1",
    title: "Andean Agronomist Summit",
    date: "2026-07-15",
    location: "Bogota, Colombia",
    category: "Conference",
    description: "Focusing on shade-canopy densities, soil biome rejuvenation, carbon insetting metrics, and global logistics transparency.",
    organizer: "Federación Nacional de Cafeteros"
  },
  {
    id: "evt-2",
    title: "Cup of Excellence Colombia",
    date: "2026-08-05",
    location: "Neiva, Huila",
    category: "Competition",
    description: "The gold standard for identifying pristine coffees. Global roasters bid on exceptional anaerobics, pink bourbons, and geishas.",
    organizer: "Alliance for Coffee Excellence"
  },
  {
    id: "evt-3",
    title: "Global Regenerative Soil Workshop",
    date: "2026-09-10",
    location: "Jakarta, Indonesia",
    category: "Training",
    description: "A continuous training forum detailing organic fertilization recipes, bio-nutrients, and blockchain integration strategies.",
    organizer: "SCA Global Quality Guild"
  }
];

export const MARKET_PRICES: MarketPrice[] = [
  {
    id: "mkt-1",
    name: "ICE C Arabica Futures",
    type: "NYC-C-Market",
    priceUSD: 2.45,
    unit: "per lb",
    changePercent: 1.85,
    lastUpdated: "Just Now"
  },
  {
    id: "mkt-2",
    name: "Fairtrade Base Index",
    type: "Fairtrade-Minimum",
    priceUSD: 1.40,
    unit: "per lb",
    changePercent: 0.00,
    lastUpdated: "24 Hours ago"
  },
  {
    id: "mkt-3",
    name: "Colombia Huila Specialty Index",
    type: "Specialty-Average",
    priceUSD: 4.20,
    unit: "per lb",
    changePercent: 1.15,
    lastUpdated: "1 Hour ago"
  },
  {
    id: "mkt-4",
    name: "Ethiopian Yirgacheffe G1 Average",
    type: "Specialty-Average",
    priceUSD: 4.80,
    unit: "per lb",
    changePercent: 2.15,
    lastUpdated: "3 Hours ago"
  }
];

export const INITIAL_MEDIA: MediaItem[] = [
  {
    id: "media-1",
    farmId: "farm-sidama",
    title: "High-Altitude Coffee Cherries ripening",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-05-12T09:30:00Z",
    caption: "Healthy red Arabica cherries ripening organically on the slopes of Aleta Wondo at 1,980m.",
    status: "synced"
  },
  {
    id: "media-2",
    farmId: "farm-huila",
    title: "Solar Parabolic Dryer Selection",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-05-15T15:45:00Z",
    caption: "Carlos inspects the uniform humidity dry curve of Pink Bourbon on elevated beds under protective plastic shade.",
    status: "synced"
  },
  {
    id: "media-3",
    farmId: "farm-sumatra",
    title: "Wet-Hulling Moisture Check",
    mimeType: "image/jpeg",
    url: "https://images.unsplash.com/photo-1628088062854-d1870b4553cb?q=80&w=800&auto=format&fit=crop",
    createdAt: "2026-05-18T11:20:00Z",
    caption: "Processing Mandheling using the traditional Giling Basah method, stripping mucilage under wet moisture conditions.",
    status: "synced"
  }
];
