
'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  ArrowRight,
  Shrink,
  Maximize,
  FileOutput,
  FileDigit,
  Scissors,
  Merge,
  Lock,
  LayoutGrid,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const ToolCard = ({ icon: Icon, title, description, href, colorClass }: any) => (
  <Link href={href} className="group">
    <Card className="h-full border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-900 overflow-hidden relative rounded-2xl">
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass.replace('bg-', 'bg-'))} />
      <CardContent className="p-6">
        <div className={cn(`size-12 rounded-xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed font-medium">{description}</p>
        <div className="flex items-center text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
          Launch Tool <ArrowRight className="ml-1 size-3" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const FeatureItem = ({ icon: Icon, title, description, iconBg }: any) => (
  <div className="flex flex-col items-center text-center px-4 group">
    <div className={cn(`size-20 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl transition-all group-hover:-translate-y-2 group-hover:rotate-6`, iconBg)}>
      <Icon className="size-10 text-white" />
    </div>
    <h4 className="text-xl font-black mb-3 text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h4>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs font-medium">{description}</p>
  </div>
);

export default function Page() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="flex-1 bg-transparent">
      {/* Ultra-Modern Hero Section */}
      <section className="relative pt-24 pb-40 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-b-[4rem] shadow-2xl shadow-primary/5">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[800px] bg-accent/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.25em] mb-10 animate-fade-in-up shadow-sm">
            <Sparkles className="size-4" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter animate-fade-in-up leading-[0.95]">
            Supercharge Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Digital Assets</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-14 font-semibold leading-relaxed opacity-90 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Professional-grade image optimization and PDF tools. 
            Local processing, 100% private, zero server footprint.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="h-16 px-12 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
              <Link href="/tools">Explore 40+ Tools</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-2xl text-lg font-black border-2 hover:bg-muted transition-all active:scale-95 shadow-lg">
              <Link href="/image-compress" className="flex items-center gap-3">
                <Cpu className="size-6 text-primary" /> Start AI Task
              </Link>
            </Button>
          </div>

          {/* Search Bridge - Eliminates gap to next section */}
          <div className="max-w-3xl mx-auto relative group translate-y-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="What do you want to fix today? (e.g. 'unlock aadhaar', 'resize photo')"
                className="w-full pl-20 pr-8 h-24 text-xl rounded-[2.5rem] bg-white dark:bg-slate-800 border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] focus-visible:ring-4 focus-visible:ring-primary/20 font-bold placeholder:font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 h-14 px-8 bg-slate-900 dark:bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                Quick Find
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Tool Grid Section */}
      <section className="pt-32 pb-32">
        <div className="container mx-auto px-4">
          {/* Image Tools */}
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="text-left">
                <div className="flex items-center gap-3 text-primary font-black text-[11px] uppercase tracking-[0.2em] mb-3">
                  <div className="w-12 h-1.5 bg-primary rounded-full" /> Visual Processor
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Image Solutions</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-md font-semibold text-base">Lightning fast visual optimization using browser-side GPU acceleration for professional results.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <ToolCard 
                icon={Shrink}
                title="AI Image Compress"
                description="Intelligent size reduction up to 95% with zero visual loss. Perfect for forms."
                href="/image-compress"
                colorClass="bg-blue-600"
              />
              <ToolCard 
                icon={Maximize}
                title="Smart Resize"
                description="Resize to exact pixels or MM for SSC, UPSC, and IBPS application forms."
                href="/image-resize"
                colorClass="bg-indigo-600"
              />
              <ToolCard 
                icon={FileOutput}
                title="Format Converter"
                description="Seamless conversion between WebP, PNG, JPG, and AVIF in seconds."
                href="/image-to-jpg"
                colorClass="bg-orange-600"
              />
              <ToolCard 
                icon={Sparkles}
                title="AI HD Enhancer"
                description="Fix blurry photos and restore lost details using local neural AI models."
                href="/enhance-photo"
                colorClass="bg-purple-600"
              />
            </div>
          </div>

          {/* PDF Tools */}
          <div className="mb-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="text-left">
                <div className="flex items-center gap-3 text-rose-600 font-black text-[11px] uppercase tracking-[0.2em] mb-3">
                  <div className="w-12 h-1.5 bg-rose-600 rounded-full" /> Document Engine
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">PDF Toolkit</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-md font-semibold text-base">Industrial grade PDF manipulation without ever uploading your sensitive files.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <ToolCard 
                icon={FileDigit}
                title="PDF Optimizer"
                description="Shrink massive PDFs for email and portal uploads instantly with text clarity."
                href="/compress-pdf"
                colorClass="bg-rose-600"
              />
              <ToolCard 
                icon={Scissors}
                title="Split & Extract"
                description="Visually select and extract specific pages with high precision extraction."
                href="/split-pdf"
                colorClass="bg-cyan-600"
              />
              <ToolCard 
                icon={Merge}
                title="Bulk Merge"
                description="Combine hundreds of documents into one organized, secure master file."
                href="/merge-pdf"
                colorClass="bg-emerald-600"
              />
              <ToolCard 
                icon={Lock}
                title="Vault Protect"
                description="Apply military-grade AES encryption and password protection to your files."
                href="/protect-pdf"
                colorClass="bg-slate-800"
              />
            </div>
            
            <div className="mt-20 text-center">
              <Button asChild variant="outline" className="h-16 px-10 rounded-2xl font-black text-primary hover:bg-primary/5 uppercase tracking-widest text-sm border-2 border-primary/20 shadow-lg">
                <Link href="/tools" className="flex items-center gap-3">View All 40+ Utilities <ArrowRight className="size-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlighting Section */}
      <section className="py-32 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden rounded-[4rem]">
        <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter">The GR7 Standard</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-semibold max-w-2xl mx-auto">Our "Zero-Server" architecture means your sensitive files never leave your computer RAM.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <FeatureItem 
              icon={ShieldCheck}
              title="100% Private"
              description="Processing happens in your RAM. No server logs, no cloud storage, zero data risk for sensitive documents."
              iconBg="bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/40"
            />
            <FeatureItem 
              icon={Zap}
              title="Native Speed"
              description="Why wait for uploads? Native browser code executes tasks 10x faster than cloud-based alternatives."
              iconBg="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/40"
            />
            <FeatureItem 
              icon={CheckCircle2}
              title="Verified Safe"
              description="Industry standard algorithms ensure your files are optimized without any quality loss or compression artifacts."
              iconBg="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/40"
            />
          </div>
        </div>
      </section>

      {/* Final Premium CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[5rem] p-16 md:p-32 text-center text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-[800px] bg-primary/25 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 size-[600px] bg-accent/20 blur-[180px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-8xl font-black mb-10 tracking-tighter leading-tight">
                Ready for the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Next Generation?</span>
              </h2>
              <p className="text-slate-400 text-xl md:text-2xl mb-16 max-w-3xl mx-auto font-semibold leading-relaxed">
                Join thousands of professionals using GR7 for secure, high-speed digital workflows. 100% Free, Forever.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Button asChild size="lg" className="h-20 px-14 rounded-3xl text-xl font-black bg-white text-slate-900 hover:bg-slate-100 shadow-3xl transition-all hover:scale-105 active:scale-95">
                  <Link href="/tools">Get Started Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-20 px-14 rounded-3xl text-xl font-black border-white/30 text-white hover:bg-white/10 transition-all active:scale-95 backdrop-blur-md">
                  <a href="mailto:gaurav.thearmy@yahoo.com">Contact Support</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
