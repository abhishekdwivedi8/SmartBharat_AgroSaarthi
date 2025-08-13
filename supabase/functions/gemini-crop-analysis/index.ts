import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, lat, lon } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY') || 'AIzaSyCiS0R6n_ovjlvxok5ME2emg9ROJvFku1k';
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Gemini API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create a request-scoped Supabase client to forward auth from the caller
    const supabaseReq = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    // Identify user (if signed in)
    const { data: authData } = await supabaseReq.auth.getUser();
    const effectiveUserId = authData?.user?.id ?? null;

    // Get weather data for context
    let weatherContext = '';
    if (lat && lon) {
      const { data: weatherData } = await supabaseReq
        .from('weather_data')
        .select('*')
        .eq('location_lat', lat)
        .eq('location_lon', lon)
        .order('created_at', { ascending: false })
        .limit(1);

      if (weatherData && weatherData.length > 0) {
        const weather = weatherData[0];
        weatherContext = `Current weather conditions: Temperature: ${weather.current_temp}°C, Humidity: ${weather.humidity}%, Weather: ${weather.weather_condition}, Soil Type: ${weather.soil_type}, Soil Moisture: ${weather.soil_moisture}%`;
      }
    }

    // Prepare the prompt for Gemini API
    const prompt = `
      You are an expert agricultural AI assistant. Analyze this crop field image and provide detailed insights.
      
      ${weatherContext ? `Context: ${weatherContext}` : ''}
      
      Please analyze the image and provide:
      1. Crop identification (what crop is this?)
      2. Health assessment (healthy, stressed, diseased, etc.)
      3. Any visible diseases or pests
      4. Growth stage assessment
      5. Recommendations for care and treatment
      6. Predicted yield potential
      7. Immediate actions needed
      
      Format your response as a JSON object with the following structure:
      {
        "crop_type": "identified crop name",
        "health_status": "healthy/stressed/diseased/unknown",
        "diseases_detected": ["list of diseases if any"],
        "pests_detected": ["list of pests if any"],
        "growth_stage": "seedling/vegetative/flowering/fruiting/mature",
        "overall_score": "score from 1-100",
        "recommendations": [
          "specific actionable recommendations"
        ],
        "immediate_actions": [
          "urgent actions needed"
        ],
        "yield_prediction": "predicted yield assessment",
        "confidence_level": "percentage confidence in analysis"
      }
    `;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: image.replace(/^data:image\/[a-z]+;base64,/, '')
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No analysis results from Gemini API');
    }

    const analysisText = geminiData.candidates[0].content.parts[0].text;
    let analysisResult;
    
    try {
      // Try to parse JSON response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured response from text
        analysisResult = {
          crop_type: "Analysis provided",
          health_status: "analyzed",
          diseases_detected: [],
          pests_detected: [],
          growth_stage: "assessed",
          overall_score: "70",
          recommendations: [analysisText],
          immediate_actions: ["Review analysis"],
          yield_prediction: "Assessment provided",
          confidence_level: "75"
        };
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      analysisResult = {
        crop_type: "Analysis provided",
        health_status: "analyzed",
        diseases_detected: [],
        pests_detected: [],
        growth_stage: "assessed",
        overall_score: "70",
        recommendations: [analysisText],
        immediate_actions: ["Review analysis"],
        yield_prediction: "Assessment provided",
        confidence_level: "75"
      };
    }

    // Store analysis result in database (only for signed-in users due to RLS)
    const cropAnalysisData = {
      user_id: effectiveUserId,
      image_url: image,
      analysis_result: analysisResult,
      crop_health_status: analysisResult.health_status,
      disease_detected: analysisResult.diseases_detected?.join(', ') || null,
      recommendations: analysisResult.recommendations?.join('; ') || null,
      confidence_score: parseInt(analysisResult.confidence_level) || 75,
      location_lat: lat,
      location_lon: lon,
    };

    if (effectiveUserId) {
      const { error: insertError } = await supabaseReq
        .from('crop_analysis')
        .insert(cropAnalysisData);
      if (insertError) {
        console.error('Error storing crop analysis:', insertError);
      }
    } else {
      console.log('Anonymous analysis request – skipping crop_analysis insert due to RLS.');
    }

    // Generate notifications based on analysis
    const notifications = generateAnalysisNotifications(analysisResult, lat, lon);
    
    if (notifications.length > 0) {
      const notificationEntries = notifications.map((notification: any) => ({
        user_id: effectiveUserId,
        notification_type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        location_lat: lat,
        location_lon: lon,
      }));

      const { error: notificationError } = await supabaseReq
        .from('weather_notifications')
        .insert(notificationEntries);

      if (notificationError) {
        console.error('Error storing notifications:', notificationError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        notifications,
        confidence: analysisResult.confidence_level,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gemini-crop-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateAnalysisNotifications(analysis: any, lat: number, lon: number) {
  const notifications = [];

  // Disease alerts
  if (analysis.diseases_detected && analysis.diseases_detected.length > 0) {
    notifications.push({
      type: 'disease_alert',
      title: 'Disease Detected',
      message: `Detected diseases: ${analysis.diseases_detected.join(', ')}. Immediate treatment recommended.`,
      priority: 'high',
    });
  }

  // Pest alerts
  if (analysis.pests_detected && analysis.pests_detected.length > 0) {
    notifications.push({
      type: 'pest_alert',
      title: 'Pest Detected',
      message: `Detected pests: ${analysis.pests_detected.join(', ')}. Take preventive measures.`,
      priority: 'high',
    });
  }

  // Health status alerts
  if (analysis.health_status === 'stressed' || analysis.health_status === 'diseased') {
    notifications.push({
      type: 'health_alert',
      title: 'Crop Health Concern',
      message: `Crop health status: ${analysis.health_status}. Review recommendations for improvement.`,
      priority: 'medium',
    });
  }

  // Low confidence alert
  if (parseInt(analysis.confidence_level) < 60) {
    notifications.push({
      type: 'analysis_alert',
      title: 'Low Confidence Analysis',
      message: 'Analysis confidence is low. Consider taking additional photos or consulting an expert.',
      priority: 'medium',
    });
  }

  // Immediate actions needed
  if (analysis.immediate_actions && analysis.immediate_actions.length > 0) {
    notifications.push({
      type: 'action_required',
      title: 'Immediate Action Required',
      message: `Actions needed: ${analysis.immediate_actions.join(', ')}`,
      priority: 'high',
    });
  }

  return notifications;
}