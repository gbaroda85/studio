
import Link from 'next/link';
import type {LucideIcon} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {ArrowRight} from 'lucide-react';
import { cn } from '@/lib/utils';

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
};

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  color,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl border-border/50 bg-card group-hover:border-primary/50 group-hover:ring-1 group-hover:ring-primary/20">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("grid size-14 place-items-center rounded-2xl bg-muted/50 transition-all group-hover:scale-110 group-hover:bg-primary/10", color)}>
              <Icon className="h-8 w-8" />
            </div>
            <div className="size-10 rounded-full flex items-center justify-center bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white transition-all">
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
          <CardTitle className="text-xl font-black mb-2 leading-tight">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</CardDescription>
        </CardHeader>
        <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors blur-xl" />
      </Card>
    </Link>
  );
}
