
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Button, useRouter, useAuth

const values = [
  {
    title: "Empathy First",
    description:
      "We believe in designing technology that truly understands human emotions and responds with genuine empathy.",
  },
  {
    title: "Privacy & Trust",
    description:
      "Your conversations with Talkzii are private. We believe in transparent data practices and giving users control.",
  },
  {
    title: "Constant Improvement",
    description:
      "We're committed to the ongoing improvement of our AI to provide increasingly meaningful interactions.",
  },
];

export function NewLandingValues() {
  // Removed handleGetStarted function

  return (
    <section id="values-section" className="py-12 md:py-20 bg-background scroll-mt-20 text-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start mb-10 text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Our Values
          </h2>
          <div className="h-1 w-24 bg-primary rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          {values.map((value, index) => (
            <Card 
              key={index} 
              className="bg-card border-border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-primary">
                  {value.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* "Get Started" Button removed from here */}
      </div>
    </section>
  );
}
