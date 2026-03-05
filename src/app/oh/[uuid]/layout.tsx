import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ uuid: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { uuid } = await params;

  const fallbackTitle = "Open House Visitor Sign-In";
  const fallbackDescription =
    "Secure visitor sign-in page powered by OpenHouse for real estate open house events.";

  try {
    const db = getDb();
    const [event] = await db
      .select({
        propertyAddress: events.propertyAddress,
        listPrice: events.listPrice,
        branding: events.branding,
      })
      .from(events)
      .where(eq(events.uuid, uuid))
      .limit(1);

    if (!event) {
      return {
        title: fallbackTitle,
        description: fallbackDescription,
        alternates: {
          canonical: absoluteUrl(`/oh/${uuid}`),
        },
        robots: {
          index: false,
          follow: false,
          nocache: true,
        },
      };
    }

    const readablePrice =
      event.listPrice && !Number.isNaN(Number(event.listPrice))
        ? `$${Number(event.listPrice).toLocaleString()}`
        : null;

    const title = `${event.propertyAddress} | Open House Sign-In`;
    const description = readablePrice
      ? `${event.propertyAddress} (${readablePrice}) visitor sign-in page powered by OpenHouse.`
      : `${event.propertyAddress} visitor sign-in page powered by OpenHouse.`;

    const socialImage = event.branding?.logoUrl || absoluteUrl("/opengraph-image");

    return {
      title,
      description,
      alternates: {
        canonical: absoluteUrl(`/oh/${uuid}`),
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: absoluteUrl(`/oh/${uuid}`),
        images: [{ url: socialImage }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [socialImage],
      },
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      alternates: {
        canonical: absoluteUrl(`/oh/${uuid}`),
      },
      robots: {
        index: false,
        follow: false,
        nocache: true,
      },
    };
  }
}

export default function PublicOpenHouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
