export const openHousePropertyTypes = [
  "single_family",
  "condo",
  "townhouse",
  "multi_family",
  "land",
  "other",
] as const;

export type OpenHousePropertyType = (typeof openHousePropertyTypes)[number];

export const publicModes = ["open_house", "listing_inquiry"] as const;

export type PublicMode = (typeof publicModes)[number];

export type EventAiQaContext = {
  customFaq?: Array<{ question: string; answer: string }>;
  mlsData?: Record<string, unknown>;
  nearbyPoi?: Record<string, unknown>;
};

export type EventImportDraft = {
  propertyAddress: string;
  mlsNumber: string | null;
  listPrice: string | null;
  propertyType: OpenHousePropertyType | null;
  bedrooms: number | null;
  bathrooms: string | null;
  sqft: number | null;
  yearBuilt: number | null;
  propertyDescription: string | null;
  propertyPhotos: string[];
  aiQaContext: EventAiQaContext | null;
  importSummary: {
    source: "mls" | "address" | "flyer";
    headline: string;
    subheadline: string;
    badges: string[];
  };
};
