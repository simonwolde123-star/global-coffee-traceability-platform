/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CONFIG = {
  MAP: {
    MIN_LNG: 34.0,
    MAX_LNG: 40.0,
    MIN_LAT: 1.0,
    MAX_LAT: 8.0,
    ELEVATION_CENTER: 2100,
    ELEVATION_DISTANCE_FACTOR: 20,
    ELEVATION_HOVER_FACTOR: 25,
    MIN_ALTITUDE: 1200,
    BOUNDARY_RADIUS: 2.4
  },
  COLORS: {
    PRIMARY: "#C5A059",
    FOREST: "#3D5A40",
    DARK: "#1B1B1B",
    DARK_ALT: "#2F4632"
  },
  API: {
    BASE_URL: process.env.REACT_APP_API_BASE || "",
    BLOCKCHAIN_PATH: "/api/blockchain",
    AUTH_LOGIN: "/api/auth/login",
    AUTH_REGISTER: "/api/auth/register",
    AUTH_VERIFY: "/api/auth/verify",
    AI_DIAGNOSE: "/api/ai/diagnose",
    AI_FORECAST: "/api/ai/forecast",
    AI_CHAT: "/api/ai/chat"
  },
  SESSION: {
    TTL: 24 * 60 * 60 * 1000, // 24 hours
    STORAGE_KEY: "origina_state",
    USER_KEY: "origina_sessions_user",
    TOKEN_KEY: "origina_sessions_token",
    LANGUAGE_KEY: "origina_language",
    CACHED_USERS_KEY: "origina_cached_users"
  },
  SYNC: {
    DEBOUNCE_MS: 500,
    RAF_THROTTLE: true // Use requestAnimationFrame for expensive updates
  },
  BLOCKCHAIN: {
    CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour
  }
} as const;
