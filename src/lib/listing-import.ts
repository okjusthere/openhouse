import { z } from "zod";
import { PDFParse } from "pdf-parse";
import { chatCompletion, hasAiConfiguration } from "@/lib/ai/openai";
import type {
  EventImportDraft,
  OpenHousePropertyType,
} from "@/lib/listing-import-shared";
export { openHousePropertyTypes } from "@/lib/listing-import-shared";

type ImportedListing = {
  source: "mls" | "address" | "flyer";
  id: string | null;
  mlsNumber: string | null;
  listingKey: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  listPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  lotSize: number | null;
  yearBuilt: number | null;
  propertyType: OpenHousePropertyType | null;
  status: string | null;
  description: string | null;
  features: string[];
  neighborhood: string | null;
  schoolDistrict: string | null;
  photos: string[];
  virtualTourUrl: string | null;
  daysOnMarket: number | null;
  providerSource: string | null;
  fallbackUsed: boolean | null;
  rawPayload: Record<string, unknown> | null;
};

const flyerExtractionSchema = z.object({
  mls_number: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  list_price: z.number().nullable().optional(),
  bedrooms: z.number().nullable().optional(),
  bathrooms: z.number().nullable().optional(),
  sqft: z.number().nullable().optional(),
  year_built: z.number().nullable().optional(),
  property_type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  school_district: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .optional(),
  nearby_poi: z.record(z.string(), z.unknown()).optional(),
});

const marketingCopySchema = z.object({
  headline: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  highlights: z.array(z.string()).max(5).optional(),
});

function getListingImportConfig() {
  const usesBboAlias = Boolean(process.env.BBO_BASE_URL || process.env.BBO_API_KEY);
  const baseUrl =
    process.env.LISTING_DATA_API_URL ||
    process.env.BBO_BASE_URL ||
    process.env.REAL_ESTATE_API_URL ||
    process.env.MLS_IMPORT_API_URL ||
    "";
  const apiKey =
    process.env.LISTING_DATA_API_KEY ||
    process.env.BBO_API_KEY ||
    process.env.REAL_ESTATE_API_KEY ||
    process.env.MLS_IMPORT_API_KEY ||
    "";
  const mlsPath =
    process.env.LISTING_DATA_MLS_LOOKUP_PATH ||
    (usesBboAlias ? "/api/v1/listings/:mlsId" : "/api/v1/listings/mls/:mlsId");
  const addressSearchPath =
    process.env.LISTING_DATA_ADDRESS_SEARCH_PATH || "/api/v1/search";

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
    mlsPath,
    addressSearchPath,
  };
}

export function isListingImportConfigured() {
  const config = getListingImportConfig();
  return Boolean(config.baseUrl && config.apiKey);
}

function buildServiceHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}

function buildServiceUrl(baseUrl: string, path: string) {
  if (!path.startsWith("/")) {
    return `${baseUrl}/${path}`;
  }

  return `${baseUrl}${path}`;
}

function toDataUrl(fileBuffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
}

async function fetchServiceJson<T>(
  input: RequestInfo | URL,
  init: RequestInit
): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get("content-type") || "";

  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (typeof payload === "object" && payload && "error" in payload) {
      const error = payload as {
        error?: { message?: string };
        message?: string;
      };
      throw new Error(error.error?.message || error.message || "Listing import request failed");
    }

    throw new Error(typeof payload === "string" ? payload : "Listing import request failed");
  }

  return payload as T;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}

function toStringValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    return value
      .split(/[|,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return null;
}

function mapPropertyType(value: string | null | undefined): OpenHousePropertyType | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized.includes("condo") || normalized.includes("apartment")) return "condo";
  if (normalized.includes("town")) return "townhouse";
  if (normalized.includes("multi") || normalized.includes("duplex") || normalized.includes("triplex")) {
    return "multi_family";
  }
  if (normalized.includes("land") || normalized.includes("lot")) return "land";
  if (
    normalized.includes("single") ||
    normalized.includes("detached") ||
    normalized.includes("house") ||
    normalized.includes("residential")
  ) {
    return "single_family";
  }

  return "other";
}

function formatAddress(
  address: string,
  city?: string | null,
  state?: string | null,
  zipCode?: string | null
) {
  const locality = [city, state, zipCode].filter(Boolean).join(" ");
  const pieces = [address, locality].filter(Boolean);
  return pieces.join(", ");
}

