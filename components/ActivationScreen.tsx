"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Key, Lock, ChevronRight, AlertTriangle } from "lucide-react";

interface ActivationData {
  plan: string;
  expiry: string;
  user: string;
  activatedAt: string;
}

interface Props {
  onActivated: (data: ActivationData) => void;
}

export default function ActivationScreen({ onActivated }: Props) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"intro" | "enter">("intro");

  const handleActivate = async () => {
    if (!key.trim()) {
      setError("Digite sua chave de ativação");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (data.success) {
        onActivated(data.data);
      } else {
        setError(data.message || "Chave inválida");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] grid-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#00FF41]/30 to-transparent"
          style={{ animation: "scanline 4s linear infinite" }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {step === "intro" ? (
          <div className="text-center">
            {/* App icon */}
            <div className="relative mx-auto w-28 h-28 mb-4">
              <div className="absolute inset-0 rounded-2xl neon-border neon-pulse overflow-hidden">
                <Image
                  src="/dog-profile.png"
                  alt="Dog Mouse Pro"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Logo */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <Image
                src="/dog-logo.png"
                alt="Dog Mouse Pro Logo"
                fill
                className="object-contain"
              />
            </div>

            <h1
              className="text-2xl font-black tracking-wider neon-green mb-1"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              DOG MOUSE
            </h1>
            <h2
              className="text-3xl font-black tracking-widest text-white mb-2"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              PRO
            </h2>
            <p className="text-[#00FF41]/60 text-xs tracking-widest uppercase mb-8">
              v3.0.1 — Sistema Avançado de Gaming
            </p>

            {/* Features preview */}
            <div className="space-y-2 mb-8 text-left">
              {[
                { icon: Shield, label: "Sistema Anti-Ban Ativo" },
                { icon: Key, label: "Licença Verificada" },
                { icon: Lock, label: "Proteção Total de Conta" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 bg-[#111] border border-[#00FF41]/20 rounded px-3 py-2"
                >
                  <Icon size={14} className="text-[#00FF41]" />
                  <span className="text-xs text-[#00FF41]/80 font-mono">{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep("enter")}
              className="w-full py-4 bg-[#00FF41] text-[#0A0A0A] font-black text-sm tracking-widest rounded flex items-center justify-center gap-2 hover:bg-[#00FF41]/90 transition-all active:scale-95"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              ATIVAR AGORA
              <ChevronRight size={16} />
            </button>

            <p className="text-[#444] text-xs mt-4 font-mono">
              Não tem uma chave?{" "}
              <span className="text-[#00FF41]/60 cursor-pointer">Comprar aqui</span>
            </p>
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setStep("intro"); setError(""); }}
              className="text-[#00FF41]/60 text-xs font-mono mb-6 flex items-center gap-1 hover:text-[#00FF41]"
            >
              ← VOLTAR
            </button>

            <div className="neon-border rounded-lg p-6 bg-[#0D0D0D]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#00FF41]/10 flex items-center justify-center neon-border">
                  <Key size={18} className="text-[#00FF41]" />
                </div>
                <div>
                  <h3
                    className="text-white font-bold text-sm tracking-wider"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                  >
                    ATIVAÇÃO
                  </h3>
                  <p className="text-[#444] text-xs font-mono">Insira sua chave de licença</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-[#00FF41]/70 text-xs font-mono mb-2 block tracking-widest">
                  CHAVE DE ATIVAÇÃO
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => { setKey(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                  placeholder="DOG-XXXX-XXXX-XXXX"
                  className="w-full bg-[#111] border border-[#00FF41]/30 rounded px-3 py-3 text-[#00FF41] text-sm font-mono tracking-widest placeholder:text-[#333] focus:outline-none focus:border-[#00FF41] focus:shadow-[0_0_10px_rgba(0,255,65,0.3)] transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-[#FF0040]/10 border border-[#FF0040]/30 rounded px-3 py-2 mb-4">
                  <AlertTriangle size={12} className="text-[#FF0040]" />
                  <span className="text-[#FF0040] text-xs font-mono">{error}</span>
                </div>
              )}

              <button
                onClick={handleActivate}
                disabled={loading}
                className="w-full py-4 bg-[#00FF41] text-[#0A0A0A] font-black text-sm tracking-widest rounded flex items-center justify-center gap-2 hover:bg-[#00FF41]/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
                    VERIFICANDO...
                  </>
                ) : (
                  <>
                    <Shield size={14} />
                    ATIVAR
                  </>
                )}
              </button>

              {/* Master key highlight */}
              <div className="mt-4 p-3 bg-[#FFB800]/5 border border-[#FFB800]/30 rounded">
                <p className="text-[#FFB800] text-xs font-bold font-mono text-center mb-2 tracking-widest">👑 CHAVE MASTER — DONO DO APP</p>
                <button
                  onClick={() => { setKey("DOG-MASTER-INFINITY-0000"); setError(""); }}
                  className="w-full text-xs font-mono text-[#FFB800] hover:text-white text-center transition-colors py-1 tracking-wider"
                >
                  DOG-MASTER-INFINITY-0000
                </button>
                <p className="text-[#555] text-xs font-mono text-center mt-1">Acesso vitalício • Tempo infinito</p>
              </div>

              <div className="mt-2 p-3 bg-[#111] border border-[#333]/30 rounded">
                <p className="text-[#444] text-xs font-mono text-center mb-2">DEMO</p>
                <div className="space-y-1">
                  {["DOG-PRO-2024-XXXX", "DOG-VIP-9999-AAAA", "DOG-PREMIUM-7777"].map((k) => (
                    <button
                      key={k}
                      onClick={() => { setKey(k); setError(""); }}
                      className="w-full text-xs font-mono text-[#00FF41]/40 hover:text-[#00FF41] text-center transition-colors py-0.5"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
