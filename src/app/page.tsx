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
  Landmark,
  Cake,
  Coins,
  Eraser,
  FileScan,
  PenLine,
  Wand2,
  FileText,
  FileCode,
  ImageIcon,
  Crop,
  ScanLine,
  Unlock,
  Copyright,
  NotebookPen,
  Archive,
  ArchiveRestore,
  Calculator,
  Percent,
  Route,
  Receipt,
  Gauge,
  AreaChart,
  Fuel,
  Waves,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Global tool list for homepage search and display
const ALL_TOOLS = [
  // Image Tools
  { icon: Shrink, title: "AI Image Compress", description: "Reduce image size up to 95% with zero visual loss.", href: "/image-compress", colorClass: "bg-blue-600", category: "image" },
  { icon: Maximize, title: "Smart Resize", description: "Resize to exact pixels or MM for application forms.", href: "/image-resize", colorClass: "bg-indigo-600", category: "image" },
  { icon: UserCircle, title: "Passport Photo Maker", description: "Create professional ID photos with AI background removal.", href: "/passport-photo", colorClass: "bg-orange-500", category: "image" },
  { icon: Eraser, title: "Background Remover", description: "Extract subjects from any photo in high definition.", href: "/remove-background", colorClass: "bg-rose-500", category: "image" },
  { icon: Sparkles, title: "AI HD Enhancer", description: "Fix blurry photos and restore lost details instantly.", href: "/enhance-photo", colorClass: "bg-purple-600", category: "image" },
  { icon: PenLine, title: "Signature Remover", description: "Clean signatures from documents using AI.", href: "/remove-signature", colorClass: "bg-orange-500", category: "image" },
  { icon: FileScan, title: "Image to Text (OCR)", description: "Extract text from any image using local AI.", href: "/image-to-text", colorClass: "bg-teal-500", category: "image" },
  { icon: FileOutput, title: "Image to JPG", description: "Convert any image format to standard JPG.", href: "/image-to-jpg", colorClass: "bg-yellow-500", category: "image" },
  { icon: FileDigit, title: "Image to PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-red-500", category: "image" },
  { icon: Crop, title: "Smart Crop", description: "Crop and straighten images with perspective correction.", href: "/crop-image", colorClass: "bg-cyan-500", category: "image" },
  
  // PDF Tools
  { icon: FileArchive, title: "PDF Optimizer", description: "Shrink massive PDFs for easy email and portal uploads.", href: "/compress-pdf", colorClass: "bg-rose-600", category: "pdf" },
  { icon: Scissors, title: "Split & Extract", description: "Visually select and extract specific pages from PDF.", href: "/split-pdf", colorClass: "bg-cyan-600", category: "pdf" },
  { icon: Merge, title: "Bulk Merge", description: "Combine hundreds of documents into one secure file.", href: "/merge-pdf", colorClass: "bg-emerald-600", category: "pdf" },
  { icon: Unlock, title: "Unlock PDF", description: "Remove passwords from Aadhaar or Bank PDFs.", href: "/unlock-pdf", colorClass: "bg-teal-500", category: "pdf" },
  { icon: Lock, title: "Vault Protect", description: "Secure PDFs with AES encryption and passwords.", href: "/protect-pdf", colorClass: "bg-slate-800", category: "pdf" },
  { icon: ScanLine, title: "Scan to PDF", description: "Turn your camera into a professional document scanner.", href: "/scan-to-pdf", colorClass: "bg-indigo-500", category: "pdf" },
  { icon: FileText, title: "Text to PDF", description: "Convert plain text into a clean PDF document.", href: "/text-to-pdf", colorClass: "bg-slate-500", category: "pdf" },
  { icon: FileCode, title: "HTML to PDF", description: "Convert raw HTML code into a professional PDF.", href: "/html-to-pdf", colorClass: "bg-orange-600", category: "pdf" },
  { icon: ImageIcon, title: "PDF to Image", description: "Extract every page of a PDF as a high-quality image.", href: "/pdf-to-image", colorClass: "bg-orange-500", category: "pdf" },
  { icon: Copyright, title: "Watermark PDF", description: "Add text watermarks to protect your documents.", href: "/add-watermark", colorClass: "bg-rose-500", category: "pdf" },
  { icon: NotebookPen, title: "Page Numbers", description: "Insert page numbers in various formats and positions.", href: "/add-page-numbers", colorClass: "bg-lime-500", category: "pdf" },

  // Calculators & Converters
  { icon: Landmark, title: "EMI Calculator", description: "Calculate monthly loan payments and interest.", href: "/loan-calculator", colorClass: "bg-indigo-600", category: "calculator" },
  { icon: Cake, title: "Age Calculator", description: "Find out your exact age in years, months, and days.", href: "/age-calculator", colorClass: "bg-rose-500", category: "calculator" },
  { icon: Percent, title: "Percentage Calc", description: "Quickly calculate marks, ratios, and percentages.", href: "/percentage-calculator", colorClass: "bg-blue-500", category: "calculator" },
  { icon: Route, title: "Fuel Cost Calc", description: "Estimate the fuel cost for your next road trip.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", category: "calculator" },
  { icon: Coins, title: "Interest Calc", description: "Calculate simple and compound interest instantly.", href: "/interest-calculator", colorClass: "bg-yellow-600", category: "calculator" },
  { icon: Receipt, title: "Sales Tax Calc", description: "Calculate tax and final price for any item.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", category: "calculator" },
  { icon: Gauge, title: "Acceleration Conv", description: "Convert between m/s², km/h², and gravity units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", category: "converters" },
  { icon: AreaChart, title: "Area Converter", description: "Convert Acre, Hectare, Sq Ft, and Sq Meter.", href: "/area-converter", colorClass: "bg-lime-500", category: "converters" },
  { icon: Fuel, title: "Fuel Converter", description: "Convert between km/L and MPG (US/UK).", href: "/fuel-converter", colorClass: "bg-orange-500", category: "converters" },
  { icon: Waves, title: "Pressure Converter", description: "Convert between Bar, PSI, Pa, and ATM.", href: "/pressure-converter", colorClass: "bg-sky-500", category: "converters" },

  // File Tools
  { icon: Archive, title: "Create Zip", description: "Compress multiple files into a single archive.", href: "/create-zip", colorClass: "bg-violet-500", category: "file" },
  { icon: ArchiveRestore, title: "Unzip File", description: "Extract contents from any ZIP archive safely.", href: "/unzip-file", colorClass: "bg-stone-500", category: "file" },
];

