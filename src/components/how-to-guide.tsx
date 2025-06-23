'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

type HowToGuideProps = {
  title: string;
  steps: string[];
};

export function HowToGuide({ title, steps }: HowToGuideProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <Card className="relative overflow-hidden border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-primary/10 rounded-full animate-pulse blur-3xl -z-10"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-accent/10 rounded-full animate-pulse blur-3xl -z-10 delay-1000"></div>
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center">
            <HelpCircle className="mr-3 h-6 w-6" />
            How to Use the {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-muted-foreground">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm mr-4 flex-shrink-0">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