function normalizeImportedListing(
  rawListing: Record<string, unknown>,
  source: ImportedListing["source"]
): ImportedListing {
  const property = isRecord(rawListing.property) ? rawListing.property : rawListing;
  const mediaItems = Array.isArray(rawListing.media)
    ? rawListing.media.filter(isRecord)
    : [];
  const derivedPhotos = [
    ...toStringArray(rawListing.imageUrls),
    ...mediaItems.flatMap((item) =>
      [
        toStringValue(item.displayUrl),
        toStringValue(item.mediaURL),
        toStringValue(item.rawUrl),
        toStringValue(item.url),
      ].filter((entry): entry is string => Boolean(entry))
    ),
    ...toStringArray(property.photos),
  ].filter(Boolean);

  return {
    source,
    id: toStringValue(property.id ?? property.listing_id ?? property.listingId),
    mlsNumber: toStringValue(
      property.mls_id ?? property.mlsNumber ?? property.mls_number ?? property.listingId
    ),
    listingKey: toStringValue(property.listingKey ?? property.listing_key),
    address: toStringValue(property.address ?? property.unparsedAddress) || "Imported property",
    city: toStringValue(property.city),
    state: toStringValue(property.state ?? property.stateOrProvince),
    zipCode: toStringValue(property.zip_code ?? property.zipCode ?? property.postalCode),
    listPrice: toNumber(property.price ?? property.list_price ?? property.listPrice ?? property.ListPrice),
    bedrooms: toNumber(property.bedrooms ?? property.bedroomsTotal ?? property.BedroomsTotal),
    bathrooms: toNumber(
      property.bathrooms ??
        property.bathroomsFull ??
        property.bathroomsTotalInteger ??
        property.BathroomsFull
    ),
    sqft: toNumber(property.sqft ?? property.livingArea ?? property.LivingArea),
    lotSize: toNumber(property.lot_size ?? property.lotSize),
    yearBuilt: toNumber(property.year_built ?? property.yearBuilt ?? property.YearBuilt),
    propertyType: mapPropertyType(
      toStringValue(property.property_type ?? property.propertyType ?? property.PropertyType)
    ),
    status: toStringValue(property.status ?? property.standardStatus ?? property.StandardStatus),
    description: toStringValue(
      property.description ?? property.publicRemarks ?? property.PublicRemarks
    ),
    features: toStringArray(property.features ?? property.interiorFeatures ?? property.appliances),
    neighborhood: toStringValue(property.neighborhood ?? property.subdivisionName),
    schoolDistrict: toStringValue(property.school_district ?? property.schoolDistrict),
    photos: Array.from(new Set(derivedPhotos)),
    virtualTourUrl: toStringValue(
      property.virtual_tour_url ?? property.virtualTourUrl ?? property.virtualTourURL
    ),
    daysOnMarket: toNumber(property.days_on_market ?? property.daysOnMarket),
    providerSource: toStringValue(rawListing.source),
    fallbackUsed: toBoolean(rawListing.fallbackUsed),
    rawPayload: rawListing,
  };
}

function buildFaq(listing: ImportedListing) {
  const faqs: Array<{ question: string; answer: string }> = [];

  if (listing.listPrice) {
    faqs.push({
      question: "What is the list price?",
      answer: `The current list price is $${Math.round(listing.listPrice).toLocaleString()}.`,
    });
  }

  if (listing.bedrooms || listing.bathrooms || listing.sqft) {
    const fragments = [
      listing.bedrooms ? `${listing.bedrooms} bedrooms` : null,
      listing.bathrooms ? `${listing.bathrooms} bathrooms` : null,
      listing.sqft ? `${listing.sqft.toLocaleString()} square feet` : null,
    ].filter(Boolean);

    faqs.push({
      question: "What are the main property stats?",
      answer: `The home offers ${fragments.join(", ")}.`,
    });
  }

  if (listing.neighborhood || listing.schoolDistrict) {
    const pieces = [
      listing.neighborhood ? `Neighborhood: ${listing.neighborhood}` : null,
      listing.schoolDistrict ? `School district: ${listing.schoolDistrict}` : null,
    ].filter(Boolean);

    faqs.push({
      question: "What area details are available?",
      answer: pieces.join(". "),
    });
  }

  if (listing.daysOnMarket) {
    faqs.push({
      question: "How long has this property been on market?",
      answer: `The listing shows ${listing.daysOnMarket} days on market.`,
    });
  }

  return faqs.slice(0, 4);
}

