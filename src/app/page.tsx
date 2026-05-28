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
  Infinity,
  Printer,
  Lock,
  Heart,
  Contact2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const ALL_TOOLS = [
  // Top Featured Image Tools (Visible on Home Page - Strictly these 5)
  { icon: FileDigit, title: "Image to PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-red-500", category: "image" },
  { icon: Shrink, title: "Smart Image Compress", description: "Reduce image file size without losing quality.", href: "/image-compress", colorClass: "bg-blue-600", category: "image" },
  { icon: Crop, title: "Crop Image", description: "Easily crop your images to the perfect size.", href: "/crop-image", colorClass: "bg-cyan-500", category: "image" },
  { icon: Heart, title: "Marriage Bio Data", description: "Design a professional A4 biodata with premium templates.", href: "/marriage-biodata", colorClass: "bg-rose-500", category: "featured_home" },
  { icon: Printer, title: "Aadhaar Printer", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-600", category: "featured_home" },
  
  // Other Image Tools (Internal - Hidden from Home Page Featured)
  { icon: Maximize, title: "Smart Resize", description: "Change the dimensions of your image quickly.", href: "/image-resize", colorClass: "bg-indigo-600", category: "image_internal" },
  { icon: Eraser, title: "Background Remover", description: "Automatically remove the background from any image.", href: "/remove-background", colorClass: "bg-rose-500", category: "image_internal" },
  { icon: PenLine, title: "Signature BG Remover", description: "Extract clean, transparent signatures by removing paper background from photos.", href: "/remove-signature", colorClass: "bg-orange-500", category: "image_internal" },
  { icon: Sparkles, title: "Pro HD Enhancer", description: "Improve photo quality, colors, and lighting professionally.", href: "/enhance-photo", colorClass: "bg-purple-600", category: "image_internal" },
  { icon: UserCircle, title: "Passport Photo Maker", description: "Create professional passport-sized photos for any country standard.", href: "/passport-photo", colorClass: "bg-emerald-600", category: "image_internal" },
  { icon: FileOutput, title: "Image to JPG", description: "Convert various image formats to standard JPG.", href: "/image-to-jpg", colorClass: "bg-yellow-500", category: "image_internal" },
  { icon: FileOutput, title: "Image to PNG", description: "Convert various image formats to lossless PNG.", href: "/image-to-png", colorClass: "bg-sky-500", category: "image_internal" },
  { icon: FileScan, title: "Image to Text (OCR)", description: "Extract text from any image using local high-speed processing.", href: "/image-to-text", colorClass: "bg-teal-500", category: "image_internal" },
  
  // PDF Tools
  { icon: FileText, title: "Word to PDF", description: "Convert DOCX documents to professional PDF files instantly.", href: "/docx-to-pdf", colorClass: "bg-blue-500", category: "pdf" },
  { icon: Lock, title: "Vault PDF Locker", description: "Seal your documents with real AES password encryption.", href: "/lock-pdf", colorClass: "bg-slate-900", category: "pdf" },
  { icon: FileArchive, title: "Compress PDF", description: "Shrink massive PDFs for easy email and portal uploads.", href: "/compress-pdf", colorClass: "bg-rose-600", category: "pdf" },
  { icon: Scissors, title: "Split & Extract", description: "Visually select and extract specific pages from PDF.", href: "/split-pdf", colorClass: "bg-cyan-600", category: "pdf" },
  { icon: Merge, title: "Merge PDF", description: "Combine hundreds of documents into one secure file.", href: "/merge-pdf", colorClass: "bg-emerald-600", category: "pdf" },
  { icon: Unlock, title: "Unlock PDF", description: "Remove password protection from a PDF (Supports Aadhaar).", href: "/unlock-pdf", colorClass: "bg-teal-500", category: "pdf" },
  { icon: Crop, title: "Crop PDF", description: "Trim margins or fix perspective of PDF pages.", href: "/crop-pdf", colorClass: "bg-amber-600", category: "pdf" },
  { icon: ScanLine, title: "Scan to PDF", description: "Turn your camera into a professional document scanner.", href: "/scan-to-pdf", colorClass: "bg-indigo-500", category: "pdf" },
  { icon: FileText, title: "Text to PDF", description: "Convert plain text into a clean PDF document.", href: "/text-to-pdf", colorClass: "bg-slate-500", category: "pdf" },
  { icon: FileCode, title: "HTML to PDF", description: "Convert raw HTML code into a professional PDF.", href: "/html-to-pdf", colorClass: "bg-orange-600", category: "pdf" },
  { icon: ImageIcon, title: "PDF to Image", description: "Extract every page of a PDF as a high-quality image.", href: "/pdf-to-image", colorClass: "bg-orange-500", category: "pdf" },
  { icon: Copyright, title: "Watermark PDF", description: "Add text watermarks to protect your documents.", href: "/add-watermark", colorClass: "bg-rose-500", category: "pdf" },
  
  // Calculators
  { icon: Calculator, title: "Standard Calc", description: "Simple math calculator for your everyday use.", href: "/standard-calculator", colorClass: "bg-cyan-500", category: "calculator" },
  { icon: Landmark, title: "EMI Calculator", description: "Calculate monthly loan payments and interest.", href: "/loan-calculator", colorClass: "bg-indigo-600", category: "calculator" },
  { icon: Cake, title: "Age Calculator", description: "Find out your exact age in years, months, and days.", href: "/age-calculator", colorClass: "bg-rose-500", category: "calculator" },
  { icon: Percent, title: "Percentage Calc", description: "Quickly calculate marks, ratios, and percentages.", href: "/percentage-calculator", colorClass: "bg-blue-500", category: "calculator" },
  { icon: Route, title: "Fuel Cost Calc", description: "Estimate the fuel cost for your next road trip.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", category: "calculator" },
  { icon: Coins, title: "Interest Calc", description: "Calculate simple and compound interest instantly.", href: "/interest-calculator", colorClass: "bg-yellow-600", category: "calculator" },
  { icon: Receipt, title: "Sales Tax Calc", description: "Calculate tax and final price for any item.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", category: "calculator" },
  
  // Converters
  { icon: Gauge, title: "Acceleration Conv", description: "Convert between m/s², km/h², and gravity units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", category: "converters" },
  { icon: AreaChart, title: "Area Converter", description: "Convert Acre, Hectare, Sq Ft, and Sq Meter.", href: "/area-converter", colorClass: "bg-lime-500", category: "converters" },
  { icon: Fuel, title: "Fuel Converter", description: "Convert between km/L and MPG (US/UK).", href: "/fuel-converter", colorClass: "bg-orange-500", category: "converters" },
  { icon: Waves, title: "Pressure Converter", description: "Convert between Bar, PSI, Pa, and ATM.", href: "/pressure-converter", colorClass: "bg-sky-500", category: "converters" },
  
  // File Tools
  { icon: Contact2, title: "Pro Resume Builder", description: "Create a professional, ATS-ready CV with A4 layout.", href: "/resume-builder", colorClass: "bg-blue-600", category: "file" },
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
      {/* Hero Section */}
      <section className="relative w-full max-w-[2000px] pt-10 pb-6 overflow-hidden bg-white/90 dark:bg-[#001D39] border-b border-border/50 rounded-b-[4rem] shadow-2xl mx-auto transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[800px] bg-accent/10 rounded-full blur-[160px] animate-pulse" />
        </div>

        <div className="w-full px-8 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/40 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm animate-fade-in-up">
            <Sparkles className="size-3 text-yellow-400 fill-yellow-400" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-[1.1] animate-fade-in-up">
            Professional Tools for <br className="hidden md:block" />
            <span className="text-gradient-hero">Images & PDFs</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-300 max-w-3xl mx-auto mb-6 font-bold leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Everything happens locally in your device RAM, 100% private. <br className="hidden md:block" /> Fast, secure, and ready for official submissions.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <Link href="/tools?tab=image" className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border-2 shadow-sm rounded-2xl hover:shadow-xl hover:border-primary/50 transition-all group">
              <ImageIcon className="size-5 text-primary group-hover:scale-110 transition-transform" />
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
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'ocr', 'biodata', 'compress')"
                className="w-full pl-16 pr-6 h-16 text-lg rounded-3xl bg-white dark:bg-[#001D39] border-2 border-white/5 shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold"
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
                        <div className="w-12 h-2 bg-primary rounded-full" /> <span className="text-gradient-hero">VISUAL PROCESSOR</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Image Solution</h2>
                        <Button asChild className="hidden sm:flex h-12 px-8 rounded-2xl font-black text-sm bg-gradient-button text-white shadow-xl hover:scale-105 transition-all">
                            <Link href="/tools">EXPLORE ALL UTILITIES <ArrowRight className="ml-2 size-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'image' || t.category === 'featured_home').slice(0, 5).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-24">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-rose-500 rounded-full" /> <span className="text-gradient-hero">DOCUMENT ENGINE</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">PDF Toolkit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'pdf').slice(0, 5).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
