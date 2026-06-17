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
      <div className="h-full bg-white dark:bg-[#0a040d] rounded-[2.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_45px_100px_-20px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] border-2 border-slate-100/50 dark:border-primary/20 flex flex-col transform-gpu shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className={cn("flex-1 rounded-[1.8rem] overflow-hidden flex flex-col p-5", lightBg, "dark:bg-[#0a040d]/60")}>
          {/* ENHANCED 3D ICON CONTAINER WITH DEEP SHADOWS */}
          <div className={cn(
            "grid size-16 place-items-center rounded-[1.5rem] transition-transform duration-200 group-hover:scale-110 shrink-0 transform-gpu",
            "shadow-[inset_3px_3px_6px_rgba(255,255,255,0.5),inset_-3px_-3px_6px_rgba(0,0,0,0.3),0_15px_30px_-5px_rgba(0,0,0,0.3)]",
            color
          )}>
            <Icon className="h-8 w-8 text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)]" />
          </div>
          <div className="flex-1 flex flex-col mt-6">
            <CardTitle className="text-lg md:text-xl font-bold mb-1.5 leading-tight text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-200 uppercase font-body tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-bold uppercase opacity-70 tracking-tight">
              {description}
            </CardDescription>

            <div className="flex flex-wrap gap-2 mt-auto pt-4">
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Premium</Badge>
                <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Secured</Badge>
            </div>
          </div>
        </div>

        {/* Footer Section with Uiverse Animated Button */}
        <div className="bg-white dark:bg-[#0a040d] p-1.5 px-6 flex items-center justify-between rounded-b-[2.5rem]">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400">Launch Tool</span>
          <div className="launch-arrow-btn">
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
