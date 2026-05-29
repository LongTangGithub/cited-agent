import { getLeases } from "@/lib/leases";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lease = getLeases().find((l) => l.id === id);
  if (!lease) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lease, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
