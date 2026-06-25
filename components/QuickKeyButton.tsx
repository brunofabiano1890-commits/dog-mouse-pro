"use client";

import { useState } from "react";
import { Plus, X, Keyboard } from "lucide-react";

interface Props {
  onAddKey: (key: string, label: string) => void;
}

const QUICK_KEYS = [
  { key: "LMB",   label: "Atirar",   emoji: "🔴" },
  { key: "RMB",   label: "Mirar",    emoji: "🟠" },
  { key: "SPACE", label: "Pular",    emoji: "🟢" },
  { key: "SHIFT", label: "Correr",   emoji: "🟣" },
  { key: "CTRL",  label: "Agachar",  emoji: "🔵" },
  { key: "R",     label: "Reload",   emoji: "🟡" },
  { key: "F",     label: "Usar",     emoji: "⚪" },
  { key: "G",     label: "Granada",  emoji: "🔴" },
  { key: "E",     label: "Interagir",emoji: "🟢" },
  { key: "V",     label: "Faca",     emoji: "🟠" },
  { key: "TAB",   label: "Inventário",emoji: "🔵" },
  { key: "M",     label: "Mapa",     emoji: "🟣" },
  { key: "1",     label: "Slot 1",   emoji: "⚪" },
  { key: "2",     label: "Slot 2",   emoji: "⚪" },
  { key: "3",     label: "Slot 3",   emoji: "⚪" },
  { key: "MMB",   label: "Scroll",   emoji: "🟡" },
  { key: "M4",    label: "Mouse 4",  emoji: "🔴" },
  { key: "M5",    label: "Mouse 5",  emoji: "🟠" },
];

export default function QuickKeyButton({ onAddKey }: Props) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [customLabel, setCustomLabel] = useState("");

  const handleAdd = (key: string, label: string) => {
    onAddKey(key, label);
    setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
        style={{
          backgroundColor: "#00FF41",
          boxShadow: "0 0 20px rgba(0,255,65,0.5), 0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        <Keyboard size={22} color="#0A0A0A" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-t-2xl bg-[#0D0D0D] border-t border-x border-[#00FF41]/30">
            {/* Handle */}
            <div className="flex justify-center pt-3"><div className="w-10 h-1 rounded-full bg-[#333]" /></div>

            {/* Title */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Plus size={15} className="text-[#00FF41]" />
                <span className="text-sm font-black text-white tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                  ADICIONAR TECLA
                </span>
              </div>
              <button onClick={() => { setOpen(false); setCustom(false); }} className="text-[#444] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {!custom ? (
                <>
                  <p className="text-xs font-mono text-[#555] tracking-widest mb-3">TECLAS RÁPIDAS</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {QUICK_KEYS.map(({ key, label, emoji }) => (
                      <button
                        key={key}
                        onClick={() => handleAdd(key, label)}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border border-[#1a1a1a] bg-[#111] hover:border-[#00FF41]/40 hover:bg-[#00FF41]/5 transition-all active:scale-95"
                      >
                        <span className="text-lg">{emoji}</span>
                        <span className="text-white text-xs font-mono font-bold">{key}</span>
                        <span className="text-[#444] text-xs font-mono" style={{ fontSize: "9px" }}>{label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCustom(true)}
                    className="w-full py-2.5 rounded border border-[#BF00FF]/30 text-[#BF00FF]/70 text-xs font-mono hover:text-[#BF00FF] hover:border-[#BF00FF]/60 transition-all"
                  >
                    + TECLA PERSONALIZADA
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <button onClick={() => setCustom(false)} className="text-xs font-mono text-[#555] hover:text-white">← voltar</button>
                  <div>
                    <label className="text-xs font-mono text-[#555] block mb-1">TECLA (ex: Q, F1, ALT)</label>
                    <input
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value.toUpperCase().slice(0, 8))}
                      placeholder="CTRL"
                      className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#00FF41]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-[#555] block mb-1">NOME DA AÇÃO</label>
                    <input
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value.slice(0, 12))}
                      placeholder="Agachar"
                      className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#00FF41]/50"
                    />
                  </div>
                  <button
                    onClick={() => { if (customKey && customLabel) handleAdd(customKey, customLabel); }}
                    disabled={!customKey || !customLabel}
                    className="w-full py-3 rounded font-black text-sm transition-all active:scale-95 disabled:opacity-40"
                    style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "#00FF41", color: "#0A0A0A" }}
                  >
                    ADICIONAR
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
