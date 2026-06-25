import { NextRequest, NextResponse } from "next/server";
import { getKey } from "@/lib/keyStore";

// Chaves fixas permanentes — nunca expiram mesmo após reinício do servidor
const PERMANENT_KEYS: Record<string, { plan: string; expiry: string; user: string }> = {
  "DOG-MASTER-INFINITY-0000": { plan: "MASTER",  expiry: "2099-12-31", user: "Dono do App" },
  "DOG-PRO-2024-XXXX":        { plan: "Pro",     expiry: "2099-12-31", user: "Player Pro" },
  "DOG-VIP-9999-AAAA":        { plan: "VIP",     expiry: "2099-12-31", user: "Player VIP" },
  "DOG-PREMIUM-7777":         { plan: "Premium", expiry: "2099-12-31", user: "Player Premium" },
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key } = body;

  if (!key || typeof key !== "string") {
    return NextResponse.json(
      { success: false, message: "Chave inválida" },
      { status: 400 }
    );
  }

  const normalizedKey = key.trim().toUpperCase();

  // Check permanent keys first
  const permanentKey = PERMANENT_KEYS[normalizedKey];
  if (permanentKey) {
    return NextResponse.json({
      success: true,
      message: "Ativação bem-sucedida!",
      data: {
        plan: permanentKey.plan,
        expiry: permanentKey.expiry,
        user: permanentKey.user,
        activatedAt: new Date().toISOString(),
      },
    });
  }

  // Check dynamic keys
  const keyData = getKey(normalizedKey);

  if (!keyData) {
    return NextResponse.json(
      { success: false, message: "Chave não encontrada. Verifique e tente novamente." },
      { status: 401 }
    );
  }

  const now = new Date();
  const expiry = new Date(keyData.expiry);

  if (now > expiry) {
    return NextResponse.json(
      { success: false, message: "Chave expirada. Renove sua licença." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Ativação bem-sucedida!",
    data: {
      plan: keyData.plan,
      expiry: keyData.expiry,
      user: keyData.user,
      activatedAt: now.toISOString(),
    },
  });
}
