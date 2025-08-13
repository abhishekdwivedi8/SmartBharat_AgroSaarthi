import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const MandiPulse = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "MandiPulse – Trade Intel & Pricing",
    hasPart: [
      { "@type": "WebPage", name: "Live Mandi Prices", url: "/prices" },
      { "@type": "WebPage", name: "AI Insights", url: "/ai-insights" }
    ]
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <SEO
        title="MandiPulse: Trade Intel & Pricing"
        description="Trader alerts, live prices, and AI market advisory with demand signals."
        structuredData={structuredData}
      />

      <header className="mb-10">
        <Badge>Suite</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">MandiPulse – Trade Intel & Pricing</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Stay ahead with live prices, AI trends, and export intelligence.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Prices</CardTitle>
            <CardDescription>Market rates and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/prices">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Market Advisory</CardTitle>
            <CardDescription>Price bands and top mandis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/ai-insights">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Lock (Futures)</CardTitle>
            <CardDescription>Secure your minimum price</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trader Alerts</CardTitle>
            <CardDescription>Custom thresholds & SMS</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default MandiPulse;
