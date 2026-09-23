import { NextResponse } from "next/server";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET() {
  const spaces = await readSpaces();

  return NextResponse.json({
    message: "OK",
    data: spaces,
  });
}
