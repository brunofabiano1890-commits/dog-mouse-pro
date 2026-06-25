"use client";

import { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, Activity, Wifi, Zap, Lock } from "lucide-react";

const PROTECTION_FEATURES = [
  { id: "fingerprint", label: "Randomização de Fingerprint", icon: Lock, risk: "CRÍTICO" },
  { id: "delay", label: "Delay Humanizado", icon: Activity, risk: "ALTO" },
  { id: "stealth", label: "Modo Stealth", icon: EyeOff, risk: "CRÍTICO" },
  { id: "traffic", label: "Ofuscação de Tráfego", icon: Wifi, risk: "MÉDIO" },
  { id: "bypass", label: "Anti-Detection Bypass", icon: Zap, risk: "ALTO" },
];

const RISK_COLORS: Record<string, string> = {
  CRÍTICO: "#FF0040",
  ALTO: "#FFB800",
  MÉDIO: "#00FF41",
};

export default function AntiBanPanel() {
  const [protections, setProtections] = useState<Record<string, boolean>>({
    fingerprint: true,
    delay: true,
    stealth: false,
    traffic: true,
    bypass: false,
  });
  const [protectionScore, setProtectionScore] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");

  useEffect(() => {
    const enabled = Object.values(protections).filter(Boolean).length;
    setProtectionScore(Math.round((enabled / PROTECTION_FEATURES.length) * 100));
  }, [protections]);

  const toggle = (id: string) => {
    setProtections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setLastScan(new Date().toLocaleTimeString("pt-BR"));
    }, 2500);
  };

  const scoreColor =
    protectionScore >= 80 ? "#00FF41" : protectionScore >= 50 ? "#FFB800" : "#FF0040";

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="neon-border rounded-lg p-4 bg-[#0D0D0D]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: scoreColor }} />
            <span
              className="text-xs tracking-widest font-bold"
              style={{ fontFamily: "var(--font-orbitron)", color: scoreColor }}
            >
              PROTEÇÃO ANTI-BAN
            </span>
          </div>
          <span
            className="text-2xl font-black"
            style={{ fontFamily: "var(--font-orbitron)", color: scoreColor }}
          >
            {protectionScore}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-2 bg-[#111] rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${protectionScore}%`,
              backgroundColor: scoreColor,
              boxShadow: `0 0 8px ${scoreColor}`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#444]">
            {lastScan ? `Último scan: ${lastScan}` : "Nunca escaneado"}
          </span>
          <button
            onClick={runScan}
            disabled={scanning}
            className="text-xs font-mono text-[#00FF41] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {scanning ? (
              <>
                <span className="inline-block w-3 h-3 border border-[#00FF41] border-t-transparent rounded-full animate-spin" />
                SCAN...
              </>
            ) : (
              <>
                <Activity size={10} />
                ESCANEAR
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {PROTECTION_FEATURES.map(({ id, label, icon: Icon, risk }) => {
          const isOn = protections[id];
          const riskColor = RISK_COLORS[risk];
          return (
            <div
              key={id}
              className="flex items-center justify-between p-3 bg-[#0D0D0D] rounded border border-[#1a1a1a] hover:border-[#00FF41]/20 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isOn ? `${riskColor}15` : "#111",
                    border: `1px solid ${isOn ? riskColor + "40" : "#222"}`,
                  }}
                >
                  <Icon size={13} style={{ color: isOn ? riskColor : "#444" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-mono truncate">{label}</p>
                  <p className="text-xs font-bold" style={{ color: riskColor, fontSize: "9px" }}>
                    {risk}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggle(id)}
                className="flex-shrink-0 ml-2 w-11 h-6 rounded-full relative transition-all"
                style={{
                  backgroundColor: isOn ? "#00FF41" : "#1a1a1a",
                  boxShadow: isOn ? "0 0 8px #00FF41" : "none",
                  border: `1px solid ${isOn ? "#00FF41" : "#333"}`,
                }}
              >
                <div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-[#0A0A0A] transition-all duration-200"
                  style={{ left: isOn ? "calc(100% - 1.35rem)" : "2px" }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div className="bg-[#FF0040]/5 border border-[#FF0040]/20 rounded p-3">
        <div className="flex items-start gap-2">
          <Eye size={12} className="text-[#FF0040] mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono text-[#FF0040]/70 leading-relaxed">
            Mantenha todas as proteções ativas para garantir segurança máxima. Proteções críticas
            desativadas aumentam risco de detecção.
          </p>
        </div>
      </div>
    </div>
  );
}
