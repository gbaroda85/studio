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
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="mb-4 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
