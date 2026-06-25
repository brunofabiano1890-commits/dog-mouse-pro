"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, RotateCcw, Save, Move, Eye, EyeOff, Lock, Unlock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HudButton {
  id: string;
  label: string;
  key: string;
  x: number; // % of container width
  y: number; // % of container height
  size: number; // px diameter
  color: string;
  shape: "circle" | "square" | "pill";
  opacity: number;
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

// ─── Default HUD presets ──────────────────────────────────────────────────────

const HUD_PRESETS: Record<string, HudButton[]> = {
  "FREE FIRE": [
    { id: "ff-fire",    label: "FOGO",    key: "LMB",   x: 78, y: 55, size: 64, color: "#FF0040", shape: "circle",  opacity: 0.85 },
    { id: "ff-aim",     label: "MIRAR",   key: "RMB",   x: 18, y: 55, size: 56, color: "#FF6600", shape: "circle",  opacity: 0.85 },
    { id: "ff-jump",    label: "PULAR",   key: "SPACE", x: 85, y: 72, size: 48, color: "#00FF41", shape: "circle",  opacity: 0.8  },
    { id: "ff-crouch",  label: "AGACHAR", key: "C",     x: 72, y: 78, size: 44, color: "#00BFFF", shape: "circle",  opacity: 0.8  },
    { id: "ff-reload",  label: "RELOAD",  key: "R",     x: 60, y: 75, size: 44, color: "#FFB800", shape: "circle",  opacity: 0.8  },
    { id: "ff-move",    label: "MOVER",   key: "WASD",  x: 15, y: 70, size: 80, color: "#555555", shape: "circle",  opacity: 0.5  },
    { id: "ff-sprint",  label: "CORRER",  key: "SHIFT", x: 28, y: 82, size: 40, color: "#BF00FF", shape: "circle",  opacity: 0.8  },
    { id: "ff-bag",     label: "BAG",     key: "TAB",   x: 88, y: 15, size: 36, color: "#00BFFF", shape: "square",  opacity: 0.8  },
    { id: "ff-map",     label: "MAPA",    key: "M",     x: 78, y: 15, size: 36, color: "#00BFFF", shape: "square",  opacity: 0.8  },
  ],
  "PUBG": [
    { id: "pb-fire",   label: "FOGO",    key: "LMB",   x: 78, y: 55, size: 64, color: "#FF0040", shape: "circle",  opacity: 0.85 },
    { id: "pb-ads",    label: "ADS",     key: "RMB",   x: 18, y: 55, size: 56, color: "#FF6600", shape: "circle",  opacity: 0.85 },
    { id: "pb-jump",   label: "PULAR",   key: "SPACE", x: 85, y: 72, size: 48, color: "#00FF41", shape: "circle",  opacity: 0.8  },
    { id: "pb-prone",  label: "DEITAR",  key: "CTRL",  x: 72, y: 80, size: 44, color: "#009922", shape: "circle",  opacity: 0.8  },
    { id: "pb-reload", label: "RELOAD",  key: "R",     x: 60, y: 75, size: 44, color: "#FFB800", shape: "circle",  opacity: 0.8  },
    { id: "pb-move",   label: "MOVER",   key: "WASD",  x: 15, y: 70, size: 80, color: "#555555", shape: "circle",  opacity: 0.5  },
    { id: "pb-inv",    label: "INV",     key: "TAB",   x: 88, y: 12, size: 36, color: "#00BFFF", shape: "square",  opacity: 0.8  },
  ],
};

const BUTTON_COLORS = ["#FF0040","#00FF41","#00BFFF","#FFB800","#BF00FF","#FF6600","#FF69B4","#555555"];
const KEY_SUGGESTIONS = ["LMB","RMB","SPACE","SHIFT","CTRL","R","F","G","E","Q","C","V","Z","M","TAB","WASD","1","2","3","4","5"];

// ─── HudButtonEl ─────────────────────────────────────────────────────────────

