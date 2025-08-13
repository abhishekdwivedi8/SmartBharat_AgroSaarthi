import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY") || 'AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k';

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) throw new Error("Missing GOOGLE_GEMINI_API_KEY secret");

  const body = { contents: [ { role: "user", parts: [ { text: prompt } ] } ] };
  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
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
    const { crop = "wheat", state = "All India", region = "india" } = await req.json();

    const prompt = `You are an agricultural market analyst for India. Provide AI-generated market advisory for the crop below.
Crop: ${crop}
Region/State: ${state || region}
Return STRICT JSON (no markdown) with this structure:
{
  "price_band": { "min": number, "max": number, "unit": "₹/quintal" },
  "trend": "rising|stable|falling",
  "top_mandis": [ { "name": "string", "state": "string", "notes": "string" } ],
  "export_opportunities": [ { "country": "string", "demand_level": "low|medium|high", "port": "string" } ],
  "advice": ["string", "string"],
  "confidence": 0-100
}`;

    const text = await callGemini(prompt);

    const parsed = tryParseJsonText(text);
    const advisory = parsed ?? { raw: text };

    return new Response(JSON.stringify({ crop, state, advisory }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-market-advisory error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
