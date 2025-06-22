import Link from 'next/link';
import type {LucideIcon} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {ArrowRight} from 'lucide-react';

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-lg">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <div className="mb-3 grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
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
