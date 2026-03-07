import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBillingSnapshot } from "@/lib/billing";
import { hasAiConfiguration } from "@/lib/ai/openai";
import { isEmailConfigured } from "@/lib/email";
import { isGmailDirectSendAvailable } from "@/lib/gmail";
import { isListingImportConfigured } from "@/lib/listing-import";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getBillingSnapshot(Number(session.user.id));

  if (!snapshot) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    tier: snapshot.tier,
    stripeConfigured: snapshot.stripeConfigured,
    aiConfigured: hasAiConfiguration(),
    pdlConfigured: Boolean(process.env.PDL_API_KEY),
    emailConfigured: isEmailConfigured(),
    gmailDirectSendAvailable: isGmailDirectSendAvailable(),
    gmailConnected: Boolean(
      snapshot.user.gmailRefreshTokenEncrypted && snapshot.user.gmailSendAsEmail
    ),
    gmailSendingEnabled: snapshot.user.gmailSendingEnabled,
    gmailSendAsEmail: snapshot.user.gmailSendAsEmail,
    gmailLastSendError: snapshot.user.gmailLastSendError,
    listingImportConfigured: isListingImportConfigured(),
    googleAuthConfigured: Boolean(
      (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
        (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)
    ),
    eventsUsed: snapshot.eventsUsed,
    signInsUsed: snapshot.signInsUsed,
    limits: snapshot.limits,
    pdlUsed: snapshot.user.pdlCreditsUsed,
    pdlLimit: snapshot.user.pdlCreditsLimit,
    aiQueriesUsed: snapshot.user.aiQueriesUsed,
    aiQueriesLimit: snapshot.user.aiQueriesLimit,
    usageResetAt: snapshot.user.usageResetAt,
    stripeCustomerId: snapshot.user.stripeCustomerId,
    stripeSubscriptionId: snapshot.user.stripeSubscriptionId,
  });
}
