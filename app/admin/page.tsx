"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Key, Plus, Trash2, Copy, Check, LogIn, Shield,
  Calendar, Users, Zap, RefreshCw,
} from "lucide-react";

const ADMIN_PW = "dogmaster2099";
type Plan = "Diária" | "Mensal" | "Anual";

interface KeyRecord {
  key: string;
  plan: string;
  expiry: string;
  user: string;
  createdAt: string;
  used: boolean;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");

  const handleLogin = () => {
    if (pw === ADMIN_PW) { setAuthed(true); setPwErr(""); }
    else setPwErr("Senha incorreta");
  };

  if (!authed) return <LoginScreen pw={pw} setPw={setPw} err={pwErr} onLogin={handleLogin} />;
  return <KeyManager />;
}

// ─── KeyManager ──────────────────────────────────────────────────────────────

function KeyManager() {
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [plan, setPlan] = useState<Plan>("Diária");
  const [user, setUser] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("Todas");

  const headers = { "Content-Type": "application/json", "x-admin-password": ADMIN_PW };

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys", { headers });
    const data = await res.json();
    if (data.keys) setKeys(data.keys);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const generate = async () => {
    setLoading(true);
    for (let i = 0; i < qty; i++) {
      await fetch("/api/keys", {
        method: "POST",
        headers,
        body: JSON.stringify({ plan, user: user || `Player_${Date.now()}` }),
      });
    }
    await fetchKeys();
    setLoading(false);
  };

  const remove = async (key: string) => {
    await fetch("/api/keys", { method: "DELETE", headers, body: JSON.stringify({ key }) });
    setKeys((p) => p.filter((k) => k.key !== key));
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    const text = displayed.map((k) => k.key).join("\n");
    navigator.clipboard.writeText(text);
    setCopied("__all__");
    setTimeout(() => setCopied(null), 2000);
  };

  const PLAN_COLORS: Record<string, string> = { Diária: "#00BFFF", Mensal: "#00FF41", Anual: "#FFB800", MASTER: "#FF0040" };
  const FILTERS = ["Todas", "Diária", "Mensal", "Anual", "MASTER"];
  const displayed = filter === "Todas" ? keys : keys.filter((k) => k.plan === filter);

  const counts = {
    total: keys.length,
    daily: keys.filter((k) => k.plan === "Diária").length,
    monthly: keys.filter((k) => k.plan === "Mensal").length,
    yearly: keys.filter((k) => k.plan === "Anual").length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-8">
      {/* Header */}
      <div className="grid-bg border-b border-[#FFB800]/20 px-4 pt-10 pb-4 bg-[#0A0A0A] sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9"><Image src="/dog-profile.png" alt="DMP" fill className="object-cover rounded-lg" /></div>
            <div>
              <h1 className="text-white font-black text-sm tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                ADMIN <span className="text-[#FFB800]">CHAVES</span>
              </h1>
              <p className="text-[#444] text-xs font-mono">Dog Mouse Pro</p>
            </div>
          </div>
          <button onClick={fetchKeys} className="w-8 h-8 rounded border border-[#333] bg-[#111] flex items-center justify-center text-[#555] hover:text-[#00FF41]">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 mt-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "TOTAL", value: counts.total, color: "#888" },
            { label: "DIÁRIAS", value: counts.daily, color: "#00BFFF" },
            { label: "MENSAIS", value: counts.monthly, color: "#00FF41" },
            { label: "ANUAIS", value: counts.yearly, color: "#FFB800" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-2 text-center">
              <p className="text-lg font-black" style={{ fontFamily: "var(--font-orbitron)", color }}>{value}</p>
              <p className="text-xs font-mono text-[#444]" style={{ fontSize: "8px" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Generator */}
        <div className="bg-[#0D0D0D] border border-[#FFB800]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Key size={13} className="text-[#FFB800]" />
            <span className="text-xs font-bold text-[#FFB800] tracking-widest" style={{ fontFamily: "var(--font-orbitron)" }}>GERAR CHAVES</span>
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-3 gap-2">
            {(["Diária", "Mensal", "Anual"] as Plan[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className="py-2.5 rounded font-bold text-xs transition-all active:scale-95"
                style={{
                  fontFamily: "var(--font-orbitron)",
                  backgroundColor: plan === p ? PLAN_COLORS[p] + "20" : "#111",
                  border: `1px solid ${plan === p ? PLAN_COLORS[p] : "#222"}`,
                  color: plan === p ? PLAN_COLORS[p] : "#555",
                  boxShadow: plan === p ? `0 0 8px ${PLAN_COLORS[p]}40` : "none",
                }}
              >
                {p === "Diária" ? "📅 1 DIA" : p === "Mensal" ? "🗓️ 30 DIAS" : "⭐ 365 DIAS"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-mono text-[#555] block mb-1">USUÁRIO (opcional)</label>
              <input
                value={user} onChange={(e) => setUser(e.target.value)}
                placeholder="Player123"
                className="w-full bg-[#111] border border-[#222] rounded px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]/50"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-[#555] block mb-1">QUANTIDADE</label>
              <input
                type="number" min={1} max={50} value={qty} onChange={(e) => setQty(Math.min(50, Math.max(1, Number(e.target.value))))}
                className="w-full bg-[#111] border border-[#222] rounded px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#FFB800]/50"
              />
            </div>
          </div>

          <button
            onClick={generate} disabled={loading}
            className="w-full py-3 rounded font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "#FFB800", color: "#0A0A0A" }}
          >
            {loading ? <span className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" /> : <Plus size={14} />}
            {loading ? "GERANDO..." : `GERAR ${qty} CHAVE${qty > 1 ? "S" : ""}`}
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-mono transition-all"
              style={{
                backgroundColor: filter === f ? "rgba(255,184,0,0.15)" : "#111",
                border: `1px solid ${filter === f ? "#FFB800" : "#222"}`,
                color: filter === f ? "#FFB800" : "#555",
              }}>{f}</button>
          ))}
          {displayed.length > 0 && (
            <button onClick={copyAll}
              className="flex-shrink-0 ml-auto px-3 py-1.5 rounded text-xs font-mono border border-[#00FF41]/30 text-[#00FF41]/70 hover:text-[#00FF41] flex items-center gap-1">
              {copied === "__all__" ? <Check size={11} /> : <Copy size={11} />}
              {copied === "__all__" ? "COPIADO!" : "COPIAR TODOS"}
            </button>
          )}
        </div>

        {/* Key list */}
        <div className="space-y-2">
          {displayed.length === 0 && (
            <div className="text-center py-10 text-[#333] text-xs font-mono">Nenhuma chave gerada ainda</div>
          )}
          {displayed.map((k) => {
            const color = PLAN_COLORS[k.plan] ?? "#888";
            const expired = new Date(k.expiry) < new Date();
            return (
              <KeyCard key={k.key} k={k} color={color} expired={expired}
                copied={copied === k.key} onCopy={() => copy(k.key)} onDelete={() => remove(k.key)} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KeyCard({ k, color, expired, copied, onCopy, onDelete }: {
  k: KeyRecord; color: string; expired: boolean;
  copied: boolean; onCopy: () => void; onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="bg-[#0D0D0D] rounded-lg overflow-hidden border transition-all"
      style={{ borderColor: expired ? "#333" : color + "30" }}>
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-mono font-bold tracking-wider truncate"
            style={{ opacity: expired ? 0.4 : 1 }}>{k.key}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-bold" style={{ fontFamily: "var(--font-orbitron)", fontSize: "8px", color }}>{k.plan.toUpperCase()}</span>
            <span className="text-xs font-mono text-[#444]">•</span>
            <span className="text-xs font-mono" style={{ color: expired ? "#FF0040" : "#555", fontSize: "9px" }}>
              {expired ? "EXPIRADA" : `Exp: ${new Date(k.expiry).toLocaleDateString("pt-BR")}`}
            </span>
            <span className="text-xs font-mono text-[#333]">• {k.user}</span>
          </div>
        </div>
        <button onClick={onCopy} className="w-7 h-7 rounded flex items-center justify-center border transition-all"
          style={{ border: `1px solid ${copied ? "#00FF41" : "#333"}`, color: copied ? "#00FF41" : "#555" }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        {confirm ? (
          <div className="flex gap-1">
            <button onClick={onDelete} className="px-2 py-1 rounded text-xs font-mono text-[#FF0040] border border-[#FF0040]/40">SIM</button>
            <button onClick={() => setConfirm(false)} className="px-2 py-1 rounded text-xs font-mono text-[#555] border border-[#333]">NÃO</button>
          </div>
        ) : (
          <button onClick={() => setConfirm(true)} className="w-7 h-7 rounded flex items-center justify-center border border-[#222] text-[#333] hover:text-[#FF0040] hover:border-[#FF0040]/40">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({
  pw, setPw, err, onLogin,
}: { pw: string; setPw: (v: string) => void; err: string; onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image src="/dog-logo.png" alt="logo" fill className="object-contain" />
          </div>
          <h1 className="text-white font-black text-xl tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
            DOG MOUSE <span className="text-[#FFB800]">ADMIN</span>
          </h1>
          <p className="text-[#444] text-xs font-mono mt-1">Painel de Gerenciamento de Chaves</p>
        </div>

        <div className="neon-border rounded-xl p-5 bg-[#0D0D0D]" style={{ borderColor: "#FFB800", boxShadow: "0 0 12px rgba(255,184,0,0.2)" }}>
          <label className="text-xs font-mono text-[#FFB800]/70 tracking-widest block mb-2">SENHA ADMIN</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
            placeholder="••••••••••••"
            className="w-full bg-[#111] border border-[#FFB800]/30 rounded px-3 py-3 text-[#FFB800] text-sm font-mono focus:outline-none focus:border-[#FFB800] mb-3"
          />
          {err && <p className="text-[#FF0040] text-xs font-mono mb-3">{err}</p>}
          <button
            onClick={onLogin}
            className="w-full py-3 rounded font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "#FFB800", color: "#0A0A0A" }}
          >
            <LogIn size={14} /> ENTRAR
          </button>
        </div>
      </div>
    </div>
  );
}
