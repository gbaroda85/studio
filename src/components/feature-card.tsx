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
import { Badge } from '@/components/ui/badge';

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  lightBg?: string;
};

export function FeatureCard({
  title,
  description,
  href,
  icon: Icon,
  color,
  lightBg,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <div className="h-full bg-white dark:bg-[#150a1a] rounded-[2.5rem] p-2 shadow-lg hover:shadow-2xl dark:hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:-translate-y-1.5 border-2 border-slate-100/50 dark:border-primary/20 flex flex-col">
        <div className={cn("flex-1 rounded-[1.8rem] overflow-hidden flex flex-col p-5", lightBg, "dark:bg-[#0a040d]/60")}>
          {/* Fixed: Use the color class directly as provided by the parent */}
          <div className={cn("grid size-12 place-items-center rounded-2xl transition-all group-hover:scale-110 shadow-lg shrink-0", color)}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1 flex flex-col mt-4">
            <CardTitle className="text-lg md:text-xl font-bold mb-1.5 leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors uppercase font-body tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase opacity-70 tracking-tight">
              {description}
            </CardDescription>

            <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Premium</Badge>
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Secured</Badge>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-white dark:bg-[#0a040d] p-3.5 px-6 flex items-center justify-between rounded-b-[2.5rem]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">Launch Tool</span>
          <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