function HudButtonEl({
  btn, isSelected, onStart,
}: {
  btn: HudButton;
  isSelected: boolean;
  onStart: (e: React.TouchEvent | React.MouseEvent) => void;
}) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: `${btn.x}%`,
    top: `${btn.y}%`,
    transform: "translate(-50%, -50%)",
    width: btn.size,
    height: btn.shape === "pill" ? btn.size * 0.6 : btn.size,
    opacity: btn.opacity,
    backgroundColor: `${btn.color}30`,
    border: `2px solid ${isSelected ? "#fff" : btn.color}`,
    boxShadow: isSelected
      ? `0 0 0 2px #fff, 0 0 12px ${btn.color}`
      : `0 0 8px ${btn.color}60`,
    borderRadius: btn.shape === "circle" ? "50%" : btn.shape === "pill" ? "999px" : "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  };

  return (
    <div
      style={base}
      onMouseDown={onStart}
      onTouchStart={onStart}
    >
      <span style={{ color: btn.color, fontSize: btn.size > 50 ? "9px" : "7px", fontFamily: "var(--font-orbitron)", fontWeight: 900, lineHeight: 1, textAlign: "center" }}>
        {btn.label}
      </span>
      <span style={{ color: `${btn.color}cc`, fontSize: "8px", fontFamily: "monospace" }}>
        {btn.key}
      </span>
    </div>
  );
}

// ─── ButtonEditor ─────────────────────────────────────────────────────────────

