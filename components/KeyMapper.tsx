"use client";

import { useState, useCallback } from "react";
import { Keyboard, Mouse, Trash2, RotateCcw, Download, Upload, Gamepad2, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionId = string;

interface KeyBind {
  key: string;       // display label, e.g. "W", "LMB", "SPACE"
  code: string;      // internal code
  action: ActionId;
  color: string;
}

interface GameAction {
  id: ActionId;
  label: string;
  category: "move" | "combat" | "utility" | "mouse";
  color: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GAME_ACTIONS: GameAction[] = [
  { id: "move_fwd",   label: "Mover Frente",    category: "move",    color: "#00FF41" },
  { id: "move_back",  label: "Mover Trás",      category: "move",    color: "#00FF41" },
  { id: "move_left",  label: "Mover Esquerda",  category: "move",    color: "#00FF41" },
  { id: "move_right", label: "Mover Direita",   category: "move",    color: "#00FF41" },
  { id: "jump",       label: "Pular",           category: "move",    color: "#00CC33" },
  { id: "crouch",     label: "Agachar",         category: "move",    color: "#00CC33" },
  { id: "prone",      label: "Deitar",          category: "move",    color: "#009922" },
  { id: "shoot",      label: "Atirar",          category: "combat",  color: "#FF0040" },
  { id: "ads",        label: "Mirar (ADS)",     category: "combat",  color: "#FF0040" },
  { id: "reload",     label: "Recarregar",      category: "combat",  color: "#FF4060" },
  { id: "knife",      label: "Faca",            category: "combat",  color: "#FF6080" },
  { id: "grenade",    label: "Granada",         category: "combat",  color: "#FF8800" },
  { id: "inventory",  label: "Inventário",      category: "utility", color: "#00BFFF" },
  { id: "map",        label: "Mapa",            category: "utility", color: "#00BFFF" },
  { id: "sprint",     label: "Correr",          category: "utility", color: "#BF00FF" },
  { id: "interact",   label: "Interagir",       category: "utility", color: "#BF00FF" },
  { id: "lmb",        label: "Botão Esq.",      category: "mouse",   color: "#FFB800" },
  { id: "rmb",        label: "Botão Dir.",      category: "mouse",   color: "#FFB800" },
  { id: "mmb",        label: "Scroll Click",    category: "mouse",   color: "#FF8800" },
  { id: "m4",         label: "Mouse Botão 4",   category: "mouse",   color: "#FF6600" },
  { id: "m5",         label: "Mouse Botão 5",   category: "mouse",   color: "#FF6600" },
];

// preset layouts
const PRESETS: Record<string, KeyBind[]> = {
  "FREE FIRE": [
    { key: "W", code: "KeyW", action: "move_fwd",   color: "#00FF41" },
    { key: "S", code: "KeyS", action: "move_back",  color: "#00FF41" },
    { key: "A", code: "KeyA", action: "move_left",  color: "#00FF41" },
    { key: "D", code: "KeyD", action: "move_right", color: "#00FF41" },
    { key: "SPACE", code: "Space",   action: "jump",    color: "#00CC33" },
    { key: "C",     code: "KeyC",    action: "crouch",  color: "#00CC33" },
    { key: "LMB",   code: "LMB",     action: "shoot",   color: "#FF0040" },
    { key: "RMB",   code: "RMB",     action: "ads",     color: "#FF0040" },
    { key: "R",     code: "KeyR",    action: "reload",  color: "#FF4060" },
    { key: "F",     code: "KeyF",    action: "interact",color: "#BF00FF" },
    { key: "G",     code: "KeyG",    action: "grenade", color: "#FF8800" },
    { key: "SHIFT", code: "ShiftL",  action: "sprint",  color: "#BF00FF" },
  ],
  "PUBG": [
    { key: "W", code: "KeyW", action: "move_fwd",   color: "#00FF41" },
    { key: "S", code: "KeyS", action: "move_back",  color: "#00FF41" },
    { key: "A", code: "KeyA", action: "move_left",  color: "#00FF41" },
    { key: "D", code: "KeyD", action: "move_right", color: "#00FF41" },
    { key: "SPACE", code: "Space",  action: "jump",    color: "#00CC33" },
    { key: "CTRL",  code: "CtrlL",  action: "prone",   color: "#009922" },
    { key: "LMB",   code: "LMB",    action: "shoot",   color: "#FF0040" },
    { key: "RMB",   code: "RMB",    action: "ads",     color: "#FF0040" },
    { key: "R",     code: "KeyR",   action: "reload",  color: "#FF4060" },
    { key: "F",     code: "KeyF",   action: "interact",color: "#BF00FF" },
    { key: "5",     code: "Digit5", action: "grenade", color: "#FF8800" },
    { key: "SHIFT", code: "ShiftL", action: "sprint",  color: "#BF00FF" },
    { key: "TAB",   code: "Tab",    action: "inventory",color: "#00BFFF" },
    { key: "M",     code: "KeyM",   action: "map",     color: "#00BFFF" },
  ],
  "COD MOBILE": [
    { key: "W", code: "KeyW", action: "move_fwd",   color: "#00FF41" },
    { key: "S", code: "KeyS", action: "move_back",  color: "#00FF41" },
    { key: "A", code: "KeyA", action: "move_left",  color: "#00FF41" },
    { key: "D", code: "KeyD", action: "move_right", color: "#00FF41" },
    { key: "SPACE", code: "Space",  action: "jump",    color: "#00CC33" },
    { key: "Z",     code: "KeyZ",   action: "prone",   color: "#009922" },
    { key: "LMB",   code: "LMB",    action: "shoot",   color: "#FF0040" },
    { key: "RMB",   code: "RMB",    action: "ads",     color: "#FF0040" },
    { key: "R",     code: "KeyR",   action: "reload",  color: "#FF4060" },
    { key: "E",     code: "KeyE",   action: "interact",color: "#BF00FF" },
    { key: "G",     code: "KeyG",   action: "grenade", color: "#FF8800" },
    { key: "V",     code: "KeyV",   action: "knife",   color: "#FF6080" },
    { key: "SHIFT", code: "ShiftL", action: "sprint",  color: "#BF00FF" },
    { key: "M4",    code: "M4",     action: "m4",      color: "#FF6600" },
  ],
};

// keyboard row layout
const KB_ROWS = [
  ["ESC","F1","F2","F3","F4","F5","F6"],
  ["`","1","2","3","4","5","6","7","8","9","0","-","="],
  ["TAB","Q","W","E","R","T","Y","U","I","O","P"],
  ["CAPS","A","S","D","F","G","H","J","K","L"],
  ["SHIFT","Z","X","C","V","B","N","M",",","."],
  ["CTRL","ALT","SPACE","ALT","FN"],
];

const KEY_CODE_MAP: Record<string, string> = {
  W:"KeyW", S:"KeyS", A:"KeyA", D:"KeyD",
  Q:"KeyQ", E:"KeyE", R:"KeyR", F:"KeyF",
  G:"KeyG", C:"KeyC", V:"KeyV", Z:"KeyZ",
  X:"KeyX", B:"KeyB", T:"KeyT", Y:"KeyY",
  M:"KeyM", N:"KeyN",
  "1":"Digit1","2":"Digit2","3":"Digit3","4":"Digit4","5":"Digit5",
  "6":"Digit6","7":"Digit7","8":"Digit8","9":"Digit9","0":"Digit0",
  SPACE:"Space", SHIFT:"ShiftL", CTRL:"CtrlL", ALT:"AltL",
  TAB:"Tab", CAPS:"CapsLock", ESC:"Escape", FN:"Fn",
  F1:"F1",F2:"F2",F3:"F3",F4:"F4",F5:"F5",F6:"F6",
  "`":"Backquote","-":"Minus","=":"Equal",",":"Comma",".":"Period",
};

const MOUSE_BUTTONS = [
  { key: "LMB", code: "LMB", label: "Esquerdo" },
  { key: "RMB", code: "RMB", label: "Direito" },
  { key: "MMB", code: "MMB", label: "Scroll" },
  { key: "M4",  code: "M4",  label: "Botão 4" },
  { key: "M5",  code: "M5",  label: "Botão 5" },
];

// ─── MapView ─────────────────────────────────────────────────────────────────

interface MapViewProps {
  binds: KeyBind[];
  selectedAction: ActionId | null;
  onKeyPress: (key: string) => void;
  onMouseBtn: (code: string, key: string) => void;
  onRemove: (code: string) => void;
  getBindForCode: (code: string) => KeyBind | undefined;
  getActionById: (id: ActionId) => GameAction | undefined;
}

function MapView({ binds, selectedAction, onKeyPress, onMouseBtn, onRemove, getBindForCode, getActionById }: MapViewProps) {
  const KEY_WIDTHS: Record<string, string> = {
    SPACE: "w-28", SHIFT: "w-16", CTRL: "w-12", TAB: "w-12",
    CAPS: "w-14", ALT: "w-10", FN: "w-10", ESC: "w-10",
  };

  return (
    <div className="space-y-3">
      {/* Keyboard visual */}
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-3 overflow-x-auto">
        <div className="flex items-center gap-2 mb-3">
          <Keyboard size={13} className="text-[#00FF41]" />
          <span className="text-xs font-mono text-[#555] tracking-widest">TECLADO</span>
          {selectedAction && (
            <span className="text-xs font-mono text-[#00FF41] ml-auto animate-pulse">
              ← toque para mapear
            </span>
          )}
        </div>
        <div className="space-y-1 min-w-max">
          {KB_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map((key) => {
                const code = KEY_CODE_MAP[key] ?? key;
                const bind = getBindForCode(code);
                const hasAction = selectedAction !== null;
                return (
                  <button
                    key={key}
                    onClick={() => bind ? onRemove(code) : onKeyPress(key)}
                    className={`
                      ${KEY_WIDTHS[key] ?? "w-8"} h-8 rounded text-center
                      flex-shrink-0 transition-all active:scale-90 relative
                      flex items-center justify-center
                    `}
                    style={{
                      backgroundColor: bind
                        ? `${bind.color}25`
                        : hasAction ? "rgba(0,255,65,0.06)" : "#111",
                      border: `1px solid ${bind ? bind.color : hasAction ? "rgba(0,255,65,0.3)" : "#222"}`,
                      boxShadow: bind ? `0 0 5px ${bind.color}50` : "none",
                    }}
                    title={bind ? `${bind.action} — clique p/ remover` : key}
                  >
                    {bind ? (
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-white" style={{ fontSize: "7px", fontFamily: "var(--font-orbitron)" }}>
                          {getActionById(bind.action)?.label.split(" ")[0].slice(0,4).toUpperCase() ?? ""}
                        </span>
                        <span className="font-bold" style={{ color: bind.color, fontSize: "7px" }}>{key}</span>
                      </div>
                    ) : (
                      <span className="font-mono text-[#444]" style={{ fontSize: key.length > 3 ? "7px" : "9px" }}>
                        {key.length > 4 ? key.slice(0, 4) : key}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mouse visual */}
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-3">
        <div className="flex items-center gap-2 mb-3">
          <Mouse size={13} className="text-[#FFB800]" />
          <span className="text-xs font-mono text-[#555] tracking-widest">MOUSE</span>
        </div>
        <div className="flex gap-2 items-center">
          {/* Mouse silhouette */}
          <div className="relative flex-shrink-0">
            <svg width="60" height="90" viewBox="0 0 60 90">
              <path
                d="M10 30 Q10 5 30 5 Q50 5 50 30 L50 70 Q50 88 30 88 Q10 88 10 70 Z"
                fill="#111" stroke="#333" strokeWidth="1.5"
              />
              <line x1="30" y1="5" x2="30" y2="45" stroke="#333" strokeWidth="1" />
              <circle cx="30" cy="48" r="5" fill="#1a1a1a" stroke="#444" strokeWidth="1" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center">
              {/* LMB */}
              <div
                className="w-6 h-7 mt-1 ml-[-12px] rounded-tl-full cursor-pointer transition-all"
                style={{
                  backgroundColor: getBindForCode("LMB") ? `${getBindForCode("LMB")!.color}30` : "transparent",
                  border: `1px solid ${getBindForCode("LMB") ? getBindForCode("LMB")!.color : "transparent"}`,
                }}
                onClick={() => getBindForCode("LMB") ? onRemove("LMB") : onMouseBtn("LMB","LMB")}
              />
            </div>
          </div>

          {/* Mouse buttons list */}
          <div className="flex-1 space-y-1.5">
            {MOUSE_BUTTONS.map(({ key, code, label }) => {
              const bind = getBindForCode(code);
              return (
                <button
                  key={code}
                  onClick={() => bind ? onRemove(code) : onMouseBtn(code, key)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded transition-all active:scale-95"
                  style={{
                    backgroundColor: bind ? `${bind.color}15` : selectedAction ? "rgba(0,255,65,0.06)" : "#111",
                    border: `1px solid ${bind ? bind.color : selectedAction ? "rgba(0,255,65,0.25)" : "#222"}`,
                    boxShadow: bind ? `0 0 4px ${bind.color}40` : "none",
                  }}
                >
                  <span className="text-xs font-mono" style={{ color: bind ? bind.color : "#666" }}>
                    {label}
                  </span>
                  {bind ? (
                    <span className="text-xs font-bold" style={{ color: bind.color, fontFamily: "var(--font-orbitron)", fontSize: "9px" }}>
                      {getActionById(bind.action)?.label.slice(0, 10)}
                    </span>
                  ) : (
                    <span className="text-xs text-[#333] font-mono">—</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

function ListView({
  binds,
  onRemove,
  getActionById,
}: {
  binds: KeyBind[];
  onRemove: (actionId: ActionId) => void;
  getActionById: (id: ActionId) => GameAction | undefined;
}) {
  const cats = [
    { id: "move", label: "MOVIMENTAÇÃO", icon: "🏃" },
    { id: "combat", label: "COMBATE", icon: "🔫" },
    { id: "utility", label: "UTILIDADES", icon: "🎒" },
    { id: "mouse", label: "MOUSE", icon: "🖱️" },
  ];

  return (
    <div className="space-y-3">
      {cats.map(({ id, label, icon }) => {
        const catBinds = binds.filter((b) => getActionById(b.action)?.category === id);
        const catActions = GAME_ACTIONS.filter((a) => a.category === id);
        return (
          <div key={id} className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-[#1a1a1a] flex items-center gap-2">
              <span>{icon}</span>
              <span className="text-xs font-bold text-[#00FF41]" style={{ fontFamily: "var(--font-orbitron)" }}>
                {label}
              </span>
              <span className="text-xs font-mono text-[#333] ml-auto">
                {catBinds.length}/{catActions.length}
              </span>
            </div>
            <div className="divide-y divide-[#111]">
              {catActions.map((action) => {
                const bind = binds.find((b) => b.action === action.id);
                return (
                  <div key={action.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-mono text-[#888]">{action.label}</span>
                    {bind ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-black"
                          style={{
                            backgroundColor: `${bind.color}20`,
                            color: bind.color,
                            border: `1px solid ${bind.color}50`,
                            fontFamily: "var(--font-orbitron)",
                            fontSize: "10px",
                          }}
                        >
                          {bind.key}
                        </span>
                        <button onClick={() => onRemove(action.id)}>
                          <Trash2 size={11} className="text-[#333] hover:text-[#FF0040] transition-colors" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[#2a2a2a]">não mapeado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface KeyMapperProps {
  initialBinds?: KeyBind[];
  accentColor?: string;
  onBindsChange?: (binds: KeyBind[]) => void;
}

export default function KeyMapper({ initialBinds, accentColor = "#00FF41", onBindsChange }: KeyMapperProps = {}) {
  const [binds, setBinds] = useState<KeyBind[]>(initialBinds ?? PRESETS["FREE FIRE"]);
  const [selectedAction, setSelectedAction] = useState<ActionId | null>(null);
  const [activePreset, setActivePreset] = useState("FREE FIRE");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"map" | "list">("map");

  const getBindForCode = useCallback(
    (code: string) => binds.find((b) => b.code === code),
    [binds]
  );

  const getActionById = (id: ActionId) => GAME_ACTIONS.find((a) => a.id === id);

  const updateBinds = (updater: (prev: KeyBind[]) => KeyBind[]) => {
    setBinds((prev) => {
      const next = updater(prev);
      onBindsChange?.(next);
      return next;
    });
  };

  const handleKeyPress = (keyLabel: string) => {
    const code = KEY_CODE_MAP[keyLabel] ?? keyLabel;
    if (!selectedAction) return;
    const action = getActionById(selectedAction);
    if (!action) return;
    updateBinds((prev) => {
      const filtered = prev.filter((b) => b.code !== code && b.action !== selectedAction);
      return [...filtered, { key: keyLabel, code, action: selectedAction, color: action.color }];
    });
    setSelectedAction(null);
  };

  const handleMouseBtn = (code: string, keyLabel: string) => {
    if (!selectedAction) return;
    const action = getActionById(selectedAction);
    if (!action) return;
    updateBinds((prev) => {
      const filtered = prev.filter((b) => b.code !== code && b.action !== selectedAction);
      return [...filtered, { key: keyLabel, code, action: selectedAction, color: action.color }];
    });
    setSelectedAction(null);
  };

  const removeBind = (code: string) => {
    updateBinds((prev) => prev.filter((b) => b.code !== code));
  };

  const removeActionBind = (actionId: ActionId) => {
    updateBinds((prev) => prev.filter((b) => b.action !== actionId));
  };

  const applyPreset = (name: string) => {
    const next = PRESETS[name];
    setBinds(next);
    onBindsChange?.(next);
    setActivePreset(name);
    setSelectedAction(null);
  };

  const clearAll = () => { setBinds([]); onBindsChange?.([]); setSelectedAction(null); };

  const handleSave = () => {
    onBindsChange?.(binds);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const categories = [
    { id: "all",     label: "TUDO" },
    { id: "move",    label: "MOVER" },
    { id: "combat",  label: "COMBATE" },
    { id: "utility", label: "UTILI." },
    { id: "mouse",   label: "MOUSE" },
  ];

  const filteredActions = filterCat === "all"
    ? GAME_ACTIONS
    : GAME_ACTIONS.filter((a) => a.category === filterCat);

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-xs font-mono text-[#555] tracking-widest mb-2">LAYOUT DO JOGO</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="py-2 text-xs font-bold rounded border transition-all active:scale-95"
              style={{
                fontFamily: "var(--font-orbitron)",
                fontSize: "9px",
                border: `1px solid ${activePreset === name ? "#00FF41" : "#222"}`,
                backgroundColor: activePreset === name ? "rgba(0,255,65,0.12)" : "#0D0D0D",
                color: activePreset === name ? "#00FF41" : "#555",
                boxShadow: activePreset === name ? "0 0 8px rgba(0,255,65,0.2)" : "none",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 bg-[#0D0D0D] rounded-lg p-1 border border-[#1a1a1a]">
        {(["map","list"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-bold rounded transition-all"
            style={{
              fontFamily: "var(--font-orbitron)",
              backgroundColor: tab === t ? "#00FF41" : "transparent",
              color: tab === t ? "#0A0A0A" : "#555",
            }}
          >
            {t === "map" ? "🎹 TECLADO" : "📋 LISTA"}
          </button>
        ))}
      </div>

      {tab === "map" ? (
        <MapView
          binds={binds}
          selectedAction={selectedAction}
          onKeyPress={handleKeyPress}
          onMouseBtn={handleMouseBtn}
          onRemove={removeBind}
          getBindForCode={getBindForCode}
          getActionById={getActionById}
        />
      ) : (
        <ListView
          binds={binds}
          onRemove={removeActionBind}
          getActionById={getActionById}
        />
      )}

      {/* Action picker */}
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-mono text-[#555] tracking-widest">
            {selectedAction
              ? `→ MAPEANDO: ${getActionById(selectedAction)?.label ?? selectedAction}`
              : "SELECIONE UMA AÇÃO ABAIXO"}
          </p>
          {selectedAction && (
            <button
              onClick={() => setSelectedAction(null)}
              className="text-xs font-mono text-[#FF0040] hover:text-white"
            >
              CANCELAR
            </button>
          )}
        </div>

        {/* category filter */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {categories.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilterCat(id)}
              className="flex-shrink-0 px-2 py-1 rounded text-xs font-mono transition-all"
              style={{
                backgroundColor: filterCat === id ? "rgba(0,255,65,0.15)" : "#111",
                color: filterCat === id ? "#00FF41" : "#444",
                border: `1px solid ${filterCat === id ? "#00FF41" : "#222"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredActions.map((action) => {
            const bound = binds.find((b) => b.action === action.id);
            const isSelected = selectedAction === action.id;
            return (
              <button
                key={action.id}
                onClick={() => setSelectedAction(isSelected ? null : action.id)}
                className="flex items-center justify-between px-2 py-2 rounded text-left transition-all active:scale-95"
                style={{
                  backgroundColor: isSelected ? `${action.color}20` : "#111",
                  border: `1px solid ${isSelected ? action.color : "#222"}`,
                  boxShadow: isSelected ? `0 0 6px ${action.color}40` : "none",
                }}
              >
                <span className="text-xs font-mono truncate" style={{ color: isSelected ? action.color : "#888" }}>
                  {action.label}
                </span>
                {bound ? (
                  <span
                    className="text-xs font-bold ml-1 flex-shrink-0 px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${bound.color}20`, color: bound.color, fontSize: "9px", fontFamily: "var(--font-orbitron)" }}
                  >
                    {bound.key}
                  </span>
                ) : (
                  <span className="text-xs text-[#333] ml-1 flex-shrink-0">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions bar */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleSave}
          className="py-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          style={{
            fontFamily: "var(--font-orbitron)",
            backgroundColor: saved ? accentColor : `${accentColor}18`,
            color: saved ? "#0A0A0A" : accentColor,
            border: `1px solid ${saved ? accentColor : accentColor + "50"}`,
          }}
        >
          {saved ? <Check size={12} /> : <Download size={12} />}
          {saved ? "SALVO!" : "SALVAR"}
        </button>
        <button
          onClick={() => applyPreset(activePreset)}
          className="py-3 rounded border border-[#FFB800]/30 text-[#FFB800] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FFB800]/10 transition-all active:scale-95"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          <RotateCcw size={12} />
          RESET
        </button>
        <button
          onClick={clearAll}
          className="py-3 rounded border border-[#FF0040]/30 text-[#FF0040] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#FF0040]/10 transition-all active:scale-95"
          style={{ fontFamily: "var(--font-orbitron)" }}
        >
          <Trash2 size={12} />
          LIMPAR
        </button>
      </div>
    </div>
  );
}
