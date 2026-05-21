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
    <Card className="h-full border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-900 overflow-hidden relative">
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass.replace('bg-', 'bg-'))} />
      <CardContent className="p-6">
        <div className={cn(`size-12 rounded-xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{description}</p>
        <div className="flex items-center text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
          Launch Tool <ArrowRight className="ml-1 size-3" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const FeatureItem = ({ icon: Icon, title, description, iconBg }: any) => (
  <div className="flex flex-col items-center text-center px-4 group">
    <div className={cn(`size-20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl transition-all group-hover:-translate-y-2 group-hover:rotate-6`, iconBg)}>
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
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Ultra-Modern Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 -left-24 size-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/2 -right-24 size-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-fade-in-up">
            <Sparkles className="size-3" /> All-in-One AI Utility Suite
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter animate-fade-in-up leading-[0.9]">
            Optimize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Digital Assets</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed opacity-90 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Professional-grade image compression, PDF manipulation, and smart calculators. 
            All processed 100% locally for maximum privacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
              <Link href="/tools">Explore 35+ Tools</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-black border-2 hover:bg-muted transition-all active:scale-95">
              <Link href="/image-compress" className="flex items-center gap-2">
                <Cpu className="size-5 text-primary" /> Start AI Task
              </Link>
            </Button>
          </div>

          {/* Search Bridge - Eliminates gap to next section */}
          <div className="max-w-2xl mx-auto relative group translate-y-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="What do you want to do? (e.g. 'compress pdf', 'resize image')"
                className="w-full pl-16 pr-6 h-20 text-lg rounded-3xl bg-white dark:bg-slate-800 border-none shadow-2xl focus-visible:ring-2 focus-visible:ring-primary font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 h-12 px-6 bg-slate-900 dark:bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                Find Tool
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Tool Grid Section */}
      <section className="pt-24 pb-24">
        <div className="container mx-auto px-4">
          {/* Image Tools */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="text-left">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                  <div className="w-8 h-1 bg-primary rounded-full" /> Graphics Processor
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Image Solutions</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-sm">Lightning fast visual optimization using browser-side GPU acceleration.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ToolCard 
                icon={Shrink}
                title="AI Image Compress"
                description="Intelligent size reduction up to 95% with zero visual loss."
                href="/image-compress"
                colorClass="bg-blue-600"
              />
              <ToolCard 
                icon={Maximize}
                title="Smart Resize"
                description="Resize to exact pixels or MM for SSC, UPSC, and IBPS forms."
                href="/image-resize"
                colorClass="bg-indigo-600"
              />
              <ToolCard 
                icon={FileOutput}
                title="Format Converter"
                description="Seamless conversion between WebP, PNG, JPG, and AVIF."
                href="/image-to-jpg"
                colorClass="bg-orange-600"
              />
              <ToolCard 
                icon={Sparkles}
                title="AI HD Enhancer"
                description="Fix blurry photos and restore details using local AI models."
                href="/enhance-photo"
                colorClass="bg-purple-600"
              />
            </div>
          </div>

          {/* PDF Tools */}
          <div className="mb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="text-left">
                <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest mb-2">
                  <div className="w-8 h-1 bg-rose-600 rounded-full" /> Document Engine
                </div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">PDF Toolkit</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-sm">Industrial grade PDF manipulation without ever uploading your files.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <ToolCard 
                icon={FileDigit}
                title="PDF Optimizer"
                description="Shrink massive PDFs for email and portal uploads instantly."
                href="/compress-pdf"
                colorClass="bg-rose-600"
              />
              <ToolCard 
                icon={Scissors}
                title="Split & Extract"
                description="Visually select and extract specific pages with high precision."
                href="/split-pdf"
                colorClass="bg-cyan-600"
              />
              <ToolCard 
                icon={Merge}
                title="Bulk Merge"
                description="Combine hundreds of documents into one organized file."
                href="/merge-pdf"
                colorClass="bg-emerald-600"
              />
              <ToolCard 
                icon={Lock}
                title="Vault Protect"
                description="Apply AES encryption and password protection to your files."
                href="/protect-pdf"
                colorClass="bg-slate-800"
              />
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild variant="ghost" className="h-12 px-8 rounded-xl font-black text-primary hover:bg-primary/5 uppercase tracking-widest text-xs border-2 border-primary/20">
                <Link href="/tools" className="flex items-center gap-2">View All 35+ Utilities <ArrowRight className="size-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlighting Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Engineered for Privacy</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">Our "Zero-Server" architecture means your sensitive files never leave your computer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <FeatureItem 
              icon={ShieldCheck}
              title="100% Private"
              description="Processing happens in your RAM. No server logs, no cloud storage, no data risk."
              iconBg="bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/30"
            />
            <FeatureItem 
              icon={Zap}
              title="Native Speed"
              description="Why wait for uploads? Native browser code executes tasks 5x faster than cloud tools."
              iconBg="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30"
            />
            <FeatureItem 
              icon={CheckCircle2}
              title="Verified Safe"
              description="Industry standard algorithms ensure your files are optimized without quality loss."
              iconBg="bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/30"
            />
          </div>
        </div>
      </section>

      {/* Final Premium CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-slate-900 dark:bg-slate-800 rounded-[4rem] p-12 md:p-24 text-center text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-[600px] bg-primary/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 size-[400px] bg-accent/20 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
                Ready to Experience <br /> the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Next Generation?</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Join the professional community using GR7 for high-speed, secure digital workflows. No registration, no ads, no limits.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild size="lg" className="h-16 px-12 rounded-[2rem] text-lg font-black bg-white text-slate-900 hover:bg-slate-100 shadow-2xl transition-all hover:scale-105 active:scale-95">
                  <Link href="/tools">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-[2rem] text-lg font-black border-white/20 text-white hover:bg-white/5 transition-all active:scale-95">
                  <a href="mailto:gaurav.thearmy@yahoo.com">Get in Touch</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
