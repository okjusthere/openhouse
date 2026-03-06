import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchListingsByAddress } from "@/lib/listing-import";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json({ error: "Address query is required" }, { status: 400 });
    }

    const drafts = await searchListingsByAddress(query);
    return NextResponse.json({ drafts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Address import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
