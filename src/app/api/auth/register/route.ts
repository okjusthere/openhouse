import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Email/password sign-up has been removed. Continue with Google instead.",
    },
    { status: 410 }
  );
}

