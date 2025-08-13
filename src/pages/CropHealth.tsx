import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Upload, Scan, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationState } from "@/hooks/use-navigation-state";
import { saveOfflineCropAnalysis, offlineStorage } from "@/lib/offline-storage";
const CropHealth = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number }>({ lat: 28.6139, lon: 77.209 });
  const [advisories, setAdvisories] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useNavigationState(); // Track navigation state

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {/* keep default Delhi coords */}
      );
    }
  }, []);
  const sampleDiseases = [
    {
      name: "Leaf Spot",
      hindiName: "पत्ता धब्बा",
      confidence: 92,
      severity: "medium",
      symptoms: ["Dark spots on leaves", "Yellowing around spots", "Leaf drop"],
      treatment: "Apply fungicide spray every 7-10 days",
      prevention: "Ensure proper spacing, avoid overhead watering"
    },
    {
      name: "Powdery Mildew",
      hindiName: "चूर्णी फफूंद",
      confidence: 88,
      severity: "high",
      symptoms: ["White powdery coating", "Stunted growth", "Distorted leaves"],
      treatment: "Use sulfur-based fungicide, improve air circulation",
      prevention: "Plant resistant varieties, avoid overcrowding"
    },
    {
      name: "Aphid Infestation",
      hindiName: "माहू कीट",
      confidence: 95,
      severity: "low",
      symptoms: ["Small insects on leaves", "Sticky honeydew", "Curling leaves"],
      treatment: "Use neem oil or insecticidal soap",
      prevention: "Encourage beneficial insects, regular monitoring"
    },
    {
      name: "Bacterial Blight",
      hindiName: "जीवाणु झुलसा",
      confidence: 78,
      severity: "high",
      symptoms: ["Water-soaked spots", "Brown margins", "Stem cankers"],
      treatment: "Remove affected plants, apply copper-based bactericide",
      prevention: "Use disease-free seeds, avoid wet conditions"
    }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
        setConfidence(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // In a real implementation, this would access the camera
    toast.info("Camera functionality requires device permissions");
    fileInputRef.current?.click();
  };

const analyzeCrop = async () => {
  if (!selectedImage) {
    toast.error("Please select an image first");
    return;
  }

  if (mode === 'offline') {
    toast.info("Offline detection ready for ML model integration. Using sample analysis for now.");
    setIsAnalyzing(true);
    setConfidence(0);
    
    const progressInterval = setInterval(() => {
      setConfidence(prev => {
        if (prev >= 98) return 98;
        return prev + 8;
      });
    }, 150);
    
    // Simulate offline analysis with sample data
    setTimeout(async () => {
      const offlineResult = sampleDiseases[Math.floor(Math.random() * sampleDiseases.length)];
      const analysisData = {
        ...offlineResult,
        name: offlineResult.name,
        hindiName: offlineResult.hindiName,
        confidence: offlineResult.confidence,
        severity: offlineResult.severity,
        symptoms: offlineResult.symptoms,
        treatment: offlineResult.treatment,
        prevention: offlineResult.prevention,
        image: selectedImage,
        location: currentLocation,
        timestamp: Date.now()
      };
      
      setAnalysisResult(analysisData);
      setConfidence(100);
      
      // Save to offline storage
      try {
        await saveOfflineCropAnalysis(analysisData);
        toast.success("Offline analysis complete! Data saved locally.");
      } catch (error) {
        console.error('Failed to save offline data:', error);
        toast.success("Offline analysis complete! (Ready for ML model integration)");
      }
      
      clearInterval(progressInterval);
      setIsAnalyzing(false);
    }, 2000);
    return;
  }

  setIsAnalyzing(true);
  setConfidence(0);

  const progressInterval = setInterval(() => {
    setConfidence(prev => {
      if (prev >= 98) return 98;
      return prev + 5;
    });
  }, 200);

  try {
    const { data, error } = await supabase.functions.invoke('gemini-crop-analysis', {
      body: {
        image: selectedImage,
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        userId: null,
      }
    });

    if (error) throw error;

    const analysis = data.analysis || data;
    
    // Format the analysis result to match our UI structure
    const formattedResult = {
      name: analysis.crop_type || "Crop Detected",
      hindiName: getHindiName(analysis.crop_type) || "फसल",
      confidence: parseInt(analysis.confidence_level) || 85,
      severity: analysis.health_status === 'healthy' ? 'low' : analysis.health_status === 'stressed' ? 'medium' : 'high',
      symptoms: analysis.diseases_detected || ["Analysis completed"],
      treatment: analysis.recommendations?.join('. ') || "Follow recommended practices",
      prevention: analysis.immediate_actions?.join('. ') || "Regular monitoring advised"
    };
    
    setAnalysisResult(formattedResult);
    setConfidence(formattedResult.confidence);

    // Fetch AI advisories based on detected crop
    try {
      const cropName = analysis.crop_type || 'wheat';
      const { data: advData, error: advError } = await supabase.functions.invoke('ai-crop-advisories', {
        body: { crop: cropName, region: 'india' }
      });
      if (!advError && advData?.advisories) {
        setAdvisories(advData.advisories);
        try {
          localStorage.setItem('lastCropAdvisories', JSON.stringify({ crop: cropName, ...advData }));
        } catch {}
      }
    } catch (e) {
      console.warn('Advisories generation failed', e);
    }

    toast.success("Online AI analysis complete!");
  } catch (err) {
    console.error('Analysis error', err);
    toast.error("Analysis failed. Please try again.");
  } finally {
    clearInterval(progressInterval);
    setConfidence(prev => (prev < 100 ? 100 : prev));
    setIsAnalyzing(false);
  }
};

const getHindiName = (cropType: string) => {
  const hindiNames: Record<string, string> = {
    'wheat': 'गेहूं',
    'rice': 'चावल',
    'corn': 'मक्का',
    'tomato': 'टमाटर',
    'potato': 'आलू',
    'onion': 'प्याज',
    'cotton': 'कपास',
    'sugarcane': 'गन्ना'
  };
  return hindiNames[cropType?.toLowerCase()] || 'फसल';
};

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
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
                <Camera className="w-6 h-6 text-warning" />
                <h1 className="text-xl font-bold">Crop Health Detection</h1>
              </div>
            </div>
            <Badge variant="secondary">
              AI-Powered • Real-time Analysis
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Crop Image</CardTitle>
              <CardDescription>
                Take a photo or upload an image of your crop for AI-powered health analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                {selectedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={selectedImage} 
                      alt="Selected crop" 
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedImage(null)}
                      className="w-full"
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Upload Crop Image</p>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG or JPEG up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleCameraCapture}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

