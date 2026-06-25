import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeyBind {
  key: string;
  code: string;
  action: string;
  color: string;
}

export interface Game {
  id: string;
  name: string;
  shortName: string;
  genre: string;
  color: string;       // primary accent color
  bgColor: string;     // card bg gradient stop
  icon: string;        // emoji fallback
  packageName?: string; // Android package to launch
  binds: KeyBind[];
  addedAt: string;
  isActive: boolean;   // currently selected/running
}

export interface GameStore {
  games: Game[];
  activeGameId: string | null;
  addGame: (game: Omit<Game, "addedAt" | "isActive">) => void;
  removeGame: (id: string) => void;
  setActiveGame: (id: string | null) => void;
  updateBinds: (gameId: string, binds: KeyBind[]) => void;
}

// ─── Default presets ─────────────────────────────────────────────────────────

const GREEN = "#00FF41";
const RED   = "#FF0040";
const AMBER = "#FFB800";
const BLUE  = "#00BFFF";
const PURP  = "#BF00FF";
const ORNG  = "#FF6600";

export const GAME_TEMPLATES: Omit<Game, "id" | "addedAt" | "isActive">[] = [
  {
    name: "Free Fire",
    shortName: "FF",
    genre: "Battle Royale",
    color: GREEN,
    bgColor: "#001a00",
    icon: "🔥",
    packageName: "com.dts.freefireth",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "C",     code: "KeyC",   action: "crouch",     color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "F",     code: "KeyF",   action: "interact",   color: PURP  },
      { key: "G",     code: "KeyG",   action: "grenade",    color: AMBER },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
    ],
  },
  {
    name: "PUBG Mobile",
    shortName: "PUBG",
    genre: "Battle Royale",
    color: AMBER,
    bgColor: "#1a1000",
    icon: "🪖",
    packageName: "com.tencent.ig",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "CTRL",  code: "CtrlL",  action: "prone",      color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "F",     code: "KeyF",   action: "interact",   color: PURP  },
      { key: "5",     code: "Digit5", action: "grenade",    color: AMBER },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
      { key: "TAB",   code: "Tab",    action: "inventory",  color: BLUE  },
      { key: "M",     code: "KeyM",   action: "map",        color: BLUE  },
    ],
  },
  {
    name: "COD Mobile",
    shortName: "COD",
    genre: "FPS",
    color: ORNG,
    bgColor: "#1a0800",
    icon: "💀",
    packageName: "com.activision.callofduty.shooter",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "Z",     code: "KeyZ",   action: "prone",      color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "E",     code: "KeyE",   action: "interact",   color: PURP  },
      { key: "G",     code: "KeyG",   action: "grenade",    color: AMBER },
      { key: "V",     code: "KeyV",   action: "knife",      color: ORNG  },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
    ],
  },
  {
    name: "Fortnite",
    shortName: "FN",
    genre: "Battle Royale",
    color: BLUE,
    bgColor: "#001020",
    icon: "⚡",
    packageName: "com.epicgames.fortnite",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "E",     code: "KeyE",   action: "interact",   color: PURP  },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
      { key: "TAB",   code: "Tab",    action: "inventory",  color: BLUE  },
    ],
  },
  {
    name: "Warzone",
    shortName: "WZ",
    genre: "Battle Royale",
    color: RED,
    bgColor: "#1a0000",
    icon: "☢️",
    packageName: "com.activision.callofduty.warzone",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "CTRL",  code: "CtrlL",  action: "prone",      color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "F",     code: "KeyF",   action: "interact",   color: PURP  },
      { key: "G",     code: "KeyG",   action: "grenade",    color: AMBER },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
      { key: "TAB",   code: "Tab",    action: "inventory",  color: BLUE  },
    ],
  },
  {
    name: "Valorant",
    shortName: "VAL",
    genre: "FPS Tático",
    color: RED,
    bgColor: "#1a0010",
    icon: "🎯",
    packageName: "com.riotgames.league.teamfighttactics",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "CTRL",  code: "CtrlL",  action: "crouch",     color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "F",     code: "KeyF",   action: "interact",   color: PURP  },
      { key: "G",     code: "KeyG",   action: "grenade",    color: AMBER },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
      { key: "TAB",   code: "Tab",    action: "map",        color: BLUE  },
    ],
  },
  {
    name: "Apex Legends",
    shortName: "APEX",
    genre: "Battle Royale",
    color: RED,
    bgColor: "#1a0500",
    icon: "🦅",
    packageName: "com.ea.gp.apexlegendsmobilefps",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "CTRL",  code: "CtrlL",  action: "crouch",     color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "E",     code: "KeyE",   action: "interact",   color: PURP  },
      { key: "Q",     code: "KeyQ",   action: "grenade",    color: AMBER },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
    ],
  },
  {
    name: "CS2 / CSGO",
    shortName: "CS2",
    genre: "FPS Tático",
    color: AMBER,
    bgColor: "#0f0c00",
    icon: "💣",
    packageName: "com.valvesoftware.android.steam.community",
    binds: [
      { key: "W",     code: "KeyW",   action: "move_fwd",   color: GREEN },
      { key: "S",     code: "KeyS",   action: "move_back",  color: GREEN },
      { key: "A",     code: "KeyA",   action: "move_left",  color: GREEN },
      { key: "D",     code: "KeyD",   action: "move_right", color: GREEN },
      { key: "SPACE", code: "Space",  action: "jump",       color: GREEN },
      { key: "CTRL",  code: "CtrlL",  action: "crouch",     color: GREEN },
      { key: "LMB",   code: "LMB",    action: "shoot",      color: RED   },
      { key: "RMB",   code: "RMB",    action: "ads",        color: RED   },
      { key: "R",     code: "KeyR",   action: "reload",     color: RED   },
      { key: "E",     code: "KeyE",   action: "interact",   color: PURP  },
      { key: "G",     code: "KeyG",   action: "grenade",    color: AMBER },
      { key: "SHIFT", code: "ShiftL", action: "sprint",     color: PURP  },
      { key: "B",     code: "KeyB",   action: "inventory",  color: BLUE  },
    ],
  },
];

// ─── Zustand store ────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      games: [],
      activeGameId: null,

      addGame: (game) =>
        set((state) => ({
          games: [
            ...state.games,
            { ...game, addedAt: new Date().toISOString(), isActive: false },
          ],
        })),

      removeGame: (id) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== id),
          activeGameId: state.activeGameId === id ? null : state.activeGameId,
        })),

      setActiveGame: (id) =>
        set((state) => ({
          activeGameId: id,
          games: state.games.map((g) => ({ ...g, isActive: g.id === id })),
        })),

      updateBinds: (gameId, binds) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, binds } : g
          ),
        })),
    }),
    { name: "dog-mouse-games" }
  )
);
