import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
