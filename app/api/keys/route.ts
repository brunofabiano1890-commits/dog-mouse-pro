import { NextRequest, NextResponse } from "next/server";
import {
  getAllKeys,
  addKey,
  deleteKey,
  generateKeyString,
  expiryForPlan,
  type KeyPlan,
} from "@/lib/keyStore";

// Senha do administrador
const ADMIN_PASSWORD = "Blzinn_Modz1579";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("x-admin-password");
  return auth === ADMIN_PASSWORD;
}

// GET /api/keys — list all keys
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ keys: getAllKeys() });
}

// POST /api/keys — generate new key
export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const plan = (body.plan as KeyPlan) || "Diária";
  const user = (body.user as string) || "Player";

  const key = generateKeyString();
  const expiry = expiryForPlan(plan);

  const stored = {
    key,
    plan,
    expiry,
    user,
    createdAt: new Date().toISOString(),
    used: false,
  };

  addKey(stored);

  return NextResponse.json({ success: true, data: stored });
}

// DELETE /api/keys — delete a key
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await req.json();
  deleteKey(key);
  return NextResponse.json({ success: true });
}
