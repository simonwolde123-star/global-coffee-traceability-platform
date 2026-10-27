/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Sparkles,
  Shield,
  Layers,
  QrCode,
  Globe,
  Sprout,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  X,
  Radio,
  FileVideo,
  Award,
  TrendingUp,
  Cpu,
  Coffee
} from "lucide-react";

// Generated cinematic visual assets
import sunriseFarmImg from "../assets/images/promo_sunrise_farm_1792155664195.jpg";
import opaqueSupplyImg from "../assets/images/promo_opaque_supply_1792155706718.jpg";
import blockchainNetImg from "../assets/images/promo_blockchain_net_1792155678329.jpg";
import farmerHarvestImg from "../assets/images/promo_farmer_harvest_1792155693948.jpg";

export type AspectRatio = "16:9" | "9:16" | "1:1";

interface PromoVideoPlayerProps {
  onClose?: () => void;
  onExplorePlatform?: () => void;
}

// Scene definition interface
interface VideoScene {
  id: number;
  title: string;
  startTime: number; // in seconds
  endTime: number;
  narration: {
    en: string;
    es: string;
    fr: string;
    it: string;
    am: string;
  };
}

const TOTAL_DURATION = 42; // 42 seconds total runtime

const SCENES: VideoScene[] = [
  {
    id: 1,
    title: "Opening Hook",
    startTime: 0,
    endTime: 5.5,
    narration: {
      en: "What if every single coffee bean could tell its authentic story?",
      es: "¿Qué pasaría si cada grano de café pudiera contar su historia auténtica?",
      fr: "Et si chaque grain de café pouvait raconter sa véritable histoire ?",
      it: "E se ogni chicco di caffè potesse raccontare la sua storia autentica?",
      am: "እያንዳንዱ የቡና ፍሬ እውነተኛ ታሪኩን መናገር ቢችልስ?"
    }
  },
  {
    id: 2,
    title: "The Dilemma",
    startTime: 5.5,
    endTime: 11,
    narration: {
      en: "Traditional coffee supply chains remain dark. Over 60% of claims lack proof, leaving farmers underpaid and buyers uncertain.",
      es: "Las cadenas tradicionales carecen de transparencia. Más del 60% carece de pruebas criptográficas.",
      fr: "Les chaînes d'approvisionnement traditionnelles sont opaques. Plus de 60 % manquent de preuves.",
      it: "Le filiere tradizionali sono opache. Oltre il 60% manca di verifiche comprovate.",
      am: "የባህላዊ ቡና ንግድ አሰራር ግልጽነት ይጎድለዋል፣ አርሶ አደሮችም ፍትሃዊ ክፍያ አያገኙም።"
    }
  },
  {
    id: 3,
    title: "The Blockchain Solution",
    startTime: 11,
    endTime: 21,
    narration: {
      en: "Introducing Coffee Traceability Blockchain. An immutable decentralized ledger connecting farmers, washing stations, exporters, and roasters.",
      es: "Presentamos Coffee Traceability Blockchain. Un libro contable inmutable que conecta toda la cadena.",
      fr: "Découvrez Coffee Traceability Blockchain. Un registre immuable reliant chaque étape.",
      it: "Presentiamo Coffee Traceability Blockchain. Il registro immutabile dal produttore al consumatore.",
      am: "የቡና ብሎክቼይን ቴክኖሎጂን እናስተዋውቃለን። ከአርሶ አደር እስከ ሸማች ድረስ የተረጋገጠ መረጃ።"
    }
  },
  {
    id: 4,
    title: "Platform Features",
    startTime: 21,
    endTime: 34,
    narration: {
      en: "Real-time GPS elevation mapping, cryptographic smart audits, instant QR verification, and automated fair-trade price floor guarantees.",
      es: "Mapeo GPS en tiempo real, auditorías criptográficas, verificación QR instantánea y precios justos garantizados.",
      fr: "Cartographie GPS en temps réel, audits cryptographiques et vérification QR instantanée.",
      it: "Mappatura GPS in tempo reale, certificati crittografici e verifica immediata tramite QR code.",
      am: "የጂፒኤስ ከፍታ መከታተያ፣ የብሎክቼይን ማረጋገጫ እና ፈጣን የQR ኮድ ፍተሻ።"
    }
  },
  {
    id: 5,
    title: "Global Impact",
    startTime: 34,
    endTime: 38.5,
    narration: {
      en: "Empowering smallholder farming communities while delivering absolute trust to roasters and consumers worldwide.",
      es: "Empoderando a millones de familias caficultoras y garantizando total confianza mundial.",
      fr: "Autonomiser les petits producteurs tout en créant une confiance absolue à travers le monde.",
      it: "Dando potere ai piccoli coltivatori e offrendo totale fiducia ai consumatori di tutto il mondo.",
      am: "አነስተኛ አርሶ አደሮችን በማጎልበት እና በዓለም ዙሪያ ለሸማቾች እምነትን በመፍጠር ላይ።"
    }
  },
  {
    id: 6,
    title: "Closing & Call to Action",
    startTime: 38.5,
    endTime: 42,
    narration: {
      en: "Coffee Traceability Blockchain. From Farm to Cup. Verified by Blockchain. Transform coffee transparency today.",
      es: "Coffee Traceability Blockchain. De la finca a la taza. Verificado por Blockchain. Transforma la transparencia hoy.",
      fr: "Coffee Traceability Blockchain. De la ferme à la tasse. Vérifié par Blockchain.",
      it: "Coffee Traceability Blockchain. Dal chicco alla tazzina. Verificato da Blockchain.",
      am: "Coffee Traceability Blockchain. ከእርሻ እስከ ሲኒ። በብሎክቼይን የተረጋገጠ።"
    }
  }
];

