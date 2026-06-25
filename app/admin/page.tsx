"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Key, Plus, Trash2, Copy, Check, LogIn, Shield,
  Calendar, Users, Zap, RefreshCw,
} from "lucide-react";

const ADMIN_PW = "Blzinn_Modz1579";
type Plan = "Diária" | "Semanal" | "Mensal" | "Semestral" | "Anual";

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

interface Person {
  id: string;
  name: string;
  whatsapp: string;
  createdAt: string;
}

function KeyManager() {
  const [view, setView] = useState<"pessoas" | "chaves">("pessoas");
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [people, setPeople] = useState<Person[]>(() => {
    try { return JSON.parse(localStorage.getItem("dmp_people") || "[]"); } catch { return []; }
  });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [plan, setPlan] = useState<Plan>("Mensal");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("Todas");

  const headers = { "Content-Type": "application/json", "x-admin-password": ADMIN_PW };
  const PLAN_COLORS: Record<string, string> = {
    Diária:    "#00BFFF",
    Semanal:   "#BF00FF",
    Mensal:    "#00FF41",
    Semestral: "#FF6600",
    Anual:     "#FFB800",
    MASTER:    "#FF0040",
  };

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys", { headers });
    const data = await res.json();
    if (data.keys) setKeys(data.keys);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const savePeople = (list: Person[]) => {
    setPeople(list);
    localStorage.setItem("dmp_people", JSON.stringify(list));
  };

  const addPerson = (name: string, whatsapp: string) => {
    const p: Person = { id: `p_${Date.now()}`, name, whatsapp, createdAt: new Date().toISOString() };
    savePeople([...people, p]);
    setSelectedPerson(p);
    setShowAddPerson(false);
  };

  const removePerson = (id: string) => {
    savePeople(people.filter((p) => p.id !== id));
    if (selectedPerson?.id === id) setSelectedPerson(null);
  };

  const generateForPerson = async (person: Person, p: Plan) => {
    setLoading(true);
    const res = await fetch("/api/keys", {
      method: "POST", headers,
      body: JSON.stringify({ plan: p, user: person.name }),
    });
    const data = await res.json();
    await fetchKeys();
    setLoading(false);
    if (data.success) {
      const key = data.data.key;
      navigator.clipboard.writeText(key);
      setCopied(key);
      setTimeout(() => setCopied(null), 3000);
    }
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

  const counts = {
    total:      keys.length,
    daily:      keys.filter((k) => k.plan === "Diária").length,
    weekly:     keys.filter((k) => k.plan === "Semanal").length,
    monthly:    keys.filter((k) => k.plan === "Mensal").length,
    semester:   keys.filter((k) => k.plan === "Semestral").length,
    yearly:     keys.filter((k) => k.plan === "Anual").length,
  };

  const displayed = filter === "Todas" ? keys : keys.filter((k) => k.plan === filter);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-8">
      {/* Header */}
      <div className="grid-bg border-b border-[#FFB800]/20 px-4 pt-10 pb-3 bg-[#0A0A0A] sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9"><Image src="/dog-profile.png" alt="DMP" fill className="object-cover rounded-lg" /></div>
            <div>
              <h1 className="text-white font-black text-sm tracking-wider" style={{ fontFamily: "var(--font-orbitron)" }}>
                ADMIN <span className="text-[#FFB800]">BLZINN</span>
              </h1>
              <p className="text-[#444] text-xs font-mono">Dog Mouse Pro</p>
            </div>
          </div>
          <button onClick={fetchKeys} className="w-8 h-8 rounded border border-[#333] bg-[#111] flex items-center justify-center text-[#555] hover:text-[#00FF41]">
            <RefreshCw size={14} />
          </button>
        </div>
        {/* View tabs */}
        <div className="max-w-md mx-auto flex gap-1 bg-[#111] rounded-lg p-1">
          <button onClick={() => setView("pessoas")}
            className="flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1"
            style={{ fontFamily: "var(--font-orbitron)", backgroundColor: view === "pessoas" ? "#FFB800" : "transparent", color: view === "pessoas" ? "#0A0A0A" : "#555" }}>
            <Users size={11} /> PESSOAS
          </button>
          <button onClick={() => setView("chaves")}
            className="flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1"
            style={{ fontFamily: "var(--font-orbitron)", backgroundColor: view === "chaves" ? "#FFB800" : "transparent", color: view === "chaves" ? "#0A0A0A" : "#555" }}>
            <Key size={11} /> CHAVES
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-4 mt-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "PESSOAS",    value: people.length,    color: "#BF00FF" },
            { label: "DIÁRIAS",    value: counts.daily,     color: "#00BFFF" },
            { label: "SEMANAIS",   value: counts.weekly,    color: "#BF00FF" },
            { label: "MENSAIS",    value: counts.monthly,   color: "#00FF41" },
            { label: "SEMESTRAIS", value: counts.semester,  color: "#FF6600" },
            { label: "ANUAIS",     value: counts.yearly,    color: "#FFB800" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0D0D0D] border border-[#1a1a1a] rounded-lg p-2 text-center">
              <p className="text-lg font-black" style={{ fontFamily: "var(--font-orbitron)", color }}>{value}</p>
              <p className="text-xs font-mono text-[#444]" style={{ fontSize: "8px" }}>{label}</p>
            </div>
          ))}
        </div>

        {view === "pessoas" ? (
          <>
            {/* People list */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-[#555] tracking-widest">CLIENTES</p>
              <button onClick={() => setShowAddPerson(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-all"
                style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "rgba(255,184,0,0.12)", color: "#FFB800", border: "1px solid rgba(255,184,0,0.4)" }}>
                <Plus size={11} /> NOVO CLIENTE
              </button>
            </div>

            {people.length === 0 && (
              <div className="text-center py-10">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-[#333] text-xs font-mono">Nenhum cliente ainda</p>
                <p className="text-[#222] text-xs font-mono">Adicione clientes para gerar chaves</p>
              </div>
            )}

            <div className="space-y-2">
              {people.map((person) => {
                const personKeys = keys.filter((k) => k.user === person.name);
                const activeKey = personKeys.find((k) => new Date(k.expiry) > new Date());
                const isSelected = selectedPerson?.id === person.id;
                return (
                  <div key={person.id} className="bg-[#0D0D0D] rounded-xl overflow-hidden border transition-all"
                    style={{ borderColor: isSelected ? "#FFB800" : "#1a1a1a" }}>
                    <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setSelectedPerson(isSelected ? null : person)}>
                      <div className="w-10 h-10 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm font-mono">{person.name}</p>
                        <p className="text-[#444] text-xs font-mono">{person.whatsapp || "Sem WhatsApp"}</p>
                        {activeKey ? (
                          <span className="text-xs font-bold" style={{ color: PLAN_COLORS[activeKey.plan] || "#888", fontFamily: "var(--font-orbitron)", fontSize: "9px" }}>
                            ✅ {activeKey.plan.toUpperCase()} — exp: {new Date(activeKey.expiry).toLocaleDateString("pt-BR")}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#FF0040]" style={{ fontSize: "9px" }}>⚠️ Sem chave ativa</span>
                        )}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removePerson(person.id); }}
                        className="w-7 h-7 flex items-center justify-center text-[#333] hover:text-[#FF0040]">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {isSelected && (
                      <div className="px-3 pb-3 space-y-2 border-t border-[#1a1a1a] pt-3">
                        <p className="text-xs font-mono text-[#555] tracking-widest">GERAR CHAVE PARA {person.name.toUpperCase()}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { plan: "Diária",    icon: "📅", label: "1 DIA"  },
                            { plan: "Semanal",   icon: "🗓️", label: "7 DIAS" },
                            { plan: "Mensal",    icon: "📆", label: "30 DIAS" },
                            { plan: "Semestral", icon: "🔥", label: "6 MESES" },
                            { plan: "Anual",     icon: "⭐", label: "1 ANO"  },
                          ] as { plan: Plan; icon: string; label: string }[]).map(({ plan: p, icon, label }) => (
                            <button key={p} onClick={() => generateForPerson(person, p)} disabled={loading}
                              className="py-2.5 rounded font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                              style={{
                                fontFamily: "var(--font-orbitron)", fontSize: "9px",
                                backgroundColor: PLAN_COLORS[p] + "20",
                                border: `1px solid ${PLAN_COLORS[p]}`,
                                color: PLAN_COLORS[p],
                              }}>
                              {loading ? "..." : `${icon} ${label}`}
                            </button>
                          ))}
                        </div>
                        {/* Person's keys */}
                        {personKeys.length > 0 && (
                          <div className="space-y-1 mt-2">
                            <p className="text-xs font-mono text-[#333]">Chaves desta pessoa:</p>
                            {personKeys.map((k) => {
                              const expired = new Date(k.expiry) < new Date();
                              const color = PLAN_COLORS[k.plan] ?? "#888";
                              return (
                                <div key={k.key} className="flex items-center gap-2 px-2 py-1.5 rounded"
                                  style={{ backgroundColor: "#111", border: `1px solid ${expired ? "#222" : color + "30"}` }}>
                                  <span className="text-xs font-mono flex-1 truncate" style={{ color: expired ? "#333" : "#fff" }}>{k.key}</span>
                                  <span style={{ color, fontSize: "8px", fontFamily: "var(--font-orbitron)" }}>{k.plan}</span>
                                  <button onClick={() => copy(k.key)}
                                    className="w-6 h-6 flex items-center justify-center"
                                    style={{ color: copied === k.key ? "#00FF41" : "#444" }}>
                                    {copied === k.key ? <Check size={11} /> : <Copy size={11} />}
                                  </button>
                                  <button onClick={() => remove(k.key)} className="w-6 h-6 flex items-center justify-center text-[#333] hover:text-[#FF0040]">
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* All keys view */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {["Todas", "Diária", "Semanal", "Mensal", "Semestral", "Anual"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-mono transition-all"
                  style={{ backgroundColor: filter === f ? "rgba(255,184,0,0.15)" : "#111", border: `1px solid ${filter === f ? "#FFB800" : "#222"}`, color: filter === f ? "#FFB800" : "#555" }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {displayed.length === 0 && <div className="text-center py-10 text-[#333] text-xs font-mono">Nenhuma chave gerada ainda</div>}
              {displayed.map((k) => {
                const color = PLAN_COLORS[k.plan] ?? "#888";
                const expired = new Date(k.expiry) < new Date();
                return (
                  <KeyCard key={k.key} k={k} color={color} expired={expired}
                    copied={copied === k.key} onCopy={() => copy(k.key)} onDelete={() => remove(k.key)} />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add person modal */}
      {showAddPerson && <AddPersonModal onAdd={addPerson} onClose={() => setShowAddPerson(false)} />}
    </div>
  );
}

function AddPersonModal({ onAdd, onClose }: { onAdd: (name: string, whatsapp: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-2xl bg-[#0D0D0D] border-t border-x border-[#FFB800]/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-orbitron)" }}>NOVO CLIENTE</span>
          <button onClick={onClose} className="text-[#444] hover:text-white text-xs font-mono">CANCELAR</button>
        </div>
        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">NOME DO CLIENTE</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="João Silva"
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FFB800]/50" />
        </div>
        <div>
          <label className="text-xs font-mono text-[#555] block mb-1">WHATSAPP (opcional)</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999"
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#FFB800]/50" />
        </div>
        <button onClick={() => { if (name.trim()) onAdd(name.trim(), whatsapp.trim()); }}
          disabled={!name.trim()}
          className="w-full py-3 rounded font-black text-sm transition-all active:scale-95 disabled:opacity-40"
          style={{ fontFamily: "var(--font-orbitron)", backgroundColor: "#FFB800", color: "#0A0A0A" }}>
          ADICIONAR CLIENTE
        </button>
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
          <p className="text-white text-xs font-mono font-bold tracking-wider truncate" style={{ opacity: expired ? 0.4 : 1 }}>{k.key}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs font-bold" style={{ fontFamily: "var(--font-orbitron)", fontSize: "8px", color }}>{k.plan.toUpperCase()}</span>
            <span className="text-xs font-mono text-[#444]">•</span>
            <span className="text-xs font-mono" style={{ color: expired ? "#FF0040" : "#555", fontSize: "9px" }}>
              {expired ? "EXPIRADA" : `Exp: ${new Date(k.expiry).toLocaleDateString("pt-BR")}`}
            </span>
            <span className="text-xs font-mono text-[#444]">• 👤 {k.user}</span>
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
