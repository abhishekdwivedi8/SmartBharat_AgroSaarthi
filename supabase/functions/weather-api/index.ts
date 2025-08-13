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
    const { lat, lon, location } = await req.json();
    
    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY') || 'b8699df2df1e9e43934ff010d49c627d';
    if (!openWeatherApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenWeather API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch current weather data
    const currentWeatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
    );

    if (!currentWeatherResponse.ok) {
      throw new Error(`Weather API error: ${currentWeatherResponse.statusText}`);
    }

    const currentWeatherData = await currentWeatherResponse.json();

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.statusText}`);
    }

    const forecastData = await forecastResponse.json();

    // Fetch UV index
    const uvResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
    );

    const uvData = uvResponse.ok ? await uvResponse.json() : { value: 0 };

    // Get soil data (simulated for now - you can integrate with actual soil API)
    const soilTypes = ['clay', 'sandy', 'loamy', 'silt', 'peaty'];
    const soilType = soilTypes[Math.floor(Math.random() * soilTypes.length)];
    const soilMoisture = Math.floor(Math.random() * 100);

    // Store current weather data
    const weatherData = {
      location_lat: lat,
      location_lon: lon,
      location_name: location || currentWeatherData.name,
      current_temp: currentWeatherData.main.temp,
      humidity: currentWeatherData.main.humidity,
      wind_speed: currentWeatherData.wind.speed,
      weather_condition: currentWeatherData.weather[0].main,
      uv_index: Math.round(uvData.value || 0),
      soil_type: soilType,
      soil_moisture: soilMoisture,
    };

    const { error: weatherError } = await supabase
      .from('weather_data')
      .insert(weatherData);

    if (weatherError) {
      console.error('Error storing weather data:', weatherError);
    }

    // Store forecast data
    const forecastEntries = forecastData.list.slice(0, 7).map((item: any) => ({
      location_lat: lat,
      location_lon: lon,
      forecast_date: new Date(item.dt * 1000).toISOString().split('T')[0],
      min_temp: item.main.temp_min,
      max_temp: item.main.temp_max,
      humidity: item.main.humidity,
      precipitation_chance: Math.round((item.pop || 0) * 100),
      weather_condition: item.weather[0].main,
    }));

    const { error: forecastError } = await supabase
      .from('weather_forecast')
      .insert(forecastEntries);

    if (forecastError) {
      console.error('Error storing forecast data:', forecastError);
    }

    // Generate crop suggestions based on weather and soil
    const cropSuggestions = generateCropSuggestions(
      currentWeatherData.main.temp,
      currentWeatherData.main.humidity,
      soilType,
      currentWeatherData.weather[0].main
    );

    // Store crop suggestions
    const cropEntries = cropSuggestions.map((crop: any) => ({
      location_lat: lat,
      location_lon: lon,
      crop_name: crop.name,
      crop_type: crop.type,
      planting_season: crop.planting_season,
      harvest_season: crop.harvest_season,
      water_requirement: crop.water_requirement,
      soil_type: soilType,
      temperature_range: crop.temperature_range,
      confidence_score: crop.confidence_score,
    }));

    const { error: cropError } = await supabase
      .from('crop_suggestions')
      .insert(cropEntries);

    if (cropError) {
      console.error('Error storing crop suggestions:', cropError);
    }

    // Check for weather alerts and create notifications
    const notifications = generateWeatherNotifications(
      currentWeatherData,
      forecastData,
      uvData
    );

    if (notifications.length > 0) {
      const notificationEntries = notifications.map((notification: any) => ({
        notification_type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        weather_condition: notification.weather_condition,
        location_lat: lat,
        location_lon: lon,
      }));

      const { error: notificationError } = await supabase
        .from('weather_notifications')
        .insert(notificationEntries);

      if (notificationError) {
        console.error('Error storing notifications:', notificationError);
      }
    }

    return new Response(
      JSON.stringify({
        current: {
          ...weatherData,
          uv_index: uvData.value || 0,
        },
        forecast: forecastEntries,
        cropSuggestions,
        notifications,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weather-api function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateCropSuggestions(temp: number, humidity: number, soilType: string, weather: string) {
  const suggestions = [];

  // Rice suggestions
  if (temp >= 20 && temp <= 35 && humidity >= 50 && soilType === 'clay') {
    suggestions.push({
      name: 'Rice',
      type: 'cereal',
      planting_season: 'Monsoon',
      harvest_season: 'Winter',
      water_requirement: 'High',
      temperature_range: '20-35°C',
      confidence_score: 85,
    });
  }

  // Wheat suggestions
  if (temp >= 15 && temp <= 25 && humidity >= 30 && soilType === 'loamy') {
    suggestions.push({
      name: 'Wheat',
      type: 'cereal',
      planting_season: 'Winter',
      harvest_season: 'Spring',
      water_requirement: 'Medium',
      temperature_range: '15-25°C',
      confidence_score: 80,
    });
  }

  // Maize suggestions
  if (temp >= 18 && temp <= 30 && humidity >= 40) {
    suggestions.push({
      name: 'Maize',
      type: 'cereal',
      planting_season: 'Spring',
      harvest_season: 'Summer',
      water_requirement: 'Medium',
      temperature_range: '18-30°C',
      confidence_score: 75,
    });
  }

  // Cotton suggestions
  if (temp >= 20 && temp <= 35 && humidity >= 30 && soilType === 'sandy') {
    suggestions.push({
      name: 'Cotton',
      type: 'fiber',
      planting_season: 'Summer',
      harvest_season: 'Winter',
      water_requirement: 'High',
      temperature_range: '20-35°C',
      confidence_score: 70,
    });
  }

  // Tomato suggestions
  if (temp >= 18 && temp <= 28 && humidity >= 40) {
    suggestions.push({
      name: 'Tomato',
      type: 'vegetable',
      planting_season: 'Spring',
      harvest_season: 'Summer',
      water_requirement: 'Medium',
      temperature_range: '18-28°C',
      confidence_score: 78,
    });
  }

  return suggestions.length > 0 ? suggestions : [
    {
      name: 'Mixed Vegetables',
      type: 'vegetable',
      planting_season: 'All seasons',
      harvest_season: 'Depends on crop',
      water_requirement: 'Medium',
      temperature_range: 'Adaptable',
      confidence_score: 60,
    }
  ];
}

function generateWeatherNotifications(currentWeather: any, forecastData: any, uvData: any) {
  const notifications = [];

  // High temperature alert
  if (currentWeather.main.temp > 35) {
    notifications.push({
      type: 'weather_alert',
      title: 'High Temperature Alert',
      message: `Temperature is ${currentWeather.main.temp}°C. Ensure adequate irrigation and shade for crops.`,
      priority: 'high',
      weather_condition: 'hot',
    });
  }

  // Low temperature alert
  if (currentWeather.main.temp < 5) {
    notifications.push({
      type: 'weather_alert',
      title: 'Frost Warning',
      message: `Temperature is ${currentWeather.main.temp}°C. Protect crops from frost damage.`,
      priority: 'high',
      weather_condition: 'cold',
    });
  }

  // High UV alert
  if (uvData.value > 8) {
    notifications.push({
      type: 'uv_alert',
      title: 'High UV Index',
      message: `UV Index is ${uvData.value}. Avoid field work during peak sun hours.`,
      priority: 'medium',
      weather_condition: 'sunny',
    });
  }

  // Rain forecast
  const rainForecast = forecastData.list.find((item: any) => item.weather[0].main === 'Rain');
  if (rainForecast) {
    notifications.push({
      type: 'weather_forecast',
      title: 'Rain Expected',
      message: 'Rain is forecasted in the next few days. Plan irrigation accordingly.',
      priority: 'medium',
      weather_condition: 'rain',
    });
  }

  // High wind alert
  if (currentWeather.wind.speed > 15) {
    notifications.push({
      type: 'weather_alert',
      title: 'High Wind Alert',
      message: `Wind speed is ${currentWeather.wind.speed} m/s. Secure loose structures and protect tall crops.`,
      priority: 'medium',
      weather_condition: 'windy',
    });
  }

  return notifications;
}