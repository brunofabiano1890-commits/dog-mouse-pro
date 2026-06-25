"use client";

import { useState, useEffect } from "react";
import type { Game, KeyBind } from "@/lib/gameStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function launchGame(game: Game) {
  const pkg = game.packageName;
  if (!pkg) return;

  // market:// abre o app diretamente se instalado, ou a Play Store se não
  // É o deep link mais confiável no Android Chrome/WebView
  const marketUrl = `market://launch?id=${pkg}`;
  const playUrl   = `https://play.google.com/store/apps/details?id=${pkg}&launch=true`;

  // Tenta market:// (abre o app se instalado)
  const a = document.createElement("a");
  a.href = marketUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Fallback após 1.5s: se não abriu, vai para Play Store em nova aba
  setTimeout(() => {
    if (!document.hidden) {
      const b = document.createElement("a");
      b.href = playUrl;
      b.target = "_blank";
      b.rel = "noopener noreferrer";
      document.body.appendChild(b);
      b.click();
      document.body.removeChild(b);
    }
  }, 1500);
}

// Agrupa binds por categoria para exibir no HUD
const ACTION_LABELS: Record<string, string> = {
  move_fwd: "Frente", move_back: "Trás", move_left: "Esq", move_right: "Dir",
  jump: "Pular", crouch: "Agachar", prone: "Deitar", sprint: "Correr",
  shoot: "Atirar", ads: "Mirar", reload: "Reload", knife: "Faca",
  grenade: "Granada", interact: "Interagir", inventory: "Inventário", map: "Mapa",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  game: Game;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GameLauncher({ game, onClose }: Props) {
  const [phase, setPhase] = useState<"launching" | "hud">("launching");

  useEffect(() => {
    // Lança o jogo imediatamente
    launchGame(game);
    // Após 1.5s mostra o HUD de teclas
    const t = setTimeout(() => setPhase("hud"), 1500);
    return () => clearTimeout(t);
  }, [game]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto left-1/2 -translate-x-1/2 w-full"
      style={{ background: "#0A0A0A" }}
    >
      {phase === "launching" ? (
        <LaunchingScreen game={game} />
      ) : (
        <HudScreen game={game} onClose={onClose} />
      )}
    </div>
  );
}

// ─── LaunchingScreen ──────────────────────────────────────────────────────────

function LaunchingScreen({ game }: { game: Game }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8"
      style={{ background: `radial-gradient(circle at center, ${game.bgColor} 0%, #0A0A0A 70%)` }}>
      <div className="text-7xl">{game.icon}</div>
      <div className="text-center">
        <p className="text-white font-black text-2xl tracking-widest mb-2"
          style={{ fontFamily: "var(--font-orbitron)", color: game.color }}>
          {game.name.toUpperCase()}
        </p>
        <p className="text-xs font-mono text-[#555]">Abrindo o jogo...</p>
      </div>
      {/* Spinner */}
      <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: `${game.color} transparent transparent transparent` }} />
      <p className="text-xs font-mono text-center" style={{ color: game.color, opacity: 0.6 }}>
        Se o jogo não abrir automaticamente,{"\n"}verifique se está instalado
      </p>
    </div>
  );
}

// ─── HudScreen ────────────────────────────────────────────────────────────────

function HudScreen({ game, onClose }: { game: Game; onClose: () => void }) {
  const binds = game.binds;

  // Separa teclas de movimento, combate e outras
  const moveBinds  = binds.filter(b => ["move_fwd","move_back","move_left","move_right","jump","crouch","prone","sprint"].includes(b.action));
  const combatBinds = binds.filter(b => ["shoot","ads","reload","knife","grenade"].includes(b.action));
  const otherBinds  = binds.filter(b => !moveBinds.includes(b) && !combatBinds.includes(b));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-10 pb-3 flex items-center gap-3 border-b"
        style={{ background: `linear-gradient(135deg, ${game.bgColor}, #0A0A0A)`, borderColor: `${game.color}40` }}>
        <span className="text-3xl">{game.icon}</span>
        <div className="flex-1">
          <p className="font-black text-white text-base" style={{ fontFamily: "var(--font-orbitron)" }}>
            {game.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: game.color }} />
            <span className="text-xs font-mono" style={{ color: game.color }}>ATIVO — {binds.length} teclas mapeadas</span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#555] hover:text-white text-base">
          ✕
        </button>
      </div>

      {/* Key HUD */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4">

        {/* Tip */}
        <div className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: `${game.color}10`, border: `1px solid ${game.color}30` }}>
          <span className="text-xl">🎮</span>
          <p className="text-xs font-mono" style={{ color: game.color }}>
            O jogo foi aberto. Use as teclas abaixo no mobilador para jogar.
          </p>
        </div>

        <BindGroup title="MOVIMENTAÇÃO" icon="🏃" binds={moveBinds} color={game.color} />
        <BindGroup title="COMBATE" icon="🔫" binds={combatBinds} color={game.color} />
        {otherBinds.length > 0 && (
          <BindGroup title="OUTROS" icon="🎒" binds={otherBinds} color={game.color} />
        )}

        {/* Reopen button */}
        <button
          onClick={() => launchGame(game)}
          className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-orbitron)",
            backgroundColor: game.color,
            color: "#0A0A0A",
            boxShadow: `0 0 20px ${game.color}50`,
          }}>
          ▶ ABRIR {game.name.toUpperCase()} NOVAMENTE
        </button>
      </div>
    </div>
  );
}

// ─── BindGroup ────────────────────────────────────────────────────────────────

function BindGroup({ title, icon, binds, color }: { title: string; icon: string; binds: KeyBind[]; color: string }) {
  if (binds.length === 0) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-[#1a1a1a]">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0D0D0D]">
        <span>{icon}</span>
        <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "var(--font-orbitron)", color }}>
          {title}
        </span>
      </div>
      <div className="bg-[#0A0A0A] grid grid-cols-2 divide-x divide-y divide-[#111]">
        {binds.map((bind) => (
          <div key={bind.action} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-mono text-[#666]">
              {ACTION_LABELS[bind.action] ?? bind.action}
            </span>
            <span className="text-xs font-black px-2 py-1 rounded"
              style={{
                fontFamily: "var(--font-orbitron)",
                fontSize: "10px",
                backgroundColor: `${bind.color}20`,
                color: bind.color,
                border: `1px solid ${bind.color}50`,
              }}>
              {bind.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
