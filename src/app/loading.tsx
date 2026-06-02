import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-background animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20 stroke-[3]" />
        <div className="absolute inset-0 m-auto h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Initializing Studio...</p>
    </div>
  );
}
