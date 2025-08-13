import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_GEMINI_API_KEY") || 'AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k';
const MODEL = "gemini-1.5-flash-latest";

function tryParseJsonText(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch (_) {}
  // Remove markdown code fences if present
  try {
    const cleaned = text
      .replace(/^```(json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (_) {}
  // Try to extract JSON substring
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const sliced = text.slice(start, end + 1);
    try {
      return JSON.parse(sliced);
    } catch (_) {}
  }
  return null;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const { query, section = "General", targetLang = "", userLocale = "", context = {} } = body ?? {};

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "'query' is required as a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const system = `You are an expert agricultural advisor for Indian farmers with 20+ years of field experience.

CRITICAL INSTRUCTIONS:
1. Answer EXACTLY what the farmer asks - be specific and direct
2. Use the SAME LANGUAGE as the user's question
3. Give practical, actionable advice for Indian farming conditions
4. Include specific quantities, timings, and methods
5. Mention local/Indian product names when possible
6. Keep responses under 100 words but complete
7. If unsure, say "consult local agricultural officer"

EXAMPLES:
Q: "मेरी गेहूं में पीले धब्बे हैं"
A: "यह पीला रतुआ रोग हो सकता है। तुरंत प्रोपिकोनाजोल 25 EC का 1 मिली प्रति लीटर पानी में छिड़काव करें। 15 दिन बाद दोहराएं। खेत में जल निकासी सुनिश्चित करें।"

Return JSON: { "language": "hi-IN", "answer": "direct-specific-answer" }`;

    const userText = `FARMER'S QUESTION: "${query}"
TARGET LANGUAGE: ${targetLang || "same as question"}
CONTEXT: ${context?.agricultural_context ? "Agricultural advice needed" : "General farming query"}

Provide specific, actionable farming advice in JSON format. Answer exactly what the farmer asked.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${system}\n\n${userText}` }] },
          ],
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return new Response(
        JSON.stringify({ error: "Gemini request failed", detail: errText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await geminiRes.json();
    const textOutput: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = tryParseJsonText(textOutput);
    
    if (!parsed || !parsed.answer) {
      console.error('Invalid Gemini response:', textOutput);
      return new Response(JSON.stringify({ 
        error: "Invalid AI response", 
        raw_response: textOutput,
        timestamp: new Date().toISOString()
      }), {
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Add metadata to verify it's from Gemini
    parsed.source = "gemini-ai";
    parsed.timestamp = new Date().toISOString();
    parsed.model = MODEL;

    console.log('Gemini AI Response Generated:', { query, response: parsed.answer, timestamp: parsed.timestamp });
    
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-generate error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
