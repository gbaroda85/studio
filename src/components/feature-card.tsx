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
    <Link href={href} className="group block h-full">
      <Card className="h-full relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl dark:group-hover:shadow-primary/20 border-2 border-border/50 dark:border-white/10 group-hover:border-primary/50 dark:group-hover:border-primary/40 bg-card rounded-[2rem]">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("grid size-12 place-items-center rounded-xl bg-muted/50 transition-all group-hover:scale-110 group-hover:bg-primary/10 shadow-inner", color)}>
              <Icon className="h-7 w-7" />
            </div>
            <div className="size-9 rounded-full flex items-center justify-center bg-primary/5 group-hover:bg-primary text-primary group-hover:text-white transition-all shadow-sm">
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <CardTitle className="text-lg font-black mb-2 leading-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight uppercase line-clamp-1">{title}</CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 leading-tight font-semibold line-clamp-2 h-10">{description}</CardDescription>
        </CardHeader>
        <div className="absolute -bottom-10 -right-10 size-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors blur-2xl" />
      </Card>
    </Link>
  );
}