function buildNearbyPoiContext(listing: ImportedListing) {
  const context: Record<string, unknown> = {};

  if (listing.neighborhood) {
    context.neighborhood = listing.neighborhood;
  }

  if (listing.schoolDistrict) {
    context.schoolDistrict = listing.schoolDistrict;
  }

  if (listing.virtualTourUrl) {
    context.virtualTourUrl = listing.virtualTourUrl;
  }

  if (listing.features.length > 0) {
    context.highlights = listing.features.slice(0, 8);
  }

  return Object.keys(context).length > 0 ? context : undefined;
}

function toDraftSummary(listing: ImportedListing): EventImportDraft["importSummary"] {
  const badges = [
    listing.mlsNumber ? `MLS ${listing.mlsNumber}` : null,
    listing.listPrice ? `$${Math.round(listing.listPrice).toLocaleString()}` : null,
    listing.propertyType ? listing.propertyType.replace("_", " ") : null,
    listing.photos.length > 0 ? `${listing.photos.length} photos` : null,
  ].filter((item): item is string => Boolean(item));

  return {
    source: listing.source,
    headline: listing.address,
    subheadline: [listing.city, listing.state, listing.schoolDistrict]
      .filter(Boolean)
      .join(" · "),
    badges,
  };
}

function buildFallbackMarketingCopy(listing: ImportedListing) {
  const location = listing.neighborhood || listing.city || listing.address;
  const statLine = [
    listing.bedrooms ? `${listing.bedrooms}-bed` : null,
    listing.bathrooms ? `${listing.bathrooms}-bath` : null,
    listing.sqft ? `${listing.sqft.toLocaleString()} sqft` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const propertyType =
    listing.propertyType?.replace(/_/g, " ") || "home";
  const summary =
    listing.description?.replace(/\s+/g, " ").trim().slice(0, 260) ||
    `Explore a ${propertyType} in ${location} with polished open-house-ready details.`;

  return {
    headline: statLine
      ? `${statLine} ${propertyType} in ${location}`
      : `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${location}`,
    summary,
    highlights: Array.from(new Set(listing.features.filter(Boolean))).slice(0, 4),
  };
}

async function generateMarketingCopy(listing: ImportedListing) {
  const fallback = buildFallbackMarketingCopy(listing);

  if (!hasAiConfiguration()) {
    return fallback;
  }

  const facts = {
    address: formatAddress(listing.address, listing.city, listing.state, listing.zipCode),
    listPrice: listing.listPrice,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    status: listing.status,
    neighborhood: listing.neighborhood,
    schoolDistrict: listing.schoolDistrict,
    features: listing.features.slice(0, 10),
    description: listing.description,
  };

  try {
    const result = await chatCompletion({
      messages: [
        {
          role: "user",
          content: `Write polished marketing copy for a public open-house sign-in page.\n\nReturn JSON only with:\n- headline: max 90 characters\n- summary: max 260 characters\n- highlights: array of 3 to 4 short bullets\n\nRules:\n- Sound credible, polished, and North American residential real-estate appropriate.\n- Do not invent facts.\n- Avoid raw MLS jargon, all-caps, and awkward abbreviations.\n- Avoid fair-housing sensitive language.\n- Focus on layout, light, flow, upgrades, convenience, and practical buyer value.\n\nListing facts:\n${JSON.stringify(facts, null, 2)}`,
        },
      ],
      maxTokens: 420,
      temperature: 0.4,
      responseFormat: "json",
    });

    const parsed = marketingCopySchema.parse(JSON.parse(result.content));

    return {
      headline: parsed.headline?.trim() || fallback.headline,
      summary: parsed.summary?.trim() || fallback.summary,
      highlights:
        parsed.highlights?.map((item) => item.trim()).filter(Boolean).slice(0, 4) ||
        fallback.highlights,
    };
  } catch {
    return fallback;
  }
}

async function withMarketingCopy(
  draft: EventImportDraft,
  listing: ImportedListing
): Promise<EventImportDraft> {
  const marketing = await generateMarketingCopy(listing);

  return {
    ...draft,
    aiQaContext: {
      ...(draft.aiQaContext ?? {}),
      customFaq: draft.aiQaContext?.customFaq,
      nearbyPoi: draft.aiQaContext?.nearbyPoi,
      mlsData: {
        ...(draft.aiQaContext?.mlsData ?? {}),
        marketingHeadline: marketing.headline,
        marketingSummary: marketing.summary,
        marketingHighlights: marketing.highlights,
      },
    },
  };
}

export function mapListingToEventDraft(listing: ImportedListing): EventImportDraft {
  return {
    propertyAddress: formatAddress(listing.address, listing.city, listing.state, listing.zipCode),
    mlsNumber: listing.mlsNumber,
    listPrice: listing.listPrice !== null ? String(Math.round(listing.listPrice)) : null,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms !== null ? String(listing.bathrooms) : null,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    propertyDescription: listing.description,
    propertyPhotos: listing.photos,
    aiQaContext: {
      customFaq: buildFaq(listing),
      mlsData: {
        importedSource: listing.source,
        importedAt: new Date().toISOString(),
        externalId: listing.id,
        mlsNumber: listing.mlsNumber,
        listingKey: listing.listingKey,
        address: formatAddress(listing.address, listing.city, listing.state, listing.zipCode),
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        listPrice: listing.listPrice,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        sqft: listing.sqft,
        lotSize: listing.lotSize,
        yearBuilt: listing.yearBuilt,
        propertyType: listing.propertyType,
        status: listing.status,
        features: listing.features,
        neighborhood: listing.neighborhood,
        schoolDistrict: listing.schoolDistrict,
        virtualTourUrl: listing.virtualTourUrl,
        daysOnMarket: listing.daysOnMarket,
        photos: listing.photos,
        source: listing.providerSource,
        fallbackUsed: listing.fallbackUsed,
        sourcePayload: listing.rawPayload,
      },
      nearbyPoi: buildNearbyPoiContext(listing),
    },
    importSummary: toDraftSummary(listing),
  };
}

type ListingLookupResponse = {
  success?: boolean;
  data?: {
    listing?: Record<string, unknown>;
  };
  listing?: Record<string, unknown>;
  property?: Record<string, unknown>;
  media?: Array<Record<string, unknown>>;
  imageUrls?: string[];
  source?: string;
  fallbackUsed?: boolean;
};

type ListingSearchResponse = {
  success?: boolean;
  data?: {
    results?: Array<{
      listing?: Record<string, unknown>;
      listing_id?: string | number;
      mls_id?: string | number;
    }>;
  };
};

export async function importListingByMlsNumber(mlsNumber: string) {
  const config = getListingImportConfig();

  if (!config.baseUrl || !config.apiKey) {
    throw new Error("Listing import service is not configured");
  }

  const lookupPath = config.mlsPath.replace(":mlsId", encodeURIComponent(mlsNumber.trim()));
  const url = buildServiceUrl(config.baseUrl, lookupPath);
  const payload = await fetchServiceJson<ListingLookupResponse>(url, {
    method: "GET",
    headers: buildServiceHeaders(config.apiKey),
    cache: "no-store",
  });
  const listing =
    payload.data?.listing ??
    payload.listing ??
    (payload.property
      ? {
          source: payload.source,
          fallbackUsed: payload.fallbackUsed,
          property: payload.property,
          media: payload.media,
          imageUrls: payload.imageUrls,
        }
      : null);

  if (!listing) {
    throw new Error(`Listing ${mlsNumber} was not found`);
  }

  const normalized = normalizeImportedListing(listing, "mls");
  return withMarketingCopy(mapListingToEventDraft(normalized), normalized);
}

export async function searchListingsByAddress(query: string) {
  const config = getListingImportConfig();

  if (!config.baseUrl || !config.apiKey) {
    throw new Error("Listing import service is not configured");
  }

  const url = buildServiceUrl(config.baseUrl, config.addressSearchPath);
  const payload = await fetchServiceJson<ListingSearchResponse>(url, {
    method: "POST",
    headers: buildServiceHeaders(config.apiKey),
    body: JSON.stringify({
      query: query.trim(),
      top_k: 5,
      include_pitch: false,
    }),
    cache: "no-store",
  });

  const results = payload.data?.results ?? [];

  return results
    .map((item) => item.listing)
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => mapListingToEventDraft(normalizeImportedListing(item, "address")));
}

