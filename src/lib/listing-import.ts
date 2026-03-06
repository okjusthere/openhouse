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

function getListingImportConfig() {
  const baseUrl =
    process.env.LISTING_DATA_API_URL ||
    process.env.REAL_ESTATE_API_URL ||
    process.env.MLS_IMPORT_API_URL ||
    "";
  const apiKey =
    process.env.LISTING_DATA_API_KEY ||
    process.env.REAL_ESTATE_API_KEY ||
    process.env.MLS_IMPORT_API_KEY ||
    "";
  const mlsPath =
    process.env.LISTING_DATA_MLS_LOOKUP_PATH || "/api/v1/listings/mls/:mlsId";
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
  return {
    source,
    id: toStringValue(rawListing.id ?? rawListing.listing_id),
    mlsNumber: toStringValue(rawListing.mls_id ?? rawListing.mlsNumber ?? rawListing.mls_number),
    address: toStringValue(rawListing.address) || "Imported property",
    city: toStringValue(rawListing.city),
    state: toStringValue(rawListing.state),
    zipCode: toStringValue(rawListing.zip_code ?? rawListing.zipCode),
    listPrice: toNumber(rawListing.price ?? rawListing.list_price ?? rawListing.listPrice),
    bedrooms: toNumber(rawListing.bedrooms),
    bathrooms: toNumber(rawListing.bathrooms),
    sqft: toNumber(rawListing.sqft),
    lotSize: toNumber(rawListing.lot_size ?? rawListing.lotSize),
    yearBuilt: toNumber(rawListing.year_built ?? rawListing.yearBuilt),
    propertyType: mapPropertyType(toStringValue(rawListing.property_type ?? rawListing.propertyType)),
    status: toStringValue(rawListing.status),
    description: toStringValue(rawListing.description),
    features: toStringArray(rawListing.features),
    neighborhood: toStringValue(rawListing.neighborhood),
    schoolDistrict: toStringValue(rawListing.school_district ?? rawListing.schoolDistrict),
    photos: toStringArray(rawListing.photos),
    virtualTourUrl: toStringValue(rawListing.virtual_tour_url ?? rawListing.virtualTourUrl),
    daysOnMarket: toNumber(rawListing.days_on_market ?? rawListing.daysOnMarket),
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
  const listing = payload.data?.listing;

  if (!listing) {
    throw new Error(`Listing ${mlsNumber} was not found`);
  }

  return mapListingToEventDraft(normalizeImportedListing(listing, "mls"));
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

  return {
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
  } satisfies EventImportDraft;
}
