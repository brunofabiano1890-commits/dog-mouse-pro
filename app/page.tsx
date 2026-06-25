"use client";

import { useState, useEffect } from "react";
import ActivationScreen from "@/components/ActivationScreen";
import Dashboard from "@/components/Dashboard";

interface ActivationData {
  plan: string;
  expiry: string;
  user: string;
  activatedAt: string;
}

const STORAGE_KEY = "dog_mouse_pro_activation";

export default function Home() {
  const [activation, setActivation] = useState<ActivationData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ActivationData = JSON.parse(stored);
        // Check if still valid
        const expiry = new Date(parsed.expiry);
        if (expiry > new Date()) {
          setActivation(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoaded(true);
  }, []);

  const handleActivated = (data: ActivationData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setActivation(data);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActivation(null);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#00FF41] border-t-transparent rounded-full animate-spin" />
          <p
            className="text-[#00FF41] text-xs tracking-widest"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            DOG MOUSE PRO
          </p>
        </div>
      </div>
    );
  }

  if (!activation) {
    return <ActivationScreen onActivated={handleActivated} />;
  }

  return <Dashboard activation={activation} onLogout={handleLogout} />;
}
