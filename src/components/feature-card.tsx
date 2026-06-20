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
      <div className="h-full bg-[#fdfdfd] dark:bg-[#0a040d] rounded-[2rem] p-1 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.1),0_4px_8px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_40px_80px_-20px_hsl(var(--primary)/0.4)] transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] border-2 border-slate-100/60 dark:border-primary/20 flex flex-col transform-gpu shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-black/[0.02] min-h-[260px]">
        <div className={cn("flex-1 rounded-[1.5rem] overflow-hidden flex flex-col p-6 shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)]", lightBg, "dark:bg-[#0a040d]/60")}>
          {/* COMPACT 3D ICON CONTAINER */}
          <div className={cn(
            "grid size-11 place-items-center rounded-[1rem] transition-transform duration-200 group-hover:scale-105 shrink-0 transform-gpu",
            "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2),0_6px_12px_-5px_rgba(0,0,0,0.3)]",
            color
          )}>
            <Icon className="h-5 w-5 text-white drop-shadow-[1.5px_1.5px_3px_rgba(0,0,0,0.3)]" />
          </div>
          <div className="flex-1 flex flex-col mt-4">
            <CardTitle className="text-lg font-bold mb-1 leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-200 uppercase font-body tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug font-bold uppercase opacity-60 tracking-tight line-clamp-2">
              {description}
            </CardDescription>

            <div className="flex flex-wrap gap-1 mt-auto pt-2">
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[6px] font-black uppercase text-slate-700 dark:text-primary border-none px-1.5 py-0.5 tracking-widest shadow-sm">Premium</Badge>
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[6px] font-black uppercase text-slate-700 dark:text-primary border-none px-1.5 py-0.5 tracking-widest shadow-sm">Secured</Badge>
            </div>
          </div>
        </div>

        {/* Footer Section with Uiverse Animated Button */}
        <div className="bg-transparent py-0.5 px-4 flex items-center justify-between rounded-b-[2rem]">
          <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-800 dark:text-slate-400 opacity-60">Launch</span>
          <div className="launch-arrow-btn scale-[0.65] origin-right -mr-2">
            <div className="button-box">
              <span className="button-elem">
                <ArrowRight />
              </span>
              <span className="button-elem">
                <ArrowRight />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
