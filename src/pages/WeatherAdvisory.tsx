import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, Eye, AlertTriangle, Calendar, Camera, Upload, Loader2, RefreshCw, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const WeatherAdvisory = () => {
  const [location, setLocation] = useState('Delhi, India');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [cropSuggestions, setCropSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lon: 77.2090 });
  const { toast } = useToast();

  useEffect(() => {
    getCurrentLocation();
    loadNotifications();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Delhi coordinates
          fetchWeatherData(28.6139, 77.2090);
        }
      );
    } else {
      // Default to Delhi coordinates
      fetchWeatherData(28.6139, 77.2090);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('weather-api', {
        body: { lat, lon, location }
      });

      if (error) throw error;

      setCurrentWeather(data.current);
      setForecast(data.forecast);
      setCropSuggestions(data.cropSuggestions);
      setNotifications(data.notifications);
      
      toast({
        title: 'Weather Updated',
        description: 'Latest weather data and crop suggestions loaded.',
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch weather data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data: notificationData, error } = await supabase
        .from('weather_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(notificationData || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      await analyzeCropImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        stream.getTracks().forEach(track => track.stop());
        analyzeCropImage(imageData);
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please try uploading an image instead.',
        variant: 'destructive',
      });
    }
  };

  const analyzeCropImage = async (imageData: string) => {
    setAnalyzingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-crop-analysis', {
        body: {
          image: imageData,
          lat: currentLocation.lat,
          lon: currentLocation.lon,
          userId: null // For now, we'll support anonymous usage
        }
      });

      if (error) throw error;

      setImageAnalysis(data.analysis || data);
      const c = data?.analysis?.confidence_level ?? data?.confidence ?? 100;
      toast({
        title: 'Analysis Complete',
        description: `Crop analysis completed with ${c}% confidence.`,
      });

      // Reload notifications to get new analysis alerts
      loadNotifications();
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis Error',
        description: 'Failed to analyze image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzingImage(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = "w-8 h-8";
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className={`${iconClass} text-yellow-500`} />;
      case 'clouds':
      case 'cloudy':
        return <Cloud className={`${iconClass} text-gray-500`} />;
      case 'rain':
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-500`} />;
      default:
        return <Sun className={`${iconClass} text-yellow-500`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-600' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-600' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-600' };
    return { level: 'Very High', color: 'text-red-600' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const uvInfo = currentWeather ? getUVLevel(currentWeather.uv_index) : { level: 'Unknown', color: 'text-gray-500' };

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
                <Cloud className="w-6 h-6 text-info" />
                <h1 className="text-xl font-bold">Weather Advisory</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={getCurrentLocation} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </Button>
              <Badge variant="secondary">
                Real-time • AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Location Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location</span>
            </CardTitle>
            <CardDescription>
              Enter your location for personalized weather and farming advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter city, state or coordinates..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => fetchWeatherData(currentLocation.lat, currentLocation.lon)} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Weather */}
        {currentWeather && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Weather</CardTitle>
              <CardDescription>{currentWeather.location_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  {getWeatherIcon(currentWeather.weather_condition)}
                  <div>
                    <div className="text-3xl font-bold">{currentWeather.current_temp}°C</div>
                    <div className="text-muted-foreground">{currentWeather.weather_condition}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Humidity</div>
                      <div className="font-medium">{currentWeather.humidity}%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Wind className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Wind Speed</div>
                      <div className="font-medium">{currentWeather.wind_speed} m/s</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Sun className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">UV Index</div>
                      <div className={`font-medium ${uvInfo.color}`}>
                        {currentWeather.uv_index} ({uvInfo.level})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-sm text-muted-foreground">Soil Type</div>
                      <div className="font-medium capitalize">{currentWeather.soil_type}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crop Image Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>AI Crop Analysis</span>
            </CardTitle>
            <CardDescription>
              Upload or capture crop images for real-time health analysis using Google Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleCameraCapture}
                  disabled={analyzingImage}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('crop-image-upload')?.click()}
                  disabled={analyzingImage}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>
              
              <input
                id="crop-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {analyzingImage && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing crop image with AI...</span>
                </div>
              )}

              {imageAnalysis && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Analysis Results</h4>
                    <Badge variant="outline">{imageAnalysis.confidence_level}% Confidence</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Crop Type</div>
                      <div className="text-sm text-muted-foreground">{imageAnalysis.crop_type}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Health Status</div>
                      <div className="text-sm text-muted-foreground capitalize">{imageAnalysis.health_status}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Growth Stage</div>
                      <div className="text-sm text-muted-foreground capitalize">{imageAnalysis.growth_stage}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Overall Score</div>
                      <div className="text-sm text-muted-foreground">{imageAnalysis.overall_score}/100</div>
                    </div>
                  </div>

                  {imageAnalysis.diseases_detected && imageAnalysis.diseases_detected.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-red-600">Diseases Detected</div>
                      <div className="text-sm text-muted-foreground">
                        {imageAnalysis.diseases_detected.join(', ')}
                      </div>
                    </div>
                  )}

                  {imageAnalysis.recommendations && imageAnalysis.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium">Recommendations</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {imageAnalysis.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forecast */}
        {forecast.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
              <CardDescription>
                7-day weather forecast for farming planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">{formatDate(day.forecast_date)}</div>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.weather_condition)}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">{day.max_temp}°/{day.min_temp}°</div>
                      <div className="flex items-center justify-center space-x-1">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span className="text-xs">{day.precipitation_chance}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crop Suggestions */}
        {cropSuggestions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Crop Suggestions</CardTitle>
              <CardDescription>
                Recommended crops based on current weather and soil conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cropSuggestions.map((crop, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{crop.name}</h4>
                      <Badge variant="outline">{crop.confidence_score}% match</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Type: {crop.type}</div>
                      <div>Planting: {crop.planting_season}</div>
                      <div>Harvest: {crop.harvest_season}</div>
                      <div>Water: {crop.water_requirement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weather Alerts & Notifications</CardTitle>
              <CardDescription>
                Important weather warnings and farming recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                    <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      notification.priority === 'high' ? 'text-red-500' : 
                      notification.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherAdvisory;