import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY") || 'AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k';

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error("Missing GOOGLE_GEMINI_API_KEY secret");

  const body = {
    contents: [
      { role: "user", parts: [{ text: prompt }] }
    ]
  };

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error(`Gemini API error ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

function tryParseJsonText(text: string) {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try { return JSON.parse(cleaned); } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch {} }
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { crop = "wheat", region = "india" } = await req.json();

    const prompt = `Generate AI advisory for Indian agriculture based on the scanned crop.
Crop: ${crop}
Region: ${region}
Return STRICT JSON with this structure (no markdown):
{
  "agrimind_ai": {
    "seasonal_crop_demand_prediction": "short summary",
    "risk_factors": ["string", "string"],
    "timeframe": "e.g., next 3 months"
  },
  "agripredict": {
    "export_markets": [ { "country": "string", "demand_level": "low|medium|high", "notes": "string" } ],
    "price_trend": "rising|stable|falling",
    "recommendations": ["string", "string"]
  },
  "seedsense_ai": {
    "seed_varieties": [ { "name": "string", "trait": "disease resistant|early maturing|drought tolerant" } ],
    "fertilizer_plan": {
      "basal": { "product": "string", "dose_per_acre": "string" },
      "top_dressings": [ { "timing": "string", "product": "string", "dose_per_acre": "string" } ]
    }
  },
  "farmsage": {
    "local_demand_forecast": "short summary",
    "export_demand_forecast": "short summary",
    "storage_advice": ["string", "string"],
    "logistics_tips": ["string", "string"]
  }
}`;

    const text = await callGemini(prompt);

    const parsed = tryParseJsonText(text);
    const advisories = parsed ?? { raw: text };

    return new Response(JSON.stringify({ crop, region, advisories }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-crop-advisories error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