async function parsePdfText(fileBuffer: Buffer) {
  const parser = new PDFParse({ data: fileBuffer });
  const parsed = await parser.getText();
  await parser.destroy();
  return parsed.text?.trim() || "";
}

async function extractStructuredFlyerDataFromText(documentText: string) {
  if (!hasAiConfiguration()) {
    throw new Error("AI is not configured for flyer import");
  }

  const prompt = `Extract structured real-estate listing data from the following flyer or PDF text.

Return JSON only.

Rules:
- Preserve exact listing facts when available.
- If a field is missing, return null.
- property_type should be a human-readable phrase like "single family", "condo", "townhouse", "multi family", or "land".
- features should be a short array of notable highlights.
- faq should contain up to 4 concise Q&A pairs that a visitor would ask at an open house.
- nearby_poi should only include concrete information found in the document text.

Document text:
"""
${documentText.slice(0, 20000)}
"""`;

  const result = await chatCompletion({
    messages: [{ role: "user", content: prompt }],
    maxTokens: 1400,
    temperature: 0.2,
    responseFormat: "json",
  });

  const parsed = JSON.parse(result.content);
  return flyerExtractionSchema.parse(parsed);
}

async function extractStructuredFlyerDataFromImage(fileBuffer: Buffer, mimeType: string) {
  if (!hasAiConfiguration()) {
    throw new Error("AI is not configured for flyer import");
  }

  const prompt = `Extract structured real-estate listing data from this marketing flyer image.

Return JSON only.

Rules:
- Preserve exact listing facts when available.
- If a field is missing, return null.
- property_type should be a human-readable phrase like "single family", "condo", "townhouse", "multi family", or "land".
- features should be a short array of notable highlights.
- faq should contain up to 4 concise Q&A pairs that a visitor would ask at an open house.
- nearby_poi should only include concrete information visible in the flyer.`;

  const result = await chatCompletion({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: toDataUrl(fileBuffer, mimeType) } },
        ],
      },
    ],
    maxTokens: 1400,
    temperature: 0.2,
    responseFormat: "json",
  });

  const parsed = JSON.parse(result.content);
  return flyerExtractionSchema.parse(parsed);
}

