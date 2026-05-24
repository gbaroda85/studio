
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
  LayoutGrid,
  CheckCircle2,
  Landmark,
  Cake,
  Percent,
  Route,
  Coins,
  Eraser,
  FileScan,
  PenLine,
  FileText,
  FileCode,
  Image as ImageIcon,
  Crop,
  ScanLine,
  Unlock,
  Copyright,
  NotebookPen,
  Archive,
  ArchiveRestore,
  Receipt,
  Gauge,
  AreaChart,
  Fuel,
  Waves,
  FileArchive,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Global tool list for search functionality
const ALL_TOOLS = [
  // Image Tools
  { icon: Shrink, title: "AI Image Compress", description: "Reduce image size up to 95% with zero visual loss.", href: "/image-compress", colorClass: "bg-blue-600", category: "image" },
  { icon: Maximize, title: "Smart Resize", description: "Resize to exact pixels or MM for application forms.", href: "/image-resize", colorClass: "bg-indigo-600", category: "image" },
  { icon: UserCircle, title: "Passport Photo Maker", description: "Create professional passport-sized photos for any country standard.", href: "/passport-photo", colorClass: "bg-emerald-600", category: "image" },
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
    <Card className="h-full border-2 border-border/50 dark:border-white/10 shadow-sm hover:shadow-2xl dark:hover:shadow-primary/20 hover:border-primary/50 dark:hover:border-primary/40 transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative rounded-2xl bg-gradient-to-br from-white via-white to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10 hover:-translate-y-2">
      <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass)} />
      <CardContent className="p-6">
        <div className={cn(`size-12 rounded-xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{title}</h3>
        <p className="text-base text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed font-semibold">{description}</p>
        <div className="flex items-center text-primary font-black text-xs uppercase tracking-widest group-hover:gap-2 transition-all">
          Try Now <ArrowRight className="ml-1 size-3.5" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const FeatureItem = ({ icon: Icon, title, description, iconBg }: any) => (
  <div className="flex flex-col items-center text-center px-4 group">
    <div className={cn(`size-12 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-all group-hover:-translate-y-1 group-hover:rotate-3`, iconBg)}>
      <Icon className="size-6 text-white" />
    </div>
    <h4 className="text-sm font-black mb-1.5 text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h4>
    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px] font-medium">{description}</p>
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
    <main className="flex-1 bg-transparent w-full flex flex-col items-center">
      {/* COMPACT Hero Section */}
      <section className="relative w-full max-w-[2000px] pt-6 pb-8 overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 rounded-b-[2rem] shadow-2xl shadow-primary/5 mx-auto">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[600px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[600px] bg-accent/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full px-8 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.2em] mb-3 shadow-sm">
            <Sparkles className="size-2.5" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black mb-3 tracking-tighter leading-tight">
            Professional Tools for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Images & PDFs</span>
          </h1>
          
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-6 font-semibold leading-relaxed">
            Everything happens locally in your device RAM, 100% private.
          </p>

          {/* Search Bar - Compact */}
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'ocr', 'emi')"
                className="w-full pl-14 pr-4 h-12 text-sm rounded-xl bg-white dark:bg-slate-800 border-none shadow-xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="pt-10 pb-20 bg-background w-full flex justify-center">
        <div className="w-full max-w-[2000px] px-8 md:px-16">
          
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.2em] mb-6">
                  <div className="w-8 h-1 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                {filteredTools.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredTools.map((tool, i) => (
                            <ToolCard key={i} {...tool} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <Search className="size-10 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-black text-slate-400 uppercase">No tools matched your search</h3>
                        <p className="text-xs text-muted-foreground font-medium mt-2">Try words like 'PDF', 'Compress', 'Resize', or 'Calc'</p>
                    </div>
                )}
            </div>
          ) : (
            <>
                {/* Visual Processor */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
                        <div className="text-left">
                            <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.2em] mb-1">
                                <div className="w-8 h-1 bg-primary rounded-full" /> Image Solutions
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Visual Processor</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        <ToolCard icon={Shrink} title="AI Image Compress" description="Reduce image size up to 95% with zero visual loss." href="/image-compress" colorClass="bg-blue-600" />
                        <ToolCard icon={Maximize} title="Smart Resize" description="Resize photos to exact pixels for job application forms." href="/image-resize" colorClass="bg-indigo-600" />
                        <ToolCard icon={UserCircle} title="Passport Photo" description="Create professional passport-sized photos for any country." href="/passport-photo" colorClass="bg-emerald-600" />
                        <ToolCard icon={Eraser} title="Background Remover" description="Extract subjects from any photo in high definition." href="/remove-background" colorClass="bg-rose-500" />
                        <ToolCard icon={FileDigit} title="Image to PDF" description="Combine multiple images into one professional PDF." href="/image-to-pdf" colorClass="bg-red-500" />
                    </div>
                </div>

                {/* Document Engine */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
                        <div className="text-left">
                            <div className="flex items-center gap-2 text-rose-600 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
                                <div className="w-8 h-1 bg-rose-600 rounded-full" /> Document Engine
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">PDF Toolkit</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        <ToolCard icon={FileArchive} title="PDF Optimizer" description="Shrink massive PDFs for easy email and portal uploads." href="/compress-pdf" colorClass="bg-rose-600" />
                        <ToolCard icon={ImageIcon} title="PDF to Image" description="Convert every page of a PDF into high-quality images." href="/pdf-to-image" colorClass="bg-orange-500" />
                        <ToolCard icon={Scissors} title="Split & Extract" description="Visually select and extract specific pages with ease." href="/split-pdf" colorClass="bg-cyan-600" />
                        <ToolCard icon={Merge} title="Bulk Merge" description="Combine multiple documents into one secure file." href="/merge-pdf" colorClass="bg-emerald-600" />
                        <ToolCard icon={Unlock} title="Unlock PDF" description="Remove passwords from Aadhaar or Bank PDFs." href="/unlock-pdf" colorClass="bg-teal-500" />
                    </div>
                </div>
                
                <div className="text-center">
                    <Button asChild variant="outline" className="h-12 px-10 rounded-xl font-black text-sm text-primary border-2 border-primary/20 shadow-lg hover:bg-primary/5">
                        <Link href="/tools">EXPLORE ALL UTILITIES <ArrowRight className="ml-2 size-4" /></Link>
                    </Button>
                </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