const ToolCard = ({ icon: Icon, title, description, href, colorClass }: any) => (
  <Link href={href} className="group">
    <Card className="h-full border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-900 overflow-hidden relative rounded-2xl">
      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass)} />
      <CardContent className="p-6">
        <div className={cn(`size-12 rounded-xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed font-medium">{description}</p>
        <div className="flex items-center text-primary font-bold text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
          Try Tool <ArrowRight className="ml-1 size-3" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const FeatureItem = ({ icon: Icon, title, description, iconBg }: any) => (
  <div className="flex flex-col items-center text-center px-4 group">
    <div className={cn(`size-14 rounded-2xl flex items-center justify-center mb-5 shadow-xl transition-all group-hover:-translate-y-1 group-hover:rotate-3`, iconBg)}>
      <Icon className="size-7 text-white" />
    </div>
    <h4 className="text-lg font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h4>
    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px] font-medium">{description}</p>
  </div>
);

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return ALL_TOOLS.filter(tool => 
      tool.title.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <main className="flex-1 bg-transparent">
      {/* Hero Section - Extremely Compact & Modern */}
      <section className="relative pt-12 pb-14 overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 rounded-b-[2.5rem] shadow-2xl shadow-primary/5">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[600px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[600px] bg-accent/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-6 animate-fade-in-up shadow-sm">
            <Sparkles className="size-3" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter animate-fade-in-up leading-[0.95]">
            Professional Tools for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Images & PDFs</span>
          </h1>
          
          <p className="text-md text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 font-semibold leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Fast, secure, and private browser-based online tools. <br className="hidden md:block" />
            Everything happens locally, 100% private.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button asChild size="lg" className="h-12 px-8 rounded-xl text-sm font-black bg-primary hover:bg-primary/90 shadow-xl transition-all hover:scale-105">
              <Link href="/tools">Start Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl text-sm font-black border-2 transition-all">
              <Link href="/tools?tab=pdf">PDF Tools</Link>
            </Button>
          </div>

          {/* Search Bridge - Compact and overlapping */}
          <div className="max-w-xl mx-auto relative group translate-y-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'compress', 'passport', 'emi')"
                className="w-full pl-14 pr-6 h-14 text-md rounded-xl bg-white dark:bg-slate-800 border-none shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] focus-visible:ring-4 focus-visible:ring-primary/20 font-bold placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section - Dynamic padding for search overlap */}
      <section className="pt-16 pb-20 bg-background">
        <div className="container mx-auto px-4">
          
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-8">
                  <div className="w-8 h-1 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredTools.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed">
                        <Search className="size-10 mx-auto mb-3 text-muted-foreground/30" />
                        <h3 className="text-lg font-black text-slate-400 uppercase">No matching tools found</h3>
                        <p className="text-xs text-muted-foreground font-medium mt-1">Try 'PDF', 'Compress', or 'Resize'</p>
                    </div>
                )}
            </div>
          ) : (
            <>
                {/* Visual Processor */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div className="text-left">
                            <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                                <div className="w-8 h-1 bg-primary rounded-full" /> Image Solutions
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Visual Processor</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ToolCard icon={Shrink} title="AI Image Compress" description="Reduce image size up to 95% with zero visual loss." href="/image-compress" colorClass="bg-blue-600" />
                        <ToolCard icon={Maximize} title="Smart Resize" description="Resize photos to exact pixels for job application forms." href="/image-resize" colorClass="bg-indigo-600" />
                        <ToolCard icon={UserCircle} title="Passport Maker" description="Create professional ID photos with AI background removal." href="/passport-photo" colorClass="bg-orange-500" />
                        <ToolCard icon={Eraser} title="Background Remover" description="Extract subjects from any photo in high definition." href="/remove-background" colorClass="bg-rose-500" />
                    </div>
                </div>

                {/* PDF Toolkit */}
                <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div className="text-left">
                            <div className="flex items-center gap-3 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                                <div className="w-8 h-1 bg-rose-600 rounded-full" /> Document Engine
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">PDF Toolkit</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ToolCard icon={FileDigit} title="PDF Optimizer" description="Shrink massive PDFs for easy email and portal uploads." href="/compress-pdf" colorClass="bg-rose-600" />
                        <ToolCard icon={Scissors} title="Split & Extract" description="Visually select and extract specific pages with ease." href="/split-pdf" colorClass="bg-cyan-600" />
                        <ToolCard icon={Merge} title="Bulk Merge" description="Combine multiple documents into one secure file." href="/merge-pdf" colorClass="bg-emerald-600" />
                        <ToolCard icon={Unlock} title="Aadhaar Unlock" description="Instantly remove passwords from Aadhaar & Bank bills." href="/unlock-pdf" colorClass="bg-teal-500" />
                    </div>
                </div>
                
                <div className="text-center">
                    <Button asChild variant="outline" className="h-12 px-8 rounded-xl font-black text-primary border-2 border-primary/20 shadow-md">
                        <Link href="/tools">View All 40+ Utilities <ArrowRight className="ml-2 size-4" /></Link>
                    </Button>
                </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section - Compact "GR7 Standard" */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 relative overflow-hidden rounded-[2.5rem]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">The GR7 Standard</h2>
            <p className="text-md text-slate-500 dark:text-slate-400 font-semibold italic">Native speed. 100% Client-side. Zero server footprints.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureItem icon={ShieldCheck} title="100% Private" description="Processing happens in your RAM. No server logs, no data risk." iconBg="bg-gradient-to-br from-green-400 to-green-600" />
            <FeatureItem icon={Zap} title="Native Speed" description="Execute tasks 10x faster using browser power." iconBg="bg-gradient-to-br from-blue-400 to-blue-600" />
            <FeatureItem icon={CheckCircle2} title="Verified Safe" description="Industry standard algorithms ensure zero artifacts." iconBg="bg-gradient-to-br from-purple-400 to-purple-600" />
          </div>
        </div>
      </section>

      {/* CTA Section - Light mode ready */}
      <section className="py-16 relative overflow-hidden bg-transparent">
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-20 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 size-80 bg-primary/5 blur-[120px] rounded-full" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter leading-tight text-slate-900 dark:text-white">
                Ready for the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Next Generation?</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-md mb-10 max-w-xl mx-auto font-semibold">
                Join thousands of users using GR7 for secure, digital-first workflows. Free forever.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8 rounded-xl text-md font-black bg-primary text-white shadow-xl hover:scale-105 transition-transform">
                  <Link href="/tools">Get Started Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl text-md font-black border-2">
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
