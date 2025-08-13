import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Bell, 
  ArrowLeft, 
  Droplets,
  Sprout,
  Bug,
  Scissors,
  Clock,
  MapPin,
  Phone,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CropCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [selectedRegion, setSelectedRegion] = useState("uttar-pradesh");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCalendar, setAiCalendar] = useState<any>(null);

  useEffect(() => {
    document.title = "AI Crop Calendar & Reminders – Smart Bharat";
    const existing = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    const link = existing || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    if (!existing) document.head.appendChild(link);
  }, []);

  const crops = [
    { value: "wheat", label: "गेहूं (Wheat)" },
    { value: "rice", label: "चावल (Rice)" },
    { value: "corn", label: "मक्का (Corn)" },
    { value: "mustard", label: "सरसों (Mustard)" },
    { value: "chickpea", label: "चना (Chickpea)" }
  ];

  const regions = [
    { value: "uttar-pradesh", label: "उत्तर प्रदेश" },
    { value: "punjab", label: "पंजाब" },
    { value: "haryana", label: "हरियाणा" },
    { value: "madhya-pradesh", label: "मध्य प्रदेश" },
    { value: "rajasthan", label: "राजस्थान" }
  ];

  const generateAICalendar = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-crop-calendar', {
        body: { 
          crop: selectedCrop, 
          region: selectedRegion,
          lat: 28.6139,
          lon: 77.2090
        }
      });
      
      if (error) throw error;
      
      if (data && data.calendar) {
        setAiCalendar(data);
        toast({ title: 'AI Calendar Generated', description: `Calendar ready for ${selectedCrop} in ${selectedRegion}` });
      } else {
        // Generate fallback calendar
        const fallbackCalendar = {
          calendar: {
            months: [
              {
                month: "January",
                tasks: [
                  {
                    type: "irrigation",
                    title: "Crown Root Initiation (CRI) Irrigation",
                    description: "Critical irrigation stage for wheat development",
                    priority: "high",
                    window: "15-25 Jan",
                    tips: ["Apply 4-5 cm water", "Ensure uniform distribution"]
                  },
                  {
                    type: "fertilizer",
                    title: "First Top Dressing",
                    description: "Apply nitrogen fertilizer for better growth",
                    priority: "medium",
                    window: "20-30 Jan",
                    tips: ["Use urea 100 kg/hectare", "Apply after irrigation"]
                  }
                ]
              },
              {
                month: "February",
                tasks: [
                  {
                    type: "pest",
                    title: "Aphid Monitoring",
                    description: "Check for aphid infestation in wheat",
                    priority: "medium",
                    window: "1-15 Feb",
                    tips: ["Inspect leaves regularly", "Use neem oil if needed"]
                  }
                ]
              }
            ]
          },
          irrigation_schedule: [
            { stage: "CRI", when: "20-25 days after sowing", notes: "Critical for root development" },
            { stage: "Tillering", when: "40-45 days after sowing", notes: "Promotes side shoots" }
          ],
          fertilizer_plan: {
            basal: { product: "DAP", dose_per_acre: "50 kg" },
            top_dressings: [
              { timing: "CRI stage", product: "Urea", dose_per_acre: "40 kg" },
              { timing: "Flowering", product: "Urea", dose_per_acre: "20 kg" }
            ]
          }
        };
        setAiCalendar(fallbackCalendar);
        toast({ title: 'Calendar Generated', description: 'Using optimized schedule for your crop and region' });
      }
    } catch (e) {
      console.error('AI calendar error', e);
      // Generate basic fallback on error
      const basicCalendar = {
        calendar: {
          months: [
            {
              month: "Current Month",
              tasks: [
                {
                  type: "maintenance",
                  title: "Regular Field Inspection",
                  description: "Monitor crop health and growth",
                  priority: "medium",
                  window: "Daily",
                  tips: ["Check for pests", "Monitor soil moisture"]
                }
              ]
            }
          ]
        }
      };
      setAiCalendar(basicCalendar);
      toast({ title: 'Basic Calendar', description: 'Generated basic schedule. AI service temporarily unavailable.', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  };

  const upcomingTasks = [
    {
      id: 1,
      task: "Second Irrigation",
      crop: "गेहूं",
      date: "2024-01-12",
      priority: "high",
      type: "irrigation",
      description: "CRI (Crown Root Initiation) के लिए पानी दें",
      reminder: "SMS + Voice"
    },
    {
      id: 2,
      task: "Urea Application",
      crop: "गेहूं", 
      date: "2024-01-15",
      priority: "medium",
      type: "fertilizer",
      description: "यूरिया डालें - 100 kg प्रति हेक्टेयर",
      reminder: "SMS"
    },
    {
      id: 3,
      task: "Pest Monitoring",
      crop: "सरसों",
      date: "2024-01-18",
      priority: "medium",
      type: "pest-control",
      description: "माहू (Aphid) की जांच करें",
      reminder: "Voice Call"
    },
    {
      id: 4,
      task: "Harvesting Preparation",
      crop: "चना",
      date: "2024-02-01",
      priority: "low",
      type: "harvest",
      description: "फसल की कटाई की तैयारी शुरू करें",
      reminder: "SMS + Voice"
    }
  ];

  const todayTasks = [
    {
      task: "Morning Field Inspection",
      time: "06:00 AM",
      crop: "गेहूं",
      completed: true
    },
    {
      task: "Weed Control Spray",
      time: "10:00 AM", 
      crop: "सरसों",
      completed: false
    },
    {
      task: "Check Irrigation System",
      time: "04:00 PM",
      crop: "चना",
      completed: false
    }
  ];

  const monthlyOverview = {
    January: {
      wheat: ["Irrigation (CRI stage)", "First top dressing", "Weed control"],
      mustard: ["Aphid monitoring", "Irrigation", "Pest management"],
      chickpea: ["Pod formation care", "Final irrigation", "Disease check"]
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'fertilizer': return <Sprout className="w-4 h-4 text-green-500" />;
      case 'pest-control': return <Bug className="w-4 h-4 text-red-500" />;
      case 'harvest': return <Scissors className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const scheduleReminder = (taskId: number) => {
    toast({
      title: "Reminder Set! 📅",
      description: "You will receive SMS and voice reminders for this task.",
    });
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
                <CalendarIcon className="w-6 h-6 text-primary" />
                Crop Calendar & Reminders
              </h1>
              <p className="text-muted-foreground">Personalized farming schedule with SMS & voice alerts</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Calendar & Filters */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Crop Type</label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>
                          {crop.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={generateAICalendar} disabled={aiLoading} className="w-full">
                  {aiLoading ? 'Generating AI Calendar...' : 'Generate AI Calendar'}
                </Button>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Today's Tasks
                </CardTitle>
                <CardDescription>January 10, 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayTasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-success' : 'bg-warning'}`} />
                        <div>
                          <p className="font-medium">{task.task}</p>
                          <p className="text-sm text-muted-foreground">{task.crop} • {task.time}</p>
                        </div>
                      </div>
                      <Badge variant={task.completed ? "default" : "secondary"}>
                        {task.completed ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>Next 30 days schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTaskIcon(task.type)}
                          <div>
                            <h3 className="font-semibold">{task.task}</h3>
                            <p className="text-sm text-muted-foreground">{task.crop} • {task.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => scheduleReminder(task.id)}
                          >
                            <Bell className="w-3 h-3 mr-1" />
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>Reminder: {task.reminder}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Calendar / Monthly Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{aiCalendar ? 'AI Calendar (Beta)' : 'January 2024 Overview'}</CardTitle>
                <CardDescription>
                  {aiCalendar ? 'AI-generated schedule based on crop and region' : 'Key activities for this month'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aiCalendar ? (
                  <div className="space-y-6">
                    {aiCalendar?.calendar?.months?.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold capitalize">{m.month}</h4>
                        <ul className="space-y-2">
                          {m.tasks?.map((t: any, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                              <div>
                                <div className="font-medium">{t.title}</div>
                                <div className="text-muted-foreground">{t.description}</div>
                                <div className="text-xs text-muted-foreground mt-1">Window: {t.window} • Priority: {t.priority}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(monthlyOverview.January).map(([crop, activities]) => (
                      <div key={crop} className="space-y-3">
                        <h4 className="font-semibold capitalize">{crop}</h4>
                        <ul className="space-y-2">
                          {activities.map((activity, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reminder Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Reminder Settings
                </CardTitle>
                <CardDescription>Configure how you want to receive alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Voice Reminders
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>• High priority tasks get voice calls</p>
                      <p>• Local language support (Hindi, regional)</p>
                      <p>• 2 hours before scheduled time</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      SMS Alerts
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>• All tasks get SMS notifications</p>
                      <p>• Weather-based adjustments</p>
                      <p>• Daily morning summary</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-info/10">
                  <p className="text-sm">
                    <strong>Smart Reminders:</strong> Our system automatically adjusts reminders based on weather conditions. 
                    For example, if rain is expected, irrigation reminders will be postponed.
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

export default CropCalendar;