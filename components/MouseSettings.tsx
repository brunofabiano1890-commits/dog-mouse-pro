"use client";

import { useState } from "react";
import { Target, Crosshair, Gauge, RotateCcw, Sliders, Smartphone } from "lucide-react";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  color?: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, unit = "", color = "#00FF41", onChange }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono text-[#888]">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2 bg-[#1a1a1a] rounded-full">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all"
          style={{
            left: `calc(${pct}% - 8px)`,
            backgroundColor: "#0A0A0A",
            borderColor: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function MouseSettings() {
  const [sensitivity, setSensitivity] = useState(45);
  const [aimSpeed, setAimSpeed] = useState(68);
  const [dpi, setDpi] = useState(800);
  const [recoilControl, setRecoilControl] = useState(30);
  const [gyroSens, setGyroSens] = useState(55);
  const [adsMultiplier, setAdsMultiplier] = useState(80);

  const [aimAssist, setAimAssist] = useState(true);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [recoilAuto, setRecoilAuto] = useState(true);
  const [peekAssist, setPeekAssist] = useState(false);

  const presets = [
    { name: "ASSAULT", s: 55, a: 72, d: 1600 },
    { name: "SNIPER", s: 20, a: 35, d: 400 },
    { name: "RUSH", s: 80, a: 90, d: 3200 },
    { name: "DEFAULT", s: 45, a: 68, d: 800 },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setSensitivity(p.s);
    setAimSpeed(p.a);
    setDpi(p.d);
  };

  const toggleStyle = (on: boolean, color = "#00FF41") => ({
    backgroundColor: on ? color : "#1a1a1a",
    boxShadow: on ? `0 0 8px ${color}` : "none",
    border: `1px solid ${on ? color : "#333"}`,
  });

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div>
        <p className="text-xs font-mono text-[#555] tracking-widest mb-2">PRESETS RÁPIDOS</p>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="py-2 text-xs font-bold rounded border border-[#00FF41]/20 bg-[#0D0D0D] text-[#00FF41]/70 hover:border-[#00FF41] hover:text-[#00FF41] hover:bg-[#00FF41]/5 transition-all active:scale-95"
              style={{ fontFamily: "var(--font-orbitron)", fontSize: "9px" }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main sliders */}
      <div className="neon-border rounded-lg p-4 bg-[#0D0D0D]">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-[#00FF41]" />
          <span className="text-xs tracking-widest font-bold text-[#00FF41]" style={{ fontFamily: "var(--font-orbitron)" }}>
            SENSIBILIDADE
          </span>
        </div>
        <SliderRow label="Sensibilidade Geral" value={sensitivity} min={1} max={100} onChange={setSensitivity} />
        <SliderRow label="Velocidade de Mira" value={aimSpeed} min={1} max={100} onChange={setAimSpeed} color="#FFB800" />
        <SliderRow label="DPI" value={dpi} min={100} max={6400} unit=" DPI" onChange={setDpi} color="#00BFFF" />
        <SliderRow label="ADS Multiplier" value={adsMultiplier} min={1} max={100} unit="%" onChange={setAdsMultiplier} color="#BF00FF" />
      </div>

      {/* Combat settings */}
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Crosshair size={14} className="text-[#FF0040]" />
          <span className="text-xs tracking-widest font-bold text-[#FF0040]" style={{ fontFamily: "var(--font-orbitron)" }}>
            COMBATE
          </span>
        </div>
        <SliderRow label="Controle de Recuo" value={recoilControl} min={0} max={100} unit="%" onChange={setRecoilControl} color="#FF0040" />
        <SliderRow label="Sensibilidade Giroscópio" value={gyroSens} min={1} max={100} onChange={setGyroSens} color="#FFB800" />
      </div>

      {/* Toggles */}
      <div className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={14} className="text-[#00BFFF]" />
          <span className="text-xs tracking-widest font-bold text-[#00BFFF]" style={{ fontFamily: "var(--font-orbitron)" }}>
            RECURSOS
          </span>
        </div>

        <div className="space-y-3">
          {[
            { label: "Aim Assist", desc: "Assistência automática de mira", on: aimAssist, set: setAimAssist, color: "#00FF41" },
            { label: "Recoil Auto", desc: "Compensação automática de recuo", on: recoilAuto, set: setRecoilAuto, color: "#FF0040" },
            { label: "Peek Assist", desc: "Facilitador de lean/peek rápido", on: peekAssist, set: setPeekAssist, color: "#FFB800" },
            { label: "Giroscópio", desc: "Controle por movimento do device", on: gyroEnabled, set: setGyroEnabled, icon: Smartphone, color: "#BF00FF" },
          ].map(({ label, desc, on, set, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white font-mono">{label}</p>
                <p className="text-xs text-[#444] font-mono">{desc}</p>
              </div>
              <button
                onClick={() => set(!on)}
                className="flex-shrink-0 w-11 h-6 rounded-full relative transition-all"
                style={toggleStyle(on, color)}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-[#0A0A0A] transition-all duration-200"
                  style={{ left: on ? "calc(100% - 1.35rem)" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "SENS", value: sensitivity, icon: Gauge },
          { label: "AIM", value: aimSpeed, icon: Target },
          { label: "DPI", value: dpi, icon: Crosshair },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#0D0D0D] border border-[#00FF41]/20 rounded-lg p-3 text-center">
            <Icon size={14} className="text-[#00FF41] mx-auto mb-1" />
            <p className="text-lg font-black text-[#00FF41]" style={{ fontFamily: "var(--font-orbitron)" }}>
              {value}
            </p>
            <p className="text-xs font-mono text-[#444]">{label}</p>
          </div>
        ))}
      </div>

      <button
        className="w-full py-3 border border-[#444]/50 rounded text-[#444] text-xs font-mono flex items-center justify-center gap-2 hover:border-[#FF0040]/50 hover:text-[#FF0040] transition-all"
        onClick={() => { setSensitivity(45); setAimSpeed(68); setDpi(800); setRecoilControl(30); setGyroSens(55); setAdsMultiplier(80); }}
      >
        <RotateCcw size={12} />
        RESETAR PADRÃO
      </button>
    </div>
  );
}
