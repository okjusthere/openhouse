import type {
  EventAiQaContext,
  EventImportDraft,
  OpenHousePropertyType,
} from "@/lib/listing-import-shared";

export type EventFormState = {
  propertyAddress: string;
  mlsNumber: string;
  listPrice: string;
  propertyDescription: string;
  complianceText: string;
  startTime: string;
  endTime: string;
  status: string;
  propertyType: OpenHousePropertyType | "";
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  yearBuilt: string;
  propertyPhotos: string[];
  aiQaContext: EventAiQaContext | null;
  importSummary: EventImportDraft["importSummary"] | null;
};

export function createEmptyEventFormState(): EventFormState {
  return {
    propertyAddress: "",
    mlsNumber: "",
    listPrice: "",
    propertyDescription: "",
    complianceText: "",
    startTime: "",
    endTime: "",
    status: "active",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    yearBuilt: "",
    propertyPhotos: [],
    aiQaContext: null,
    importSummary: null,
  };
}

export function applyImportedDraft(
  current: EventFormState,
  draft: EventImportDraft
): EventFormState {
  return {
    ...current,
    propertyAddress: draft.propertyAddress || current.propertyAddress,
    mlsNumber: draft.mlsNumber || current.mlsNumber,
    listPrice: draft.listPrice || current.listPrice,
    propertyDescription: draft.propertyDescription || current.propertyDescription,
    propertyType: draft.propertyType || current.propertyType,
    bedrooms:
      draft.bedrooms !== null && draft.bedrooms !== undefined
        ? String(draft.bedrooms)
        : current.bedrooms,
    bathrooms: draft.bathrooms || current.bathrooms,
    sqft: draft.sqft !== null && draft.sqft !== undefined ? String(draft.sqft) : current.sqft,
    yearBuilt:
      draft.yearBuilt !== null && draft.yearBuilt !== undefined
        ? String(draft.yearBuilt)
        : current.yearBuilt,
    propertyPhotos: draft.propertyPhotos.length > 0 ? draft.propertyPhotos : current.propertyPhotos,
    aiQaContext: draft.aiQaContext || current.aiQaContext,
    importSummary: draft.importSummary,
  };
}

export function buildEventPayload(form: EventFormState) {
  return {
    propertyAddress: form.propertyAddress,
    mlsNumber: form.mlsNumber.trim() || undefined,
    listPrice: form.listPrice.trim() || undefined,
    startTime: new Date(form.startTime).toISOString(),
    endTime: new Date(form.endTime).toISOString(),
    propertyDescription: form.propertyDescription.trim() || undefined,
    complianceText: form.complianceText.trim() || undefined,
    status: form.status,
    propertyType: form.propertyType || undefined,
    bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
    bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
    sqft: form.sqft ? Number(form.sqft) : undefined,
    yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
    propertyPhotos: form.propertyPhotos.length > 0 ? form.propertyPhotos : undefined,
    aiQaContext: form.aiQaContext || undefined,
  };
}
