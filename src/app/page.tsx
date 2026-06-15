'use client';

import Link from 'next/link';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import {
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  ArrowRight,
  Shrink,
  FileOutput,
  FileDigit,
  LayoutGrid,
  Landmark,
  Cake,
  Percent,
  Eraser,
  FileScan,
  FileText,
  Image as ImageIcon,
  Crop,
  Lock,
  Heart,
  Calculator,
  Camera,
  Printer,
  FileArchive,
  Merge,
  UserCircle,
  FilePenLine,
  Unlock,
  Maximize,
  FileCode,
  Copyright,
  NotebookPen,
  Route,
  Coins,
  Receipt,
  Gauge,
  AreaChart,
  Fuel,
  Waves,
  Archive,
  ArchiveRestore,
  MonitorCheck,
  Trophy,
  Music,
  Video,
  RotateCw,
  Barcode,
  QrCode,
  ChevronUp,
  ScanLine,
  Wand2,
  IndianRupee,
  TrendingUp,
  PiggyBank,
  Layers,
  Home as HomeIcon,
  Scissors,
  MonitorPlay,
  PlayCircle,
  PenLine,
  PenTool,
  CalendarDays,
  Banknote,
  Palette,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const ALL_TOOLS = [
  // FEATURED / VISUAL PROCESSORS (Limit 6 for Home Grid)
  { icon: CalendarDays, title: "ADD NAME & DATE TO PHOTO", description: "Add Name and Date to passport photos instantly.", href: "/passport-date-name", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "featured" },
  { icon: Wand2, title: "PHOTO ENHANCER", description: "Improve brightness, contrast and quality instantly.", href: "/enhance-photo", colorClass: "bg-violet-600", lightBg: "bg-violet-50", category: "featured" },
  { icon: Eraser, title: "BACKGROUND REMOVER", description: "Automatically remove background from any image.", href: "/remove-background", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "featured" },
  { icon: FileDigit, title: "IMAGE TO PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-sky-500", lightBg: "bg-sky-50", category: "featured" },
  { icon: QrCode, title: "QR CODE GENERATOR", description: "Create custom QR codes with logos and gradients.", href: "/qr-code-generator", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "featured" },
  { icon: ScanLine, title: "DOCUMENT SCAN", description: "Premium scanner with BW PRO and Magic filters.", href: "/document-scan", colorClass: "bg-emerald-500", lightBg: "bg-emerald-50", category: "featured" },
  
  // PDF TOOLKIT (Limit 6 for Home Grid)
  { icon: Layers, title: "ORGANIZE PDF", description: "Delete, reorder and rotate pages visually.", href: "/organize-pdf", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "pdf-kit" },
  { icon: Merge, title: "MERGE PDF", description: "Combine multiple PDF files into one.", href: "/merge-pdf", colorClass: "bg-emerald-600", lightBg: "bg-emerald-50", category: "pdf-kit" },
  { icon: RotateCw, title: "ROTATE PDF", description: "Rotate PDF pages permanently and save.", href: "/rotate-pdf", colorClass: "bg-blue-500", lightBg: "bg-blue-50", category: "pdf-kit" },
  { icon: Lock, title: "PDF LOCKER", description: "Protect documents with secure AES encryption.", href: "/lock-pdf", colorClass: "bg-slate-900", lightBg: "bg-slate-50", category: "pdf-kit" },
  { icon: Unlock, title: "UNLOCK PDF", description: "Remove password protection from a PDF.", href: "/unlock-pdf", colorClass: "bg-teal-500", lightBg: "bg-[#f0fdfa]", category: "pdf-kit" },
  { icon: FileArchive, title: "PDF COMPRESS", description: "Reduce PDF file size without losing text clarity.", href: "/compress-pdf", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "pdf-kit" },

  // FINANCE CENTER (Limit 6 for Home Grid)
  { icon: Banknote, title: "SALARY SLIP GENERATOR", description: "Generate professional A4 pay slips for employees instantly.", href: "/salary-slip", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "calculator" },
  { icon: Receipt, title: "GST INVOICE GENERATOR", description: "Generate professional GST compliant invoices instantly.", href: "/gst-invoice", colorClass: "bg-emerald-600", lightBg: "bg-emerald-50", category: "calculator" },
  { icon: IndianRupee, title: "GST CALCULATOR", description: "Calculate GST addition or removal instantly.", href: "/gst-calculator", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "calculator" },
  { icon: TrendingUp, title: "SIP CALCULATOR", description: "Estimate returns on your monthly mutual fund investments.", href: "/sip-calculator", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "calculator" },
  { icon: PiggyBank, title: "FD & RD CALCULATOR", description: "Calculate returns on Fixed and Recurring Deposits.", href: "/fd-rd-calculator", colorClass: "bg-orange-500", lightBg: "bg-orange-50", category: "calculator" },
  { icon: Landmark, title: "TAX CALCULATOR", description: "Calculate income tax liability for FY 2024-25.", href: "/income-tax-calculator", colorClass: "bg-blue-700", lightBg: "bg-blue-50", category: "calculator" },

  // --- FILE TOOLS ---
  { icon: CreditCard, title: "ID CARD GENERATOR", description: "Design professional Employee & Student IDs with Bulk support.", href: "/id-card-generator", colorClass: "bg-primary", lightBg: "bg-primary/5", category: "file" },
  { icon: Printer, title: "AADHAAR PRINTER", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-600", lightBg: "bg-orange-50", category: "file" },
  { icon: Archive, title: "CREATE ZIP", description: "Bundle multiple files into a single ZIP archive.", href: "/create-zip", colorClass: "bg-violet-500", lightBg: "bg-violet-50", category: "file" },
  { icon: ArchiveRestore, title: "UNZIP FILE", description: "Extract files from any ZIP archive locally.", href: "/unzip-file", colorClass: "bg-stone-500", lightBg: "bg-[#f8fafc]", category: "file" },

  // --- ALL OTHER TOOLS (Searchable only) ---
  { icon: Palette, title: "COLOR PICKER STUDIO", description: "Identify colors, check contrast and generate palettes.", href: "/color-picker", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "converters" },
  { icon: Cake, title: "AGE CALCULATOR", description: "Find out your exact age profile in years and days.", href: "/age-calculator", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "calculator" },
  { icon: HomeIcon, title: "MORTGAGE CALC", description: "Estimate home loans, interest and taxes instantly.", href: "/mortgage-calculator", colorClass: "bg-primary", lightBg: "bg-primary/5", category: "calculator" },
  { icon: Shrink, title: "IMAGE COMPRESS", description: "Reduce image file size without losing quality.", href: "/image-compress", colorClass: "bg-emerald-500", lightBg: "bg-[#fefce8]", category: "image" },
  { icon: PenTool, title: "SIGNATURE RESIZER", description: "Resize signature to exact CM/Pixel and KB size.", href: "/signature-resizer", colorClass: "bg-orange-600", lightBg: "bg-orange-50", category: "image" },
  { icon: PlayCircle, title: "INSTAGRAM DOWNLOADER", description: "Download Reels and Videos from Instagram privately.", href: "/instagram-downloader", colorClass: "bg-pink-600", lightBg: "bg-pink-50", category: "video" },
  { icon: Music, title: "VIDEO TO MP3", description: "Extract high-quality audio from any video.", href: "/video-to-mp3", colorClass: "bg-indigo-500", lightBg: "bg-indigo-50", category: "video" },
  { icon: UserCircle, title: "PASSPORT PHOTO", description: "Create professional ID photos for all countries.", href: "/passport-photo", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdfa]", category: "image" },
  { icon: Crop, title: "CROP IMAGE", description: "Precisely crop and fix perspective on photos.", href: "/crop-image", colorClass: "bg-cyan-500", lightBg: "bg-cyan-50", category: "image" },
  { icon: Maximize, title: "IMAGE RESIZER", description: "Change image dimensions for official forms.", href: "/image-resize", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "image" },
  { icon: PenLine, title: "SIGNATURE REMOVER", description: "Extract clean signatures from paper photos.", href: "/remove-signature", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "image" },
  { icon: FileScan, title: "IMAGE TO TEXT (OCR)", description: "Extract text from documents and images locally.", href: "/image-to-text", colorClass: "bg-teal-500", lightBg: "bg-teal-50", category: "image" },
  { icon: FileOutput, title: "IMAGE TO JPG", description: "Convert various image formats to JPG.", href: "/image-to-jpg", colorClass: "bg-orange-500", lightBg: "bg-orange-50", category: "image" },
  { icon: FileOutput, title: "IMAGE TO PNG", description: "Convert various image formats to PNG.", href: "/image-to-png", colorClass: "bg-sky-500", lightBg: "bg-sky-50", category: "image" },
  { icon: FilePenLine, title: "PDF EDITOR", description: "Edit text, images and pages in any PDF document.", href: "/edit-pdf", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "pdf" },
  { icon: Scissors, title: "SPLIT PDF", description: "Extract specific pages from any PDF file.", href: "/split-pdf", colorClass: "bg-cyan-600", lightBg: "bg-cyan-50", category: "pdf" },
  { icon: Crop, title: "CROP PDF", description: "Trim margins and fix perspective on PDF pages.", href: "/crop-pdf", colorClass: "bg-amber-600", lightBg: "bg-amber-50", category: "pdf" },
  { icon: ImageIcon, title: "PDF TO IMAGE", description: "Convert all PDF pages into HD images.", href: "/pdf-to-image", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "pdf" },
  { icon: FileCode, title: "HTML TO PDF", description: "Transform raw code into professional documents.", href: "/html-to-pdf", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]", category: "pdf" },
  { icon: FileText, title: "TEXT TO PDF", description: "Convert plain text notes into a clean PDF.", href: "/text-to-pdf", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "pdf" },
  { icon: Copyright, title: "ADD WATERMARK", description: "Protect your PDFs with custom text watermarks.", href: "/add-watermark", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "pdf" },
  { icon: NotebookPen, title: "PAGE NUMBERS", description: "Insert professional page numbers into PDFs.", href: "/add-page-numbers", colorClass: "bg-emerald-500", lightBg: "bg-[#f7fee7]", category: "pdf" },
  { icon: Barcode, title: "BARCODE GENERATOR", description: "Create scannable industrial-grade barcodes.", href: "/barcode-generator", colorClass: "bg-amber-600", lightBg: "bg-amber-50", category: "converters" },
  { icon: Gauge, title: "ACCELERATION CONV.", description: "Convert between various acceleration units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", lightBg: "bg-[#f0fdf4]", category: "converters" },
  { icon: AreaChart, title: "AREA CONVERTER", description: "Convert international and local land area units.", href: "/area-converter", colorClass: "bg-lime-500", lightBg: "bg-[#f7fee7]", category: "converters" },
  { icon: Fuel, title: "FUEL CONVERTER", description: "Convert between MPG and km/L efficiency units.", href: "/fuel-converter", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "converters" },
  { icon: Waves, title: "PRESSURE CONVERTER", description: "Convert Bar, PSI, and Pascal units with precision.", href: "/pressure-converter", colorClass: "bg-sky-500", lightBg: "bg-[#f0f9ff]", category: "converters" },
  { icon: Route, title: "FUEL COST CALC", description: "Estimate trip fuel expenses and distance.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: Coins, title: "INTEREST CALC", description: "Calculate simple and compound interest returns.", href: "/interest-calculator", colorClass: "bg-yellow-600", lightBg: "bg-[#fefce8]", category: "calculator" },
  { icon: Receipt, title: "SALES TAX CALC", description: "Calculate bill tax and final price inclusive of tax.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: Percent, title: "PERCENTAGE CALC", description: "Find percentages for marks, ratios and discounts.", href: "/percentage-calculator", colorClass: "bg-blue-500", lightBg: "bg-[#eff6ff]", category: "calculator" },
];

const ToolCard = ({ icon: Icon, title, description, href, colorClass, lightBg }: any) => (
  <Link href={href} className="group block h-full">
    <div className="h-full bg-white dark:bg-[#0a040d] rounded-[2.5rem] p-2 shadow-lg hover:shadow-2xl dark:hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:-translate-y-1.5 border-2 border-slate-100/50 dark:border-primary/20 flex flex-col">
      <div className={cn("flex-1 rounded-[1.8rem] overflow-hidden flex flex-col p-5", lightBg, "dark:bg-[#0a040d]/60")}>
        <div className={cn(`size-11 rounded-2xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 shadow-lg shrink-0`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg md:text-xl font-bold mb-1.5 text-slate-900 dark:text-slate-100 tracking-tighter uppercase leading-tight">{title}</h3>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed mb-4 uppercase opacity-60 tracking-tight">{description}</p>
          
          <div className="flex flex-wrap gap-2 mt-auto">
             <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Professional</Badge>
             <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Local RAM</Badge>
          </div>
        </div>
      </div>
      
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

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Tracking logic remains for owner but UI is removed
    const visits = parseInt(localStorage.getItem('gr7_visits') || '0') + 1;
    localStorage.setItem('gr7_visits', visits.toString());
    console.log(`[Owner Access] Total Studio Visits: ${visits}`);
  }, []);

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
      <section className="relative w-full max-w-[2000px] pt-6 pb-6 overflow-hidden bg-background dark:bg-[#0a040d] border-b-2 border-border/50 rounded-b-[2.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.7)] mx-auto transition-colors duration-500 z-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fdf8f9] via-[#1e73be]/5 to-[#d4e157]/10 dark:hidden" />
          <div className="hidden dark:block absolute inset-0">
            {placeholderData.hero_bg.url && (
              <Image 
                src={placeholderData.hero_bg.url} 
                alt="Hero Background" 
                fill 
                className="object-cover opacity-20 transition-opacity duration-700"
                priority
                data-ai-hint={placeholderData.hero_bg.hint}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply opacity-0 dark:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/90" />
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[800px] bg-accent/10 rounded-full blur-[160px] animate-pulse" />
        </div>

        <div className="w-full px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm animate-fade-in-up shadow-sm">
            <Sparkles className="size-3 text-yellow-400 fill-yellow-400" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tighter leading-[1.05] animate-fade-in-up font-jakarta">
            Professional Tools for <br className="hidden md:block" />
            <span className="text-gradient-hero">Images & PDFs</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-300 max-w-3xl mx-auto mb-6 font-semibold leading-relaxed animate-fade-in-up">
            Everything happens locally in your device RAM, 100% private. <br className="hidden md:block" /> Fast, secure, and ready for official submissions.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8 animate-fade-in-up">
            <Link href="/tools?tab=image" className="uiverse-clay-btn">
              <div className="button-outer">
                <div className="button-inner">
                  <span>Image Tools</span>
                </div>
              </div>
            </Link>
            <Link href="/tools?tab=pdf" className="uiverse-clay-btn">
              <div className="button-outer">
                <div className="button-inner">
                  <span>PDF Tools</span>
                </div>
              </div>
            </Link>
            <Link href="/tools?tab=calculator" className="uiverse-clay-btn">
              <div className="button-outer">
                <div className="button-inner">
                  <span>Calculators</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto relative group animate-fade-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'upscale', 'scan', 'barcode')"
                className="w-full pl-14 pr-6 h-12 text-base rounded-3xl bg-background/90 dark:bg-slate-900/90 border-2 border-white/5 shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold font-jakarta backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary z-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 pb-12 bg-background w-full flex justify-center">
        <div className="w-full px-8 md:px-16">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-12 font-body">
                  <div className="w-12 h-2 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTools.map((tool, i) => <ToolCard key={i} {...tool} />)}
                </div>
                {filteredTools.length === 0 && (
                   <div className="text-center py-20 opacity-30 font-body">
                      <Search className="size-20 mx-auto mb-4" />
                      <p className="font-bold uppercase tracking-widest">No matching tools found.</p>
                   </div>
                )}
            </div>
          ) : (
            <>
                {/* IMAGE SOLUTION - LIMIT 6 */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3 font-body">
                        <div className="w-12 h-2 bg-primary rounded-full" /> <span className="text-gradient-hero">IMAGE SOLUTION</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter font-body uppercase">Visual Processors</h2>
                        <Link href="/tools?tab=all" className="hidden sm:flex">
                          <button className="learn-more">
                            <span className="font-black tracking-widest uppercase">Explore All</span>
                          </button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'featured').slice(0, 6).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                {/* PDF TOOLKIT - LIMIT 6 */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-[0.3em] mb-3 font-body">
                        <div className="w-12 h-2 bg-rose-500 rounded-full" /> <span className="text-gradient-hero">DOCUMENT ENGINE</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter mb-10 font-body uppercase">PDF Toolkit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'pdf-kit').slice(0, 6).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                {/* FINANCE CENTER - LIMIT 6 */}
                <div className="mb-24">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-[0.3em] mb-3 font-body">
                        <div className="w-12 h-2 bg-indigo-500 rounded-full" /> <span className="text-gradient-hero">FINANCE CENTER</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter mb-10 font-body uppercase">Smart Calculators</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'calculator').slice(0, 6).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-32 py-16 px-8 bg-[#fdf8f9] dark:bg-slate-900/40 rounded-[3rem] border-2 border-primary/20 dark:border-white/10 shadow-inner overflow-hidden relative">
                    <div className="absolute top-0 right-0 size-64 bg-primary/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 size-64 bg-accent/10 blur-3xl rounded-full" />
                    
                    <div className="relative z-10 text-center space-y-16">
                        <div className="space-y-4">
                            <Badge variant="outline" className="px-6 py-1.5 rounded-full border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest shadow-sm font-body">CORE PRINCIPLES</Badge>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter font-body">Why Choose <span className="text-gradient-hero">GR7 Tools?</span></h2>
                            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-bold max-w-2xl mx-auto uppercase opacity-80 font-body">The only professional studio built entirely on privacy-first architecture.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            <div className="space-y-6 group">
                                <div className="size-20 mx-auto rounded-[2rem] bg-background dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-transparent group-hover:border-green-500/30 group-hover:-translate-y-2 transition-all duration-300">
                                    <ShieldCheck className="size-10 text-green-500" />
                                </div>
                                <div className="space-y-2 font-body">
                                    <h3 className="text-lg font-bold tracking-tight">100% Private</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your images and documents never leave your device. All processing happens 100% locally in your browser's temporary memory (RAM).</p>
                                </div>
                            </div>

                            <div className="space-y-6 group">
                                <div className="size-20 mx-auto rounded-[2rem] bg-background dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-transparent group-hover:border-blue-500/30 group-hover:-translate-y-2 transition-all duration-300">
                                    <Zap className="size-10 text-blue-500" />
                                </div>
                                <div className="space-y-2 font-body">
                                    <h3 className="text-lg font-bold tracking-tight">Native Performance</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Using advanced WASM technology, we process files at your device's native hardware speed. No server queues, no waiting, no limits.</p>
                                </div>
                            </div>

                            <div className="space-y-6 group">
                                <div className="size-20 mx-auto rounded-[2rem] bg-background dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-transparent group-hover:border-primary/30 group-hover:-translate-y-2 transition-all duration-300">
                                    <Trophy className="size-10 text-primary" />
                                </div>
                                <div className="space-y-2 font-body">
                                    <h3 className="text-lg font-bold tracking-tight">Studio Quality</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Engineered for professional submissions. Every output is rendered in high-definition (300 DPI equivalent) for crystal clear printing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
