"use client";

import { useState } from "react";
import { Plus, Trash2, Play, Gamepad2, ChevronRight, X, Check, Search } from "lucide-react";
import { useGameStore, GAME_TEMPLATES, type Game } from "@/lib/gameStore";
import KeyMapper from "./KeyMapper";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GameLibrary() {
  const { games, activeGameId, setActiveGame, removeGame } = useGameStore();
  const [showAdd, setShowAdd] = useState(false);
  const [openGame, setOpenGame] = useState<string | null>(null);

  // If a game is open in mapper view
  if (openGame) {
    const game = games.find((g) => g.id === openGame);
    if (game) {
      return (
        <GameMapperView
          game={game}
          onBack={() => setOpenGame(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-[#555] tracking-widest">BIBLIOTECA DE JOGOS</p>
          <p className="text-xs font-mono text-[#333]">{games.length} jogo{games.length !== 1 ? "s" : ""} adicionado{games.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-orbitron)",
            backgroundColor: "rgba(0,255,65,0.12)",
            color: "#00FF41",
            border: "1px solid rgba(0,255,65,0.4)",
          }}
        >
          <Plus size={12} />
          ADICIONAR
        </button>
      </div>

      {/* Active game banner */}
      {activeGameId && (() => {
        const ag = games.find((g) => g.id === activeGameId);
        if (!ag) return null;
        return (
          <ActiveBanner game={ag} onOpen={() => setOpenGame(ag.id)} onDeactivate={() => setActiveGame(null)} />
        );
      })()}

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
              onActivate={() => { setActiveGame(game.id); setOpenGame(game.id); }}
              onOpen={() => setOpenGame(game.id)}
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

// ─── ActiveBanner ─────────────────────────────────────────────────────────────

function ActiveBanner({ game, onOpen, onDeactivate }: { game: Game; onOpen: () => void; onDeactivate: () => void }) {
  return (
    <div
      className="rounded-lg p-3 flex items-center gap-3 cursor-pointer active:scale-95 transition-all"
      style={{
        background: `linear-gradient(135deg, ${game.bgColor}, #0A0A0A)`,
        border: `1px solid ${game.color}60`,
        boxShadow: `0 0 20px ${game.color}20`,
      }}
      onClick={onOpen}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ backgroundColor: `${game.color}20`, border: `1px solid ${game.color}40` }}
      >
        {game.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: game.color }} />
          <span className="text-xs font-mono text-[#555]">ATIVO AGORA</span>
        </div>
        <p className="font-bold text-sm text-white truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
          {game.name}
        </p>
        <p className="text-xs font-mono" style={{ color: game.color }}>
          {game.binds.length} teclas mapeadas
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onDeactivate(); }}
          className="w-7 h-7 rounded flex items-center justify-center bg-[#1a1a1a] border border-[#333] hover:border-[#FF0040] hover:text-[#FF0040] text-[#555] transition-all"
        >
          <X size={12} />
        </button>
        <ChevronRight size={16} style={{ color: game.color }} />
      </div>
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

// ─── GameMapperView ───────────────────────────────────────────────────────────

function GameMapperView({ game, onBack }: { game: Game; onBack: () => void }) {
  const { updateBinds, setActiveGame, activeGameId } = useGameStore();
  const [activating, setActivating] = useState(false);
  const isAlreadyActive = activeGameId === game.id;

  const handleActivate = () => {
    setActivating(true);
    setActiveGame(game.id);
    setTimeout(() => {
      setActivating(false);
      onBack();
    }, 800);
  };

  return (
    <div className="space-y-3">
      {/* Game header */}
      <div
        className="rounded-lg p-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${game.bgColor}, #0A0A0A)`,
          border: `1px solid ${game.color}50`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: `${game.color}20`, border: `1px solid ${game.color}40` }}
        >
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-base truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
            {game.name}
          </p>
          <p className="text-xs font-mono" style={{ color: game.color }}>
            {game.genre} • {game.binds.length} teclas
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-mono text-[#444] hover:text-white transition-colors"
        >
          ← VOLTAR
        </button>
      </div>

      {/* Activate toggle */}
      <button
        onClick={handleActivate}
        disabled={activating}
        className="w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-orbitron)",
          backgroundColor: activating
            ? `${game.color}40`
            : isAlreadyActive
            ? `${game.color}30`
            : `${game.color}18`,
          color: game.color,
          border: `1px solid ${activating ? game.color : game.color + "50"}`,
          boxShadow: activating
            ? `0 0 20px ${game.color}40`
            : isAlreadyActive
            ? `0 0 16px ${game.color}25`
            : `0 0 12px ${game.color}15`,
        }}
      >
        {activating ? (
          <>
            <Check size={14} />
            PERFIL ATIVADO!
          </>
        ) : isAlreadyActive ? (
          <>
            <Check size={14} />
            PERFIL JÁ ATIVO
          </>
        ) : (
          <>
            <Play size={14} />
            JOGAR COM ESTE PERFIL
          </>
        )}
      </button>

      {/* Mapper */}
      <KeyMapper
        initialBinds={game.binds}
        accentColor={game.color}
        onBindsChange={(binds) => updateBinds(game.id, binds)}
      />
    </div>
  );
}

// ─── GameCard ─────────────────────────────────────────────────────────────────

function GameCard({
  game, isActive, onActivate, onOpen, onRemove,
}: {
  game: Game;
  isActive: boolean;
  onActivate: () => void;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        border: `1px solid ${isActive ? game.color + "60" : "#1a1a1a"}`,
        boxShadow: isActive ? `0 0 12px ${game.color}20` : "none",
      }}
    >
      <div
        className="flex items-center gap-3 p-3 cursor-pointer active:scale-[0.98] transition-all"
        style={{ background: isActive ? `linear-gradient(135deg, ${game.bgColor}80, #0D0D0D)` : "#0D0D0D" }}
        onClick={isActive ? onOpen : onActivate}
      >
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl relative"
          style={{ backgroundColor: `${game.color}15`, border: `1px solid ${game.color}30` }}
        >
          {game.icon}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: game.color }}>
              <Check size={8} color="#000" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-white truncate" style={{ fontFamily: "var(--font-orbitron)" }}>
              {game.name}
            </p>
          </div>
          <p className="text-xs font-mono text-[#555]">{game.genre}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: game.color + "99" }}>
            {game.binds.length} teclas • toque para {isActive ? "abrir" : "ativar"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {confirm ? (
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="px-2 py-1 rounded text-xs font-mono text-[#FF0040] border border-[#FF0040]/40 hover:bg-[#FF0040]/10"
              >
                SIM
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirm(false); }}
                className="px-2 py-1 rounded text-xs font-mono text-[#555] border border-[#333]"
              >
                NÃO
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirm(true); }}
                className="w-7 h-7 rounded flex items-center justify-center bg-[#111] border border-[#222] hover:border-[#FF0040]/50 hover:text-[#FF0040] text-[#333] transition-all"
              >
                <Trash2 size={12} />
              </button>
              <div className="w-7 h-7 rounded flex items-center justify-center" style={{ color: game.color }}>
                <ChevronRight size={16} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
