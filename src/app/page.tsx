'use client';

import Link from 'next/link';
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
  Scissors,
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
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const ALL_TOOLS = [
  // FEATURED & VISUAL PROCESSOR
  { icon: Sparkles, title: "DOCUMENT SCAN", description: "Premium scanner with BW PRO and Magic filters.", href: "/document-scan", colorClass: "bg-primary", lightBg: "bg-[#f0fdf4]", category: "featured" },
  { icon: FileDigit, title: "IMAGE TO PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-red-500", lightBg: "bg-[#fff1f2]", category: "featured" },
  { icon: Shrink, title: "SMART IMAGE COMPRESS", description: "Reduce image file size without losing quality.", href: "/image-compress", colorClass: "bg-blue-600", lightBg: "bg-[#fefce8]", category: "featured" },
  { icon: Heart, title: "MARRIAGE BIO DATA", description: "Design professional A4 biodata with premium templates.", href: "/marriage-biodata", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "featured" },
  { icon: Printer, title: "AADHAAR PRINTER", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]", category: "featured" },
  { icon: UserCircle, title: "PASSPORT PHOTO MAKER", description: "Create professional passport-sized photos instantly.", href: "/passport-photo", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdfa]", category: "featured" },
  { icon: Eraser, title: "BACKGROUND REMOVER", description: "Automatically remove background from any image.", href: "/remove-background", colorClass: "bg-rose-500", lightBg: "bg-[#faf5ff]", category: "featured" },
  { icon: Sparkles, title: "ENHANCE PHOTO", description: "Improve photo quality, brightness and sharpness.", href: "/enhance-photo", colorClass: "bg-purple-600", lightBg: "bg-[#f5f3ff]", category: "featured" },
  
  // PDF TOOLS
  { icon: Merge, title: "MERGE PDF", description: "Combine multiple PDF files into one.", href: "/merge-pdf", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdf4]", category: "pdf-kit" },
  { icon: FileText, title: "WORD TO PDF", description: "Convert DOCX documents to professional PDF.", href: "/docx-to-pdf", colorClass: "bg-blue-500", lightBg: "bg-[#eff6ff]", category: "pdf-kit" },
  { icon: Lock, title: "VAULT PDF LOCKER", description: "Protect documents with secure AES encryption.", href: "/lock-pdf", colorClass: "bg-slate-900", lightBg: "bg-[#f8fafc]", category: "pdf-kit" },
  { icon: FileArchive, title: "PDF OPTIMIZER", description: "Reduce PDF file size without losing text clarity.", href: "/compress-pdf", colorClass: "bg-rose-600", lightBg: "bg-[#fff1f2]", category: "pdf-kit" },
  { icon: FilePenLine, title: "EDIT PDF", description: "Add text, images, and organize pages in your PDF document.", href: "/edit-pdf", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "pdf-kit" },

  // HIDDEN FROM HOME BUT IN SEARCH INDEX
  { icon: FileOutput, title: "IMAGE TO JPG", description: "Convert various image formats to JPG.", href: "/image-to-jpg", colorClass: "bg-yellow-500", lightBg: "bg-[#fefce8]", category: "image" },
  { icon: FileOutput, title: "IMAGE TO PNG", description: "Convert various image formats to PNG.", href: "/image-to-png", colorClass: "bg-sky-500", lightBg: "bg-[#ecfeff]", category: "image" },
  { icon: FileScan, title: "IMAGE TO TEXT (OCR)", description: "Extract text from any image locally.", href: "/image-to-text", colorClass: "bg-teal-500", lightBg: "bg-[#f0fdfa]", category: "image" },
  { icon: Crop, title: "CROP IMAGE", description: "Easily crop your images to the perfect size.", href: "/crop-image", colorClass: "bg-cyan-500", lightBg: "bg-[#ecfeff]", category: "image" },
  { icon: Maximize, title: "IMAGE RESIZE", description: "Change the dimensions of your image quickly.", href: "/image-resize", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "image" },
  { icon: Scissors, title: "SPLIT PDF", description: "Extract specific pages from any PDF file visually.", href: "/split-pdf", colorClass: "bg-cyan-600", lightBg: "bg-[#ecfeff]", category: "pdf-extra" },
  { icon: Unlock, title: "UNLOCK PDF", description: "Remove password protection from a PDF.", href: "/unlock-pdf", colorClass: "bg-teal-500", lightBg: "bg-[#f0fdfa]", category: "pdf-extra" },
  { icon: Crop, title: "CROP PDF", description: "Crop the visible area of PDF pages.", href: "/crop-pdf", colorClass: "bg-amber-600", lightBg: "bg-[#fffbeb]" },
  { icon: Camera, title: "SCAN TO PDF", description: "Scan documents directly to a PDF file.", href: "/scan-to-pdf", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]" },
  { icon: ImageIcon, title: "PDF TO IMAGE", description: "Extract all pages from a PDF as images.", href: "/pdf-to-image", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]" },
  { icon: FileCode, title: "HTML TO PDF", description: "Convert raw HTML code into a PDF document.", href: "/html-to-pdf", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]" },
  { icon: Copyright, title: "ADD WATERMARK", description: "Add a text watermark to your PDF.", href: "/add-watermark", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]" },
  { icon: NotebookPen, title: "ADD PAGE NUMBERS", description: "Insert page numbers into your PDF document.", href: "/add-page-numbers", colorClass: "bg-lime-500", lightBg: "bg-[#f7fee7]" },

  // CALCULATORS
  { icon: Calculator, title: "STANDARD CALCULATOR", description: "For your everyday calculations.", href: "/standard-calculator", colorClass: "bg-cyan-500", lightBg: "bg-[#ecfeff]", category: "calculator" },
  { icon: Landmark, title: "LOAN & EMI CALCULATOR", description: "Calculate your loan payments ease.", href: "/loan-calculator", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: Cake, title: "AGE CALCULATOR", description: "Find out your exact age profile.", href: "/age-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: Percent, title: "PERCENTAGE CALCULATOR", description: "Quickly calculate percentages.", href: "/percentage-calculator", colorClass: "bg-blue-500", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: Route, title: "FUEL COST CALCULATOR", description: "Estimate trip fuel expenses.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: Coins, title: "INTEREST CALCULATOR", description: "Simple and compound interest.", href: "/interest-calculator", colorClass: "bg-yellow-600", lightBg: "bg-[#fefce8]", category: "calculator" },
  { icon: Receipt, title: "SALES TAX CALCULATOR", description: "Calculate tax and total price.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]", category: "calculator" },

  // CONVERTERS
  { icon: Gauge, title: "ACCELERATION CONVERTER", description: "Convert between different units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", lightBg: "bg-[#f0fdf4]", category: "converter" },
  { icon: AreaChart, title: "AREA CONVERTER", description: "Convert between different area units.", href: "/area-converter", colorClass: "bg-lime-500", lightBg: "bg-[#f7fee7]", category: "converter" },
  { icon: Fuel, title: "FUEL CONSUMPTION CONVERTER", description: "Convert between efficiency units.", href: "/fuel-converter", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "converter" },
  { icon: Waves, title: "PRESSURE CONVERTER", description: "Convert between different units.", href: "/pressure-converter", colorClass: "bg-sky-500", lightBg: "bg-[#f0f9ff]", category: "converter" },

  // FILE TOOLS
  { icon: Archive, title: "CREATE ZIP", description: "Combine multiple files into a single zip.", href: "/create-zip", colorClass: "bg-violet-500", lightBg: "bg-[#f5f3ff]", category: "file" },
  { icon: ArchiveRestore, title: "UNZIP FILE", description: "Extract files from a zip archive.", href: "/unzip-file", colorClass: "bg-stone-500", lightBg: "bg-[#f8fafc]", category: "file" },
];

const ToolCard = ({ icon: Icon, title, description, href, colorClass, lightBg }: any) => (
  <Link href={href} className="group">
    <Card className={cn(
      "h-full border-2 border-border/50 dark:border-white/5 shadow-sm hover:shadow-2xl dark:hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden relative rounded-[2.5rem] hover:-translate-y-2",
      lightBg,
      "dark:bg-card"
    )}>
      <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass)} />
      <CardContent className="p-5">
        <div className={cn(`size-10 rounded-xl flex items-center justify-center mb-3 text-white transition-transform group-hover:scale-110 shadow-lg`, colorClass)}>
          <Icon className="size-5" />
        </div>
        <h3 className="text-xl font-bold mb-1.5 text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 uppercase font-headline">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-tight font-normal h-10">{description}</p>
        <div className="flex items-center text-primary font-bold text-[9px] uppercase tracking-widest group-hover:gap-2 transition-all">
          Launch Tool <ArrowRight className="ml-1 size-3" />
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
      <section className="relative w-full max-w-[2000px] pt-10 pb-10 overflow-hidden bg-background dark:bg-[#001D39] border-b-2 border-border/50 rounded-b-[5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.7)] mx-auto transition-colors duration-500 z-10">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[800px] bg-accent/10 rounded-full blur-[160px] animate-pulse" />
        </div>

        <div className="w-full px-8 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm animate-fade-in-up">
            <Sparkles className="size-3 text-yellow-400 fill-yellow-400" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-3 tracking-tighter leading-[1.05] animate-fade-in-up" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Professional Tools for <br className="hidden md:block" />
            <span className="text-gradient-hero">Images & PDFs</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-300 max-w-3xl mx-auto mb-6 font-semibold leading-relaxed animate-fade-in-up">
            Everything happens locally in your device RAM, 100% private. <br className="hidden md:block" /> Fast, secure, and ready for official submissions.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in-up">
            <Link href="/tools?tab=image" className="flex items-center gap-4 px-8 py-4 bg-background dark:bg-slate-900 border-2 shadow-md rounded-full hover:shadow-2xl hover:border-primary/50 transition-all group">
              <ImageIcon className="size-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">Image Tools</span>
            </Link>
            <Link href="/tools?tab=pdf" className="flex items-center gap-4 px-8 py-4 bg-background dark:bg-slate-900 border-2 shadow-md rounded-full hover:shadow-2xl hover:border-rose-500/50 transition-all group">
              <FileText className="size-6 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">PDF Tools</span>
            </Link>
            <Link href="/tools?tab=calculator" className="flex items-center gap-4 px-8 py-4 bg-background dark:bg-slate-900 border-2 shadow-md rounded-full hover:shadow-2xl hover:border-emerald-500/50 transition-all group">
              <Calculator className="size-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200">Calculators</span>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto relative group animate-fade-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'scan', 'biodata', 'compress')"
                className="w-full pl-14 pr-6 h-12 text-base rounded-3xl bg-background dark:bg-[#001D39] border-2 border-white/5 shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 pb-12 bg-background w-full flex justify-center">
        <div className="w-full max-w-[2000px] px-8 md:px-16">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-12">
                  <div className="w-12 h-2 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredTools.map((tool, i) => <ToolCard key={i} {...tool} />)}
                </div>
                {filteredTools.length === 0 && (
                   <div className="text-center py-20 opacity-30">
                      <Search className="size-20 mx-auto mb-4" />
                      <p className="font-bold uppercase tracking-widest">No matching tools found.</p>
                   </div>
                )}
            </div>
          ) : (
            <>
                <div className="mb-24">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-primary rounded-full" /> <span className="text-gradient-hero">IMAGE SOLUTION</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">VISUAL PROCESSOR</h2>
                        <Button asChild className="hidden sm:flex h-12 px-8 rounded-2xl font-bold text-sm bg-gradient-button text-white shadow-xl hover:scale-105 transition-all">
                            <Link href="/tools">EXPLORE ALL <ArrowRight className="ml-2 size-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'featured').map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-24">
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-rose-500 rounded-full" /> <span className="text-gradient-hero">DOCUMENT ENGINE</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter mb-10">PDF Toolkit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'pdf-kit').map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-32 py-16 px-8 bg-[#ecf4f4] dark:bg-slate-900/40 rounded-[3rem] border-2 border-primary/20 dark:border-white/10 shadow-inner overflow-hidden relative">
                    <div className="absolute top-0 right-0 size-64 bg-primary/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 left-0 size-64 bg-accent/10 blur-3xl rounded-full" />
                    
                    <div className="relative z-10 text-center space-y-16">
                        <div className="space-y-4">
                            <Badge variant="outline" className="px-6 py-1.5 rounded-full border-primary/20 text-primary font-bold uppercase text-[10px] tracking-widest shadow-sm">CORE PRINCIPLES</Badge>
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">Why Choose <span className="text-gradient-hero">GR7 Tools?</span></h2>
                            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-bold max-w-2xl mx-auto uppercase opacity-80">The only professional studio built entirely on privacy-first architecture.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                            <div className="space-y-6 group">
                                <div className="size-20 mx-auto rounded-[2rem] bg-background dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-transparent group-hover:border-green-500/30 group-hover:-translate-y-2 transition-all duration-300">
                                    <ShieldCheck className="size-10 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold tracking-tight">100% Private</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your images and documents never leave your device. All processing happens 100% locally in your browser's temporary memory (RAM).</p>
                                </div>
                            </div>

                            <div className="space-y-6 group">
                                <div className="size-20 mx-auto rounded-[2rem] bg-background dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-transparent group-hover:border-blue-500/30 group-hover:-translate-y-2 transition-all duration-300">
                                    <Zap className="size-10 text-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold tracking-tight">Native Performance</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Using advanced WASM technology, we process files at your device's native hardware speed. No server queues, no waiting, no limits.</p>
                                </div>
                            </div>

                            <div className="space-y-6 group">
                                <div className="size-20 mx-auto rounded-[2rem] bg-background dark:bg-slate-800 shadow-xl flex items-center justify-center border-2 border-transparent group-hover:border-primary/30 group-hover:-translate-y-2 transition-all duration-300">
                                    <Trophy className="size-10 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold tracking-tight">Studio Quality</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Engineered for professional submissions. Every output is rendered in high-definition (300 DPI equivalent) for crystal clear printing.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                             <div className="inline-flex items-center gap-3 px-6 py-3 bg-background dark:bg-slate-800 border-2 rounded-2xl shadow-lg border-primary/5 dark:border-white/5">
                                <div className="flex items-center -space-x-3">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">U{i}</div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase leading-none">Trusted by 10,000+ Users</p>
                                    <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">For official document management</p>
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