export default function PromoVideoPlayer({ onClose, onExplorePlatform }: PromoVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [enableVoiceover, setEnableVoiceover] = useState(false);
  const [language, setLanguage] = useState<"en" | "es" | "fr" | "it" | "am">("en");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const synthNodesRef = useRef<any[]>([]);

  // Preloaded image element references
  const imagesRef = useRef<{
    sunrise: HTMLImageElement | null;
    problem: HTMLImageElement | null;
    blockchain: HTMLImageElement | null;
    harvest: HTMLImageElement | null;
  }>({
    sunrise: null,
    problem: null,
    blockchain: null,
    harvest: null
  });

  // Preload images into memory
  useEffect(() => {
    const sImg = new Image();
    sImg.src = sunriseFarmImg;
    imagesRef.current.sunrise = sImg;

    const pImg = new Image();
    pImg.src = opaqueSupplyImg;
    imagesRef.current.problem = pImg;

    const bImg = new Image();
    bImg.src = blockchainNetImg;
    imagesRef.current.blockchain = bImg;

    const hImg = new Image();
    hImg.src = farmerHarvestImg;
    imagesRef.current.harvest = hImg;
  }, []);

  // Web Audio Synthesizer: Procedural inspiring tech soundtrack
  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Start musical loops
      startProceduralScore(ctx, masterGain);
    } catch (e) {
      console.warn("Web Audio not supported or blocked by user interaction policy:", e);
    }
  }, [isMuted, volume]);

  // Adjust volume
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        isMuted ? 0 : volume,
        audioContextRef.current.currentTime,
        0.05
      );
    }
  }, [isMuted, volume]);

  // Procedural futuristic soundtrack generator (inspiring tech startup chords + arpeggio)
  const startProceduralScore = (ctx: AudioContext, destination: GainNode) => {
    // Chords: F minor - Ab - Eb - Bb (Cinematic & futuristic)
    const chordFrequencies = [
      [174.61, 220.00, 261.63, 349.23], // F min
      [207.65, 261.63, 311.13, 415.30], // Ab maj
      [155.56, 196.00, 233.08, 311.13], // Eb maj
      [116.54, 174.61, 233.08, 293.66], // Bb
    ];

    let step = 0;
    const tempo = 118; // BPM
    const stepDuration = 60 / tempo / 2; // eighth notes

    const playStep = () => {
      if (!ctx || ctx.state === "closed") return;

      const now = ctx.currentTime;
      const chordIndex = Math.floor(step / 16) % chordFrequencies.length;
      const currentChord = chordFrequencies[chordIndex];

      // Bass pad on bar start
      if (step % 8 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "sawtooth";
        bassOsc.frequency.setValueAtTime(currentChord[0] / 2, now);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);

        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 7.5);

        bassOsc.connect(filter);
        filter.connect(bassGain);
        bassGain.connect(destination);

        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 8);
      }

      // Arpeggiated tech synth
      const noteFreq = currentChord[step % currentChord.length];
      const arpOsc = ctx.createOscillator();
      const arpGain = ctx.createGain();
      arpOsc.type = "sine";
      arpOsc.frequency.setValueAtTime(noteFreq * 2, now);

      arpGain.gain.setValueAtTime(0.06, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

      arpOsc.connect(arpGain);
      arpGain.connect(destination);

      arpOsc.start(now);
      arpOsc.stop(now + stepDuration);

      // Sub drop / impact on key moments
      if (step === 0 || step === 32 || step === 64) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.35);

        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        kickOsc.connect(kickGain);
        kickGain.connect(destination);

        kickOsc.start(now);
        kickOsc.stop(now + 0.5);
      }

      step++;
      setTimeout(playStep, stepDuration * 1000);
    };

    playStep();
  };

  // Voiceover narration using browser SpeechSynthesis
  const speakCurrentScene = useCallback((sceneIndex: number) => {
    if (!enableVoiceover || isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const scene = SCENES[sceneIndex];
      if (!scene) return;
      const text = scene.narration[language] || scene.narration.en;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.98;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }, [enableVoiceover, isMuted, language, volume]);

  // Current active scene
  const currentSceneIndex = SCENES.findIndex(
    s => currentTime >= s.startTime && currentTime < s.endTime
  );
  const activeScene = SCENES[currentSceneIndex >= 0 ? currentSceneIndex : SCENES.length - 1];

  // Track previous scene to trigger voiceover on transition
  const prevSceneIdRef = useRef<number>(-1);
  useEffect(() => {
    if (activeScene && activeScene.id !== prevSceneIdRef.current && isPlaying) {
      prevSceneIdRef.current = activeScene.id;
      speakCurrentScene(activeScene.id - 1);
    }
  }, [activeScene, isPlaying, speakCurrentScene]);

  // Main playback timer loop
  useEffect(() => {
    let animId: number;
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const delta = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + delta * playbackSpeed;
          if (next >= TOTAL_DURATION) {
            return 0; // Loop or stop
          }
          return next;
        });
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  // High-Performance 1080p Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed master resolution 1920x1080 (1080p Full HD)
    const W = canvas.width;
    const H = canvas.height;

    const t = currentTime;

    // Clear frame
    ctx.fillStyle = "#0c0d0e";
    ctx.fillRect(0, 0, W, H);

    // ==========================================
    // SCENE 1: OPENING HOOK (0.0s - 5.5s)
    // ==========================================
    if (t < 5.5) {
      const sceneProgress = t / 5.5;

      // Draw background coffee farm sunrise with slow cinematic push-in (Ken Burns)
      const img = imagesRef.current.sunrise;
      if (img && img.complete) {
        const scale = 1.0 + sceneProgress * 0.08;
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -W / 2, -H / 2, W, H);
        ctx.restore();
      }

      // Atmospheric golden vignette & gradient
      const grad = ctx.createRadialGradient(W / 2, H * 0.35, 100, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, "rgba(255, 230, 160, 0.2)");
      grad.addColorStop(0.5, "rgba(20, 25, 20, 0.45)");
      grad.addColorStop(1, "rgba(10, 12, 10, 0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Floating golden mist & light particles
      for (let i = 0; i < 24; i++) {
        const px = ((i * 137.5 + t * 45) % W);
        const py = ((i * 83.2 - t * 30 + H) % H);
        const rad = (i % 5) + 2;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 200, 120, ${0.25 + 0.2 * Math.sin(t * 3 + i)})`;
        ctx.fill();
      }

      // Elegant Minimal Typography: Startup style (Apple/Stripe aesthetic)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Pill-free kicker
      ctx.fillStyle = "#E8C882";
      ctx.font = "600 24px 'JetBrains Mono', monospace";
      ctx.letterSpacing = "6px";
      const kickerAlpha = Math.min(1, Math.max(0, (t - 0.4) * 2));
      ctx.globalAlpha = kickerAlpha;
      ctx.fillText("BEARER OF TRUTH · GLOBAL COFFEE LEDGER", W / 2, H * 0.38);

      // Hero Hook text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 64px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const textAlpha = Math.min(1, Math.max(0, (t - 1.0) * 1.5));
      ctx.globalAlpha = textAlpha;
      ctx.fillText("What if every coffee bean", W / 2, H * 0.48);
      ctx.fillText("could tell its authentic story?", W / 2, H * 0.56);

      // Sub-kicker
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "400 22px -apple-system, sans-serif";
      const subAlpha = Math.min(1, Math.max(0, (t - 2.2) * 1.5));
      ctx.globalAlpha = subAlpha;
      ctx.fillText("From high-altitude Ethiopian shade canopies to your morning cup", W / 2, H * 0.65);
      ctx.globalAlpha = 1.0;
    }

    // ==========================================
    // SCENE 2: THE DILEMMA / PROBLEM (5.5s - 11.0s)
    // ==========================================
    else if (t >= 5.5 && t < 11.0) {
      const sceneProgress = (t - 5.5) / 5.5;

      // Dark moody shipping port image with slow push
      const img = imagesRef.current.problem;
      if (img && img.complete) {
        ctx.drawImage(img, 0, 0, W, H);
      }

      // Red digital glitch / dark gradient overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(10, 10, 15, 0.75)");
      grad.addColorStop(0.5, "rgba(20, 10, 10, 0.65)");
      grad.addColorStop(1, "rgba(15, 5, 5, 0.9)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Animated warning radar grid
      ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
      ctx.lineWidth = 1;
      const gridOffset = (t * 40) % 60;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x + gridOffset, 0);
        ctx.lineTo(x + gridOffset, H);
        ctx.stroke();
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Kicker
      ctx.fillStyle = "#F87171";
      ctx.font = "700 22px 'JetBrains Mono', monospace";
      ctx.fillText("THE HIDDEN CRISIS IN SPECIALTY COFFEE", W / 2, H * 0.28);

      // Headline
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 58px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("A Broken, Opaque Supply Chain", W / 2, H * 0.38);

      // 3 Warning Insight Cards (Stripe-like dark glass aesthetic)
      const cardW = 440;
      const cardH = 220;
      const cardY = H * 0.52;
      const cards = [
        {
          tag: "FRAUD & MISLABELING",
          stat: "60% Unverified",
          desc: "Origins and high-altitude claims frequently falsified or blended without audits."
        },
        {
          tag: "DISCONNECTED FARMERS",
          stat: "12M+ Smallholders",
          desc: "Producers lose up to 70% of specialty retail value to untracked intermediaries."
        },
        {
          tag: "PAPER RECORD FAILURE",
          stat: "Zero Cryptographic Proof",
          desc: "Manual paper manifests easily altered during shipping and terminal processing."
        }
      ];

      cards.forEach((c, idx) => {
        const cardX = (W / 2) + (idx - 1) * (cardW + 36) - cardW / 2;
        const enterDelay = 6.0 + idx * 0.6;
        const cardAlpha = Math.min(1, Math.max(0, (t - enterDelay) * 3));

        ctx.save();
        ctx.globalAlpha = cardAlpha;

        // Card background
        ctx.fillStyle = "rgba(25, 12, 12, 0.85)";
        ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, cardX, cardY, cardW, cardH, 16);
        ctx.fill();
        ctx.stroke();

        // Card Tag
        ctx.textAlign = "left";
        ctx.fillStyle = "#F87171";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.fillText(c.tag, cardX + 24, cardY + 40);

        // Card Stat
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "800 28px -apple-system, sans-serif";
        ctx.fillText(c.stat, cardX + 24, cardY + 84);

        // Card Desc
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "400 15px -apple-system, sans-serif";
        wrapText(ctx, c.desc, cardX + 24, cardY + 130, cardW - 48, 22);

        ctx.restore();
      });
    }

    // ==========================================
    // SCENE 3: THE SOLUTION / BLOCKCHAIN (11.0s - 21.0s)
    // ==========================================
    else if (t >= 11.0 && t < 21.0) {
      const sceneProgress = (t - 11.0) / 10.0;

      // High-tech holographic blockchain background
      const img = imagesRef.current.blockchain;
      if (img && img.complete) {
        ctx.drawImage(img, 0, 0, W, H);
      }

      // Tech cyan & gold dark vignette
      const grad = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * 0.8);
      grad.addColorStop(0, "rgba(5, 20, 15, 0.45)");
      grad.addColorStop(0.7, "rgba(8, 12, 16, 0.75)");
      grad.addColorStop(1, "rgba(5, 7, 10, 0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Platform Reveal Title
      ctx.fillStyle = "#C5A059";
      ctx.font = "700 20px 'JetBrains Mono', monospace";
      ctx.letterSpacing = "4px";
      ctx.fillText("INTRODUCING THE DECENTRALIZED STANDARD", W / 2, H * 0.16);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 62px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Coffee Traceability Blockchain", W / 2, H * 0.25);

      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "400 22px -apple-system, sans-serif";
      ctx.fillText("An immutable cryptographic ledger connecting every physical milestone", W / 2, H * 0.32);

      // 5 Interconnected Animated Blockchain Nodes across the screen
      const nodes = [
        { label: "1. FARM HARVEST", role: "Sidama Estate", sub: "Elev. 1,980m", color: "#3D5A40" },
        { label: "2. WET MILLING", role: "Aleta Wondo", sub: "Ferment 36h", color: "#2F4632" },
        { label: "3. DRY MILL & QC", role: "Addis Terminal", sub: "Score 88.5 SCA", color: "#C5A059" },
        { label: "4. GLOBAL EXPORT", role: "Mombasa Vessel", sub: "Container Sealed", color: "#1E3A8A" },
        { label: "5. CUPPING & CAFE", role: "Direct Consumer", sub: "Scan Verified", color: "#059669" }
      ];

      const startX = W * 0.14;
      const endX = W * 0.86;
      const nodeY = H * 0.58;

      // Connecting glowing blockchain path
      ctx.save();
      ctx.strokeStyle = "rgba(197, 160, 89, 0.4)";
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(startX, nodeY);
      ctx.lineTo(endX, nodeY);
      ctx.stroke();

      // Traveling data packet animation
      const packetPos = startX + ((t * 1.5) % 1) * (endX - startX);
      ctx.beginPath();
      ctx.arc(packetPos, nodeY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.shadowColor = "#F59E0B";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();

      // Render the nodes
      nodes.forEach((n, idx) => {
        const nx = startX + (idx / (nodes.length - 1)) * (endX - startX);
        const nodeActive = t >= 12.0 + idx * 1.4;

        ctx.save();
        // Outer pulsing ring
        if (nodeActive) {
          ctx.beginPath();
          ctx.arc(nx, nodeY, 36 + Math.sin(t * 5 + idx) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(197, 160, 89, 0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Inner node circle
        ctx.beginPath();
        ctx.arc(nx, nodeY, 28, 0, Math.PI * 2);
        ctx.fillStyle = nodeActive ? "#1B1B1B" : "#111827";
        ctx.strokeStyle = nodeActive ? "#C5A059" : "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        // Icon representation inside node
        ctx.fillStyle = nodeActive ? "#C5A059" : "rgba(255, 255, 255, 0.4)";
        ctx.font = "700 14px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`0${idx + 1}`, nx, nodeY);

        // Node labels below
        ctx.fillStyle = nodeActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.4)";
        ctx.font = "700 15px -apple-system, sans-serif";
        ctx.fillText(n.label, nx, nodeY + 54);

        ctx.fillStyle = nodeActive ? "#C5A059" : "rgba(255, 255, 255, 0.3)";
        ctx.font = "600 13px 'JetBrains Mono', monospace";
        ctx.fillText(n.role, nx, nodeY + 76);

        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.font = "400 12px -apple-system, sans-serif";
        ctx.fillText(n.sub, nx, nodeY + 98);

        ctx.restore();
      });

      // Bottom live cryptographic block ticker
      const blockNum = 14890 + Math.floor(t * 2);
      ctx.fillStyle = "rgba(18, 24, 20, 0.8)";
      ctx.strokeStyle = "rgba(197, 160, 89, 0.35)";
      roundRect(ctx, W / 2 - 380, H * 0.84, 760, 52, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#E8C882";
      ctx.font = "600 14px 'JetBrains Mono', monospace";
      ctx.fillText(
        `● LIVE LEDGER: BLOCK #${blockNum} | HASH: 0x${Math.sin(t * 10).toString(16).substring(2, 12)}...c89e | VERIFIED`,
        W / 2,
        H * 0.84 + 26
      );
    }

    // ==========================================
    // SCENE 4: FEATURES SHOWCASE (21.0s - 34.0s)
    // ==========================================
    else if (t >= 21.0 && t < 34.0) {
      const featTime = t - 21.0; // 0 to 13s

      // Background deep slate high-tech studio gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#0E1410");
      grad.addColorStop(0.5, "#141C18");
      grad.addColorStop(1, "#0A0D0B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Section Top Header
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#C5A059";
      ctx.font = "700 18px 'JetBrains Mono', monospace";
      ctx.letterSpacing = "4px";
      ctx.fillText("CORE PLATFORM CAPABILITIES", W / 2, H * 0.12);

      // 4 Distinct Feature Highlights based on time window
      // 21-24s: Feature 1 (GPS Elevation & Topography)
      // 24-27s: Feature 2 (Blockchain Audit & Smart Contracts)
      // 27-30s: Feature 3 (Consumer QR-Code Provenance)
      // 30-34s: Feature 4 (Fair-Trade Sustainability & Analytics)
      const subIdx = Math.min(3, Math.floor(featTime / 3.25));

      const featureCards = [
        {
          num: "01",
          title: "Real-Time GPS & Elevation Tracking",
          subtitle: "Precision Agroforestry Mapping (1,800m+ MASL)",
          bullets: [
            "Continuous coordinate telemetry for shade-grown micro-lots",
            "Automated harvest date and climatic zone registration",
            "EUDR zero-deforestation polygon verification"
          ],
          stat1: "1,980m",
          stat1Label: "Peak Elevation",
          stat2: "100%",
          stat2Label: "Canopy Preserved"
        },
        {
          num: "02",
          title: "Cryptographic Smart Audits",
          subtitle: "Immutable Fairtrade & Labor Compliance Ledger",
          bullets: [
            "SHA-256 tamper-proof block hashing prevents retroactive edits",
            "Zero child labor compliance independently certified",
            "Direct digital proof of environmental stewardship"
          ],
          stat1: "98/100",
          stat1Label: "Audit Score",
          stat2: "SHA-256",
          stat2Label: "Cipher Verified"
        },
        {
          num: "03",
          title: "Instant Consumer QR Code Verification",
          subtitle: "From Remote Farm to Coffee Cup in 2 Seconds",
          bullets: [
            "Dynamic QR seal printed on every export bag and retail bag",
            "Shoppers scan to view farmer portrait, harvest date, and wet mill",
            "Download official cryptographic PDF certificate of authenticity"
          ],
          stat1: "< 2 sec",
          stat1Label: "Scan Verification",
          stat2: "100%",
          stat2Label: "Consumer Trust"
        },
        {
          num: "04",
          title: "Fair-Trade Economics & Live Dashboard",
          subtitle: "Guaranteed Floor Pricing + Community Quality Premiums",
          bullets: [
            "Smallholders receive verified +$0.50/lb direct quality bonus",
            "SCA sensory radar attributes (88.5+ Specialty Grade)",
            "One-click CSV & JSON regulatory export for cooperatives"
          ],
          stat1: "+$0.50/lb",
          stat1Label: "Farmer Premium",
          stat2: "88.5 SCA",
          stat2Label: "Specialty Grade"
        }
      ];

      const curFeat = featureCards[subIdx];

      // Left Feature Detail Glass Card
      const cardW = W * 0.52;
      const cardH = H * 0.64;
      const cardX = W * 0.08;
      const cardY = H * 0.22;

      ctx.save();
      ctx.fillStyle = "rgba(22, 30, 25, 0.9)";
      ctx.strokeStyle = "rgba(197, 160, 89, 0.4)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, cardX, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      // Feature Number Pill-free
      ctx.textAlign = "left";
      ctx.fillStyle = "#C5A059";
      ctx.font = "800 28px 'JetBrains Mono', monospace";
      ctx.fillText(`FEATURE ${curFeat.num} / 04`, cardX + 40, cardY + 54);

      // Feature Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 38px -apple-system, sans-serif";
      ctx.fillText(curFeat.title, cardX + 40, cardY + 110);

      // Subtitle
      ctx.fillStyle = "#E8C882";
      ctx.font = "600 18px -apple-system, sans-serif";
      ctx.fillText(curFeat.subtitle, cardX + 40, cardY + 152);

      // Bullets
      curFeat.bullets.forEach((b, bIdx) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "400 17px -apple-system, sans-serif";
        ctx.fillText(`✓  ${b}`, cardX + 40, cardY + 215 + bIdx * 42);
      });

      // Quick Stats Footer in Card
      const statBoxY = cardY + cardH - 100;
      ctx.fillStyle = "rgba(35, 48, 38, 0.7)";
      ctx.strokeStyle = "rgba(197, 160, 89, 0.25)";
      roundRect(ctx, cardX + 40, statBoxY, cardW - 80, 72, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#C5A059";
      ctx.font = "800 24px 'JetBrains Mono', monospace";
      ctx.fillText(curFeat.stat1, cardX + 64, statBoxY + 36);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "500 12px sans-serif";
      ctx.fillText(curFeat.stat1Label, cardX + 64, statBoxY + 56);

      ctx.fillStyle = "#10B981";
      ctx.font = "800 24px 'JetBrains Mono', monospace";
      ctx.fillText(curFeat.stat2, cardX + 320, statBoxY + 36);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "500 12px sans-serif";
      ctx.fillText(curFeat.stat2Label, cardX + 320, statBoxY + 56);
      ctx.restore();

      // Right Interactive UI Visual Preview (simulating live platform HUD)
      const mockW = W * 0.32;
      const mockX = W * 0.62;

      ctx.save();
      ctx.fillStyle = "#111814";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      roundRect(ctx, mockX, cardY, mockW, cardH, 20);
      ctx.fill();
      ctx.stroke();

      // Window header bar
      ctx.fillStyle = "#1B241E";
      roundRect(ctx, mockX, cardY, mockW, 44, 20);
      ctx.fill();
      // Mac style dots
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.arc(mockX + 22, cardY + 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.arc(mockX + 38, cardY + 22, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#10B981";
      ctx.beginPath();
      ctx.arc(mockX + 54, cardY + 22, 6, 0, Math.PI * 2);
      ctx.fill();

      // Preview content based on active sub-feature
      if (subIdx === 0) {
        // Map elevation HUD preview
        ctx.fillStyle = "#E8C882";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.fillText("TERRAIN ELEVATION HUD", mockX + 80, cardY + 26);

        // Draw animated contour rings
        for (let r = 0; r < 4; r++) {
          ctx.beginPath();
          ctx.arc(mockX + mockW / 2, cardY + cardH / 2, 45 + r * 30 + Math.sin(t * 3) * 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(197, 160, 89, ${0.4 - r * 0.08})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.fillStyle = "#3D5A40";
        ctx.beginPath();
        ctx.arc(mockX + mockW / 2, cardY + cardH / 2, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 14px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("SIDAMA 1,980m", mockX + mockW / 2, cardY + cardH / 2 + 50);
      } else if (subIdx === 1) {
        // Blockchain transaction card
        ctx.fillStyle = "#10B981";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.fillText("IMMUTABLE AUDIT LEDGER", mockX + 80, cardY + 26);

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "700 16px -apple-system, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Batch #LOT-ETH-2026-AA03", mockX + 24, cardY + 90);

        ctx.fillStyle = "#C5A059";
        ctx.font = "600 13px 'JetBrains Mono', monospace";
        ctx.fillText("Audit: Fairtrade & Organic", mockX + 24, cardY + 120);
        ctx.fillText("Child Labor Free: 100% OK", mockX + 24, cardY + 150);
        ctx.fillText("Inspector: Simon Wolde Balango", mockX + 24, cardY + 180);
        ctx.fillText("Cryptographic Nonce: 284", mockX + 24, cardY + 210);

        // Verified Stamp
        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 2;
        roundRect(ctx, mockX + 24, cardY + 260, mockW - 48, 54, 8);
        ctx.stroke();
        ctx.fillStyle = "#10B981";
        ctx.font = "800 16px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText("✓ VERIFIED ON BLOCKCHAIN", mockX + mockW / 2, cardY + 292);
      } else if (subIdx === 2) {
        // Consumer smartphone QR preview
        ctx.fillStyle = "#E8C882";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.fillText("INSTANT SMARTPHONE QR", mockX + 80, cardY + 26);

        // Draw Stylized QR code box
        ctx.fillStyle = "#FFFFFF";
        roundRect(ctx, mockX + mockW / 2 - 70, cardY + 80, 140, 140, 12);
        ctx.fill();

        // QR inner pattern
        ctx.fillStyle = "#000000";
        roundRect(ctx, mockX + mockW / 2 - 55, cardY + 95, 36, 36, 4);
        ctx.fill();
        roundRect(ctx, mockX + mockW / 2 + 19, cardY + 95, 36, 36, 4);
        ctx.fill();
        roundRect(ctx, mockX + mockW / 2 - 55, cardY + 169, 36, 36, 4);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 16px sans-serif";
        ctx.fillText("Scan with Camera", mockX + mockW / 2, cardY + 260);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "400 13px sans-serif";
        ctx.fillText("Instant certificate retrieval", mockX + mockW / 2, cardY + 288);
      } else {
        // Analytics radar chart simulation
        ctx.fillStyle = "#C5A059";
        ctx.font = "700 13px 'JetBrains Mono', monospace";
        ctx.fillText("SCA SENSORY RADAR & METRICS", mockX + 80, cardY + 26);

        ctx.textAlign = "left";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 15px sans-serif";
        ctx.fillText("Cupping Score: 88.5 SCA", mockX + 24, cardY + 90);
        ctx.fillText("Base Price: $3.40 / lb", mockX + 24, cardY + 124);
        ctx.fillText("Fairtrade Premium: +$0.50 / lb", mockX + 24, cardY + 158);
        ctx.fillText("Moisture: 10.8% Certified", mockX + 24, cardY + 192);

        // Progress bar
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        roundRect(ctx, mockX + 24, cardY + 250, mockW - 48, 14, 7);
        ctx.fill();
        ctx.fillStyle = "#C5A059";
        roundRect(ctx, mockX + 24, cardY + 250, (mockW - 48) * 0.885, 14, 7);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "600 12px 'JetBrains Mono', monospace";
        ctx.fillText("Specialty Grade Threshold Met", mockX + 24, cardY + 288);
      }
      ctx.restore();
    }

    // ==========================================
    // SCENE 5: GLOBAL IMPACT (34.0s - 38.5s)
    // ==========================================
    else if (t >= 34.0 && t < 38.5) {
      const sceneProgress = (t - 34.0) / 4.5;

      // Smiling African farmer portrait image
      const img = imagesRef.current.harvest;
      if (img && img.complete) {
        ctx.drawImage(img, 0, 0, W, H);
      }

      // Warm cinematic overlay
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(20, 24, 20, 0.55)");
      grad.addColorStop(0.5, "rgba(15, 20, 15, 0.45)");
      grad.addColorStop(1, "rgba(10, 15, 12, 0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Kicker
      ctx.fillStyle = "#E8C882";
      ctx.font = "700 20px 'JetBrains Mono', monospace";
      ctx.letterSpacing = "4px";
      ctx.fillText("REAL WORLD SUSTAINABLE IMPACT", W / 2, H * 0.22);

      // Main Headline
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 60px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Empowering Farmers. Inspiring Consumers.", W / 2, H * 0.32);

      // 3 High-Impact Metric Pillars
      const stats = [
        { value: "12.5M+", label: "Smallholders Supported", sub: "Direct cooperative empowerment" },
        { value: "100%", label: "Fair Floor Pricing", sub: "No middlemen markdown" },
        { value: "0 Deforestation", label: "EUDR Certified", sub: "100% shade canopy preserved" }
      ];

      const boxW = 380;
      const boxH = 180;
      const boxY = H * 0.48;

      stats.forEach((s, sIdx) => {
        const boxX = W / 2 + (sIdx - 1) * (boxW + 40) - boxW / 2;

        ctx.save();
        ctx.fillStyle = "rgba(15, 25, 20, 0.85)";
        ctx.strokeStyle = "rgba(197, 160, 89, 0.45)";
        ctx.lineWidth = 1.5;
        roundRect(ctx, boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#10B981";
        ctx.font = "800 44px 'JetBrains Mono', monospace";
        ctx.fillText(s.value, boxX + boxW / 2, boxY + 60);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 20px -apple-system, sans-serif";
        ctx.fillText(s.label, boxX + boxW / 2, boxY + 110);

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.font = "400 14px -apple-system, sans-serif";
        ctx.fillText(s.sub, boxX + boxW / 2, boxY + 142);
        ctx.restore();
      });
    }

    // ==========================================
    // SCENE 6: CLOSING & CALL TO ACTION (38.5s - 42.0s)
    // ==========================================
    else {
      const sceneProgress = (t - 38.5) / 3.5;

      // Dark minimalist luxury startup finale
      const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.7);
      grad.addColorStop(0, "#1F2B22");
      grad.addColorStop(0.5, "#141D17");
      grad.addColorStop(1, "#0A0D0B");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Rotating holographic golden ring
      ctx.save();
      ctx.translate(W / 2, H * 0.32);
      ctx.rotate(t * 0.8);
      ctx.strokeStyle = "rgba(197, 160, 89, 0.35)";
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 75, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Center Platform Icon
      ctx.save();
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.32, 54, 0, Math.PI * 2);
      ctx.fillStyle = "#3D5A40";
      ctx.strokeStyle = "#C5A059";
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#C5A059";
      ctx.font = "700 36px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☕", W / 2, H * 0.32);
      ctx.restore();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Platform Name
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "800 58px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("Coffee Traceability Blockchain", W / 2, H * 0.50);

      // Brand Slogan
      ctx.fillStyle = "#C5A059";
      ctx.font = "700 24px 'JetBrains Mono', monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText("FROM FARM TO CUP. VERIFIED BY BLOCKCHAIN.", W / 2, H * 0.58);

      // Developer & Lead Architect attribution
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.font = "500 16px -apple-system, sans-serif";
      ctx.fillText("Platform Architecture & Development by Simon Wolde Balango", W / 2, H * 0.65);

      // Grand Call To Action Button Graphic
      const ctaW = 440;
      const ctaH = 68;
      const ctaX = W / 2 - ctaW / 2;
      const ctaY = H * 0.74;

      ctx.save();
      // Glowing button gradient
      const btnGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY);
      btnGrad.addColorStop(0, "#C5A059");
      btnGrad.addColorStop(1, "#E8C882");
      ctx.fillStyle = btnGrad;
      ctx.shadowColor = "rgba(197, 160, 89, 0.6)";
      ctx.shadowBlur = 24;
      roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 34);
      ctx.fill();

      ctx.fillStyle = "#111111";
      ctx.font = "800 22px -apple-system, sans-serif";
      ctx.fillText("Transform Coffee Transparency Today →", W / 2, ctaY + ctaH / 2);
      ctx.restore();

      // Bottom sub-kicker
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "400 13px 'JetBrains Mono', monospace";
      ctx.fillText("ORIGINA GLOBAL LEDGER · ETHIOPIA & WORLDWIDE COOPERATIVES · 2026", W / 2, H * 0.90);
    }

    // ==========================================
    // PERSISTENT CINEMATIC LETTERBOX & WATERMARK
    // ==========================================
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "700 13px 'JetBrains Mono', monospace";
    ctx.fillText("BEANTRACE GLOBAL · 4K 60FPS MASTER", 36, 32);

    ctx.textAlign = "right";
    const timeFormatted = `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
    ctx.fillText(`${timeFormatted} / 0:42.0`, W - 36, 32);

    // Active Scene Title on Top Center
    if (activeScene) {
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(197, 160, 89, 0.85)";
      ctx.font = "700 12px 'JetBrains Mono', monospace";
      ctx.fillText(`SCENE ${activeScene.id}/06: ${activeScene.title.toUpperCase()}`, W / 2, 32);
    }
  }, [currentTime, activeScene]);

  // Canvas Rounded Rectangle Helper
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Text wrap utility for canvas
  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
  }

  // Handle Play/Pause
  const togglePlay = () => {
    initAudio();
    setIsPlaying(prev => !prev);
  };

  // Handle Scrub
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    initAudio();
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  // Jump to specific scene
  const jumpToScene = (scene: VideoScene) => {
    initAudio();
    setCurrentTime(scene.startTime);
    setIsPlaying(true);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Export 1080p Video via MediaRecorder API
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initAudio();
    setIsExporting(true);
    setExportProgress(0);
    setCurrentTime(0);
    setIsPlaying(true);

    try {
      const stream = canvas.captureStream(60);

      // Attach audio stream if available
      if (audioContextRef.current && masterGainRef.current) {
        const dest = audioContextRef.current.createMediaStreamDestination();
        masterGainRef.current.connect(dest);
        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }

      // Check supported MIME type
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4"
      ];
      const selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 8000000 // 8 Mbps high quality
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const extension = selectedMime.includes("mp4") ? "mp4" : "webm";
        a.download = `Coffee_Traceability_Blockchain_Promo_1080p.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      recorder.start(100);

      // Track progress until end of video
      const checkInterval = setInterval(() => {
        setCurrentTime(t => {
          const pct = Math.min(100, Math.round((t / TOTAL_DURATION) * 100));
          setExportProgress(pct);
          if (t >= TOTAL_DURATION - 0.5) {
            clearInterval(checkInterval);
            recorder.stop();
          }
          return t;
        });
      }, 500);

    } catch (err: any) {
      console.error("Recording error:", err);
      alert("Video export error: " + (err.message || err));
      setIsExporting(false);
    }
  };

  // Dynamic aspect ratio container styling
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16] max-w-[420px]";
      case "1:1":
        return "aspect-square max-w-[680px]";
      case "16:9":
      default:
        return "aspect-video w-full max-w-5xl";
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white overflow-y-auto selection:bg-[#C5A059]/40"
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3D5A40] flex items-center justify-center text-[#C5A059] shadow-sm">
            <Coffee size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#C5A059]">
                PROMOTIONAL FILM STUDIO
              </span>
              <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">
                1080P MASTER
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              Coffee Traceability Blockchain · Official Commercial
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Aspect Ratio Switcher */}
          <div className="hidden sm:flex items-center bg-white/10 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setAspectRatio("16:9")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                aspectRatio === "16:9" ? "bg-[#C5A059] text-black font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              16:9 Widescreen
            </button>
            <button
              onClick={() => setAspectRatio("9:16")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                aspectRatio === "9:16" ? "bg-[#C5A059] text-black font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              9:16 Reel
            </button>
            <button
              onClick={() => setAspectRatio("1:1")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                aspectRatio === "1:1" ? "bg-[#C5A059] text-black font-bold" : "text-white/60 hover:text-white"
              }`}
            >
              1:1 Square
            </button>
          </div>

          {/* Export Video Button */}
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059] hover:bg-[#d4b068] text-black font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <FileVideo size={14} className="animate-spin" />
                <span>Exporting ({exportProgress}%)...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export 1080p Video</span>
              </>
            )}
          </button>

          {/* Close Player */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close Player"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Screen Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        <div className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black ${getAspectRatioClasses()}`}>
          {/* Master 1080p Canvas (1920x1080 internal resolution) */}
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Subtitles Overlay Bar */}
          <div className="absolute bottom-4 left-6 right-6 pointer-events-none text-center">
            <div className="inline-block px-5 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 max-w-2xl text-xs sm:text-sm font-medium text-white/95 leading-relaxed shadow-lg">
              {activeScene?.narration[language] || activeScene?.narration.en}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Master Playbar & Timeline Scrub Controls */}
      <div className="space-y-3 pt-3 border-t border-white/10 shrink-0">
        {/* Scrubbing Bar & Scene Marks */}
        <div className="space-y-1">
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max={TOTAL_DURATION}
              step="0.05"
              value={currentTime}
              onChange={handleScrub}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#C5A059]"
            />
          </div>

          {/* Scene Jump Bookmarks */}
          <div className="grid grid-cols-6 gap-1 text-[10px] font-mono text-white/60">
            {SCENES.map(s => {
              const isCurrent = currentTime >= s.startTime && currentTime < s.endTime;
              return (
                <button
                  key={s.id}
                  onClick={() => jumpToScene(s)}
                  className={`text-left p-1 rounded truncate transition-colors cursor-pointer ${
                    isCurrent ? "bg-[#C5A059]/20 text-[#E8C882] font-bold border-l-2 border-[#C5A059]" : "hover:text-white"
                  }`}
                >
                  <span className="block">{s.id}. {s.title}</span>
                  <span className="text-[8px] opacity-60">{s.startTime.toFixed(0)}s-{s.endTime.toFixed(0)}s</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Bottom Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-[#C5A059] text-black flex items-center justify-center font-bold hover:bg-[#d8b56f] transition-transform active:scale-95 cursor-pointer shadow-sm"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              onClick={() => {
                initAudio();
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
              title="Restart Video"
            >
              <RotateCcw size={16} />
            </button>

            <span className="font-mono text-sm font-semibold">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, "0")} / 0:42
            </span>

            {/* Audio Mute & Volume */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <button
                onClick={() => {
                  initAudio();
                  setIsMuted(prev => !prev);
                }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => {
                  initAudio();
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-white/20 rounded accent-[#C5A059] cursor-pointer"
              />
            </div>

            {/* Voiceover Speech Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-white/80 cursor-pointer pl-2 border-l border-white/10">
              <input
                type="checkbox"
                checked={enableVoiceover}
                onChange={e => setEnableVoiceover(e.target.checked)}
                className="rounded accent-[#C5A059]"
              />
              <span className="text-[11px] font-mono">Narrator AI Voice</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            {/* Subtitle Language Selector */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl font-mono text-[10px]">
              {(["en", "es", "fr", "it", "am"] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 rounded font-bold uppercase cursor-pointer transition-colors ${
                    language === lang ? "bg-[#C5A059] text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Speed Control */}
            <select
              value={playbackSpeed}
              onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-white/10 border border-white/15 text-white rounded-lg px-2 py-1 font-mono text-xs outline-none cursor-pointer"
            >
              <option value="0.75" className="bg-black">0.75x</option>
              <option value="1" className="bg-black">1.0x</option>
              <option value="1.25" className="bg-black">1.25x</option>
              <option value="1.5" className="bg-black">1.5x</option>
            </select>

            {/* Explore Live App CTA */}
            {onExplorePlatform && (
              <button
                onClick={onExplorePlatform}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#3D5A40] hover:bg-[#2F4632] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <span>Launch Live Platform</span>
                <ChevronRight size={14} />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
              title="Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
