import { NextRequest, NextResponse } from "next/server";
import { readSpaces } from "@/lib/admin-spaces-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const spaces = await readSpaces();
  const space = spaces.find((item) => String(item.id) === String(id));

  if (!space) {
    return NextResponse.json(
      { message: "Space tidak ditemukan." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    message: "OK",
    data: space,
  });
}
