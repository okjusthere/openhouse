import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  encryptGmailRefreshToken,
  exchangeGmailCodeForTokens,
  fetchGoogleUserInfo,
  isGmailDirectSendAvailable,
  parseGmailOAuthState,
} from "@/lib/gmail";

function sanitizeReturnTo(value?: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard/settings";
  }

  return value;
}

function redirectWithStatus(request: NextRequest, returnTo: string, status: string) {
  const url = new URL(returnTo, request.url);
  url.searchParams.set("gmail", status);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const googleError = request.nextUrl.searchParams.get("error");

  let parsedState: { userId: number; returnTo?: string } | null = null;

  if (state) {
    try {
      parsedState = parseGmailOAuthState(state);
    } catch {
      parsedState = null;
    }
  }

  const returnTo = sanitizeReturnTo(parsedState?.returnTo);

  if (!isGmailDirectSendAvailable()) {
    return redirectWithStatus(request, returnTo, "not-configured");
  }

  if (googleError) {
    return redirectWithStatus(request, returnTo, googleError === "access_denied" ? "denied" : "error");
  }

  if (!parsedState?.userId || !code) {
    return redirectWithStatus(request, returnTo, "error");
  }

  const [existingUser] = await db
    .select({
      id: users.id,
      gmailRefreshTokenEncrypted: users.gmailRefreshTokenEncrypted,
    })
    .from(users)
    .where(eq(users.id, parsedState.userId))
    .limit(1);

  if (!existingUser) {
    return redirectWithStatus(request, returnTo, "error");
  }

  try {
    const tokens = await exchangeGmailCodeForTokens(code);
    const userInfo = await fetchGoogleUserInfo(tokens.access_token!);
    const refreshTokenEncrypted = tokens.refresh_token
      ? encryptGmailRefreshToken(tokens.refresh_token)
      : existingUser.gmailRefreshTokenEncrypted;

    if (!refreshTokenEncrypted) {
      return redirectWithStatus(request, returnTo, "missing-refresh-token");
    }

    await db
      .update(users)
      .set({
        gmailRefreshTokenEncrypted: refreshTokenEncrypted,
        gmailSendAsEmail: userInfo.email ?? null,
        gmailSendingEnabled: true,
        gmailConnectedAt: new Date(),
        gmailLastSendError: null,
      })
      .where(eq(users.id, existingUser.id));

    return redirectWithStatus(request, returnTo, "connected");
  } catch {
    return redirectWithStatus(request, returnTo, "error");
  }
}
