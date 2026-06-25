"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Shield,
  Target,
  Settings,
  Power,
  Star,
  Calendar,
  User,
  Home,
  Zap,
  Layout,
  Gamepad2,
} from "lucide-react";
import AntiBanPanel from "./AntiBanPanel";
import MouseSettings from "./MouseSettings";
import KeyMapper from "./KeyMapper";
import GameLibrary from "./GameLibrary";
import HudMapper from "./HudMapper";
import QuickKeyButton from "./QuickKeyButton";
import { useGameStore } from "@/lib/gameStore";

interface ActivationData {
  plan: string;
  expiry: string;
  user: string;
  activatedAt: string;
}

interface Props {
  activation: ActivationData;
  onLogout: () => void;
}

type Tab = "home" | "games" | "hud" | "antiban" | "settings";

export default function Dashboard({ activation, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [masterOn, setMasterOn] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [quickKeys, setQuickKeys] = useState<{key: string; label: string}[]>([]);
  const { games, activeGameId } = useGameStore();

  const handleAddQuickKey = (key: string, label: string) => {
    setQuickKeys((prev) => {
      if (prev.find((k) => k.key === key)) return prev;
      return [...prev, { key, label }];
    });
  };

  const handleOpenGames = () => {
    setActiveTab("games");
  };

  const planColor =
    activation.plan === "MASTER"
      ? "#FFB800"
      : activation.plan === "VIP" || activation.plan === "Premium"
      ? "#FFB800"
      : activation.plan === "Pro"
      ? "#00FF41"
      : "#888";

  const expiryDate = new Date(activation.expiry).toLocaleDateString("pt-BR");
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(activation.expiry).getTime() - Date.now()) / 86400000)
  );

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "home",     label: "INÍCIO",  icon: Home },
    { id: "games",    label: "JOGOS",   icon: Gamepad2 },
    { id: "hud",      label: "HUD",     icon: Layout },
    { id: "antiban",  label: "BAN",     icon: Shield },
    { id: "settings", label: "AJUSTES", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <div className="grid-bg border-b border-[#00FF41]/20 px-4 pt-10 pb-3 sticky top-0 z-20 bg-[#0A0A0A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#00FF41]/40">
              <Image src="/dog-profile.png" alt="Dog Mouse Pro" fill className="object-cover" />
            </div>
            <div>
              <h1
                className="text-white font-black text-sm tracking-wider leading-none"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                DOG MOUSE <span className="text-[#00FF41]">PRO</span>
              </h1>
              <p className="text-[#444] text-xs font-mono">v3.0.1</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Master toggle */}
            <button
              onClick={() => setMasterOn(!masterOn)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                fontFamily: "var(--font-orbitron)",
                backgroundColor: masterOn ? "#00FF41" : "#1a1a1a",
                color: masterOn ? "#0A0A0A" : "#444",
                boxShadow: masterOn ? "0 0 12px #00FF41" : "none",
                border: `1px solid ${masterOn ? "#00FF41" : "#333"}`,
              }}
            >
              <Power size={11} />
              {masterOn ? "ON" : "OFF"}
            </button>

            <button onClick={() => setShowProfile(!showProfile)}>
              <div className="w-8 h-8 rounded-full border border-[#444] flex items-center justify-center bg-[#111]">
                <User size={14} className="text-[#888]" />
              </div>
            </button>
          </div>
        </div>

        {/* Profile dropdown */}
        {showProfile && (
          <div className="mt-3 bg-[#111] border border-[#00FF41]/20 rounded-lg p-3 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#00FF41]/40">
                <Image src="/dog-logo.png" alt="logo" fill className="object-contain" />
              </div>
              <div>
                <p className="text-white text-sm font-mono font-bold">{activation.user}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} style={{ color: planColor }} />
                  <span className="text-xs font-bold" style={{ color: planColor, fontFamily: "var(--font-orbitron)" }}>
                    {activation.plan.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-[#0D0D0D] rounded p-2 text-center">
                <Calendar size={12} className="text-[#555] mx-auto mb-1" />
                <p className="text-xs font-mono text-white">{expiryDate}</p>
                <p className="text-xs font-mono text-[#444]">Expira em</p>
              </div>
              <div className="bg-[#0D0D0D] rounded p-2 text-center">
                <Zap size={12} className="text-[#FFB800] mx-auto mb-1" />
                <p className="text-xs font-mono font-bold" style={{ color: daysLeft < 30 ? "#FF0040" : "#00FF41" }}>
                  {daysLeft}d
                </p>
                <p className="text-xs font-mono text-[#444]">Dias restantes</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full py-2 border border-[#FF0040]/30 text-[#FF0040] text-xs font-mono rounded hover:bg-[#FF0040]/10 transition-all"
            >
              SAIR / TROCAR CHAVE
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {activeTab === "home"     && <HomeTab masterOn={masterOn} setMasterOn={setMasterOn} activation={activation} planColor={planColor} daysLeft={daysLeft} onOpenGames={handleOpenGames} quickKeys={quickKeys} onRemoveQuickKey={(k) => setQuickKeys((p) => p.filter((x) => x.key !== k))} hasGames={games.length > 0} activeGameName={games.find(g => g.id === activeGameId)?.name} />}
        {activeTab === "games"    && <GameLibrary />}
        {activeTab === "hud"      && <HudMapper />}
        {activeTab === "antiban"  && <AntiBanPanel />}
        {activeTab === "settings" && <SettingsTab onLogout={onLogout} />}
      </div>

      {/* Quick Key FAB — visible on all tabs */}
      <QuickKeyButton onAddKey={handleAddQuickKey} />

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0A0A0A] border-t border-[#00FF41]/20 px-2 py-2 z-20">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive ? "#00FF41/10" : "transparent",
                  background: isActive ? "rgba(0,255,65,0.08)" : "transparent",
                }}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? "#00FF41" : "#444" }}
                />
                <span
                  className="text-xs font-bold"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    fontSize: "8px",
                    color: isActive ? "#00FF41" : "#444",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HomeTab({
  masterOn,
  setMasterOn,
  activation,
  planColor,
  daysLeft,
  onOpenGames,
  quickKeys,
  onRemoveQuickKey,
  hasGames,
  activeGameName,
}: {
  masterOn: boolean;
  setMasterOn: (v: boolean) => void;
  activation: ActivationData;
  planColor: string;
  daysLeft: number;
  onOpenGames: () => void;
  quickKeys: { key: string; label: string }[];
  onRemoveQuickKey: (key: string) => void;
  hasGames: boolean;
  activeGameName?: string;
}) {
  const stats = [
    { label: "PRECISÃO", value: "94%", color: "#00FF41" },
    { label: "KD MÉDIO", value: "4.2", color: "#FFB800" },
    { label: "WIN RATE", value: "71%", color: "#00BFFF" },
    { label: "RANK", value: "TOP 1%", color: "#BF00FF" },
  ];

  const logs = [
    "Sistema iniciado com sucesso",
    "Anti-ban ativo — proteção máxima",
    "Fingerprint randomizado",
    "Configuração carregada",
    "Conexão verificada OK",
  ];

  return (
    <div className="space-y-4">
      {/* Big toggle */}
      <div
        className="rounded-2xl p-6 text-center relative overflow-hidden"
        style={{
          background: masterOn
            ? "radial-gradient(circle at center, rgba(0,255,65,0.15) 0%, #0D0D0D 70%)"
            : "#0D0D0D",
          border: `1px solid ${masterOn ? "#00FF41" : "#1a1a1a"}`,
          boxShadow: masterOn ? "0 0 30px rgba(0,255,65,0.2)" : "none",
        }}
      >
        <button
          onClick={() => setMasterOn(!masterOn)}
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300 active:scale-95"
          style={{
            background: masterOn
              ? "radial-gradient(circle, #00FF41, #00cc33)"
              : "#1a1a1a",
            border: `3px solid ${masterOn ? "#00FF41" : "#333"}`,
            boxShadow: masterOn
              ? "0 0 20px #00FF41, 0 0 50px rgba(0,255,65,0.3)"
              : "none",
          }}
        >
          <Power size={36} style={{ color: masterOn ? "#0A0A0A" : "#444" }} />
        </button>
        <p
          className="font-black text-lg tracking-widest mb-1"
          style={{
            fontFamily: "var(--font-orbitron)",
            color: masterOn ? "#00FF41" : "#444",
          }}
        >
          {masterOn ? "ATIVO" : "INATIVO"}
        </p>
        <p className="text-xs font-mono text-[#555]">
          {masterOn ? "Dog Mouse Pro está funcionando" : "Toque para ativar"}
        </p>
      </div>

      {/* License badge */}
      {activation.plan === "MASTER" ? (
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ background: "linear-gradient(135deg, rgba(255,184,0,0.12), rgba(255,100,0,0.06))", border: "1px solid rgba(255,184,0,0.5)", boxShadow: "0 0 20px rgba(255,184,0,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <span className="text-sm font-black text-[#FFB800] block" style={{ fontFamily: "var(--font-orbitron)" }}>
                MASTER — DONO DO APP
              </span>
              <span className="text-xs font-mono text-[#FFB800]/60">Acesso vitalício • Tempo infinito</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#FFB800] font-mono">∞</span>
        </div>
      ) : (
        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ background: `${planColor}10`, border: `1px solid ${planColor}30` }}
        >
          <div className="flex items-center gap-2">
            <Star size={14} style={{ color: planColor }} />
            <span className="text-sm font-black" style={{ fontFamily: "var(--font-orbitron)", color: planColor }}>
              {activation.plan.toUpperCase()} PLAN
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: daysLeft < 30 ? "#FF0040" : "#555" }}>
            {daysLeft} dias
          </span>
        </div>
      )}

      {/* Open Game button */}
      <button
        onClick={onOpenGames}
        className="w-full py-4 rounded-xl font-black text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
        style={{
          fontFamily: "var(--font-orbitron)",
          background: activeGameName
            ? "linear-gradient(135deg, rgba(0,255,65,0.2), rgba(0,191,255,0.1))"
            : "linear-gradient(135deg, rgba(0,255,65,0.1), rgba(0,191,255,0.05))",
          border: `1px solid ${activeGameName ? "rgba(0,255,65,0.6)" : "rgba(0,255,65,0.3)"}`,
          color: "#00FF41",
          boxShadow: activeGameName ? "0 0 20px rgba(0,255,65,0.2)" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <Gamepad2 size={18} />
          <span>🎮 {activeGameName ? `JOGAR: ${activeGameName.toUpperCase()}` : "ABRIR JOGO"}</span>
        </div>
        <span className="text-xs font-mono font-normal" style={{ color: "#00FF41", opacity: 0.6 }}>
          {hasGames ? (activeGameName ? "jogo ativo — toque para configurar" : "toque para selecionar jogo") : "toque para adicionar seu primeiro jogo"}
        </span>
      </button>

      {/* Quick key strip */}
      {quickKeys.length > 0 && (
        <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-3">
          <p className="text-xs font-mono text-[#555] tracking-widest mb-2">TECLAS ADICIONADAS</p>
          <div className="flex flex-wrap gap-1.5">
            {quickKeys.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onRemoveQuickKey(key)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#00FF41]/30 bg-[#00FF41]/8 text-[#00FF41] text-xs font-mono hover:border-[#FF0040]/50 hover:text-[#FF0040] transition-all group"
              >
                <span className="font-bold">{key}</span>
                <span className="text-[#444] group-hover:text-[#FF0040] transition-colors" style={{ fontSize: "9px" }}>{label}</span>
                <span className="text-[#333] group-hover:text-[#FF0040] transition-colors ml-0.5">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-3">
            <p
              className="text-xl font-black mb-0.5"
              style={{ fontFamily: "var(--font-orbitron)", color }}
            >
              {value}
            </p>
            <p className="text-xs font-mono text-[#444]">{label}</p>
          </div>
        ))}
      </div>

      {/* Activity log */}
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-3">
        <p className="text-xs font-mono text-[#555] tracking-widest mb-3">LOG DE ATIVIDADE</p>
        <div className="space-y-1.5">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FF41] flex-shrink-0" />
              <span className="text-xs font-mono text-[#666]">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ onLogout }: { onLogout: () => void }) {
  const [notif, setNotif] = useState(true);
  const [darkMode] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [telemetry, setTelemetry] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<boolean>(false);

  // Capture PWA install event
  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      (window as unknown as Record<string, unknown>)._pwaPrompt = e;
      setInstallPrompt(true);
    });
  }

  const handleInstall = () => {
    const prompt = (window as unknown as Record<string, unknown>)._pwaPrompt as { prompt?: () => void } | undefined;
    prompt?.prompt?.();
  };

  const toggleStyle = (on: boolean) => ({
    backgroundColor: on ? "#00FF41" : "#1a1a1a",
    boxShadow: on ? "0 0 8px #00FF41" : "none",
    border: `1px solid ${on ? "#00FF41" : "#333"}`,
  });

  const items = [
    { label: "Notificações", desc: "Alertas de proteção e status", on: notif, set: setNotif },
    { label: "Modo Escuro", desc: "Tema dark (sempre ativo)", on: darkMode, set: () => {} },
    { label: "Iniciar Automático", desc: "Ativar ao abrir o app", on: autoStart, set: setAutoStart },
    { label: "Telemetria", desc: "Dados anônimos de melhoria", on: telemetry, set: setTelemetry },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg overflow-hidden">
        {items.map(({ label, desc, on, set }, i) => (
          <div
            key={label}
            className={`flex items-center justify-between px-4 py-3 ${i < items.length - 1 ? "border-b border-[#1a1a1a]" : ""}`}
          >
            <div>
              <p className="text-sm text-white font-mono">{label}</p>
              <p className="text-xs text-[#444] font-mono">{desc}</p>
            </div>
            <button
              onClick={() => set(!on)}
              className="flex-shrink-0 w-11 h-6 rounded-full relative transition-all"
              style={toggleStyle(on)}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-[#0A0A0A] transition-all duration-200"
                style={{ left: on ? "calc(100% - 1.35rem)" : "2px" }}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-4 text-center">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Image src="/dog-logo.png" alt="logo" fill className="object-contain" />
        </div>
        <p className="text-white font-bold text-sm font-mono mb-1">Dog Mouse Pro</p>
        <p className="text-[#444] text-xs font-mono">Versão 3.0.1 — Build 2024.12</p>
        <p className="text-[#00FF41]/40 text-xs font-mono mt-1">© 2024 Dog Mouse Team</p>
      </div>

      {/* Install as APK / PWA */}
      <div className="bg-[#00FF41]/5 border border-[#00FF41]/30 rounded-lg p-4">
        <p className="text-[#00FF41] text-xs font-bold tracking-widest mb-1" style={{ fontFamily: "var(--font-orbitron)" }}>
          📲 INSTALAR COMO APP
        </p>
        <p className="text-[#555] text-xs font-mono mb-3">
          Instale o Dog Mouse Pro na tela inicial do seu Android — funciona como APK, sem navegador.
        </p>
        <ol className="text-xs font-mono text-[#444] space-y-1 mb-3 list-decimal list-inside">
          <li>Abra no Chrome no Android</li>
          <li>Toque nos 3 pontos (⋮) no canto</li>
          <li>Selecione "Adicionar à tela inicial"</li>
          <li>Confirme — ícone aparece na home!</li>
        </ol>
        {installPrompt && (
          <button
            onClick={handleInstall}
            className="w-full py-2.5 rounded font-bold text-sm transition-all active:scale-95"
            style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "#00FF41", color: "#0A0A0A" }}
          >
            INSTALAR AGORA
          </button>
        )}
      </div>

      {/* Admin panel link */}
      <a
        href="/admin"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 border border-[#FFB800]/30 text-[#FFB800]/70 text-sm font-mono rounded flex items-center justify-center gap-2 hover:text-[#FFB800] hover:border-[#FFB800]/60 hover:bg-[#FFB800]/5 transition-all"
      >
        👑 PAINEL ADMIN — GERAR CHAVES
      </a>

      <button
        onClick={onLogout}
        className="w-full py-3 border border-[#FF0040]/30 text-[#FF0040] text-sm font-mono rounded hover:bg-[#FF0040]/10 transition-all"
      >
        SAIR / TROCAR CHAVE
      </button>
    </div>
  );
}
