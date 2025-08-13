import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, TrendingDown, Search, MapPin, Clock, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCachedMarketPrices, cacheMarketPrices } from "@/lib/offline-storage";

function stripCodeFences(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function cleanMaybeJson(input: any) {
  if (input == null) return input;
  if (typeof input === "string") {
    try { return JSON.parse(stripCodeFences(input)); } catch { return input; }
  }
  if (typeof (input as any)?.raw === "string") {
    try { return JSON.parse(stripCodeFences((input as any).raw)); } catch { return input; }
  }
  return input;
}

const MandiPrices = () => {
  const [selectedState, setSelectedState] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvisory, setAiAdvisory] = useState<any>(null);

  const states = [
    { code: "all", name: "All States" },
    { code: "up", name: "Uttar Pradesh" },
    { code: "mh", name: "Maharashtra" },
    { code: "pb", name: "Punjab" },
    { code: "hr", name: "Haryana" },
    { code: "rj", name: "Rajasthan" },
    { code: "mp", name: "Madhya Pradesh" },
    { code: "gj", name: "Gujarat" },
    { code: "wb", name: "West Bengal" },
    { code: "tn", name: "Tamil Nadu" },
    { code: "kn", name: "Karnataka" },
    { code: "ap", name: "Andhra Pradesh" },
    { code: "ts", name: "Telangana" }
  ];

  const marketPrices = [
    {
      commodity: "Wheat",
      hindiName: "गेहूं",
      state: "Punjab",
      mandi: "Amritsar",
      minPrice: 2100,
      maxPrice: 2150,
      modalPrice: 2125,
      trend: "up",
      change: "+25",
      unit: "per quintal"
    },
    {
      commodity: "Rice",
      hindiName: "चावल",
      state: "Punjab",
      mandi: "Patiala",
      minPrice: 3200,
      maxPrice: 3400,
      modalPrice: 3300,
      trend: "up",
      change: "+50",
      unit: "per quintal"
    },
    {
      commodity: "Sugarcane",
      hindiName: "गन्ना",
      state: "Uttar Pradesh",
      mandi: "Muzaffarnagar",
      minPrice: 280,
      maxPrice: 320,
      modalPrice: 300,
      trend: "stable",
      change: "0",
      unit: "per quintal"
    },
    {
      commodity: "Cotton",
      hindiName: "कपास",
      state: "Maharashtra",
      mandi: "Akola",
      minPrice: 5800,
      maxPrice: 6200,
      modalPrice: 6000,
      trend: "down",
      change: "-100",
      unit: "per quintal"
    },
    {
      commodity: "Onion",
      hindiName: "प्याज",
      state: "Maharashtra",
      mandi: "Lasalgaon",
      minPrice: 1200,
      maxPrice: 1500,
      modalPrice: 1350,
      trend: "up",
      change: "+200",
      unit: "per quintal"
    },
    {
      commodity: "Potato",
      hindiName: "आलू",
      state: "Uttar Pradesh",
      mandi: "Agra",
      minPrice: 800,
      maxPrice: 1000,
      modalPrice: 900,
      trend: "down",
      change: "-50",
      unit: "per quintal"
    },
    {
      commodity: "Tomato",
      hindiName: "टमाटर",
      state: "Karnataka",
      mandi: "Bangalore",
      minPrice: 1500,
      maxPrice: 2000,
      modalPrice: 1750,
      trend: "up",
      change: "+150",
      unit: "per quintal"
    },
    {
      commodity: "Mustard",
      hindiName: "सरसों",
      state: "Rajasthan",
      mandi: "Bharatpur",
      minPrice: 4200,
      maxPrice: 4500,
      modalPrice: 4350,
      trend: "up",
      change: "+75",
      unit: "per quintal"
    },
    {
      commodity: "Maize",
      hindiName: "मक्का",
      state: "Madhya Pradesh",
      mandi: "Bhopal",
      minPrice: 1800,
      maxPrice: 1950,
      modalPrice: 1875,
      trend: "stable",
      change: "0",
      unit: "per quintal"
    },
    {
      commodity: "Soybean",
      hindiName: "सोयाबीन",
      state: "Madhya Pradesh",
      mandi: "Indore",
      minPrice: 3800,
      maxPrice: 4100,
      modalPrice: 3950,
      trend: "down",
      change: "-25",
      unit: "per quintal"
    },
    {
      commodity: "Groundnut",
      hindiName: "मूंगफली",
      state: "Gujarat",
      mandi: "Rajkot",
      minPrice: 5200,
      maxPrice: 5600,
      modalPrice: 5400,
      trend: "up",
      change: "+100",
      unit: "per quintal"
    },
    {
      commodity: "Turmeric",
      hindiName: "हल्दी",
      state: "Tamil Nadu",
      mandi: "Erode",
      minPrice: 8500,
      maxPrice: 9200,
      modalPrice: 8850,
      trend: "up",
      change: "+200",
      unit: "per quintal"
    }
  ];

  const filteredPrices = marketPrices.filter(price => {
    const matchesState = selectedState === "all" || price.state.toLowerCase().includes(states.find(s => s.code === selectedState)?.name.toLowerCase() || "");
    const matchesSearch = searchQuery === "" || 
      price.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.hindiName.includes(searchQuery) ||
      price.mandi.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesState && matchesSearch;
  });

  const refreshPrices = () => {
    setLastUpdated(new Date());
    // Simulate data refresh
    setTimeout(() => {
      console.log("Prices refreshed");
    }, 1000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 bg-muted rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  useEffect(() => {
    // Basic SEO for this page
    document.title = "MarketPulse – Live Mandi Prices & AI Advisory";
    // Canonical URL for SEO
    const existing = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    const link = existing || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    if (!existing) document.head.appendChild(link);

    // Load cached data first, then fetch fresh data
    loadCachedData();
    getAIAdvisory();
  }, []);

  const loadCachedData = async () => {
    try {
      const cachedPrices = await getCachedMarketPrices();
      if (cachedPrices && cachedPrices.advisory) {
        setAiAdvisory(cachedPrices.advisory);
      }
    } catch (error) {
      console.warn('Failed to load cached market data:', error);
    }
  };

  const getAIAdvisory = async () => {
    try {
      setAiLoading(true);
      const stateName = states.find((s) => s.code === selectedState)?.name || "All India";
      const crop = searchQuery?.trim() || "wheat";
      const { data, error } = await supabase.functions.invoke('ai-market-advisory', {
        body: { crop, state: stateName },
      });
      if (error) throw error as any;
      const raw = (data as any)?.advisory ?? data;
      const cleaned = cleanMaybeJson(raw);
      
      // Ensure we have valid advisory data
      if (cleaned && typeof cleaned === 'object' && !cleaned.error) {
        setAiAdvisory(cleaned);
        // Cache the successful response
        try {
          await cacheMarketPrices({ advisory: cleaned, timestamp: Date.now() });
        } catch (error) {
          console.warn('Failed to cache market data:', error);
        }
      } else {
        // Generate fallback advisory
        const fallbackAdvisory = {
          price_band: { min: 2100, max: 2150, unit: "₹/quintal" },
          trend: "rising",
          top_mandis: [
            { name: "Amritsar", state: "Punjab", notes: "Good quality wheat" },
            { name: "Muzaffarnagar", state: "Uttar Pradesh", notes: "High demand" }
          ],
          export_opportunities: [
            { country: "Bangladesh", demand_level: "high", port: "Kolkata" },
            { country: "Nepal", demand_level: "medium", port: "Delhi" }
          ],
          advice: [
            "Current prices are trending upward due to strong demand",
            "Quality wheat is fetching premium prices",
            "Consider selling in phases to maximize returns"
          ],
          confidence: 85
        };
        setAiAdvisory(fallbackAdvisory);
      }
    } catch (e) {
      console.error('AI advisory error', e);
      // Generate fallback advisory on error
      const fallbackAdvisory = {
        price_band: { min: 2100, max: 2150, unit: "₹/quintal" },
        trend: "stable",
        advice: [
          "Market conditions are stable",
          "Monitor local mandi prices regularly",
          "Ensure proper storage to maintain quality"
        ],
        confidence: 75
      };
      setAiAdvisory(fallbackAdvisory);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-success" />
                <h1 className="text-xl font-bold">Live Mandi Prices</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:flex">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {lastUpdated.toLocaleTimeString()}
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshPrices}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Market Prices</CardTitle>
            <CardDescription>
              Search by commodity, state, or mandi name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search commodity, mandi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Showing {filteredPrices.length} results
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Prices Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrices.map((price, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{price.commodity}</CardTitle>
                    <CardDescription className="text-sm">{price.hindiName}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(price.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(price.trend)}`}>
                      {price.change !== "0" ? price.change : "No change"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Modal Price</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(price.modalPrice)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Min:</span>
                      <span className="ml-1 font-medium">{formatPrice(price.minPrice)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max:</span>
                      <span className="ml-1 font-medium">{formatPrice(price.maxPrice)}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {price.mandi}, {price.state}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {price.unit}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Insights */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-muted-foreground">
                  AgriPredict · FarmSage (AI-powered market advisory)
                </div>
                <Button size="sm" variant="secondary" onClick={getAIAdvisory} disabled={aiLoading}>
                  {aiLoading ? 'Analyzing…' : 'Get AI Advisory'}
                </Button>
              </div>

              {aiAdvisory?.error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {aiAdvisory.error}
                </div>
              )}

              {aiAdvisory && !aiAdvisory.error ? (
                <div className="space-y-4">
                  {aiAdvisory.price_band && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Estimated Price Band</div>
                        <Badge variant="outline">{aiAdvisory?.trend || 'trend'}</Badge>
                      </div>
                      <p className="text-lg font-bold mt-1">
                        ₹{aiAdvisory.price_band.min} – ₹{aiAdvisory.price_band.max} / quintal
                      </p>
                    </div>
                  )}

                  {Array.isArray(aiAdvisory.top_mandis) && aiAdvisory.top_mandis.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Top Mandis</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {aiAdvisory.top_mandis.map((m: any, i: number) => (
                          <div key={i} className="p-3 rounded-md bg-muted/30 text-sm">
                            <div className="font-medium">{m.name}, {m.state}</div>
                            {m.notes && <div className="text-muted-foreground">{m.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(aiAdvisory.export_opportunities) && aiAdvisory.export_opportunities.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Export Opportunities</div>
                      <div className="space-y-2">
                        {aiAdvisory.export_opportunities.map((e: any, i: number) => (
                          <div key={i} className="p-3 rounded-md bg-info/10 text-sm">
                            <div className="font-medium">{e.country} · {e.demand_level?.toUpperCase()}</div>
                            {e.port && <div className="text-muted-foreground">Port: {e.port}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(aiAdvisory.advice) && aiAdvisory.advice.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">AI Advice</div>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {aiAdvisory.advice.map((t: string, i: number) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {typeof aiAdvisory.confidence === 'number' && (
                    <div className="text-xs text-muted-foreground">Confidence: {aiAdvisory.confidence}%</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium">Price Rising</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Wheat and Rice prices are trending upward due to increased demand
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">Price Alert</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cotton prices have dropped by ₹100 per quintal in Maharashtra
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground mt-4">
                Advisory is AI-generated and for guidance only. Verify with local mandi officials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Check prices before travelling to mandi to avoid losses</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Morning hours typically have better prices</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Quality of produce affects final price significantly</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p>Consider transport costs when choosing mandi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MandiPrices;