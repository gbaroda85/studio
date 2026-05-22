
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

type HowToGuideProps = {
  title: string;
  steps: string[];
};

export function HowToGuide({ title, steps }: HowToGuideProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-10">
      <Card className="relative overflow-hidden border-primary/20 shadow-lg bg-gradient-to-b from-primary/10 to-background">
        <CardHeader className="py-4">
          <CardTitle className="text-lg text-primary flex items-center">
            <HelpCircle className="mr-3 h-5 w-5" />
            How to Use the {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <ol className="space-y-3 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[10px] mr-3 mt-0.5 flex-shrink-0">{index + 1}</span>
                <span className="leading-tight">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
