import { NextRequest, NextResponse } from "next/server";
import { getKey } from "@/lib/keyStore";

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
