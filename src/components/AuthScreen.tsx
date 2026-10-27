/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, RefreshCw, Star, Info, Sprout, Globe, Film } from "lucide-react";
import { LanguageCode, translations } from "../translations";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleAuthProvider } from "../firebase";
import { saveUserProfile } from "../services/firestoreService";

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
  onPublicVerifyClick?: () => void;
  onWatchPromoVideo?: () => void;
}

export default function AuthScreen({ onAuthSuccess, isOffline, language, setLanguage, onPublicVerifyClick, onWatchPromoVideo }: AuthScreenProps) {
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

  // Email Verification states
  const [verificationPending, setVerificationPending] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState("");
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [systemDraftCode, setSystemDraftCode] = useState("");
  const [originalPendingUser, setOriginalPendingUser] = useState<any>(null);

  // Google sign in via Firebase Auth popup
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const userProfile = {
        uid: user.uid,
        email: user.email || "",
        name: user.displayName || user.email?.split("@")[0] || "Coffee Auditor",
        username: user.email?.split("@")[0] || "auditor",
        role: "QualityInspector",
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(userProfile);
      setSuccess("Authenticated with Google successfully!");
      setTimeout(() => {
        onAuthSuccess({
          name: userProfile.name,
          username: userProfile.username,
          email: userProfile.email
        }, user.uid);
      }, 600);
    } catch (err: any) {
      console.warn("Google popup login error:", err);
      setError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      if (activeTab === "register") {
        if (data.isVerificationRequired) {
          setVerificationPending(true);
          setEmailToVerify(data.email || email);
          setSystemDraftCode(data.code || "");
          setOriginalPendingUser(null); // Managed server-side
          setSuccess(t.verificationSent);
        } else {
          setSuccess("Registered successfully!");
          setTimeout(() => {
            onAuthSuccess(data.user, data.token);
          }, 800);
        }
      } else {
        setSuccess(t.authSuccessMessage);
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
        }, 800);
      }

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
      const offlineCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      setOriginalPendingUser(newUser);
      setSystemDraftCode(offlineCode);
      setEmailToVerify(email);
      setVerificationPending(true);
      setSuccess(t.verificationSent);
      setLoading(false);
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

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!verificationCodeInput || verificationCodeInput.trim().length !== 6) {
      setError(language === "it" ? "Inserisci un codice valido a 6 cifre." : "Please enter a valid 6-digit confirmation code.");
      return;
    }

    setLoading(true);

    if (systemDraftCode && !originalPendingUser) {
      // Server-side verification flow
      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToVerify, code: verificationCodeInput.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t.codeInvalid);
        }

        setSuccess(t.verifySuccess);
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
        }, 1000);

      } catch (err: any) {
        setError(err.message || t.codeInvalid);
        setLoading(false);
      }
    } else {
      // Local/Offline simulation verify check
      if (verificationCodeInput.trim() !== systemDraftCode) {
        setError(t.codeInvalid);
        setLoading(false);
        return;
      }

      const savedUsersStr = localStorage.getItem("origina_cached_users") || "[]";
      const cachedUsers = JSON.parse(savedUsersStr);
      cachedUsers.push(originalPendingUser);
      localStorage.setItem("origina_cached_users", JSON.stringify(cachedUsers));

      setSuccess(t.verifySuccess);
      setTimeout(() => {
        onAuthSuccess(
          { username: originalPendingUser.username, email: originalPendingUser.email, name: originalPendingUser.name },
          `offline-token-${originalPendingUser.username}`
        );
      }, 1000);
    }
  };

  const handleResendCode = () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSystemDraftCode(generatedCode);
    setSuccess(t.verificationSent);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F5F2] flex flex-col items-center justify-center p-4">
      {/* Dynamic Selector for Worldwide Languages */}
      <div className="mb-6 flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
        <Globe size={14} className="text-gray-400" />
        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mr-1">Language:</span>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {(["en", "it", "am", "es", "fr", "pt"] as LanguageCode[]).map((lang) => (
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

          {verificationPending ? (
            <div className="space-y-6">
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    {t.enterVerificationCode}
                  </label>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    {language === "it" 
                      ? `Inviato un codice di sicurezza speciale a ${emailToVerify}.`
                      : language === "am"
                      ? `ልዩ የማረጋገጫ ኮድ ወደ ${emailToVerify} ልከናል።`
                      : `Sent secure code to ${emailToVerify}.`
                    }
                  </p>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-[#C5A059]" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder={t.verifyInputPlaceholder}
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeInput(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono font-bold tracking-widest text-[#2D2926] focus:ring-1 focus:ring-[#C5A059] focus:grid-[#C5A059] outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationPending(false);
                      setSuccess(null);
                      setError(null);
                    }}
                    className="flex-1 border border-gray-250 hover:bg-gray-50 text-gray-700 py-2 rounded-xl text-xs font-bold uppercase transition-colors"
                  >
                    {language === "it" ? "Indietro" : language === "am" ? "ተመለስ" : "Back"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-black hover:bg-black/95 text-white py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {loading ? <RefreshCw size={12} className="animate-spin text-[#C5A059]" /> : null}
                    {language === "it" ? "Verifica" : language === "am" ? "አረጋግጥ" : "Verify Code"}
                  </button>
                </div>
              </form>

              {/* Inbound Satellite Mail Server Simulated UI */}
              <div className="border border-[#C5A059]/30 rounded-xl overflow-hidden shadow-inner bg-[#FDFBF7]">
                <div className="bg-[#1b1b1b] px-3.5 py-2 text-white flex items-center justify-between border-b border-[#C5A059]/20">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#C5A059] uppercase">
                      {t.emailSimulatorTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[9px] font-bold uppercase text-white/70 hover:text-white bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded transition-all"
                  >
                    {t.resendCode}
                  </button>
                </div>
                
                <div className="p-4 space-y-2.5 text-[11px] font-mono leading-relaxed text-gray-700">
                  <div className="grid grid-cols-4 gap-1 border-b border-gray-150 pb-2">
                    <span className="font-bold text-gray-400 uppercase">From:</span>
                    <span className="col-span-3 text-black">security@beantrace.org</span>
                    
                    <span className="font-bold text-gray-400 uppercase">To:</span>
                    <span className="col-span-3 text-black font-semibold">{emailToVerify}</span>
                    
                    <span className="font-bold text-gray-400 uppercase">Subject:</span>
                    <span className="col-span-3 text-[#C5A059] font-bold">{t.emailVerificationSubject}</span>
                  </div>

                  <div className="pt-2 text-gray-600 bg-white p-3 rounded border border-gray-150 relative select-all selection:bg-amber-100">
                    <p className="mb-2.5">
                      {t.emailVerificationBody}
                    </p>
                    <div className="bg-[#FCF8EE] border border-[#C5A059]/35 py-2.5 text-center text-lg font-bold tracking-widest text-black rounded select-all selection:bg-amber-100">
                      {systemDraftCode}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
          )}

          {/* Google Sign-in & Quick Access Triggers */}
          <div className="border-t border-gray-150 pt-4 space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:border-gray-400"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <div className="text-center">
              <span className="text-[9px] bg-white px-2 py-0.5 border border-gray-200 text-gray-400 uppercase tracking-widest font-mono rounded">
                Or Continue As Demo Auditor
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

            {onWatchPromoVideo && (
              <button
                type="button"
                onClick={onWatchPromoVideo}
                className="w-full bg-[#3D5A40] hover:bg-[#2F4632] text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Film size={14} className="text-[#E8C882]" />
                <span>🎬 Watch Platform Commercial (42s)</span>
              </button>
            )}

            {onPublicVerifyClick && (
              <button
                type="button"
                onClick={onPublicVerifyClick}
                className="w-full bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={14} className="text-[#3D5A40]" />
                <span>Verify Public Coffee Batch (QR / Lot ID)</span>
              </button>
            )}

            <p className="text-[9px] text-[#2D2926]/50 text-center leading-normal max-w-[300px] mx-auto font-mono">
              {t.demoCredentialsNote}
            </p>
          </div>
        </div>

        {/* Brand footers */}
        <div className="p-4 bg-gray-50 border-t border-gray-150 text-center flex flex-col items-center justify-center gap-1">
          <span className="text-[9px] text-gray-500 uppercase font-mono font-bold tracking-wider">
            © 2026 Origina Traceability Ledger · Lead Developer: Simon Wolde Balango
          </span>
          <span className="text-[8px] text-gray-400 font-mono">
            Platform Certified Worldwide Usability · BeanTrace Alliance
          </span>
        </div>
      </div>
    </div>
  );
}