function ButtonEditor({
  btn, onChange, onDelete,
}: {
  btn: HudButton;
  onChange: (patch: Partial<HudButton>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-[#0D0D0D] border border-[#00FF41]/20 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#00FF41]" style={{ fontFamily: "var(--font-orbitron)" }}>
          EDITAR: {btn.label}
        </span>
        <button onClick={onDelete} className="flex items-center gap-1 text-xs font-mono text-[#FF0040]/70 hover:text-[#FF0040]">
          <Trash2 size={11} /> REMOVER
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">LABEL</label>
          <input
            value={btn.label}
            onChange={(e) => onChange({ label: e.target.value.toUpperCase().slice(0, 6) })}
            className="w-full bg-[#111] border border-[#222] rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]/50"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">TECLA</label>
          <input
            value={btn.key}
            onChange={(e) => onChange({ key: e.target.value.toUpperCase().slice(0, 6) })}
            className="w-full bg-[#111] border border-[#222] rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]/50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-mono text-[#555] block mb-1">TAMANHO: {btn.size}px</label>
        <input type="range" min={30} max={100} value={btn.size} onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="w-full h-1 rounded appearance-none cursor-pointer" style={{ accentColor: btn.color }} />
      </div>

      <div>
        <label className="text-xs font-mono text-[#555] block mb-1">OPACIDADE: {Math.round(btn.opacity * 100)}%</label>
        <input type="range" min={20} max={100} value={Math.round(btn.opacity * 100)} onChange={(e) => onChange({ opacity: Number(e.target.value) / 100 })}
          className="w-full h-1 rounded appearance-none cursor-pointer" style={{ accentColor: btn.color }} />
      </div>

      <div>
        <label className="text-xs font-mono text-[#555] block mb-1">FORMA</label>
        <div className="flex gap-1">
          {(["circle","square","pill"] as const).map((s) => (
            <button key={s} onClick={() => onChange({ shape: s })}
              className="flex-1 py-1 rounded text-xs font-mono transition-all"
              style={{
                backgroundColor: btn.shape === s ? `${btn.color}20` : "#111",
                border: `1px solid ${btn.shape === s ? btn.color : "#222"}`,
                color: btn.shape === s ? btn.color : "#555",
              }}>
              {s === "circle" ? "⬤" : s === "square" ? "■" : "⬬"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-mono text-[#555] block mb-1">COR</label>
        <div className="flex gap-1.5 flex-wrap">
          {BUTTON_COLORS.map((c) => (
            <button key={c} onClick={() => onChange({ color: c })}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: btn.color === c ? "#fff" : "transparent" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AddButtonModal ───────────────────────────────────────────────────────────

function AddButtonModal({ onAdd, onClose }: { onAdd: (label: string, key: string, color: string, shape: HudButton["shape"]) => void; onClose: () => void }) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [color, setColor] = useState("#FF0040");
  const [shape, setShape] = useState<HudButton["shape"]>("circle");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl bg-[#0D0D0D] border-t border-x border-[#00FF41]/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>NOVO BOTÃO HUD</span>
          <button onClick={onClose} className="text-[#444] hover:text-white text-xs font-mono">CANCELAR</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-mono text-[#555] block mb-1">LABEL (6 chars)</label>
            <input value={label} onChange={(e) => setLabel(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="FOGO" className="w-full bg-[#111] border border-[#222] rounded px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]/50" />
          </div>
          <div>
            <label className="text-xs font-mono text-[#555] block mb-1">TECLA</label>
            <input value={key} onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="LMB" className="w-full bg-[#111] border border-[#222] rounded px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00FF41]/50" />
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">SUGESTÕES DE TECLA</label>
          <div className="flex gap-1 flex-wrap">
            {KEY_SUGGESTIONS.slice(0, 12).map((k) => (
              <button key={k} onClick={() => setKey(k)}
                className="px-1.5 py-0.5 rounded text-xs font-mono border transition-all"
                style={{ borderColor: key === k ? "#00FF41" : "#222", color: key === k ? "#00FF41" : "#444", backgroundColor: key === k ? "rgba(0,255,65,0.1)" : "#111" }}>
                {k}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">COR</label>
          <div className="flex gap-2">
            {BUTTON_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: color === c ? "#fff" : "transparent" }} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">FORMA</label>
          <div className="flex gap-1">
            {(["circle","square","pill"] as const).map((s) => (
              <button key={s} onClick={() => setShape(s)}
                className="flex-1 py-1.5 rounded text-xs font-mono transition-all"
                style={{ backgroundColor: shape === s ? `${color}20` : "#111", border: `1px solid ${shape === s ? color : "#222"}`, color: shape === s ? color : "#555" }}>
                {s === "circle" ? "Círculo" : s === "square" ? "Quadrado" : "Pilula"}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if (label && key) onAdd(label, key, color, shape); }}
          disabled={!label || !key}
          className="w-full py-3 rounded font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
          style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "#00FF41", color: "#0A0A0A" }}
        >
          ADICIONAR AO HUD
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HudMapper() {
  const [buttons, setButtons] = useState<HudButton[]>(HUD_PRESETS["FREE FIRE"]);
  const [activePreset, setActivePreset] = useState("FREE FIRE");
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [locked, setLocked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedBtn = buttons.find((b) => b.id === selected);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const startDrag = useCallback((e: React.TouchEvent | React.MouseEvent, id: string) => {
    if (locked) return;
    e.preventDefault();
    const pt = "touches" in e ? e.touches[0] : e;
    const btn = buttons.find((b) => b.id === id);
    if (!btn) return;
    setSelected(id);
    setDragging({ id, startX: pt.clientX, startY: pt.clientY, origX: btn.x, origY: btn.y });
  }, [locked, buttons]);

  const moveDrag = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    e.preventDefault();
    const pt = "touches" in e ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((pt.clientX - dragging.startX) / rect.width) * 100;
    const dy = ((pt.clientY - dragging.startY) / rect.height) * 100;
    setButtons((prev) =>
      prev.map((b) =>
        b.id === dragging.id
          ? { ...b, x: Math.min(95, Math.max(5, dragging.origX + dx)), y: Math.min(95, Math.max(5, dragging.origY + dy)) }
          : b
      )
    );
  }, [dragging]);

  const endDrag = useCallback(() => setDragging(null), []);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const updateSelected = (patch: Partial<HudButton>) => {
    if (!selected) return;
    setButtons((prev) => prev.map((b) => b.id === selected ? { ...b, ...patch } : b));
  };

  const deleteSelected = () => {
    setButtons((prev) => prev.filter((b) => b.id !== selected));
    setSelected(null);
  };

  const addButton = (label: string, key: string, color: string, shape: HudButton["shape"]) => {
    const newBtn: HudButton = {
      id: `btn_${Date.now()}`,
      label, key, color, shape,
      x: 50, y: 50, size: 52, opacity: 0.85,
    };
    setButtons((prev) => [...prev, newBtn]);
    setSelected(newBtn.id);
    setShowAdd(false);
  };

  const applyPreset = (name: string) => {
    const preset = HUD_PRESETS[name];
    if (preset) { setButtons(preset); setActivePreset(name); setSelected(null); }
  };

  const clearAll = () => { setButtons([]); setSelected(null); };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Presets */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.keys(HUD_PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-bold transition-all"
            style={{
              fontFamily: "var(--font-orbitron)",
              fontSize: "9px",
              border: `1px solid ${activePreset === name ? "#00FF41" : "#222"}`,
              backgroundColor: activePreset === name ? "rgba(0,255,65,0.12)" : "#0D0D0D",
              color: activePreset === name ? "#00FF41" : "#555",
            }}
          >
            {name}
          </button>
        ))}
        <button
          onClick={clearAll}
          className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-mono border border-[#FF0040]/30 text-[#FF0040]/70 hover:text-[#FF0040]"
        >
          LIMPAR
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold flex-1 justify-center transition-all"
          style={{
            fontFamily: "var(--font-orbitron)",
            backgroundColor: "rgba(0,255,65,0.12)",
            color: "#00FF41",
            border: "1px solid rgba(0,255,65,0.4)",
          }}
        >
          <Plus size={12} /> ADICIONAR BOTÃO
        </button>
        <button
          onClick={() => setLocked(!locked)}
          className="w-9 h-9 rounded flex items-center justify-center border transition-all"
          style={{
            border: `1px solid ${locked ? "#FFB800" : "#333"}`,
            backgroundColor: locked ? "rgba(255,184,0,0.1)" : "#111",
            color: locked ? "#FFB800" : "#555",
          }}
          title={locked ? "Desbloquear" : "Travar posições"}
        >
          {locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className="w-9 h-9 rounded flex items-center justify-center border border-[#333] bg-[#111] text-[#555] hover:text-white transition-all"
          title="Mostrar/ocultar HUD"
        >
          {showOverlay ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={handleSave}
          className="w-9 h-9 rounded flex items-center justify-center border transition-all"
          style={{
            border: `1px solid ${saved ? "#00FF41" : "#333"}`,
            backgroundColor: saved ? "rgba(0,255,65,0.15)" : "#111",
            color: saved ? "#00FF41" : "#555",
          }}
        >
          <Save size={14} />
        </button>
      </div>

      {/* HUD Canvas */}
      <div
        ref={canvasRef}
        className="relative rounded-xl overflow-hidden select-none"
        style={{
          height: "340px",
          background: "linear-gradient(180deg, #0a1a0a 0%, #0a0a14 50%, #0a0a0a 100%)",
          border: "1px solid #1a1a1a",
          touchAction: "none",
        }}
        onMouseMove={moveDrag}
        onMouseUp={endDrag}
        onTouchMove={moveDrag}
        onTouchEnd={endDrag}
        onClick={(e) => {
          if (e.target === canvasRef.current) setSelected(null);
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Game screen hint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-[#1a2a1a] text-xs font-mono text-center">
            TELA DO JOGO<br/>ARRASTE OS BOTÕES
          </p>
        </div>

        {/* Crosshair center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-4 h-px bg-[#00FF41]/10" />
          <div className="w-px h-4 bg-[#00FF41]/10 -mt-2 ml-2" />
        </div>

        {/* HUD buttons */}
        {showOverlay && buttons.map((btn) => (
          <HudButtonEl
            key={btn.id}
            btn={btn}
            isSelected={selected === btn.id}
            onStart={(e) => startDrag(e, btn.id)}
          />
        ))}
      </div>

      {/* Selected button editor */}
      {selectedBtn && !locked && (
        <ButtonEditor btn={selectedBtn} onChange={updateSelected} onDelete={deleteSelected} />
      )}

      {/* Info when locked */}
      {locked && (
        <p className="text-center text-xs font-mono text-[#FFB800]/60 py-2">
          🔒 Posições travadas — destrave para editar
        </p>
      )}

      {/* Add modal */}
      {showAdd && <AddButtonModal onAdd={addButton} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