export async function importListingFromFlyer(
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
) {
  const isPdf = mimeType === "application/pdf";
  const isSupportedImage = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(mimeType);

  if (!isPdf && !isSupportedImage) {
    throw new Error("Only PDF, PNG, JPG, or WEBP flyers are supported");
  }

  const extracted = isPdf
    ? await (async () => {
        const extractedText = await parsePdfText(fileBuffer);

        if (!extractedText) {
          throw new Error("No text could be extracted from the uploaded PDF");
        }

        return extractStructuredFlyerDataFromText(extractedText);
      })()
    : await extractStructuredFlyerDataFromImage(fileBuffer, mimeType);
  const listing = normalizeImportedListing(
    {
      mls_number: extracted.mls_number,
      address: extracted.address,
      city: extracted.city,
      state: extracted.state,
      zip_code: extracted.zip_code,
      list_price: extracted.list_price,
      bedrooms: extracted.bedrooms,
      bathrooms: extracted.bathrooms,
      sqft: extracted.sqft,
      year_built: extracted.year_built,
      property_type: extracted.property_type,
      description: extracted.description,
      neighborhood: extracted.neighborhood,
      school_district: extracted.school_district,
      features: extracted.features,
    },
    "flyer"
  );

  const draft = mapListingToEventDraft(listing);
  const faq = extracted.faq?.slice(0, 4);
  const nearbyPoi = extracted.nearby_poi;

  return withMarketingCopy({
    ...draft,
    aiQaContext: {
      customFaq: faq && faq.length > 0 ? faq : draft.aiQaContext?.customFaq,
      mlsData: {
        ...(draft.aiQaContext?.mlsData ?? {}),
        importedSource: "flyer",
        importedAt: new Date().toISOString(),
        documentName: fileName,
      },
      nearbyPoi:
        nearbyPoi && Object.keys(nearbyPoi).length > 0
          ? nearbyPoi
          : draft.aiQaContext?.nearbyPoi,
    },
  } satisfies EventImportDraft, listing);
}
