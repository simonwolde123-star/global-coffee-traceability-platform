/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, RefreshCw, Star, Info, Sprout, Globe } from "lucide-react";
import { LanguageCode, translations } from "../translations";

interface AuthUser {
  username: string;
  email: string;
  name: string;
}

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser, token: string) => void;
  isOffline: boolean;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export default function AuthScreen({ onAuthSuccess, isOffline, language, setLanguage }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  // Translation shortener
  const t = translations[language] || translations.en;

  // Form values
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick select standard demo credentials
  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: "auditor", password: "securePass123" }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(t.authSuccessMessage);
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
        }, 800);
      } else {
        throw new Error("Could not reach demo endpoint");
      }
    } catch (err) {
      // Local recovery fallback for offline development
      const fallbackUser = {
        username: "auditor",
        email: "auditor@beantrace.org",
        name: "Elena Rostova"
      };
      setSuccess(`${t.authSuccessMessage} (${t.oflineIndicator})`);
      setTimeout(() => {
        onAuthSuccess(fallbackUser, "offline-simulated-token-auditor");
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation checks
    if (activeTab === "register") {
      if (!name || !username || !email || !password || !confirmPassword) {
        setError(language === "es" ? "Por favor completes todos los campos." : "Please populate all fields.");
        return;
      }
      if (!email.includes("@")) {
        setError(language === "es" ? "Correo no válido." : "Please enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError(language === "es" ? "La contraseña debe superar 6 caracteres." : "Passwords must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError(language === "es" ? "Las contraseñas no coinciden." : "Passwords do not match. Please verify.");
        return;
      }
    } else {
      if (!username || !password) {
        setError(language === "es" ? "Falta usuario o contraseña." : "Please provide both Username and Password.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = activeTab === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload = activeTab === "register" 
        ? { name, username, email, password }
        : { identifier: username, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.authErrorMessage);
      }

      setSuccess(activeTab === "register" ? "Registered successfully!" : t.authSuccessMessage);
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
      }, 800);

    } catch (err: any) {
      console.warn("Auth Server Endpoint issue:", err.message);

      if (isOffline || err.message.includes("Failed to fetch") || err.message.includes("Could not reach")) {
        handleOfflineSubmit();
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const handleOfflineSubmit = () => {
    const savedUsersStr = localStorage.getItem("origina_cached_users") || "[]";
    const cachedUsers = JSON.parse(savedUsersStr);

    if (activeTab === "register") {
      const exist = cachedUsers.some((u: any) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
      if (exist || username.toLowerCase() === "auditor") {
        setError(language === "es" ? "Este usuario o correo ya existe." : "An account with this username already exists.");
        setLoading(false);
        return;
      }

      const newUser = { username, email, password, name };
      cachedUsers.push(newUser);
      localStorage.setItem("origina_cached_users", JSON.stringify(cachedUsers));

      setSuccess(language === "es" ? "¡Registrado localmente de manera segura!" : "Registered and Saved to Local Cache!");
      setTimeout(() => {
        onAuthSuccess({ username, email, name }, `offline-token-${username}`);
      }, 900);
    } else {
      // Login attempt
      let found = cachedUsers.find((u: any) => 
        (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
        u.password === password
      );

      // Support default professional auditor
      if (!found && username.toLowerCase() === "auditor" && password === "securePass123") {
        found = { username: "auditor", email: "auditor@beantrace.org", name: "Elena Rostova" };
      }

      if (!found) {
        setError(language === "es" ? "Credenciales no válidas en modo fuera de línea." : "Invalid credentials. Use Elena Rostova Quick Demo Access.");
        setLoading(false);
        return;
      }

      setSuccess(t.authSuccessMessage);
      setTimeout(() => {
        onAuthSuccess({ username: found.username, email: found.email, name: found.name }, `offline-token-${found.username}`);
      }, 900);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] flex flex-col items-center justify-center p-4">
      {/* Dynamic Selector for Worldwide Languages */}
      <div className="mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
        <Globe size={14} className="text-gray-400" />
        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mr-1">Language:</span>
        <div className="flex gap-1.5">
          {(["en", "es", "fr", "pt"] as LanguageCode[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-0.5 text-xs font-bold rounded uppercase transition-all cursor-pointer ${
                language === lang 
                  ? "bg-[#C5A059] text-white" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden transition-all duration-300 transform hover:shadow-2xl">
        {/* Brand header panel with global credentials */}
        <div className="bg-[#1B1B1B] p-6 text-center relative">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full border border-white/15">
            <span className={`h-1.5 w-1.5 rounded-full ${isOffline ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
            <span className="text-[9px] font-mono font-semibold text-white/80 uppercase">
              {isOffline ? t.secureIngressLocal : t.secureIngress}
            </span>
          </div>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#C5A059] mb-3 text-black">
            <Sprout size={24} />
          </div>
          <h2 className="text-[#C5A059] font-bold text-2xl tracking-tight uppercase italic flex items-center justify-center gap-1">
            {t.appName}
          </h2>
          <p className="text-[11px] text-white/60 uppercase tracking-widest mt-1 font-mono">
            {t.coopTraceability}
          </p>
        </div>

        {/* Tab Switching controls */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              setActiveTab("login");
              setError(null);
            }}
            className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "login"
                ? "border-[#C5A059] text-black bg-white"
                : "border-transparent text-gray-500 hover:bg-gray-100/50"
            }`}
          >
            {t.loginTab}
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === "register"
                ? "border-[#C5A059] text-black bg-white"
                : "border-transparent text-gray-500 hover:bg-gray-100/50"
            }`}
          >
            {t.registerTab}
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg font-medium flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-r-lg font-medium flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#C5A059] focus:grid-[#C5A059] outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder={activeTab === "register" ? "auditor_coop" : "auditor / auditor@beantrace.org"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#C5A059] focus:grid-[#C5A059] outline-none"
                />
              </div>
            </div>

            {activeTab === "register" && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="auditor@beantrace.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#C5A059] focus:grid-[#C5A059] outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#C5A059] focus:grid-[#C5A059] outline-none"
                />
              </div>
            </div>

            {activeTab === "register" && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-[#C5A059] focus:grid-[#C5A059] outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black/95 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors duration-250 mt-2 cursor-pointer flex items-center justify-center gap-2 shadow md:shadow-md"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-[#C5A059]" />
                  Processing...
                </>
              ) : activeTab === "register" ? (
                t.registerButton
              ) : (
                t.loginButton
              )}
            </button>
          </form>

          {/* Quick Demo Access Trigger */}
          <div className="border-t border-gray-150 pt-5 space-y-3">
            <div className="text-center">
              <span className="text-[9px] bg-white px-2 py-1 border border-gray-200 text-gray-400 uppercase tracking-widest font-mono rounded">
                Symmetric Certification Setup
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={loading}
              className="w-full bg-[#FCF8EE] border border-[#C5A059]/40 hover:bg-[#FCEFD2] text-black py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Star size={14} className="text-[#C5A059] fill-[#C5A059]" />
              <span>{t.demoAccessButton}</span>
            </button>
            <p className="text-[9px] text-[#2D2926]/50 text-center leading-normal max-w-[300px] mx-auto font-mono">
              {t.demoCredentialsNote}
            </p>
          </div>
        </div>

        {/* Brand footers */}
        <div className="p-4 bg-gray-50 border-t border-gray-150 text-center flex items-center justify-center gap-1">
          <span className="text-[9px] text-gray-400 uppercase font-mono">
            Platform Certified Worldwide Usability · BeanTrace Alliance
          </span>
        </div>
      </div>
    </div>
  );
}
