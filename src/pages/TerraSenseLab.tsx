import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const TerraSenseLab = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "TerraSense Lab – Soil, Pest & Climate Health",
    hasPart: [
      { "@type": "WebPage", name: "Crop Health Detection", url: "/crop-health" },
      { "@type": "WebPage", name: "Weather Advisory", url: "/weather" }
    ]
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <SEO
        title="TerraSense Lab: Soil, Pest & Climate Health"
        description="Soil health, pest detection, and climate risk alerts with AI, satellites, drones, and IoT."
        structuredData={structuredData}
      />

      <header className="mb-10">
        <Badge>Suite</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">TerraSense Lab – Soil, Pest & Climate Health</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Early detection and actionable advisories combining imagery, sensors, and climate intelligence.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crop Health Detection</CardTitle>
            <CardDescription>Diagnose disease and get care steps</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/crop-health">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Climate Risk Alerts</CardTitle>
            <CardDescription>Weather-driven notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/weather">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satellite Early Detection</CardTitle>
            <CardDescription>Spot stress before it's visible</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drone Monitoring</CardTitle>
            <CardDescription>On-demand aerial survey</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IoT Sensor Hub</CardTitle>
            <CardDescription>Soil moisture and microclimate</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default TerraSenseLab;
