import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Download, 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  User,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const EPass = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    farmerName: "",
    phoneNumber: "",
    cropType: "",
    quantity: "",
    mandiLocation: "",
    expectedDate: "",
    vehicleNumber: ""
  });
  const [generatedPass, setGeneratedPass] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const cropTypes = [
    "गेहूं (Wheat)", "चावल (Rice)", "मक्का (Corn)", "बाजरा (Millet)", 
    "सरसों (Mustard)", "चना (Chickpea)", "अरहर (Pigeon Pea)", "सोयाबीन (Soybean)"
  ];

  const mandiLocations = [
    "कानपुर मंडी", "लखनऊ मंडी", "आगरा मंडी", "मेरठ मंडी", 
    "वाराणसी मंडी", "गोरखपुर मंडी", "बरेली मंडी", "मुरादाबाद मंडी"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateEPass = async () => {
    if (!formData.farmerName || !formData.phoneNumber || !formData.cropType || 
        !formData.quantity || !formData.mandiLocation || !formData.expectedDate) {
      toast({
        title: "कृपया सभी फील्ड भरें",
        description: "e-Pass बनाने के लिए सभी जानकारी जरूरी है।",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      const passData = {
        id: `EP${Date.now()}`,
        ...formData,
        generatedAt: new Date().toISOString(),
        status: "active",
        qrCode: `EPASS-${Date.now()}-${formData.farmerName.replace(/\s+/g, '')}`
      };
      
      setGeneratedPass(passData);
      setIsGenerating(false);
      
      toast({
        title: "e-Pass तैयार! 🎉",
        description: "आपका डिजिटल e-Pass सफलतापूर्वक बन गया है।",
      });
    }, 2000);
  };

  const downloadPass = () => {
    toast({
      title: "Downloading e-Pass",
      description: "PDF download will start shortly.",
    });
  };

  const recentPasses = [
    {
      id: "EP1704123456",
      crop: "गेहूं",
      quantity: "50 क्विंटल",
      mandi: "कानपुर मंडी",
      date: "2024-01-10",
      status: "completed"
    },
    {
      id: "EP1704123457",
      crop: "चावल",
      quantity: "30 क्विंटल", 
      mandi: "लखनऊ मंडी",
      date: "2024-01-08",
      status: "active"
    }
  ];

  if (generatedPass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5 p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => setGeneratedPass(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Generate New
            </Button>
            <h1 className="text-2xl font-bold">Your e-Pass</h1>
          </div>

          <Card className="border-2 border-success">
            <CardHeader className="text-center bg-success/10">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">e-Pass Generated Successfully</CardTitle>
              <CardDescription>ID: {generatedPass.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* QR Code Section */}
              <div className="text-center">
                <div className="w-48 h-48 bg-white border-4 border-primary mx-auto rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-32 h-32 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code at mandi entry
                </p>
              </div>

              {/* Pass Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Farmer Name</Label>
                  <p className="font-medium">{generatedPass.farmerName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">{generatedPass.phoneNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Crop Type</Label>
                  <p className="font-medium">{generatedPass.cropType}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Quantity</Label>
                  <p className="font-medium">{generatedPass.quantity} क्विंटल</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Mandi Location</Label>
                  <p className="font-medium">{generatedPass.mandiLocation}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Expected Date</Label>
                  <p className="font-medium">{generatedPass.expectedDate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button onClick={downloadPass} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  Share e-Pass
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-info/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• मंडी पहुंचने पर QR कोड स्कैन कराएं</li>
                  <li>• फोन नंबर और आधार कार्ड साथ रखें</li>
                  <li>• निर्धारित समय पर ही मंडी पहुंचें</li>
                  <li>• e-Pass की PDF कॉपी सेव कर लें</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Mandi e-Pass Generator</h1>
              <p className="text-muted-foreground">Generate QR-based digital pass for mandi entry</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Generate New e-Pass
                </CardTitle>
                <CardDescription>
                  Fill in your details to generate a digital mandi entry pass
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmerName">
                      <User className="w-4 h-4 inline mr-2" />
                      Farmer Name *
                    </Label>
                    <Input
                      id="farmerName"
                      placeholder="अपना नाम लिखें"
                      value={formData.farmerName}
                      onChange={(e) => handleInputChange("farmerName", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phoneNumber"
                      placeholder="मोबाइल नंबर"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Crop Type *</Label>
                    <Select onValueChange={(value) => handleInputChange("cropType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="फसल चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                        {cropTypes.map((crop) => (
                          <SelectItem key={crop} value={crop}>
                            {crop}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (Quintal) *</Label>
                    <Input
                      id="quantity"
                      placeholder="मात्रा (क्विंटल में)"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Mandi Location *
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("mandiLocation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="मंडी चुनें" />
                      </SelectTrigger>
                      <SelectContent>
                        {mandiLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expectedDate">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Expected Date *
                    </Label>
                    <Input
                      id="expectedDate"
                      type="date"
                      value={formData.expectedDate}
                      onChange={(e) => handleInputChange("expectedDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">
                    <Truck className="w-4 h-4 inline mr-2" />
                    Vehicle Number (Optional)
                  </Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="वाहन नंबर (वैकल्पिक)"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleInputChange("vehicleNumber", e.target.value)}
                  />
                </div>

                <Button 
                  onClick={generateEPass} 
                  className="w-full" 
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating e-Pass...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate e-Pass
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>e-Pass Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">No Queue Waiting</p>
                      <p className="text-muted-foreground">Direct entry with QR scan</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">Pre-Registration</p>
                      <p className="text-muted-foreground">Mandi knows your arrival</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">Priority Service</p>
                      <p className="text-muted-foreground">Faster processing time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <div>
                      <p className="font-medium">Digital Record</p>
                      <p className="text-muted-foreground">All transactions tracked</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Passes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent e-Passes</CardTitle>
                <CardDescription>Your previous mandi entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPasses.map((pass) => (
                    <div key={pass.id} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{pass.crop}</p>
                        <Badge 
                          variant={pass.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {pass.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pass.quantity} • {pass.mandi}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pass.date}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPass;