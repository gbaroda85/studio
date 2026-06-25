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
  ImageIcon,
  Crop,
  Lock,
  Calculator,
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
  RotateCw,
  Barcode,
  QrCode,
  ScanLine,
  Wand2,
  IndianRupee,
  TrendingUp,
  PiggyBank,
  Layers,
  Home as HomeIcon,
  Scissors,
  Music,
  PenLine,
  PenTool,
  CalendarDays,
  Menu,
  Palette,
  CheckCircle2,
  Trophy,
  Target,
  Settings,
  Video,
  MousePointer2,
  ChevronRight,
  Volume2,
  Banknote
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

const ALL_TOOLS = [
  // FEATURED / VISUAL PROCESSORS
  { icon: CalendarDays, title: "ADD NAME & DATE TO PHOTO", description: "Add Name and Date to passport photos instantly.", href: "/passport-date-name", colorClass: "bg-gradient-to-br from-blue-500 to-blue-700", lightBg: "bg-blue-50", category: "featured" },
  { icon: Wand2, title: "PHOTO ENHANCER", description: "Improve brightness, contrast and quality instantly.", href: "/enhance-photo", colorClass: "bg-gradient-to-br from-violet-500 to-violet-700", lightBg: "bg-violet-50", category: "featured" },
  { icon: Eraser, title: "BACKGROUND REMOVER", description: "Automatically remove background from any image.", href: "/remove-background", colorClass: "bg-gradient-to-br from-rose-400 to-rose-600", lightBg: "bg-rose-50", category: "featured" },
  { icon: FileDigit, title: "IMAGE TO PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-gradient-to-br from-sky-400 to-sky-600", lightBg: "bg-sky-50", category: "featured" },
  { icon: QrCode, title: "QR CODE GENERATOR", description: "Create custom QR codes with logos and gradients.", href: "/qr-code-generator", colorClass: "bg-gradient-to-br from-indigo-500 to-indigo-700", lightBg: "bg-indigo-50", category: "featured" },
  { icon: ScanLine, title: "DOCUMENT SCAN", description: "Premium scanner with BW PRO and Magic Color filters.", href: "/document-scan", colorClass: "bg-gradient-to-br from-emerald-400 to-emerald-600", lightBg: "bg-emerald-50", category: "featured" },
  { icon: Shrink, title: "IMAGE COMPRESS", description: "Reduce image file size without losing quality.", href: "/image-compress", colorClass: "bg-gradient-to-br from-emerald-500 to-emerald-700", lightBg: "bg-[#fefce8]", category: "featured" },
  { icon: PenTool, title: "SIGNATURE RESIZER", description: "Resize signature to exact CM/Pixel and KB size.", href: "/signature-resizer", colorClass: "bg-orange-600", lightBg: "bg-orange-50", category: "featured" },
  
  // PDF TOOLKIT
  { icon: Layers, title: "ORGANIZE PDF", description: "Delete, reorder and rotate pages visually.", href: "/organize-pdf", colorClass: "bg-gradient-to-br from-indigo-500 to-indigo-700", lightBg: "bg-indigo-50", category: "pdf-kit" },
  { icon: Merge, title: "MERGE PDF", description: "Combine multiple PDF files into one.", href: "/merge-pdf", colorClass: "bg-gradient-to-br from-emerald-500 to-emerald-700", lightBg: "bg-[#f0fdf4]", category: "pdf-kit" },
  { icon: RotateCw, title: "ROTATE PDF", description: "Rotate PDF pages permanently and save.", href: "/rotate-pdf", colorClass: "bg-gradient-to-br from-blue-400 to-blue-600", lightBg: "bg-[#eff6ff]", category: "pdf-kit" },
  { icon: Lock, title: "PDF LOCKER", description: "Protect documents with secure AES encryption.", href: "/lock-pdf", colorClass: "bg-gradient-to-br from-slate-700 to-slate-900", lightBg: "bg-slate-50", category: "pdf-kit" },
  { icon: Unlock, title: "UNLOCK PDF", description: "Remove password protection from a PDF.", href: "/unlock-pdf", colorClass: "bg-gradient-to-br from-teal-400 to-teal-600", lightBg: "bg-[#f0fdfa]", category: "pdf-kit" },
  { icon: FileArchive, title: "PDF COMPRESS", description: "Reduce PDF file size without losing text clarity.", href: "/compress-pdf", colorClass: "bg-gradient-to-br from-rose-400 to-rose-600", lightBg: "bg-[#fff1f2]", category: "pdf-kit" },
  { icon: FilePenLine, title: "PDF EDITOR", description: "Edit text, images and pages in any PDF document.", href: "/edit-pdf", colorClass: "bg-gradient-to-br from-indigo-500 to-indigo-700", lightBg: "bg-[#eff6ff]", category: "pdf-kit" },
  { icon: Scissors, title: "SPLIT PDF", description: "Extract specific pages from any PDF file.", href: "/split-pdf", colorClass: "bg-gradient-to-br from-cyan-500 to-cyan-700", lightBg: "bg-cyan-50", category: "pdf-kit" },

  // AUDIO & VIDEO
  { icon: Merge, title: "AUDIO MERGER", description: "Combine multiple audio tracks into a single file.", href: "/merge-audio", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "audio" },
  { icon: Volume2, title: "MP3 CUTTER", description: "Trim, cut and enhance audio files precisely.", href: "/mp3-cutter", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "audio" },
  { icon: FileOutput, title: "AUDIO CONVERTER", description: "Convert between MP3, WAV, OGG and M4A instantly.", href: "/audio-converter", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "audio" },
  { icon: Music, title: "VIDEO TO MP3", description: "Extract high-quality audio from any video.", href: "/video-to-mp3", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]", category: "video" },

  // FINANCE CENTER
  { icon: Banknote, title: "SALARY SLIP GENERATOR", description: "Generate professional A4 pay slips for employees instantly.", href: "/salary-slip", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "calculator" },
  { icon: Receipt, title: "GST INVOICE GENERATOR", description: "Generate professional GST compliant invoices instantly.", href: "/gst-invoice", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdf4]", category: "calculator" },
  { icon: IndianRupee, title: "GST CALCULATOR", description: "Calculate GST addition or removal instantly.", href: "/gst-calculator", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: TrendingUp, title: "SIP CALCULATOR", description: "Estimate returns on your monthly mutual fund investments.", href: "/sip-calculator", colorClass: "bg-blue-600", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: PiggyBank, title: "FD & RD CALCULATOR", description: "Calculate returns on your bank deposits with quarterly and monthly compounding precision.", href: "/fd-rd-calculator", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "calculator" },
  { icon: Landmark, title: "INCOME TAX CALCULATOR", description: "Calculate income tax liability for FY 2025-26.", href: "/income-tax-calculator", colorClass: "bg-blue-700", lightBg: "bg-[#eef2ff]", category: "calculator" },

  // FILE TOOLS
  { icon: Printer, title: "AADHAAR CARD PRINTER", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]", category: "file" },
  { icon: Archive, title: "CREATE ZIP", description: "Bundle multiple files into a single ZIP archive.", href: "/create-zip", colorClass: "bg-violet-500", lightBg: "bg-[#f5f3ff]", category: "file" },
  { icon: ArchiveRestore, title: "UNZIP FILE", description: "Extract files from any ZIP archive locally.", href: "/unzip-file", colorClass: "bg-stone-500", lightBg: "bg-[#f8fafc]", category: "file" },

  // OTHER SEARCHABLE TOOLS
  { icon: Palette, title: "COLOR PICKER STUDIO", description: "Identify colors, check contrast and generate palettes.", href: "/color-picker", colorClass: "bg-blue-600", lightBg: "bg-blue-50", category: "converters" },
  { icon: Cake, title: "AGE CALCULATOR", description: "Find out your exact age profile in years and days.", href: "/age-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: HomeIcon, title: "MORTGAGE CALCULATOR", description: "Estimate home loans, interest and taxes instantly.", href: "/mortgage-calculator", colorClass: "bg-primary", lightBg: "bg-primary/5", category: "calculator" },
  { icon: UserCircle, title: "PASSPORT PHOTO MAKER", description: "Create professional ID photos for all countries.", href: "/passport-photo", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdfa]", category: "image" },
  { icon: Crop, title: "CROP IMAGE", description: "Precisely crop and fix perspective on photos.", href: "/crop-image", colorClass: "bg-cyan-50", lightBg: "bg-[#ecfeff]", category: "image" },
  { icon: Maximize, title: "IMAGE RESIZER", description: "Change image dimensions for official forms.", href: "/image-resize", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "image" },
  { icon: PenLine, title: "SIGNATURE BG REMOVER", description: "Extract clean signatures from paper photos.", href: "/remove-signature", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "image" },
  { icon: FileScan, title: "IMAGE TO TEXT (OCR)", description: "Extract text from documents and images locally.", href: "/image-to-text", colorClass: "bg-teal-500", lightBg: "bg-[#f0fdfa]", category: "image" },
  { icon: FileOutput, title: "IMAGE TO JPG", description: "Convert various image formats to JPG.", href: "/image-to-jpg", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "image" },
  { icon: FileOutput, title: "IMAGE TO PNG", description: "Convert various image formats to PNG.", href: "/image-to-png", colorClass: "bg-sky-500", lightBg: "bg-[#ecfeff]", category: "image" },
  { icon: Crop, title: "CROP PDF", description: "Trim margins and fix perspective on PDF pages.", href: "/crop-pdf", colorClass: "bg-amber-600", lightBg: "bg-[#fffbeb]" , category: "pdf" },
  { icon: ImageIcon, title: "PDF TO IMAGE", description: "Convert all PDF pages into HD images.", href: "/pdf-to-image", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "pdf" },
  { icon: FileCode, title: "HTML TO PDF", description: "Transform raw code into professional documents.", href: "/html-to-pdf", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]", category: "pdf" },
  { icon: FileText, title: "TEXT TO PDF", description: "Convert plain text notes into a clean PDF.", href: "/text-to-pdf", colorClass: "bg-indigo-600", lightBg: "bg-[#f8fafc]", category: "pdf" },
  { icon: Copyright, title: "ADD WATERMARK", description: "Protect your PDFs with custom text watermarks.", href: "/add-watermark", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "pdf" },
  { icon: NotebookPen, title: "ADD PAGE NUMBERS", description: "Insert professional page numbers into PDFs.", href: "/add-page-numbers", colorClass: "bg-emerald-500", lightBg: "bg-[#f7fee7]", category: "pdf" },
  { icon: Barcode, title: "BARCODE GENERATOR", description: "Create scannable industrial-grade barcodes.", href: "/barcode-generator", colorClass: "bg-amber-600", lightBg: "bg-[#fefce8]", category: "converters" },
  { icon: Gauge, title: "ACCELERATION CONVERTER", description: "Convert between various acceleration units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", lightBg: "bg-[#f0fdf4]", category: "converters" },
  { icon: AreaChart, title: "AREA CONVERTER", description: "Convert international and local land area units.", href: "/area-converter", colorClass: "bg-lime-500", lightBg: "bg-[#f7fee7]", category: "converters" },
  { icon: Fuel, title: "FUEL CONVERTER", description: "Convert between MPG and km/L efficiency units.", href: "/fuel-converter", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "converters" },
  { icon: Waves, title: "PRESSURE CONVERTER", description: "Convert Bar, PSI, and Pascal units with precision.", href: "/pressure-converter", colorClass: "bg-sky-500", lightBg: "bg-[#f0f9ff]", category: "converters" },
  { icon: Route, title: "FUEL COST CALCULATOR", description: "Estimate trip fuel expenses and distance.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: Coins, title: "INTEREST CALCULATOR", description: "Calculate simple and compound interest returns.", href: "/interest-calculator", colorClass: "bg-yellow-600", lightBg: "bg-[#fefce8]", category: "calculator" },
  { icon: Receipt, title: "SALES TAX CALCULATOR", description: "Calculate bill tax and final price inclusive of tax.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: Percent, title: "PERCENTAGE CALCULATOR", description: "Find percentages for marks, ratios and discounts.", href: "/percentage-calculator", colorClass: "bg-blue-500", lightBg: "bg-[#eff6ff]", category: "calculator" },
];

const UiverseViewAllButton = ({ href }: { href: string }) => {
  return (
    <Link href={href} className="scale-[0.6] sm:scale-75 md:scale-100 origin-right transition-transform">
      <button className="btn-view-all-uiverse transform-gpu">
        <div className="uiverse-outline"></div>
        <div className="state state--default">
          <div className="icon">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </div>
          <p>
            <span style={{ "--i": 0 } as any}>V</span>
            <span style={{ "--i": 1 } as any}>I</span>
            <span style={{ "--i": 2 } as any}>E</span>
            <span style={{ "--i": 3 } as any}>W</span>
            <span style={{ "--i": 4 } as any}>&nbsp;</span>
            <span style={{ "--i": 5 } as any}>A</span>
            <span style={{ "--i": 6 } as any}>L</span>
            <span style={{ "--i": 7 } as any}>L</span>
          </p>
        </div>
        <div className="state state--sent">
          <div className="icon">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p>
            <span style={{ "--i": 0 } as any}>G</span>
            <span style={{ "--i": 1 } as any}>O</span>
            <span style={{ "--i": 2 } as any}>I</span>
            <span style={{ "--i": 3 } as any}>N</span>
            <span style={{ "--i": 4 } as any}>G</span>
            <span style={{ "--i": 5 } as any}>.</span>
            <span style={{ "--i": 6 } as any}>.</span>
            <span style={{ "--i": 7 } as any}>.</span>
          </p>
        </div>
      </button>
    </Link>
  );
};

const ToolCard = ({ icon: Icon, title, description, href, colorClass, lightBg }: any) => (
  <Link href={href} className="group block h-full touch-manipulation transform-gpu">
    <div className="h-full bg-white dark:bg-[#0a040d] rounded-[2rem] p-1.5 shadow-xl dark:shadow-primary/5 hover:shadow-2xl dark:hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] border-2 border-slate-200/50 dark:border-primary/20 flex flex-col transform-gpu min-h-[280px] md:min-h-[300px] overflow-hidden text-left">
      <div className={cn("flex-1 rounded-[1.5rem] overflow-hidden flex flex-col p-5 md:p-6 shadow-inner transform-gpu", lightBg, "dark:bg-slate-900/60")}>
        <div className={cn(
          `size-12 md:size-14 rounded-[1rem] md:rounded-[1.2rem] flex items-center justify-center mb-5 md:mb-6 text-white transition-transform group-hover:scale-110 shrink-0 transform-gpu`,
          "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.3)]",
          colorClass
        )}>
          <Icon className="size-6 md:size-7 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)]" />
        </div>
        <div className="flex-1 flex flex-col transform-gpu">
          <h3 className="text-base md:text-xl font-medium mb-2 text-slate-900 dark:text-slate-100 tracking-tighter uppercase leading-tight whitespace-normal md:whitespace-nowrap">{title}</h3>
          <p className="text-[10px] md:text-[12px] text-slate-600 dark:text-slate-400 font-bold leading-snug uppercase opacity-60 tracking-tight line-clamp-3 md:line-clamp-2 lg:line-clamp-3">{description}</p>
          
          <div className="flex flex-wrap gap-2 mt-auto pt-4 md:pt-6 transform-gpu">
             <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest shadow-sm">Industrial</Badge>
             <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest shadow-sm">Secured</Badge>
          </div>
        </div>
      </div>
      
      <div className="bg-white/20 dark:bg-black/20 py-2 md:py-2.5 px-6 md:px-8 flex items-center justify-between shrink-0 transform-gpu">
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-400 opacity-60">Launch Tool</span>
        <div className="launch-arrow-btn scale-[0.6] md:scale-75 origin-right -mr-2 transform-gpu">
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
    const visits = parseInt(localStorage.getItem('gr7_visits') || '0') + 1;
    localStorage.setItem('gr7_visits', visits.toString());
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
    <div className="w-full flex flex-col items-center transform-gpu">
      <section className="relative w-full max-w-[2000px] pt-4 pb-10 overflow-hidden z-10 transform-gpu mx-auto bg-[#FDFBFC] dark:bg-[#001D39] border-b-2 border-slate-200/50 dark:border-primary/10 rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.7)] transition-colors duration-500">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
          <div className="absolute top-[10%] left-[5%] size-[400px] bg-[#FDE7D8] dark:bg-primary/10 rounded-full blur-[100px] opacity-60 mix-blend-multiply dark:mix-blend-overlay animate-pulse transform-gpu" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[5%] right-[10%] size-[500px] bg-[#FBE3EA] dark:bg-accent/10 rounded-full blur-[120px] opacity-50 mix-blend-multiply dark:mix-blend-overlay animate-pulse transform-gpu" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full px-5 md:px-12 relative z-10 transform-gpu">
          <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center transform-gpu">
            <div className="flex-1 text-center space-y-4 max-w-4xl mx-auto flex flex-col items-center transform-gpu">
                <div className="inline-flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-[8px] md:text-[10px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] mb-1 shadow-sm animate-fade-in-up transform-gpu">
                    <Sparkles className="size-2.5 md:size-3 text-yellow-400 fill-yellow-400" /> ALL-IN-ONE GR7 TOOLKIT
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-1 tracking-tighter leading-[1.1] md:leading-[0.95] animate-fade-in-up font-jakarta text-slate-900 dark:text-white text-center transform-gpu">
                    Professional Tools for <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">Images, PDFs & Audio</span>
                </h1>
                
                <div className="space-y-1 mb-4 animate-fade-in-up px-4 text-center transform-gpu">
                    <p className="text-xs md:text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed opacity-80 mx-auto transform-gpu">
                    Everything happens locally in your browser RAM, 100% private. <br className="hidden md:block" />
                    Fast, secure, and ready for official submissions.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 animate-fade-in-up transform-gpu">
                    <Link href="/tools" className="uiverse-clay-btn transform-gpu">
                    <div className="button-outer">
                        <div className="button-inner flex items-center gap-2 px-4 md:px-6">
                        <LayoutGrid className="size-4 text-primary" />
                        <span>ALL TOOLS</span>
                        </div>
                    </div>
                    </Link>
                    <Link href="/tools?tab=image" className="uiverse-clay-btn transform-gpu">
                    <div className="button-outer">
                        <div className="button-inner flex items-center gap-2 px-4 md:px-6">
                        <ImageIcon className="size-4 text-blue-500" />
                        <span>IMAGE TOOLS</span>
                        </div>
                    </div>
                    </Link>
                    <Link href="/tools?tab=pdf" className="uiverse-clay-btn transform-gpu">
                    <div className="button-outer">
                        <div className="button-inner flex items-center gap-2 px-4 md:px-6">
                        <FileText className="size-4 text-rose-500" />
                        <span>PDF TOOLS</span>
                        </div>
                    </div>
                    </Link>
                    <Link href="/tools?tab=calculator" className="uiverse-clay-btn transform-gpu">
                    <div className="button-outer">
                        <div className="button-inner flex items-center gap-2 px-4 md:px-6">
                        <Calculator className="size-4 text-emerald-500" />
                        <span>CALCULATORS</span>
                        </div>
                    </div>
                    </Link>
                </div>

                <div className="max-w-2xl w-full mx-auto relative group animate-fade-in-up px-2 md:px-0 mt-6 transform-gpu">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity transform-gpu" />
                    <div className="relative transform-gpu">
                    <Input
                        type="text"
                        placeholder="Search tools... (e.g. 'scan', 'barcode', 'audio')"
                        className="w-full pl-12 md:pl-14 pr-6 h-12 md:h-16 text-sm md:text-lg rounded-full bg-background/90 dark:bg-slate-900/90 border-2 border-white/5 shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold font-jakarta backdrop-blur-sm tracking-tight text-left transform-gpu"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 size-5 md:h-6 md:w-6 text-slate-400 group-focus-within:text-primary z-10 pointer-events-none transform-gpu" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 md:pt-12 pb-24 md:pb-24 bg-transparent w-full transform-gpu">
        <div className="w-full px-5 md:px-12 transform-gpu">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 transform-gpu">
                <div className="flex items-center gap-3 text-primary font-black text-[10px] md:text-xs uppercase tracking-widest mb-10 md:mb-12 font-body transform-gpu">
                  <div className="w-12 md:w-16 h-1.5 md:h-2 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 transform-gpu">
                    {filteredTools.map((tool, i) => <ToolCard key={i} {...tool} />)}
                </div>
                {filteredTools.length === 0 && (
                   <div className="text-center py-20 md:py-32 opacity-20 font-body flex flex-col items-center transform-gpu">
                      <Search className="size-16 md:size-24 mb-6" />
                      <p className="font-black text-xl md:text-2xl uppercase tracking-[0.3em]">No tools found.</p>
                   </div>
                )}
            </div>
          ) : (
            <>
                <div className="mb-16 md:mb-20 transform-gpu">
                    <div className="flex items-center gap-3 text-primary font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 font-body transform-gpu">
                        <div className="w-12 md:w-16 h-1 md:h-2 bg-primary rounded-full" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">IMAGE ENGINE</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-8 md:mb-12 transform-gpu">
                        <h2 className="text-xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tighter font-body uppercase">Visual Processors</h2>
                        <UiverseViewAllButton href="/tools?tab=image" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-10 transform-gpu">
                        {ALL_TOOLS.filter(t => t.category === 'featured').slice(0, 8).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-16 md:mb-20 transform-gpu">
                    <div className="flex items-center gap-3 text-rose-500 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 font-body transform-gpu">
                        <div className="w-12 md:w-16 h-1 md:h-2 bg-rose-500 rounded-full" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">DOCUMENT STUDIO</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-8 md:mb-12 transform-gpu">
                        <h2 className="text-xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tighter font-body uppercase">PDF Toolkit</h2>
                        <UiverseViewAllButton href="/tools?tab=pdf" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-10 transform-gpu">
                        {ALL_TOOLS.filter(t => t.category === 'pdf-kit').slice(0, 9).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-24 md:mb-32 transform-gpu">
                    <div className="flex items-center gap-3 text-indigo-500 font-black text-[9px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] mb-3 md:mb-4 font-body transform-gpu">
                        <div className="w-12 md:w-16 h-1 md:h-2 bg-indigo-50 rounded-full" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">FINANCE HUB</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-8 md:mb-12 transform-gpu">
                        <h2 className="text-xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tighter font-body uppercase">Calculators</h2>
                        <UiverseViewAllButton href="/tools?tab=calculator" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-10 transform-gpu">
                        {ALL_TOOLS.filter(t => t.category === 'calculator').slice(0, 10).map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>
            </>
          )}
        </div>
      </section>

      {!isSearching && (
        <section className="relative w-full no-print overflow-hidden bg-transparent pb-32 transform-gpu">
          <div className="absolute top-0 left-0 w-full h-[600px] z-0 overflow-hidden transform-gpu">
             <div className="absolute inset-0 bg-gradient-to-br from-[#2d0b3a] via-[#1a1a1a] to-[#2d0b3a] transform-gpu" />
             <div className="absolute inset-0 opacity-20 mix-blend-overlay transform-gpu">
                <Image src={placeholderData.hero_bg.url} alt="bg" fill className="object-cover" />
             </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 relative z-10 transform-gpu">
            <header className="text-center mb-24 space-y-3 transform-gpu">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md mb-4 shadow-xl transform-gpu">
                    <span className="size-2.5" /> OUR VALUES
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-headline leading-tight transform-gpu">WHY USERS LOVE <br/> <span className="text-primary">GR7 TOOLS</span></h2>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40 transform-gpu">FAST, SECURE AND RELIABLE</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 relative transform-gpu">
                <div className="relative group pt-10 transform-gpu">
                    <span className="absolute -top-4 left-6 text-9xl font-black text-white/5 select-none transition-all group-hover:text-primary/10 group-hover:-translate-y-4 transform-gpu">01</span>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col h-full transform-gpu transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-primary/20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1e3a8a] text-white px-8 py-2 rounded-full shadow-2xl border-4 border-white z-20 transform-gpu">
                            <span className="font-black text-[10px] uppercase tracking-widest">VALUES</span>
                        </div>
                        <div className="p-10 md:p-12 text-center flex-1 flex flex-col pt-16 transform-gpu">
                            <div className="space-y-6 flex-1 transform-gpu">
                                <div className="space-y-1 transform-gpu">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Privacy Policy</p>
                                    <h3 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-800 dark:text-white uppercase leading-none">100% PRIVATE</h3>
                                </div>
                                <div className="h-1 w-12 bg-primary mx-auto rounded-full transform-gpu" />
                                <p className="text-xs md:text-sm text-muted-foreground font-bold leading-relaxed uppercase opacity-70">Your data never leaves your device. All processing happens locally in your browser RAM.</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 size-16 md:size-20 rounded-3xl bg-white dark:bg-slate-800 shadow-3xl border-[6px] border-slate-50 dark:border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 transform-gpu">
                            <ShieldCheck className="size-8 md:size-10 text-sky-500" />
                        </div>
                    </div>
                </div>

                <div className="relative group pt-10 transform-gpu">
                    <span className="absolute -top-4 left-6 text-9xl font-black text-white/5 select-none transition-all group-hover:text-primary/10 group-hover:-translate-y-4 transform-gpu">02</span>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col h-full transform-gpu transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-primary/20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0ea5e9] text-white px-8 py-2 rounded-full shadow-2xl border-4 border-white z-20 transform-gpu">
                            <span className="font-black text-[10px] uppercase tracking-widest">VISION</span>
                        </div>
                        <div className="p-10 md:p-12 text-center flex-1 flex flex-col pt-16 transform-gpu">
                            <div className="space-y-6 flex-1 transform-gpu">
                                <div className="space-y-1 transform-gpu">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">System Core</p>
                                    <h3 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-800 dark:text-white uppercase leading-none">NATIVE SPEED</h3>
                                </div>
                                <div className="h-1 w-12 bg-primary mx-auto rounded-full transform-gpu" />
                                <p className="text-xs md:text-sm text-muted-foreground font-bold leading-relaxed uppercase opacity-70">Using WebAssembly technology for hardware-level performance without any server-side lag.</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 size-16 md:size-20 rounded-3xl bg-white dark:bg-slate-800 shadow-3xl border-[6px] border-slate-50 dark:border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 transform-gpu">
                            <Zap className="size-8 md:size-10 text-yellow-500" />
                        </div>
                    </div>
                </div>

                <div className="relative group pt-10 transform-gpu">
                    <span className="absolute -top-4 left-6 text-9xl font-black text-white/5 select-none transition-all group-hover:text-primary/10 group-hover:-translate-y-4 transform-gpu">03</span>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col h-full transform-gpu transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-primary/20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#10b981] text-white px-8 py-2 rounded-full shadow-2xl border-4 border-white z-20 transform-gpu">
                            <span className="font-black text-[10px] uppercase tracking-widest">MISSION</span>
                        </div>
                        <div className="p-10 md:p-12 text-center flex-1 flex flex-col pt-16 transform-gpu">
                            <div className="space-y-6 flex-1 transform-gpu">
                                <div className="space-y-1 transform-gpu">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">Output Standards</p>
                                    <h3 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-800 dark:text-white uppercase leading-none">HD QUALITY</h3>
                                </div>
                                <div className="h-1 w-12 bg-primary mx-auto rounded-full transform-gpu" />
                                <p className="text-xs md:text-sm text-muted-foreground font-bold leading-relaxed uppercase opacity-70">Industrial-grade 300 DPI rendering ensuring every pixel is optimized for official form submissions.</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 size-16 md:size-20 rounded-3xl bg-white dark:bg-slate-800 shadow-3xl border-[6px] border-slate-50 dark:border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 transform-gpu">
                            <Target className="size-8 md:size-10 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
