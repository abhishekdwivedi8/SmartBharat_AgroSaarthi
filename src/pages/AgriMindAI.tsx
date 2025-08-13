import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const AgriMindAI = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AgriMind AI – Crop Advisory & Insights",
    hasPart: [
      { "@type": "WebPage", name: "AI Insights", url: "/ai-insights" },
      { "@type": "WebPage", name: "Live Mandi Prices", url: "/prices" },
      { "@type": "WebPage", name: "Weather Advisory", url: "/weather" },
      { "@type": "WebPage", name: "Crop Calendar", url: "/crop-calendar" }
    ]
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <SEO
        title="AgriMind AI: Crop Advisory & Insights"
        description="AI-powered crop advisory, seasonal demand, and market intelligence for Indian farmers."
        structuredData={structuredData}
      />

      <header className="mb-10">
        <Badge>Suite</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">AgriMind AI – Crop Advisory & Insights</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Unified AI advisory for crops, demand forecasting, export opportunities, and actionable recommendations.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Market advisory and agronomy suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/ai-insights">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Mandi Prices</CardTitle>
            <CardDescription>Real-time prices with trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/prices">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weather Advisory</CardTitle>
            <CardDescription>Localized weather-driven guidance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/weather">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crop Calendar</CardTitle>
            <CardDescription>Plan season-wise farm activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/crop-calendar">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predictive Export Advisory</CardTitle>
            <CardDescription>Top destinations and demand signals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crop Substitution</CardTitle>
            <CardDescription>AI-guided crop switching suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default AgriMindAI;
