"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventImportDraft } from "@/lib/listing-import-shared";
import { cn } from "@/lib/utils";
import {
  FileSearch,
  FileUp,
  Home,
  Loader2,
  MapPin,
  ScanSearch,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  onApplyDraft: (draft: EventImportDraft) => void;
  className?: string;
};

type AddressSearchResult = EventImportDraft[];

function DraftPreview({ draft }: { draft: EventImportDraft }) {
  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-emerald-500/25 bg-emerald-500/10 text-emerald-700">
          {draft.importSummary.source.toUpperCase()}
        </Badge>
        {draft.importSummary.badges.map((badge) => (
          <Badge key={badge} variant="outline" className="border-border/60 bg-background/70">
            {badge}
          </Badge>
        ))}
      </div>
      <p className="mt-3 text-sm font-semibold text-foreground">{draft.importSummary.headline}</p>
      {draft.importSummary.subheadline ? (
        <p className="mt-1 text-xs text-muted-foreground">{draft.importSummary.subheadline}</p>
      ) : null}
      {draft.propertyDescription ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {draft.propertyDescription}
        </p>
      ) : null}
    </div>
  );
}

export function EventImportAssistant({ onApplyDraft, className }: Props) {
  const [mlsNumber, setMlsNumber] = useState("");
  const [addressQuery, setAddressQuery] = useState("");
  const [isImportingMls, setIsImportingMls] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);
  const [addressResults, setAddressResults] = useState<AddressSearchResult>([]);
  const [latestDraft, setLatestDraft] = useState<EventImportDraft | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const hasAddressResults = addressResults.length > 0;
  const mlsHelper = useMemo(
    () => "Paste an MLS number to pull structured property data and enrich the event draft.",
    []
  );

  async function applyDraft(draft: EventImportDraft, successMessage: string) {
    onApplyDraft(draft);
    setLatestDraft(draft);
    toast.success(successMessage);
  }

  async function handleMlsImport() {
    if (!mlsNumber.trim()) {
      toast.error("Enter an MLS number first");
      return;
    }

    try {
      setIsImportingMls(true);
      const response = await fetch("/api/import/mls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mlsNumber }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "MLS import failed");
      }

      await applyDraft(payload.draft as EventImportDraft, "MLS data applied to this event draft");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "MLS import failed");
    } finally {
      setIsImportingMls(false);
    }
  }

  async function handleAddressSearch() {
    if (!addressQuery.trim()) {
      toast.error("Enter an address or neighborhood query first");
      return;
    }

    try {
      setIsSearchingAddress(true);
      setAddressResults([]);

      const response = await fetch("/api/import/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: addressQuery }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Address search failed");
      }

      const drafts = (payload.drafts as EventImportDraft[]) ?? [];
      setAddressResults(drafts);

      if (drafts.length === 0) {
        toast.message("No matching listings were found for that address query.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Address search failed");
    } finally {
      setIsSearchingAddress(false);
    }
  }

  async function handleFlyerUpload(file: File | null) {
    if (!file) {
      return;
    }

    try {
      setIsUploadingFlyer(true);
      setSelectedFileName(file.name);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/flyer", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Flyer import failed");
      }

      await applyDraft(payload.draft as EventImportDraft, "Flyer data applied to this event draft");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Flyer import failed");
    } finally {
      setIsUploadingFlyer(false);
    }
  }

  return (
    <Card
      className={cn(
        "border-border/60 bg-gradient-to-br from-background to-muted/20 shadow-sm",
        className
      )}
    >
      <CardHeader className="gap-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-xs font-medium text-emerald-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI-native property import
        </div>
        <div>
          <CardTitle className="text-base sm:text-lg">Start with listing data instead of a blank form</CardTitle>
          <CardDescription className="mt-1 max-w-2xl text-sm leading-relaxed">
            Pull a record from your MLS data service, search by address, or upload a PDF flyer to
            backfill the event draft and AI Q&A context. Keep the flyer upload path as a manual
            fallback whenever the MLS payload is incomplete or unavailable.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="mls">
          <TabsList variant="line" className="w-full justify-start gap-2 rounded-2xl bg-transparent p-0">
            <TabsTrigger
              value="mls"
              className="rounded-2xl border border-border/60 bg-background/80 px-4 py-2 data-[state=active]:border-emerald-500/30 data-[state=active]:bg-emerald-500/[0.08]"
            >
              <Home className="h-4 w-4" />
              Import by MLS #
            </TabsTrigger>
            <TabsTrigger
              value="address"
              className="rounded-2xl border border-border/60 bg-background/80 px-4 py-2 data-[state=active]:border-emerald-500/30 data-[state=active]:bg-emerald-500/[0.08]"
            >
              <MapPin className="h-4 w-4" />
              Import by Address
            </TabsTrigger>
            <TabsTrigger
              value="flyer"
              className="rounded-2xl border border-border/60 bg-background/80 px-4 py-2 data-[state=active]:border-emerald-500/30 data-[state=active]:bg-emerald-500/[0.08]"
            >
              <FileUp className="h-4 w-4" />
              Upload Flyer / PDF
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mls" className="mt-5">
            <div className="grid gap-4 rounded-3xl border border-border/60 bg-background/75 p-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3">
                <Label htmlFor="mls-import-number">MLS number</Label>
                <div className="flex gap-2">
                  <Input
                    id="mls-import-number"
                    placeholder="e.g. MLS123456"
                    value={mlsNumber}
                    onChange={(event) => setMlsNumber(event.target.value)}
                  />
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                    onClick={handleMlsImport}
                    disabled={isImportingMls}
                  >
                    {isImportingMls ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ScanSearch className="mr-2 h-4 w-4" />
                    )}
                    Pull listing
                  </Button>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{mlsHelper}</p>
              </div>

              <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  What gets filled
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Address, price, beds, baths, square footage, year built</li>
                  <li>Property description and photo URLs</li>
                  <li>AI Q&A context like neighborhood, school district, and listing highlights</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="mt-5 space-y-4">
            <div className="rounded-3xl border border-border/60 bg-background/75 p-4">
              <Label htmlFor="address-import-query">Address or neighborhood query</Label>
              <div className="mt-3 flex gap-2">
                <Input
                  id="address-import-query"
                  placeholder="123 Main St, Jersey City, NJ"
                  value={addressQuery}
                  onChange={(event) => setAddressQuery(event.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleAddressSearch} disabled={isSearchingAddress}>
                  {isSearchingAddress ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </div>

            {hasAddressResults && (
              <div className="grid gap-3">
                {addressResults.map((draft) => (
                  <div
                    key={`${draft.importSummary.headline}-${draft.importSummary.badges.join("-")}`}
                    className="rounded-3xl border border-border/60 bg-background/85 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <DraftPreview draft={draft} />
                      <Button
                        type="button"
                        className="shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                        onClick={() => applyDraft(draft, "Address match applied to this event draft")}
                      >
                        Apply this match
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flyer" className="mt-5">
            <div className="rounded-3xl border border-border/60 bg-background/75 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload a PDF flyer</p>
                  <p className="text-xs text-muted-foreground">
                    OpenHouse will extract listing facts from a flyer image or PDF, generate a
                    structured draft, and prep AI Q&A context from the uploaded asset.
                  </p>
                </div>
                <Label
                  htmlFor="flyer-upload-input"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-border/70 bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
                >
                  {isUploadingFlyer ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSearch className="h-4 w-4" />
                  )}
                  {isUploadingFlyer ? "Analyzing PDF..." : "Choose PDF"}
                </Label>
              </div>
              <input
                id="flyer-upload-input"
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => handleFlyerUpload(event.target.files?.[0] ?? null)}
                disabled={isUploadingFlyer}
              />
              {selectedFileName ? (
                <p className="mt-4 text-xs text-muted-foreground">Selected file: {selectedFileName}</p>
              ) : null}
            </div>
          </TabsContent>
        </Tabs>

        {latestDraft ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Latest imported draft
            </p>
            <DraftPreview draft={latestDraft} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
