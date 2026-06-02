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
  ArchiveRestore
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const ALL_TOOLS = [
  // FEATURED & VISUAL PROCESSOR
  { icon: Sparkles, title: "Document Scan", description: "Premium scanner with BW PRO and Magic filters.", href: "/document-scan", colorClass: "bg-primary", lightBg: "bg-[#f0fdf4]", category: "featured" },
  { icon: FileDigit, title: "Image to PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-red-500", lightBg: "bg-[#fff1f2]", category: "featured" },
  { icon: Shrink, title: "Smart Image Compress", description: "Reduce image file size without losing quality.", href: "/image-compress", colorClass: "bg-blue-600", lightBg: "bg-[#fefce8]", category: "featured" },
  { icon: Heart, title: "Marriage Bio Data", description: "Design professional A4 biodata with premium templates.", href: "/marriage-biodata", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "featured" },
  { icon: Printer, title: "Aadhaar Printer", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]", category: "featured" },
  { icon: UserCircle, title: "Passport Photo Maker", description: "Create professional passport-sized photos instantly.", href: "/passport-photo", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdfa]", category: "featured" },
  { icon: Eraser, title: "Background Remover", description: "Automatically remove background from any image.", href: "/remove-background", colorClass: "bg-rose-500", lightBg: "bg-[#faf5ff]", category: "featured" },
  { icon: Sparkles, title: "Enhance Photo", description: "Improve photo quality, brightness and sharpness.", href: "/enhance-photo", colorClass: "bg-purple-600", lightBg: "bg-[#f5f3ff]", category: "featured" },
  
  // IMAGE TOOLS
  { icon: FileOutput, title: "Image to JPG", description: "Convert various image formats to JPG.", href: "/image-to-jpg", colorClass: "bg-yellow-500", lightBg: "bg-[#fefce8]", category: "image" },
  { icon: FileOutput, title: "Image to PNG", description: "Convert various image formats to PNG.", href: "/image-to-png", colorClass: "bg-sky-500", lightBg: "bg-[#ecfeff]", category: "image" },
  { icon: FileScan, title: "Image to Text (OCR)", description: "Extract text from any image locally.", href: "/image-to-text", colorClass: "bg-teal-500", lightBg: "bg-[#f0fdfa]", category: "image" },
  { icon: Crop, title: "Crop Image", description: "Easily crop your images to the perfect size.", href: "/crop-image", colorClass: "bg-cyan-500", lightBg: "bg-[#ecfeff]", category: "image" },
  { icon: Maximize, title: "Image Resize", description: "Change the dimensions of your image quickly.", href: "/image-resize", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "image" },

  // PDF TOOLS - REORDERED
  { icon: Merge, title: "Merge PDF", description: "Combine multiple PDF files into one.", href: "/merge-pdf", colorClass: "bg-emerald-600", lightBg: "bg-[#f0fdf4]", category: "pdf-kit" },
  { icon: FileText, title: "Word to PDF", description: "Convert DOCX documents to professional PDF.", href: "/docx-to-pdf", colorClass: "bg-blue-500", lightBg: "bg-[#eff6ff]", category: "pdf-kit" },
  { icon: Lock, title: "Vault PDF Locker", description: "Protect documents with secure AES encryption.", href: "/lock-pdf", colorClass: "bg-slate-900", lightBg: "bg-[#f8fafc]", category: "pdf-kit" },
  { icon: FileArchive, title: "PDF Optimizer", description: "Reduce PDF file size without losing text clarity.", href: "/compress-pdf", colorClass: "bg-rose-600", lightBg: "bg-[#fff1f2]", category: "pdf-kit" },
  { icon: FilePenLine, title: "Edit PDF", description: "Add text, images, and organize pages in your PDF document.", href: "/edit-pdf", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "pdf-kit" },

  // HIDDEN FROM HOME BUT IN SEARCH INDEX
  { icon: Scissors, title: "Split PDF", description: "Extract specific pages from any PDF file visually.", href: "/split-pdf", colorClass: "bg-cyan-600", lightBg: "bg-[#ecfeff]", category: "pdf-extra" },
  { icon: Unlock, title: "Unlock PDF", description: "Remove password protection from a PDF.", href: "/unlock-pdf", colorClass: "bg-teal-500", lightBg: "bg-[#f0fdfa]", category: "pdf-extra" },
  { icon: Crop, title: "Crop PDF", description: "Crop the visible area of PDF pages.", href: "/crop-pdf", colorClass: "bg-amber-600", lightBg: "bg-[#fffbeb]", category: "pdf-extra" },
  { icon: Camera, title: "Scan to PDF", description: "Scan documents directly to a PDF file.", href: "/scan-to-pdf", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]", category: "pdf-extra" },
  { icon: ImageIcon, title: "PDF to Image", description: "Extract all pages from a PDF as images.", href: "/pdf-to-image", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "pdf-extra" },
  { icon: FileCode, title: "HTML to PDF", description: "Convert raw HTML code into a PDF document.", href: "/html-to-pdf", colorClass: "bg-orange-600", lightBg: "bg-[#fff7ed]", category: "pdf-extra" },
  { icon: FileText, title: "Text to PDF", description: "Convert plain text into a PDF document.", href: "/text-to-pdf", colorClass: "bg-slate-500", lightBg: "bg-[#f1f5f9]", category: "pdf-extra" },
  { icon: Copyright, title: "Add Watermark", description: "Add a text watermark to your PDF.", href: "/add-watermark", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "pdf-extra" },
  { icon: NotebookPen, title: "Add Page Numbers", description: "Insert page numbers into your PDF document.", href: "/add-page-numbers", colorClass: "bg-lime-500", lightBg: "bg-[#f7fee7]", category: "pdf-extra" },

  // CALCULATORS
  { icon: Calculator, title: "Standard Calculator", description: "For your everyday calculations.", href: "/standard-calculator", colorClass: "bg-cyan-500", lightBg: "bg-[#ecfeff]", category: "calculator" },
  { icon: Landmark, title: "Loan & EMI Calculator", description: "Calculate your loan payments ease.", href: "/loan-calculator", colorClass: "bg-indigo-600", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: Cake, title: "Age Calculator", description: "Find out your exact age profile.", href: "/age-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: Percent, title: "Percentage Calculator", description: "Quickly calculate percentages.", href: "/percentage-calculator", colorClass: "bg-blue-500", lightBg: "bg-[#eff6ff]", category: "calculator" },
  { icon: Route, title: "Fuel Cost Calculator", description: "Estimate trip fuel expenses.", href: "/fuel-cost-calculator", colorClass: "bg-rose-500", lightBg: "bg-[#fff1f2]", category: "calculator" },
  { icon: Coins, title: "Interest Calculator", description: "Simple and compound interest.", href: "/interest-calculator", colorClass: "bg-yellow-600", lightBg: "bg-[#fefce8]", category: "calculator" },
  { icon: Receipt, title: "Sales Tax Calculator", description: "Calculate tax and total price.", href: "/sales-tax-calculator", colorClass: "bg-indigo-500", lightBg: "bg-[#eff6ff]", category: "calculator" },

  // CONVERTERS
  { icon: Gauge, title: "Acceleration Converter", description: "Convert between different units.", href: "/acceleration-converter", colorClass: "bg-emerald-500", lightBg: "bg-[#f0fdf4]", category: "converter" },
  { icon: AreaChart, title: "Area Converter", description: "Convert between different area units.", href: "/area-converter", colorClass: "bg-lime-500", lightBg: "bg-[#f7fee7]", category: "converter" },
  { icon: Fuel, title: "Fuel Consumption Converter", description: "Convert between efficiency units.", href: "/fuel-converter", colorClass: "bg-orange-500", lightBg: "bg-[#fff7ed]", category: "converter" },
  { icon: Waves, title: "Pressure Converter", description: "Convert between different units.", href: "/pressure-converter", colorClass: "bg-sky-500", lightBg: "bg-[#f0f9ff]", category: "converter" },

  // FILE TOOLS
  { icon: Archive, title: "Create Zip", description: "Combine multiple files into a single zip.", href: "/create-zip", colorClass: "bg-violet-500", lightBg: "bg-[#f5f3ff]", category: "file" },
  { icon: ArchiveRestore, title: "Unzip File", description: "Extract files from a zip archive.", href: "/unzip-file", colorClass: "bg-stone-500", lightBg: "bg-[#f8fafc]", category: "file" },
];

const ToolCard = ({ icon: Icon, title, description, href, colorClass, lightBg }: any) => (
  <Link href={href} className="group">
    <Card className={cn(
      "h-full border-2 border-border/50 dark:border-white/5 shadow-sm hover:shadow-2xl dark:hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden relative rounded-[2.5rem] hover:-translate-y-2",
      lightBg, // Colourful background for Light Mode
      "dark:bg-card" // Professional dark background for Dark Mode
    )}>
      <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity", colorClass)} />
      <CardContent className="p-5">
        <div className={cn(`size-10 rounded-xl flex items-center justify-center mb-3 text-white transition-transform group-hover:scale-110 shadow-lg`, colorClass)}>
          <Icon className="size-5" />
        </div>
        <h3 className="text-lg font-black mb-1.5 text-slate-900 dark:text-white group-hover:text-primary transition-colors uppercase tracking-tighter line-clamp-1">{title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 leading-tight font-semibold h-8">{description}</p>
        <div className="flex items-center text-primary font-black text-[9px] uppercase tracking-widest group-hover:gap-2 transition-all">
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
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-300 max-w-3xl mx-auto mb-6 font-bold leading-relaxed animate-fade-in-up">
            Everything happens locally in your device RAM, 100% private. <br className="hidden md:block" /> Fast, secure, and ready for official submissions.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in-up">
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

          <div className="max-w-2xl mx-auto relative group animate-fade-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within:text-primary" />
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'scan', 'biodata', 'compress')"
                className="w-full pl-16 pr-6 h-16 text-lg rounded-3xl bg-white dark:bg-[#001D39] border-2 border-white/5 shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 pb-32 bg-background w-full flex justify-center">
        <div className="w-full max-w-[2000px] px-8 md:px-16">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-12">
                  <div className="w-12 h-2 bg-primary rounded-full" /> Search Results ({filteredTools.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {filteredTools.map((tool, i) => <ToolCard key={i} {...tool} />)}
                </div>
                {filteredTools.length === 0 && (
                   <div className="text-center py-20 opacity-30">
                      <Search className="size-20 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest">No matching tools found.</p>
                   </div>
                )}
            </div>
          ) : (
            <>
                <div className="mb-24">
                    <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-primary rounded-full" /> <span className="text-gradient-hero">IMAGE SOLUTION</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">VISUAL PROCESSOR</h2>
                        <Button asChild className="hidden sm:flex h-12 px-8 rounded-2xl font-black text-sm bg-gradient-button text-white shadow-xl hover:scale-105 transition-all">
                            <Link href="/tools">EXPLORE ALL <ArrowRight className="ml-2 size-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'featured').map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="mb-24">
                    <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.3em] mb-3">
                        <div className="w-12 h-2 bg-rose-500 rounded-full" /> <span className="text-gradient-hero">DOCUMENT ENGINE</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10">PDF Toolkit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'pdf-kit').map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
