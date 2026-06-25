"use client";

import { useState } from "react";
import { Plus, Trash2, Check, Search } from "lucide-react";
import { useGameStore, GAME_TEMPLATES, type Game } from "@/lib/gameStore";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GameLibrary() {
  const { games, activeGameId, setActiveGame, removeGame } = useGameStore();
  const [showAdd, setShowAdd] = useState(false);
  const [justActivated, setJustActivated] = useState<string | null>(null);

  const handleActivate = (id: string) => {
    setActiveGame(id);
    setJustActivated(id);
    setTimeout(() => setJustActivated(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-[#555] tracking-widest">SELECIONE O JOGO</p>
          <p className="text-xs font-mono text-[#333]">{games.length} jogo{games.length !== 1 ? "s" : ""} adicionado{games.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all active:scale-95"
          style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "rgba(0,255,65,0.12)", color: "#00FF41", border: "1px solid rgba(0,255,65,0.4)" }}
        >
          <Plus size={12} /> ADICIONAR
        </button>
      </div>

      {/* Game list */}
      {games.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="space-y-2">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isActive={game.id === activeGameId}
              justActivated={justActivated === game.id}
              onSelect={() => handleActivate(game.id)}
              onRemove={() => removeGame(game.id)}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && <AddGameModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}



// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#111] border border-[#222] flex items-center justify-center mb-4 text-3xl">
        🎮
      </div>
      <p className="text-white font-bold font-mono mb-1">Nenhum jogo adicionado</p>
      <p className="text-[#444] text-xs font-mono mb-6">Adicione seus jogos e configure as teclas</p>
      <button
        onClick={onAdd}
        className="px-6 py-3 rounded text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
        style={{
          fontFamily: "var(--font-orbitron)",
          backgroundColor: "rgba(0,255,65,0.12)",
          color: "#00FF41",
          border: "1px solid rgba(0,255,65,0.4)",
        }}
      >
        <Plus size={12} />
        ADICIONAR PRIMEIRO JOGO
      </button>
    </div>
  );
}

// ─── AddGameModal ─────────────────────────────────────────────────────────────

function AddGameModal({ onClose }: { onClose: () => void }) {
  const { addGame, games } = useGameStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [step, setStep] = useState<"pick" | "custom">("pick");
  const [added, setAdded] = useState(false);

  // Filter out already-added games
  const addedNames = games.map((g) => g.name);
  const filtered = GAME_TEMPLATES.filter(
    (t) =>
      !addedNames.includes(t.name) &&
      (search === "" || t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.genre.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = () => {
    const template = selected === "__custom__"
      ? GAME_TEMPLATES[0] // base binds for custom
      : GAME_TEMPLATES.find((t) => t.shortName === selected);
    if (!template) return;
    const name = selected === "__custom__" ? (customName.trim() || "Meu Jogo") : template.name;
    addGame({
      id: `game_${Date.now()}`,
      name,
      shortName: selected === "__custom__" ? name.slice(0, 4).toUpperCase() : template.shortName,
      genre: template.genre,
      color: template.color,
      bgColor: template.bgColor,
      icon: template.icon,
      binds: [...template.binds],
    });
    setAdded(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-t-2xl bg-[#0D0D0D] border-t border-x border-[#00FF41]/20 overflow-hidden"
        style={{ maxHeight: "85vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#333]" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <Gamepad2 size={16} className="text-[#00FF41]" />
            <span className="font-bold text-sm text-white" style={{ fontFamily: "var(--font-orbitron)" }}>
              ADICIONAR JOGO
            </span>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 100px)" }}>
          {added ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#00FF41]/10 border border-[#00FF41] flex items-center justify-center">
                <Check size={28} className="text-[#00FF41]" />
              </div>
              <p className="text-[#00FF41] font-bold font-mono text-sm">Jogo adicionado!</p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar jogo..."
                  className="w-full bg-[#111] border border-[#222] rounded pl-8 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-[#333] focus:outline-none focus:border-[#00FF41]/50"
                />
              </div>

              {/* Template list */}
              <div className="space-y-2 mb-4">
                {filtered.map((t) => (
                  <button
                    key={t.shortName}
                    onClick={() => setSelected(t.shortName)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg transition-all active:scale-98"
                    style={{
                      background: selected === t.shortName
                        ? `linear-gradient(135deg, ${t.bgColor}90, #111)`
                        : "#111",
                      border: `1px solid ${selected === t.shortName ? t.color + "80" : "#1a1a1a"}`,
                      boxShadow: selected === t.shortName ? `0 0 10px ${t.color}20` : "none",
                    }}
                  >
                    <span className="text-2xl w-10 text-center flex-shrink-0">{t.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-bold font-mono">{t.name}</p>
                      <p className="text-xs font-mono text-[#555]">{t.genre} • {t.binds.length} teclas pré-mapeadas</p>
                    </div>
                    {selected === t.shortName && (
                      <Check size={14} style={{ color: t.color }} />
                    )}
                  </button>
                ))}

                {filtered.length === 0 && search && (
                  <p className="text-center text-xs font-mono text-[#333] py-4">Nenhum jogo encontrado</p>
                )}

                {/* Custom option */}
                <button
                  onClick={() => { setSelected("__custom__"); setStep("custom"); }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{
                    background: selected === "__custom__" ? "rgba(191,0,255,0.08)" : "#111",
                    border: `1px solid ${selected === "__custom__" ? "#BF00FF80" : "#1a1a1a"}`,
                  }}
                >
                  <span className="text-2xl w-10 text-center">✏️</span>
                  <div className="text-left flex-1">
                    <p className="text-white text-sm font-bold font-mono">Jogo Personalizado</p>
                    <p className="text-xs font-mono text-[#555]">Adicione qualquer jogo com nome próprio</p>
                  </div>
                  {selected === "__custom__" && <Check size={14} className="text-[#BF00FF]" />}
                </button>
              </div>

              {/* Custom name input */}
              {selected === "__custom__" && (
                <div className="mb-4">
                  <label className="text-xs font-mono text-[#555] tracking-widest mb-2 block">NOME DO JOGO</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Minecraft, Roblox..."
                    className="w-full bg-[#111] border border-[#BF00FF]/30 rounded px-3 py-2.5 text-sm font-mono text-white placeholder:text-[#333] focus:outline-none focus:border-[#BF00FF]/70"
                  />
                </div>
              )}

              {/* Confirm */}
              <button
                onClick={handleAdd}
                disabled={!selected || (selected === "__custom__" && !customName.trim())}
                className="w-full py-3.5 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "var(--font-orbitron)",
                  backgroundColor: selected ? "#00FF41" : "#1a1a1a",
                  color: selected ? "#0A0A0A" : "#333",
                }}
              >
                <Plus size={14} />
                ADICIONAR JOGO
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GameCard ─────────────────────────────────────────────────────────────────

function GameCard({
  game, isActive, justActivated, onSelect, onRemove,
}: {
  game: Game;
  isActive: boolean;
  justActivated: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border: `2px solid ${isActive ? game.color : "#1a1a1a"}`,
        boxShadow: isActive ? `0 0 18px ${game.color}35` : "none",
      }}
    >
      <div
        className="flex items-center gap-3 p-4 cursor-pointer active:scale-[0.97] transition-all"
        style={{ background: isActive ? `linear-gradient(135deg, ${game.bgColor}, #0D0D0D)` : "#0D0D0D" }}
        onClick={() => { if (!confirm) onSelect(); }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl relative"
          style={{ backgroundColor: `${game.color}18`, border: `1px solid ${game.color}40` }}
        >
          {game.icon}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: game.color }}>
              <Check size={10} color="#000" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
            {game.name}
          </p>
          <p className="text-xs font-mono text-[#555]">{game.genre} • {game.binds.length} teclas</p>
          <div className="mt-1">
            {justActivated ? (
              <span className="text-xs font-bold font-mono" style={{ color: game.color }}>✅ ATIVADO!</span>
            ) : isActive ? (
              <span className="text-xs font-bold font-mono animate-pulse" style={{ color: game.color }}>● ATIVO AGORA</span>
            ) : (
              <span className="text-xs font-mono text-[#444]">toque para selecionar</span>
            )}
          </div>
        </div>

        {/* Delete */}
        <div className="flex-shrink-0">
          {confirm ? (
            <div className="flex flex-col gap-1">
              <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="px-2 py-1 rounded text-xs font-mono text-[#FF0040] border border-[#FF0040]/40">SIM</button>
              <button onClick={(e) => { e.stopPropagation(); setConfirm(false); }}
                className="px-2 py-1 rounded text-xs font-mono text-[#555] border border-[#333]">NÃO</button>
            </div>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setConfirm(true); }}
              className="w-8 h-8 rounded flex items-center justify-center bg-[#111] border border-[#222] text-[#333] hover:text-[#FF0040] hover:border-[#FF0040]/40 transition-all">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
