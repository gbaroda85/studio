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
    <Link href={href} className="group block h-full touch-manipulation">
      <div className="h-full bg-white dark:bg-[#0a040d] rounded-[2rem] p-1 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-primary/5 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] border-2 border-slate-200/50 dark:border-primary/20 flex flex-col transform-gpu min-h-[280px] md:min-h-[300px]">
        <div className={cn("flex-1 rounded-[1.7rem] overflow-hidden flex flex-col p-5 md:p-6 shadow-inner", lightBg, "dark:bg-slate-900/60")}>
          {/* COMPACT 3D ICON CONTAINER */}
          <div className={cn(
            "grid size-12 md:size-14 place-items-center rounded-[1rem] md:rounded-[1.2rem] transition-transform duration-200 group-hover:scale-110 shrink-0 transform-gpu",
            "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.3)]",
            color
          )}>
            <Icon className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
          <div className="flex-1 flex flex-col mt-5 md:mt-6">
            <CardTitle className="text-base md:text-xl font-semibold mb-2 leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-200 uppercase font-body tracking-tighter whitespace-normal md:whitespace-nowrap">
              {title}
            </CardTitle>
            <CardDescription className="text-[10px] md:text-[12px] text-slate-600 dark:text-slate-400 leading-snug font-bold uppercase opacity-60 tracking-tight line-clamp-3 md:line-clamp-2 lg:line-clamp-3">
              {description}
            </CardDescription>

            <div className="flex flex-wrap gap-2 mt-auto pt-4 md:pt-6">
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest shadow-sm">Premium</Badge>
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest shadow-sm">Industrial</Badge>
            </div>
          </div>
        </div>

        {/* Footer Section with Uiverse Animated Button */}
        <div className="bg-white/10 dark:bg-black/10 py-2 md:py-2.5 px-6 md:px-8 flex items-center justify-between shrink-0">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400 opacity-60">Launch Tool</span>
          <div className="launch-arrow-btn scale-[0.6] md:scale-[0.7] origin-right -mr-2">
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
