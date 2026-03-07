import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { listHistoryEntries, listSavedPrompts } from "@/lib/prompt-store/server";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    savedPrompts: listSavedPrompts(user.id),
    history: listHistoryEntries(user.id),
  });
}