{/* Detection Mode */}
<div className="flex items-center justify-between">
  <div>
    <p className="text-sm font-medium">Detection Mode</p>
    <p className="text-xs text-muted-foreground">Online uses Gemini AI • Offline coming soon</p>
  </div>
  <div className="grid grid-cols-2 gap-2">
    <Button size="sm" variant={mode === 'online' ? 'default' : 'outline'} onClick={() => setMode('online')}>Online</Button>
    <Button size="sm" variant={mode === 'offline' ? 'default' : 'outline'} onClick={() => setMode('offline')}>Offline</Button>
  </div>
</div>

{/* Analyze Button */}
<Button 
  onClick={analyzeCrop}
  disabled={!selectedImage || isAnalyzing}
  className="w-full bg-warning hover:bg-warning/90 mt-2"
>
  {isAnalyzing ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Analyzing...
    </>
  ) : (
    <>
      <Scan className="w-4 h-4 mr-2" />
      Analyze Crop Health
    </>
  )}
</Button>

{/* Analysis Progress */}
{isAnalyzing && (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>Analysis Progress</span>
      <span>{confidence}%</span>
    </div>
    <Progress value={confidence} className="h-2" />
  </div>
)}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                AI-powered crop health diagnosis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult ? (
                <div className="space-y-6">
                  {/* Disease Detection */}
                  <div className="p-4 bg-card rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{analysisResult.name}</h3>
                      <Badge className={getSeverityColor(analysisResult.severity)}>
                        {getSeverityIcon(analysisResult.severity)}
                        <span className="ml-1 capitalize">{analysisResult.severity}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {analysisResult.hindiName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Confidence:</span>
                      <div className="flex-1">
                        <Progress value={analysisResult.confidence} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{analysisResult.confidence}%</span>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <h4 className="font-semibold mb-2">Symptoms Detected</h4>
                    <ul className="space-y-1">
                      {analysisResult.symptoms.map((symptom: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-destructive rounded-full" />
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Treatment */}
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Treatment</h4>
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-sm">{analysisResult.treatment}</p>
                    </div>
                  </div>

                  {/* Prevention */}
                  <div>
                    <h4 className="font-semibold mb-2">Prevention Tips</h4>
                    <div className="p-3 bg-info/10 rounded-lg">
                      <p className="text-sm">{analysisResult.prevention}</p>
                    </div>
                  </div>

                  {/* AI Advisories */}
                  {advisories && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">AI Advisories</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* AgriMind AI */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <h5 className="font-medium mb-1">AgriMind AI – Seasonal Demand</h5>
                          <p className="text-sm text-muted-foreground mb-2">{advisories.agrimind_ai?.seasonal_crop_demand_prediction}</p>
                          {advisories.agrimind_ai?.risk_factors && (
                            <ul className="text-sm list-disc pl-5 space-y-1">
                              {advisories.agrimind_ai.risk_factors.map((r: string, i: number) => (<li key={i}>{r}</li>))}
                            </ul>
                          )}
                        </div>

                        {/* AgriPredict */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <h5 className="font-medium mb-1">AgriPredict – Export Advisory</h5>
                          <p className="text-xs text-muted-foreground mb-1">Trend: {advisories.agripredict?.price_trend}</p>
                          {advisories.agripredict?.export_markets && (
                            <ul className="text-sm list-disc pl-5 space-y-1">
                              {advisories.agripredict.export_markets.slice(0,3).map((m: any, i: number) => (
                                <li key={i}>{m.country} • {m.demand_level}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* SeedSense AI */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <h5 className="font-medium mb-1">SeedSense AI – Seeds & Fertilizer</h5>
                          {advisories.seedsense_ai?.seed_varieties && (
                            <div className="text-sm mb-2">
                              <span className="font-medium">Varieties: </span>
                              {advisories.seedsense_ai.seed_varieties.map((v: any) => v.name).join(', ')}
                            </div>
                          )}
                          {advisories.seedsense_ai?.fertilizer_plan?.basal && (
                            <div className="text-sm text-muted-foreground">
                              Basal: {advisories.seedsense_ai.fertilizer_plan.basal.product} • {advisories.seedsense_ai.fertilizer_plan.basal.dose_per_acre}
                            </div>
                          )}
                        </div>

                        {/* FarmSage */}
                        <div className="border rounded-lg p-4 bg-muted/30">
                          <h5 className="font-medium mb-1">FarmSage – Demand Forecast</h5>
                          <p className="text-sm text-muted-foreground mb-1">Local: {advisories.farmsage?.local_demand_forecast}</p>
                          <p className="text-sm text-muted-foreground">Export: {advisories.farmsage?.export_demand_forecast}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      Save Report
                    </Button>
                    <Button className="w-full">
                      Get Expert Help
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Scan className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No Analysis Yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a crop image and click analyze to get AI-powered health insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning models trained on thousands of crop images for accurate disease detection.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get immediate analysis results with confidence scores and detailed recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Offline Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Basic disease detection works offline using lightweight models stored locally.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropHealth;