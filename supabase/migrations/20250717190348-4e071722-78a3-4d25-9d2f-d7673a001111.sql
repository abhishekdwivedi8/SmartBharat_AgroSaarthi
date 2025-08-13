-- Create weather data table
CREATE TABLE public.weather_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lon DECIMAL(11, 8) NOT NULL,
  location_name TEXT NOT NULL,
  current_temp DECIMAL(5, 2),
  humidity INTEGER,
  wind_speed DECIMAL(5, 2),
  weather_condition TEXT,
  uv_index INTEGER,
  soil_type TEXT,
  soil_moisture INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather forecast table
CREATE TABLE public.weather_forecast (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lon DECIMAL(11, 8) NOT NULL,
  forecast_date DATE NOT NULL,
  min_temp DECIMAL(5, 2),
  max_temp DECIMAL(5, 2),
  humidity INTEGER,
  precipitation_chance INTEGER,
  weather_condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop suggestions table
CREATE TABLE public.crop_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lon DECIMAL(11, 8) NOT NULL,
  crop_name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  planting_season TEXT,
  harvest_season TEXT,
  water_requirement TEXT,
  soil_type TEXT,
  temperature_range TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop analysis table for Gemini API results
CREATE TABLE public.crop_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  image_url TEXT,
  analysis_result JSONB,
  crop_health_status TEXT,
  disease_detected TEXT,
  recommendations TEXT,
  confidence_score INTEGER,
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather notifications table
CREATE TABLE public.weather_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  weather_condition TEXT,
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_forecast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for weather_data (public read access)
CREATE POLICY "Anyone can view weather data" 
ON public.weather_data 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert weather data" 
ON public.weather_data 
FOR INSERT 
WITH CHECK (true);

-- Create policies for weather_forecast (public read access)
CREATE POLICY "Anyone can view weather forecast" 
ON public.weather_forecast 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert weather forecast" 
ON public.weather_forecast 
FOR INSERT 
WITH CHECK (true);

-- Create policies for crop_suggestions
CREATE POLICY "Users can view crop suggestions" 
ON public.crop_suggestions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create crop suggestions" 
ON public.crop_suggestions 
FOR INSERT 
WITH CHECK (true);

-- Create policies for crop_analysis
CREATE POLICY "Users can view their own crop analysis" 
ON public.crop_analysis 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create crop analysis" 
ON public.crop_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policies for weather_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.weather_notifications 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create notifications" 
ON public.weather_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications" 
ON public.weather_notifications 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_weather_data_updated_at
  BEFORE UPDATE ON public.weather_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_weather_data_location ON public.weather_data(location_lat, location_lon);
CREATE INDEX idx_weather_forecast_location ON public.weather_forecast(location_lat, location_lon);
CREATE INDEX idx_crop_suggestions_location ON public.crop_suggestions(location_lat, location_lon);
CREATE INDEX idx_crop_analysis_user ON public.crop_analysis(user_id);
CREATE INDEX idx_weather_notifications_user ON public.weather_notifications(user_id, is_read);