import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY") || 'AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k';

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GOOGLE_GEMINI_API_KEY secret");
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${errText}`);
  }

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crop = "wheat", region = "uttar-pradesh", lat, lon } = await req.json();

    const prompt = `You are an agronomy expert. Generate a detailed JSON crop calendar for Indian farming.
Crop: ${crop}
Region: ${region}
Coordinates (optional): ${lat ?? ""}, ${lon ?? ""}

Return STRICT JSON with this exact structure:
{
  "calendar": {
    "months": [
      {
        "month": "January",
        "tasks": [
          { "type": "irrigation|fertilizer|pest|weed|sowing|harvest|maintenance", "title": "string", "description": "string", "priority": "low|medium|high", "window": "date-range or week", "tips": ["string", "string"] }
        ]
      }
    ]
  },
  "irrigation_schedule": [ { "stage": "CRI/Vegetative/etc", "when": "string", "notes": "string" } ],
  "fertilizer_plan": {
    "basal": { "product": "string", "dose_per_acre": "string" },
    "top_dressings": [ { "timing": "string", "product": "string", "dose_per_acre": "string" } ]
  },
  "pest_management": [ { "pest": "string", "monitor_from": "month", "threshold": "string", "treatment": "string" } ]
}

Ensure valid JSON only (no markdown). Keep culturally and regionally appropriate recommendations for India.`;

    const text = await callGemini(prompt);

    const parsed = tryParseJsonText(text);
    let result: any;
    if (parsed) {
      result = parsed;
    } else {
      result = { calendar: { months: [] }, irrigation_schedule: [], fertilizer_plan: {}, pest_management: [], raw: text };
    }

    return new Response(JSON.stringify({ crop, region, lat, lon, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-crop-calendar error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
