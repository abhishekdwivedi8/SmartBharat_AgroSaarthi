import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, TrendingUp, Factory, Ship, Info, Share2 } from "lucide-react";

// Lightweight SEO helper (no extra deps)
function useSEO(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${path}`;
  }, [title, description, path]);
}

const STATES = [
  "All India","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

const CROPS = ["wheat","paddy","rice","maize","cotton","soybean","sugarcane","mustard","groundnut","barley","millet"]; 

interface CacheRow {
  id: string;
  crop: string;
  state: string;
  market_advisory: any | null;
  crop_advisories: any | null;
  created_at: string;
}

const CACHE_TTL_HOURS = 6;

function stripCodeFences(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function cleanMaybeJson(input: any) {
  if (!input) return input;
  if (typeof input === "string") {
    try { return JSON.parse(stripCodeFences(input)); } catch { return input; }
  }
  if (typeof input.raw === "string") {
    try { return JSON.parse(stripCodeFences(input.raw)); } catch { return input; }
  }
  return input;
}

export default function AIInsights() {
  useSEO(
    "AI Insights: Market & Crop Advisory | Smart Bharat",
    "AI Insights combines market advisory and crop advisories with filters for crop and state.",
    "/ai-insights"
  );

  const [crop, setCrop] = useState<string>("wheat");
  const [state, setState] = useState<string>("All India");
  const [bypassCache, setBypassCache] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("crop");
    const s = params.get("state");
    if (c) setCrop(c);
    if (s) setState(s);
  }, []);

  const updateUrl = () => {
    const params = new URLSearchParams();
    params.set("crop", crop);
    params.set("state", state);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
  };

  const queryKey = useMemo(() => ["ai-insights", crop, state, bypassCache], [crop, state, bypassCache]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      // 1) Try cache unless bypassing
      if (!bypassCache) {
        const { data: cached, error } = await supabase
          .from("ai_insights_cache")
          .select("id, crop, state, market_advisory, crop_advisories, created_at")
          .eq("crop", crop)
          .eq("state", state)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<CacheRow>();

        if (error) console.warn("Cache read error", error);

        if (cached) {
          const ageMs = Date.now() - new Date(cached.created_at).getTime();
          const ageHours = ageMs / (1000 * 60 * 60);
          if (ageHours < CACHE_TTL_HOURS) {
            return { market: cleanMaybeJson(cached.market_advisory), cropAdvisories: cleanMaybeJson(cached.crop_advisories), fromCache: true };
          }
        }
      }

      // 2) Fetch both advisories in parallel
      const [marketRes, cropRes] = await Promise.all([
        supabase.functions.invoke("ai-market-advisory", { body: { crop, state, region: state || "india" } }),
        supabase.functions.invoke("ai-crop-advisories", { body: { crop, region: state || "india" } })
      ]);

      if (marketRes.error) throw marketRes.error;
      if (cropRes.error) throw cropRes.error;

      const marketRaw = (marketRes.data as any)?.advisory ?? null;
      const cropRaw = (cropRes.data as any)?.advisories ?? null;
      const market = cleanMaybeJson(marketRaw);
      const cropAdvisories = cleanMaybeJson(cropRaw);

      // 3) Store in cache (best effort)
      const { error: insertErr } = await supabase
        .from("ai_insights_cache")
        .insert({ crop, state, market_advisory: market, crop_advisories: cropAdvisories });
      if (insertErr) console.warn("Cache insert error", insertErr);

      return { market, cropAdvisories, fromCache: false };
    },
  });

  useEffect(() => {
    if (data) setFetchedAt(new Date());
  }, [data]);

  useEffect(() => {
    const market = (data as any)?.market;
    if (!market) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${crop} market advisory for ${state}`,
      about: ["agriculture", "market prices", crop, state],
      datePublished: new Date().toISOString(),
      description: Array.isArray(market?.advice) ? market.advice.join("; ").slice(0, 160) : "AI-generated market advisory."
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [data, crop, state]);

  const copyLink = async () => {
    updateUrl();
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied", description: "Share this AI insight with others." });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy link." });
    }
  };

  const onSearch = async () => {
    setBypassCache(false);
    const res = await refetch();
    updateUrl();
    if (res.data?.fromCache) {
      toast({ title: "Loaded from cache", description: "Showing recent insights from cache (under 6 hours)." });
    } else {
      toast({ title: "Insights updated", description: "Fetched fresh AI insights." });
    }
  };

  const onRefresh = async () => {
    setBypassCache(true);
    const res = await refetch();
    updateUrl();
    if (!res.error) toast({ title: "Refreshed", description: "Fetched fresh AI insights (cache bypassed)." });
    setBypassCache(false);
  };

  return (
    <div>
      <header className="border-b bg-background/60 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold">AI Insights: Market and Crop Advisory</h1>
          <p className="text-muted-foreground">Get AI-powered market and agronomy guidance for your crop and state.</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section aria-label="Filters" className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Select crop and state to generate insights.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="crop">Crop</Label>
                  <div className="flex gap-2">
                    <Select value={crop} onValueChange={setCrop}>
                      <SelectTrigger id="crop">
                        <SelectValue placeholder="Select crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {CROPS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Or type crop"
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2 flex-wrap">
                  <Button onClick={onSearch} disabled={isLoading || isFetching}>Get Insights</Button>
                  <Button variant="outline" onClick={onRefresh} disabled={isFetching}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                  <Button variant="ghost" onClick={copyLink}>
                    <Share2 className="w-4 h-4 mr-2" /> Copy Link
                  </Button>
                  {fetchedAt && (
                    <span className="text-xs text-muted-foreground ml-2">Last updated: {fetchedAt.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Insights">
          <Tabs defaultValue="market" className="w-full">
            <TabsList>
              <TabsTrigger value="market">Market Advisory</TabsTrigger>
              <TabsTrigger value="crop">Crop Advisories</TabsTrigger>
            </TabsList>

            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Market Advisory</CardTitle>
                  <CardDescription>AI-generated price band, trend, top mandis and export opportunities.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading || isFetching ? (
                    <p className="text-muted-foreground">Loading market advisory…</p>
                  ) : data?.market ? (
                    <div className="space-y-4">
                      {data.market?.price_band && (
                        <div>
                          <h3 className="font-semibold">Price Band</h3>
                          <p>
                            ₹{data.market.price_band.min} - ₹{data.market.price_band.max} {data.market.price_band.unit}
                          </p>
                        </div>
                      )}

                      {data.market?.trend && (
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Trend</h3>
                          <Badge variant="secondary">{data.market.trend}</Badge>
                        </div>
                      )}

                      {Array.isArray(data.market?.top_mandis) && data.market.top_mandis.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Top Mandis</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {data.market.top_mandis.map((m: any, idx: number) => (
                              <li key={idx}>
                                <span className="font-medium">{m.name}</span> ({m.state}) — {m.notes}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(data.market?.export_opportunities) && data.market.export_opportunities.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2"><Ship className="w-4 h-4" /> Export Opportunities</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {data.market.export_opportunities.map((e: any, idx: number) => (
                              <li key={idx}>
                                {e.country} — {e.demand_level} demand via {e.port}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(data.market?.advice) && data.market.advice.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Advice</h3>
                          <ul className="list-disc pl-5 space-y-1">
                            {data.market.advice.map((a: string, idx: number) => (
                              <li key={idx}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {typeof data.market?.confidence === "number" && (
                        <p className="text-sm text-muted-foreground">Confidence: {data.market.confidence}%</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> No market advisory yet. Choose filters and click Get Insights.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crop">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Factory className="w-5 h-5" /> Crop Advisories</CardTitle>
                  <CardDescription>AI-powered agronomic tips across seeds, fertilization, logistics and demand.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading || isFetching ? (
                    <p className="text-muted-foreground">Loading crop advisories…</p>
                  ) : data?.cropAdvisories ? (
                    <div className="space-y-6">
                      {data.cropAdvisories?.agrimind_ai && (
                        <div>
                          <h3 className="font-semibold mb-1">AgriMind AI</h3>
                          <p className="text-sm text-muted-foreground">{data.cropAdvisories.agrimind_ai.seasonal_crop_demand_prediction}</p>
                          {Array.isArray(data.cropAdvisories.agrimind_ai.risk_factors) && (
                            <ul className="list-disc pl-5 mt-2">
                              {data.cropAdvisories.agrimind_ai.risk_factors.map((r: string, i: number) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                          {data.cropAdvisories.agrimind_ai.timeframe && (
                            <p className="text-sm text-muted-foreground mt-1">Timeframe: {data.cropAdvisories.agrimind_ai.timeframe}</p>
                          )}
                        </div>
                      )}

                      {data.cropAdvisories?.agripredict && (
                        <div>
                          <h3 className="font-semibold mb-1">AgriPredict</h3>
                          <p className="text-sm">Price trend: <Badge variant="secondary">{data.cropAdvisories.agripredict.price_trend}</Badge></p>
                          {Array.isArray(data.cropAdvisories.agripredict.export_markets) && (
                            <div className="mt-2">
                              <p className="text-sm text-muted-foreground">Export markets:</p>
                              <ul className="list-disc pl-5 mt-1">
                                {data.cropAdvisories.agripredict.export_markets.map((m: any, i: number) => (
                                  <li key={i}>{m.country} — {m.demand_level} ({m.notes})</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {Array.isArray(data.cropAdvisories.agripredict.recommendations) && (
                            <ul className="list-disc pl-5 mt-2">
                              {data.cropAdvisories.agripredict.recommendations.map((r: string, i: number) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {data.cropAdvisories?.seedsense_ai && (
                        <div>
                          <h3 className="font-semibold mb-1">SeedSense AI</h3>
                          {Array.isArray(data.cropAdvisories.seedsense_ai.seed_varieties) && (
                            <ul className="list-disc pl-5 mt-2">
                              {data.cropAdvisories.seedsense_ai.seed_varieties.map((s: any, i: number) => (
                                <li key={i}>{s.name} — {s.trait}</li>
                              ))}
                            </ul>
                          )}
                          {data.cropAdvisories.seedsense_ai.fertilizer_plan && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-muted-foreground">Fertilizer Plan:</p>
                              <p>Basal: {data.cropAdvisories.seedsense_ai.fertilizer_plan.basal.product} — {data.cropAdvisories.seedsense_ai.fertilizer_plan.basal.dose_per_acre}</p>
                              {Array.isArray(data.cropAdvisories.seedsense_ai.fertilizer_plan.top_dressings) && (
                                <ul className="list-disc pl-5">
                                  {data.cropAdvisories.seedsense_ai.fertilizer_plan.top_dressings.map((t: any, i: number) => (
                                    <li key={i}>{t.timing}: {t.product} — {t.dose_per_acre}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {data.cropAdvisories?.farmsage && (
                        <div>
                          <h3 className="font-semibold mb-1">FarmSage</h3>
                          <p className="text-sm">Local demand: {data.cropAdvisories.farmsage.local_demand_forecast}</p>
                          <p className="text-sm">Export demand: {data.cropAdvisories.farmsage.export_demand_forecast}</p>
                          {Array.isArray(data.cropAdvisories.farmsage.storage_advice) && (
                            <ul className="list-disc pl-5 mt-2">
                              {data.cropAdvisories.farmsage.storage_advice.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          )}
                          {Array.isArray(data.cropAdvisories.farmsage.logistics_tips) && (
                            <ul className="list-disc pl-5 mt-2">
                              {data.cropAdvisories.farmsage.logistics_tips.map((l: string, i: number) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground flex items-center gap-2"><Info className="w-4 h-4" /> No crop advisories yet. Choose filters and click Get Insights.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}
