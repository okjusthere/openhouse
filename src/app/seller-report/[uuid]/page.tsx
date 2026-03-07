import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { SellerReportView, type SellerReportEvent } from "@/components/seller-report-view";
import { getDb } from "@/lib/db";
import { events, signIns } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function PublicSellerReportPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const db = getDb();

  const [event] = await db.select().from(events).where(eq(events.uuid, uuid)).limit(1);

  if (!event) {
    notFound();
  }

  const eventSignIns = await db.select().from(signIns).where(eq(signIns.eventId, event.id));

  const reportEvent: SellerReportEvent = {
    id: event.id,
    uuid: event.uuid,
    propertyAddress: event.propertyAddress,
    mlsNumber: event.mlsNumber,
    listPrice: event.listPrice ? String(event.listPrice) : null,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    publicMode: event.publicMode,
    status: event.status,
    totalSignIns: event.totalSignIns,
    hotLeadsCount: event.hotLeadsCount,
    bedrooms: event.bedrooms,
    bathrooms: event.bathrooms ? String(event.bathrooms) : null,
    sqft: event.sqft,
    signIns: eventSignIns.map((signIn) => ({
      id: signIn.id,
      fullName: signIn.fullName,
      phone: signIn.phone,
      email: signIn.email,
      captureMode: signIn.captureMode,
      hasAgent: Boolean(signIn.hasAgent),
      isPreApproved: signIn.isPreApproved,
      interestLevel: signIn.interestLevel,
      buyingTimeline: signIn.buyingTimeline,
      priceRange: signIn.priceRange,
      leadTier: signIn.leadTier,
      leadScore: signIn.leadScore
        ? {
            overallScore:
              typeof signIn.leadScore === "object" &&
              signIn.leadScore !== null &&
              "overallScore" in signIn.leadScore
                ? Number(
                    (signIn.leadScore as { overallScore?: number | string }).overallScore ?? 0
                  )
                : 0,
            tier:
              typeof signIn.leadScore === "object" &&
              signIn.leadScore !== null &&
              "tier" in signIn.leadScore
                ? String((signIn.leadScore as { tier?: string }).tier ?? "")
                : "",
          }
        : null,
      signedInAt: signIn.signedInAt.toISOString(),
    })),
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  const shareUrl = appUrl ? `${appUrl}/seller-report/${event.uuid}` : undefined;

  return <SellerReportView event={reportEvent} isPublic shareUrl={shareUrl} />;
}
