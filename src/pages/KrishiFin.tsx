import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const KrishiFin = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "KrishiFin – Credit & Insurance",
    hasPart: [
      { "@type": "WebPage", name: "Subsidy Finder", url: "/subsidy-finder" }
    ]
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <SEO
        title="KrishiFin: Credit & Insurance"
        description="Credit profile, repayment calendar, micro-loans and insurance integrations."
        structuredData={structuredData}
      />

      <header className="mb-10">
        <Badge>Suite</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">KrishiFin – Credit & Insurance</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Discover subsidies and plan your finances with upcoming credit tools.
        </p>
      </header>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subsidy Finder</CardTitle>
            <CardDescription>Eligible schemes near you</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full"><Link to="/subsidy-finder">Open</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Profile</CardTitle>
            <CardDescription>Scores and documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Calendar</CardTitle>
            <CardDescription>Repayment reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Micro-loans & Insurance</CardTitle>
            <CardDescription>Best offers for farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>Coming soon</Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default KrishiFin;
