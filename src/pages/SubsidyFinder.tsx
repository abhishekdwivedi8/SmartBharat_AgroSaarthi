import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Gift, 
  Search, 
  ArrowLeft, 
  CheckCircle,
  ExternalLink,
  FileText,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Sprout,
  Volume2,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SubsidyFinder = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    farmerName: "",
    landSize: "",
    cropType: "",
    region: "",
    category: ""
  });

  const categories = [
    { value: "general", label: "सामान्य (General)" },
    { value: "sc", label: "अनुसूचित जाति (SC)" },
    { value: "st", label: "अनुसूचित जनजाति (ST)" },
    { value: "obc", label: "अन्य पिछड़ा वर्ग (OBC)" },
    { value: "women", label: "महिला किसान (Women Farmer)" }
  ];

  const availableSchemes = [
    {
      id: 1,
      name: "PM-KISAN",
      title: "प्रधानमंत्री किसान सम्मान निधि योजना",
      amount: "₹6,000/year",
      description: "सभी छोटे और सीमांत किसानों को आर्थिक सहायता",
      eligibility: ["2 हेक्टेयर तक की जमीन", "भारतीय नागरिकता", "खेती करने वाला किसान"],
      documents: ["आधार कार्ड", "भूमि दस्तावेज", "बैंक पासबुक"],
      deadline: "कोई समय सीमा नहीं",
      status: "eligible",
      category: ["general", "sc", "st", "obc", "women"],
      applicationLink: "https://pmkisan.gov.in"
    },
    {
      id: 2,
      name: "Crop Insurance",
      title: "प्रधानमंत्री फसल बीमा योजना",
      amount: "फसल का बीमा",
      description: "प्राकृतिक आपदाओं से होने वाले नुकसान की भरपाई",
      eligibility: ["सभी किसान", "अधसूचित फसलें", "अधसूचित क्षेत्र"],
      documents: ["आधार कार्ड", "भूमि दस्तावेज", "बुवाई प्रमाण पत्र"],
      deadline: "बुवाई के बाद निर्धारित तिथि तक",
      status: "eligible",
      category: ["general", "sc", "st", "obc", "women"],
      applicationLink: "https://pmfby.gov.in"
    },
    {
      id: 3,
      name: "Soil Health Card",
      title: "मृदा स्वास्थ्य कार्ड योजना",
      amount: "निःशुल्क मिट्टी परीक्षण",
      description: "मिट्टी की गुणवत्ता जांच और सुधार सुझाव",
      eligibility: ["सभी किसान", "कृषि भूमि होना जरूरी"],
      documents: ["आधार कार्ड", "भूमि दस्तावेज"],
      deadline: "साल भर उपलब्ध",
      status: "eligible",
      category: ["general", "sc", "st", "obc", "women"],
      applicationLink: "https://soilhealth.dac.gov.in"
    },
    {
      id: 4,
      name: "Kisan Credit Card",
      title: "किसान क्रेडिट कार्ड योजना",
      amount: "₹3 लाख तक का ऋण",
      description: "कम ब्याज दर पर कृषि ऋण",
      eligibility: ["सभी किसान", "भूमि स्वामित्व", "कृषि गतिविधि"],
      documents: ["आधार कार्ड", "भूमि दस्तावेज", "आय प्रमाण पत्र"],
      deadline: "साल भर उपलब्ध",
      status: "eligible",
      category: ["general", "sc", "st", "obc"],
      applicationLink: "https://kcc.gov.in"
    },
    {
      id: 5,
      name: "Women Farmer Scheme",
      title: "महिला किसान सशक्तिकरण योजना",
      amount: "₹1 लाख तक अनुदान",
      description: "महिला किसानों के लिए विशेष वित्तीय सहायता",
      eligibility: ["महिला किसान", "स्वयं सहायता समूह सदस्य"],
      documents: ["आधार कार्ड", "महिला प्रमाण पत्र", "SHG सदस्यता"],
      deadline: "मार्च 2024",
      status: "eligible",
      category: ["women"],
      applicationLink: "https://mahila-kisan.gov.in"
    }
  ];

  const [filteredSchemes, setFilteredSchemes] = useState(availableSchemes);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const findSchemes = () => {
    if (!formData.farmerName || !formData.category) {
      toast({
        title: "कृपया सभी जानकारी भरें",
        description: "योजनाएं खोजने के लिए नाम और श्रेणी जरूरी है।",
        variant: "destructive"
      });
      return;
    }

    const filtered = availableSchemes.filter(scheme => 
      scheme.category.includes(formData.category)
    );
    
    setFilteredSchemes(filtered);
    
    toast({
      title: "योजनाएं मिलीं! 🎉",
      description: `आपके लिए ${filtered.length} योजनाएं उपलब्ध हैं।`,
    });
  };

  const playAudioExplanation = (schemeId: number) => {
    toast({
      title: "ऑडियो चल रहा है 🔊",
      description: "योजना की जानकारी हिंदी में सुनाई जा रही है।",
    });
  };

  const downloadForm = (schemeId: number) => {
    toast({
      title: "फॉर्म डाउनलोड हो रहा है",
      description: "आवेदन फॉर्म PDF में डाउनलोड हो जाएगा।",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-success/10 text-success border-success/20';
      case 'not-eligible': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

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
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="w-6 h-6 text-primary" />
                Subsidy & Scheme Finder
              </h1>
              <p className="text-muted-foreground">Find government schemes with audio explanations in Hindi</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Your Schemes
                </CardTitle>
                <CardDescription>Enter your details to find eligible schemes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    <User className="w-4 h-4 inline mr-2" />
                    Farmer Name *
                  </label>
                  <Input
                    placeholder="अपना नाम लिखें"
                    value={formData.farmerName}
                    onChange={(e) => handleInputChange("farmerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="श्रेणी चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Land Size (Hectare)
                  </label>
                  <Input
                    placeholder="भूमि का आकार"
                    value={formData.landSize}
                    onChange={(e) => handleInputChange("landSize", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    <Sprout className="w-4 h-4 inline mr-2" />
                    Main Crop
                  </label>
                  <Select onValueChange={(value) => handleInputChange("cropType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="मुख्य फसल चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheat">गेहूं (Wheat)</SelectItem>
                      <SelectItem value="rice">चावल (Rice)</SelectItem>
                      <SelectItem value="corn">मक्का (Corn)</SelectItem>
                      <SelectItem value="mustard">सरसों (Mustard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={findSchemes} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Find Schemes
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Schemes:</span>
                    <span className="font-bold">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Eligible:</span>
                    <span className="font-bold text-success">{filteredSchemes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Applied This Year:</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Benefits Received:</span>
                    <span className="font-bold text-success">₹18,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schemes List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Available Schemes</h2>
              <Badge className="bg-success/10 text-success border-success/20">
                {filteredSchemes.length} schemes found
              </Badge>
            </div>

            <div className="space-y-6">
              {filteredSchemes.map((scheme) => (
                <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{scheme.name}</CardTitle>
                          <Badge className={getStatusColor(scheme.status)}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Eligible
                          </Badge>
                        </div>
                        <CardDescription className="text-base font-medium text-foreground">
                          {scheme.title}
                        </CardDescription>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-success font-bold text-lg">
                          <DollarSign className="w-5 h-5" />
                          {scheme.amount}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{scheme.description}</p>
                    
                    {/* Eligibility */}
                    <div>
                      <h4 className="font-semibold mb-2">Eligibility (पात्रता):</h4>
                      <ul className="space-y-1 text-sm">
                        {scheme.eligibility.map((criteria, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-3 h-3 text-success mt-0.5" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <h4 className="font-semibold mb-2">Required Documents (आवश्यक दस्तावेज):</h4>
                      <div className="flex flex-wrap gap-2">
                        {scheme.documents.map((doc, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-warning" />
                      <span><strong>Deadline:</strong> {scheme.deadline}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Button 
                        size="sm" 
                        onClick={() => playAudioExplanation(scheme.id)}
                        className="flex-1 min-w-fit"
                      >
                        <Volume2 className="w-3 h-3 mr-1" />
                        Listen (हिंदी में सुनें)
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadForm(scheme.id)}
                        className="flex-1 min-w-fit"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download Form
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        asChild
                        className="flex-1 min-w-fit"
                      >
                        <a href={scheme.applicationLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Apply Online
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Help Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Need Help? / सहायता चाहिए?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Audio Support</h4>
                    <p className="text-muted-foreground">
                      हर योजना की जानकारी हिंदी में सुन सकते हैं। "Listen" बटन दबाएं।
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Application Help</h4>
                    <p className="text-muted-foreground">
                      आवेदन भरने में मदद के लिए फॉर्म डाउनलोड करें या हेल्पलाइन पर कॉल करें।
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 rounded-lg bg-info/10">
                  <p className="text-sm">
                    <strong>Helpline:</strong> 1800-115-526 (सुबह 9 बजे से शाम 6 बजे तक)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubsidyFinder;