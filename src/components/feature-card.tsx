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
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:border-primary/80 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:ring-2 group-hover:ring-primary/50 dark:group-hover:shadow-primary/10">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10">
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
