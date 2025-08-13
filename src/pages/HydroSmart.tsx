import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const HydroSmart = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "HydroSmart Control – Irrigation & Automation",
    hasPart: [
      { "@type": "WebPage", name: "Weather Advisory", url: "/weather" }
    ]
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <SEO
        title="HydroSmart Control: Irrigation & Automation"
        description="Smart irrigation scheduling, water-saving tips, and weather-aware plans."
        structuredData={structuredData}
      />

      <header className="mb-10">
        <Badge>Suite</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">HydroSmart Control – Irrigation & Automation</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Schedule irrigation intelligently with weather forecasts and soil conditions.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weather-Aware Plans</CardTitle>
            <CardDescription>Avoid irrigation before rain</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/weather">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Smart Scheduling</CardTitle>
            <CardDescription>Automated water slots</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soil Moisture Insights</CardTitle>
            <CardDescription>Sensor-led decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default HydroSmart;
