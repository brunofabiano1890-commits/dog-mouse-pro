"use client";


import type { Game, KeyBind } from "@/lib/gameStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Abre a Play Store em nova aba — única ação confiável de um PWA/browser
function openPlayStore(pkg: string) {
  window.open(`https://play.google.com/store/apps/details?id=${pkg}`, "_blank", "noopener");
}

// Agrupa binds por categoria para exibir no HUD
const ACTION_LABELS: Record<string, string> = {
  move_fwd: "Frente", move_back: "Trás", move_left: "Esq", move_right: "Dir",
  jump: "Pular", crouch: "Agachar", prone: "Deitar", sprint: "Correr",
  shoot: "Atirar", ads: "Mirar", reload: "Reload", knife: "Faca",
  grenade: "Granada", interact: "Interagir", inventory: "Inventário", map: "Mapa",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  game: Game;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GameLauncher({ game, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col max-w-md mx-auto left-1/2 -translate-x-1/2 w-full bg-[#0A0A0A]">
      <HudScreen game={game} onClose={onClose} />
    </div>
  );
}

// ─── HudScreen ────────────────────────────────────────────────────────────────

function HudScreen({ game, onClose }: { game: Game; onClose: () => void }) {
  const binds = game.binds;
  const moveBinds   = binds.filter(b => ["move_fwd","move_back","move_left","move_right","jump","crouch","prone","sprint"].includes(b.action));
  const combatBinds = binds.filter(b => ["shoot","ads","reload","knife","grenade"].includes(b.action));
  const otherBinds  = binds.filter(b => !moveBinds.includes(b) && !combatBinds.includes(b));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-4 pt-10 pb-3 flex items-center gap-3 border-b"
        style={{ background: `linear-gradient(135deg, ${game.bgColor}, #0A0A0A)`, borderColor: `${game.color}40` }}>
        <span className="text-3xl">{game.icon}</span>
        <div className="flex-1">
          <p className="font-black text-white text-base" style={{ fontFamily: "var(--font-orbitron)" }}>
            {game.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: game.color }} />
            <span className="text-xs font-mono" style={{ color: game.color }}>
              ATIVO — {binds.length} teclas mapeadas
            </span>
          </div>
        </div>
        <button onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#555] hover:text-white text-base">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4">

        {/* Passo a passo */}
        <div className="rounded-xl overflow-hidden border border-[#1a1a1a]">
          <div className="px-3 py-2 bg-[#0D0D0D] border-b border-[#1a1a1a]">
            <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "var(--font-orbitron)", color: game.color }}>
              COMO JOGAR COM O PERFIL
            </span>
          </div>
          <div className="bg-[#0A0A0A] divide-y divide-[#111]">
            {[
              { n: "1", text: `Minimize o Dog Mouse Pro (botão Home do Android)` },
              { n: "2", text: `Abra o ${game.name} na sua gaveta de apps` },
              { n: "3", text: `No mobilador, use as teclas mapeadas abaixo` },
              { n: "4", text: `Volte aqui a qualquer momento para consultar as teclas` },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3 px-4 py-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5"
                  style={{ backgroundColor: game.color, color: "#0A0A0A", fontFamily: "var(--font-orbitron)" }}>
                  {n}
                </span>
                <span className="text-xs font-mono text-[#888] leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Play Store */}
        {game.packageName && (
          <button
            onClick={() => openPlayStore(game.packageName!)}
            className="w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              fontFamily: "var(--font-orbitron)",
              backgroundColor: game.color,
              color: "#0A0A0A",
              boxShadow: `0 0 20px ${game.color}50`,
            }}>
            ▶ ABRIR {game.name.toUpperCase()} NA PLAY STORE
          </button>
        )}

        {/* Teclas mapeadas */}
        <BindGroup title="MOVIMENTAÇÃO" icon="🏃" binds={moveBinds} color={game.color} />
        <BindGroup title="COMBATE"      icon="🔫" binds={combatBinds} color={game.color} />
        {otherBinds.length > 0 && (
          <BindGroup title="OUTROS" icon="🎒" binds={otherBinds} color={game.color} />
        )}

      </div>
    </div>
  );
}

// ─── BindGroup ────────────────────────────────────────────────────────────────

function BindGroup({ title, icon, binds, color }: { title: string; icon: string; binds: KeyBind[]; color: string }) {
  if (binds.length === 0) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-[#1a1a1a]">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-[#1a1a1a] bg-[#0D0D0D]">
        <span>{icon}</span>
        <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "var(--font-orbitron)", color }}>
          {title}
        </span>
      </div>
      <div className="bg-[#0A0A0A] grid grid-cols-2 divide-x divide-y divide-[#111]">
        {binds.map((bind) => (
          <div key={bind.action} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-xs font-mono text-[#666]">
              {ACTION_LABELS[bind.action] ?? bind.action}
            </span>
            <span className="text-xs font-black px-2 py-1 rounded"
              style={{
                fontFamily: "var(--font-orbitron)",
                fontSize: "10px",
                backgroundColor: `${bind.color}20`,
                color: bind.color,
                border: `1px solid ${bind.color}50`,
              }}>
              {bind.key}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
