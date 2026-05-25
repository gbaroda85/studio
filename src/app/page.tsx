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
  Calculator,
  Star,
  FileLock2,
  Infinity,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const ALL_TOOLS = [
  // Image Tools (12)
  { icon: Shrink, title: "AI Image Compress", description: "Reduce image size up to 95% with zero visual loss.", href: "/image-compress", colorClass: "bg-blue-600", category: "image" },
  { icon: Maximize, title: "Smart Resize", description: "Resize to exact pixels or MM for application forms.", href: "/image-resize", colorClass: "bg-indigo-600", category: "image" },
  { icon: Printer, title: "Aadhaar Printer", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-600", category: "image" },
  { icon: UserCircle, title: "Passport Photo Maker", description: "Create professional passport-sized photos for any country standard.", href: "/passport-photo", colorClass: "bg-emerald-600", category: "image" },
  { icon: Eraser, title: "Background Remover", description: "Extract subjects from any photo in high definition.", href: "/remove-background", colorClass: "bg-rose-500", category: "image" },
  { icon: Sparkles, title: "AI HD Enhancer", description: "Fix blurry photos and restore lost details instantly.", href: "/enhance-photo", colorClass: "bg-purple-600", category: "image" },
  { icon: PenLine, title: "Signature Remover", description: "Clean signatures from documents using AI.", href: "/remove-signature", colorClass: "bg-orange-500", category: "image" },
  { icon: FileScan, title: "Image to Text (OCR)", description: "Extract text from any image using local AI.", href: "/image-to-text", colorClass: "bg-teal-500", category: "image" },
  { icon: FileOutput, title: "Image to JPG", description: "Convert any image format to standard JPG.", href: "/image-to-jpg", colorClass: "bg-yellow-500", category: "image" },
  { icon: FileOutput, title: "Image to PNG", description: "Convert image formats to lossless PNG.", href: "/image-to-png", colorClass: "bg-sky-500", category: "image" },
  { icon: FileDigit, title: "Image to PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-red-500", category: "image" },
  { icon: Crop, title: "Smart Crop", description: "Crop and straighten images with perspective correction.", href: "/crop-image", colorClass: "bg-cyan-500", category: "image" },
  
  // PDF Tools (12)
  { icon: FileArchive, title: "PDF Optimizer", description: "Shrink massive PDFs for easy email and portal uploads.", href: "/compress-pdf", colorClass: "bg-rose-600", category: "pdf" },
  { icon: Scissors, title: "Split & Extract", description: "Visually select and extract specific pages from PDF.", href: "/split-pdf", colorClass: "bg-cyan-600", category: "pdf" },
  { icon: Merge, title: "Bulk Merge", description: "Combine hundreds of documents into one secure file.", href: "/merge-pdf", colorClass: "bg-emerald-600", category: "pdf" },
  { icon: Unlock, title: "Unlock PDF", description: "Remove passwords from Aadhaar or Bank PDFs.", href: "/unlock-pdf", colorClass: "bg-teal-500", category: "pdf" },
  { icon: FileLock2, title: "Protect PDF", description: "Add password and AES-128 encryption to your documents.", href: "/protect-pdf", colorClass: "bg-indigo-700", category: "pdf" },
  { icon: Crop, title: "Crop PDF", description: "Trim margins or fix perspective of PDF pages.", href: "/crop-pdf", colorClass: "bg-amber-600", category: "pdf" },
  { icon: ScanLine, title: "Scan to PDF", description: "Turn your camera into a professional document scanner.", href: "/scan-to-pdf", colorClass: "bg-indigo-500", category: "pdf" },
  { icon: FileText, title: "Text to PDF", description: "Convert plain text into a clean PDF document.", href: "/text-to-pdf", colorClass: "bg-slate-500", category: "pdf" },
  { icon: FileCode, title: "HTML to PDF", description: "Convert raw HTML code into a professional PDF.", href: "/html-to-pdf", colorClass: "bg-orange-600", category: "pdf" },
  { icon: ImageIcon, title: "PDF to Image", description: "Extract every page of a PDF as a high-quality image.", href: "/pdf-to-image", colorClass: "bg-orange-500", category: "pdf" },
  { icon: Copyright, title: "Watermark PDF", description: "Add text watermarks to protect your documents.", href: "/add-watermark", colorClass: "bg-rose-500", category: "pdf" },
  { icon: NotebookPen, title: "Page Numbers", description: "Insert page numbers in various formats and positions.", href: "/add-page-numbers", colorClass: "bg-lime-500", category: "pdf" },
  
  // Calculators (7)
  { icon: Calculator, title: "Standard Calc", description: "Simple math calculator for your everyday use.", href: "/standard-calculator", colorClass: "bg-cyan-500", category: "calculator" },
  { icon: Landmark, title: "EMI Calculator", description: "Calculate monthly loan payments and interest.", href: "/loan-calculator", colorClass: "bg-indigo-600", category: "calculator" },
  { icon: Cake, title: "Age Calculator", description: "Find out your exact age in years, months, and days.", href: "/age-calculator", colorClass: "bg-rose-500", category: "calculator" },
  { icon: Percent, title: "Percentage Calc", description: "Quickly calculate marks, ratios, and percentages.", href: "/percentage-calculator", colorClass: "bg-blue-500", category: "calculator" },
  { icon: Route, title: "Fuel Cost Calc", description: "Estimate the fuel cost for your next road trip.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", category: "calculator" },
  { icon: Coins, title: "Interest Calc", description: "Calculate simple and compound interest instantly.", href: "/interest-calculator", colorClass: "bg-yellow-600", category: "calculator" },
  { icon: Receipt, title: "Sales Tax Calc", description: "Calculate tax and final price for any item.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", category: "calculator" },
  
  // Converters (4)
  { icon: Gauge, title: "Acceleration Conv", description: "Convert between m/s², km/h², and gravity units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", category: "converters" },
  { icon: AreaChart, title: "Area Converter", description: "Convert Acre, Hectare, Sq Ft, and Sq Meter.", href: "/area-converter", colorClass: "bg-lime-500", category: "converters" },
  { icon: Fuel, title: "Fuel Converter", description: "Convert between km/L and MPG (US/UK).", href: "/fuel-converter", colorClass: "bg-orange-500", category: "converters" },
  { icon: Waves, title: "Pressure Converter", description: "Convert between Bar, PSI, Pa, and ATM.", href: "/pressure-converter", colorClass: "bg-sky-500", category: "converters" },
  
  // File Tools (2)
  { icon: Archive, title: "Create Zip", description: "Compress multiple files into a single archive.", href: "/create-zip", colorClass: "bg-violet-500", category: "file" },
  { icon: ArchiveRestore, title: "Unzip File", description: "Extract contents from any ZIP archive safely.", href: "/unzip-file", colorClass: "bg-stone-500", category: "file" },
];

const ToolCard = ({ icon: Icon, title, description, href, colorClass }: any) => (
  <Link href={href} className="group">
    <Card className="h-full border-2 border-border/50 dark:border-white/5 shadow-sm hover:shadow-2xl dark:hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 bg-card overflow-hidden relative rounded-[2rem] hover:-translate-y-2">
      <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass)} />
      <CardContent className="p-6">
        <div className={cn(`size-12 rounded-2xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 shadow-lg`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors uppercase tracking-tighter">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed font-semibold">{description}</p>
        <div className="flex items-center text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-2 transition-all">
          Launch Tool <ArrowRight className="ml-1 size-3.5" />
        </div>
      </CardContent>
    </Card>
  </Link>
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
      {/* Hero Section - Ultra Compact */}
      <section className="relative w-full max-w-[2000px] pt-10 pb-6 overflow-hidden bg-white dark:bg-[#020202] border-b border-border/50 rounded-b-[4rem] shadow-2xl mx-auto transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[800px] bg-purple-500/10 rounded-full blur-[160px] animate-pulse" />
        </div>

        <div className="w-full px-8 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/40 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm animate-fade-in-up">
            <Sparkles className="size-3 text-orange-400 fill-orange-400" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-[1.1] animate-fade-in-up">
            Professional Tools for <br className="hidden md:block" />
            <span className="text-gradient-hero">Images & PDFs</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-6 font-bold leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Everything happens locally in your device RAM, 100% private. <br className="hidden md:block" /> Fast, secure, and ready for official submissions.
          </p>

          {/* Quick Access Action Category Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Link href="/tools?tab=image" className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border-2 shadow-sm rounded-2xl hover:shadow-xl hover:border-primary/50 transition-all group">
              <ImageIcon className="size-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-200">Image Tools</span>
            </Link>
            <Link href="/tools?tab=pdf" className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border-2 shadow-sm rounded-2xl hover:shadow-xl hover:border-rose-500/50 transition-all group">
              <FileText className="size-5 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-200">PDF Tools</span>
            </Link>
            <Link href="/tools?tab=calculator" className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border-2 shadow-sm rounded-2xl hover:shadow-xl hover:border-emerald-500/50 transition-all group">
              <Calculator className="size-5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-700 dark:text-slate-200">Calculators</span>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto relative group animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-emerald-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'ocr', 'emi', 'compress')"
                className="w-full pl-16 pr-6 h-16 text-lg rounded-3xl bg-white dark:bg-[#0a0a0a] border-2 border-white/5 shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-16 pb-32 bg-background w-full flex justify-center">
        <div className="w-full max-w-[2000px] px-8 md:px-16">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-12">
                  <div className="w-12 h-2 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredTools.map((tool, i) => <ToolCard key={i} {...tool} />)}
                </div>
            </div>
          ) : (
            <>
                <div className="mb-24">
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-primary rounded-full" /> <span className="text-gradient-hero">IMAGE SOLUTION</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Visual Processor</h2>
                        <Button asChild className="hidden sm:flex h-12 px-8 rounded-2xl font-black text-sm bg-gradient-button text-white shadow-xl hover:scale-105 transition-all">
                            <Link href="/tools">EXPLORE ALL UTILITIES <ArrowRight className="ml-2 size-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'image').slice(0, 5).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-24">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-rose-500 rounded-full" /> <span className="text-gradient-hero">Document Engine</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">PDF Toolkit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'pdf').slice(0, 5).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                {/* Why Choose Section (Image Based) - Now at the Bottom */}
                <section className="py-20 bg-white dark:bg-black/20 w-full flex justify-center border-t border-border/50 rounded-[4rem] shadow-inner">
                    <div className="w-full max-w-6xl px-8 md:px-16 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Why Choose GR7 Tools?</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-20 text-lg">Built with cutting-edge technology for professional results</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {/* Pillar 1: Secure */}
                        <div className="flex flex-col items-center group">
                        <div className="size-24 rounded-full bg-green-500 flex items-center justify-center text-white shadow-2xl shadow-green-500/30 transition-transform group-hover:scale-110 duration-500 mb-8">
                            <ShieldCheck className="size-12" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">100% Secure</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-[280px] mx-auto">
                            All files are processed locally in your browser. No data is uploaded to our servers, ensuring complete privacy.
                            </p>
                        </div>
                        </div>

                        {/* Pillar 2: Fast */}
                        <div className="flex flex-col items-center group">
                        <div className="size-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 transition-transform group-hover:scale-110 duration-500 mb-8">
                            <Zap className="size-12 fill-white/20" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Lightning Fast</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-[280px] mx-auto">
                            Advanced algorithms ensure rapid processing of your files without compromising on quality or performance.
                            </p>
                        </div>
                        </div>

                        {/* Pillar 3: Quality */}
                        <div className="flex flex-col items-center group">
                        <div className="size-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-2xl shadow-purple-500/30 transition-transform group-hover:scale-110 duration-500 mb-8">
                            <Star className="size-12 fill-white/20" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Professional Quality</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-[280px] mx-auto">
                            Industry-standard compression and processing techniques deliver professional-grade results every time.
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
