import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GamepadIcon, 
  QrCode, 
  Shield, 
  Calendar, 
  Gift,
  TrendingUp,
  Users,
  Award,
  Bell,
  ChevronRight,
  Coins
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationState } from "@/hooks/use-navigation-state";
const Dashboard = () => {
  const [priceValue, setPriceValue] = useState("₹—/quintal");
  const [priceChange, setPriceChange] = useState("");
  const [alertsCount, setAlertsCount] = useState(0);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const { getLastVisitedPage } = useNavigationState();

  const quickStats = [
    { label: "Today's Mandi Price", value: priceValue, change: priceChange || "", icon: TrendingUp },
    { label: "Active Farmers", value: "12,847", change: "+8.1%", icon: Users },
    { label: "Game Tokens Earned", value: "2,350", change: "+15%", icon: Award },
    { label: "Pending Alerts", value: String(alertsCount), change: "New", icon: Bell }
  ];

  useEffect(() => {
    // Basic SEO
    document.title = "Smart Bharat Dashboard – AI Farm Status";
    const existing = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    const link = existing || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    if (!existing) document.head.appendChild(link);

    const fetchAdvisory = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('ai-market-advisory', {
          body: { crop: 'wheat', state: 'All India' }
        });
        if (!error && data) {
          const advisory = data?.advisory || data;
          const pb = advisory?.price_band;
          if (pb?.min && pb?.max) {
            setPriceValue(`₹${pb.min}–₹${pb.max}/quintal`);
            setPriceChange(advisory?.trend || "stable");
          } else {
            setPriceValue("₹2100–₹2150/quintal");
            setPriceChange("rising");
          }
          const advice = advisory?.advice || [];
          setAiTips(Array.isArray(advice) ? advice : ["Monitor market trends", "Check quality standards", "Plan harvest timing"]);
        } else {
          // Fallback data
          setPriceValue("₹2100–₹2150/quintal");
          setPriceChange("rising");
          setAiTips(["Monitor market trends", "Check quality standards", "Plan harvest timing"]);
        }
      } catch (e) {
        console.warn('Advisory fetch failed', e);
        // Fallback data
        setPriceValue("₹2100–₹2150/quintal");
        setPriceChange("rising");
        setAiTips(["Monitor market trends", "Check quality standards", "Plan harvest timing"]);
      }
    };

    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('weather_notifications')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data) setAlertsCount(data.length);
      } catch (e) {
        console.warn('Alerts fetch failed', e);
      }
    };

    fetchAdvisory();
    fetchAlerts();
  }, []);

  // Realtime updates for alerts
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'weather_notifications' },
        () => setAlertsCount((c) => c + 1)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const recentActivities = [
    { action: "Crop Health Scan", crop: "Wheat", result: "Healthy", time: "2 hours ago" },
    { action: "Mandi e-Pass Generated", location: "Kanpur Mandi", time: "4 hours ago" },
    { action: "Game Level Completed", game: "Fertilizer Quiz", reward: "50 tokens", time: "1 day ago" },
    { action: "Weather Alert", message: "Rain expected tomorrow", time: "1 day ago" }
  ];

  const upcomingReminders = [
    { task: "Wheat Irrigation", date: "Tomorrow", priority: "high" },
    { task: "Fertilizer Application", date: "Jan 12", priority: "medium" },
    { task: "Pest Control Check", date: "Jan 15", priority: "low" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-info/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Farmer Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Ramesh Kumar</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-success/10 text-success border-success/20">
                <Coins className="w-3 h-3 mr-1" />
                2,350 Tokens
              </Badge>
              <Link to="/">
                <Button variant="outline" size="sm">Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-success">{stat.change}</p>
                    </div>
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Where You Left Off */}
            {getLastVisitedPage() !== '/dashboard' && getLastVisitedPage() !== '/' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChevronRight className="w-5 h-5 text-primary" />
                    Continue Where You Left Off
                  </CardTitle>
                  <CardDescription>Resume your previous activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={getLastVisitedPage()}>
                    <Button className="w-full" size="lg">
                      Return to {getLastVisitedPage().replace('/', '').replace('-', ' ').toUpperCase() || 'Previous Page'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Link to="/agri-game">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <GamepadIcon className="w-6 h-6 text-primary" />
                      <span className="text-sm">Play & Learn</span>
                    </Button>
                  </Link>
                  <Link to="/e-pass">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <QrCode className="w-6 h-6 text-info" />
                      <span className="text-sm">Generate e-Pass</span>
                    </Button>
                  </Link>
                  <Link to="/blockchain-tracking">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Shield className="w-6 h-6 text-success" />
                      <span className="text-sm">Track Payments</span>
                    </Button>
                  </Link>
                  <Link to="/crop-calendar">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Calendar className="w-6 h-6 text-warning" />
                      <span className="text-sm">Crop Calendar</span>
                    </Button>
                  </Link>
                  <Link to="/subsidy-finder">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Gift className="w-6 h-6 text-primary" />
                      <span className="text-sm">Find Subsidies</span>
                    </Button>
                  </Link>
                  <Link to="/prices">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <TrendingUp className="w-6 h-6 text-info" />
                      <span className="text-sm">Market Prices</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.crop && `${activity.crop} - `}
                          {activity.result && `${activity.result} - `}
                          {activity.location && `${activity.location} - `}
                          {activity.game && `${activity.game} - `}
                          {activity.reward && `+${activity.reward} - `}
                          {activity.message && `${activity.message} - `}
                          {activity.time}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Reminders */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
                <CardDescription>Your farming schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{reminder.task}</p>
                        <p className="text-sm text-muted-foreground">{reminder.date}</p>
                      </div>
                      <Badge 
                        variant={reminder.priority === 'high' ? 'destructive' : 
                               reminder.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {reminder.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Token Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Game Progress</CardTitle>
                <CardDescription>Keep learning to earn more tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level 5</span>
                      <span>2,350 / 3,000</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    650 more tokens needed for Level 6
                  </p>
                  <Link to="/agri-game">
                    <Button size="sm" className="w-full">
                      Play More Games
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* AI Tips */}
            <Card>
              <CardHeader>
                <CardTitle>AI Tips</CardTitle>
                <CardDescription>AgriMind • AgriPredict • FarmSage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-muted-foreground">For crop: wheat</div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const { data } = await supabase.functions.invoke('ai-market-advisory', { body: { crop: 'wheat', state: 'All India' } });
                        setAiTips(Array.isArray(data?.advisory?.advice) ? data.advisory.advice : []);
                      } catch (e) {
                        console.warn('AI tips refresh failed', e);
                      }
                    }}
                  >
                    Refresh
                  </Button>
                </div>
                {aiTips && aiTips.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {aiTips.slice(0, 5).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No tips yet. Click Refresh to fetch AI guidance.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;