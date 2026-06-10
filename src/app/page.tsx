
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
  Trophy,
  Music,
  Video,
  PenLine,
  RotateCw,
  Barcode,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const ALL_TOOLS = [
  // IMAGE SOLUTION
  { icon: Eraser, title: "BACKGROUND REMOVER", description: "Automatically remove background from any image.", href: "/remove-background", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "featured" },
  { icon: FileDigit, title: "IMAGE TO PDF", description: "Convert multiple images into a single PDF file.", href: "/image-to-pdf", colorClass: "bg-sky-500", lightBg: "bg-sky-50", category: "featured" },
  { icon: QrCode, title: "QR CODE GENERATOR", description: "Create custom QR codes with logos and gradients.", href: "/qr-code-generator", colorClass: "bg-indigo-600", lightBg: "bg-indigo-50", category: "featured" },
  { icon: Sparkles, title: "DOCUMENT SCAN", description: "Premium scanner with BW PRO and Magic filters.", href: "/document-scan", colorClass: "bg-emerald-500", lightBg: "bg-emerald-50", category: "featured" },
  { icon: Shrink, title: "IMAGE COMPRESS", description: "Reduce image file size without losing quality.", href: "/image-compress", colorClass: "bg-emerald-500", lightBg: "bg-emerald-50", category: "featured" },
  { icon: Heart, title: "MARRIAGE BIODATA", description: "Design professional A4 biodata with premium templates.", href: "/marriage-biodata", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "featured" },
  { icon: Printer, title: "AADHAAR PRINTER", description: "Auto-crop and arrange e-Aadhaar for easy printing.", href: "/aadhaar-printer", colorClass: "bg-orange-500", lightBg: "bg-orange-50", category: "featured" },
  { icon: UserCircle, title: "PASSPORT PHOTO MAKER", description: "Create professional passport-sized photos instantly.", href: "/passport-photo", colorClass: "bg-sky-500", lightBg: "bg-sky-50", category: "featured" },
  
  // PDF Toolkit
  { icon: Merge, title: "MERGE PDF", description: "Combine multiple PDF files into one.", href: "/merge-pdf", colorClass: "bg-emerald-500", lightBg: "bg-emerald-50", category: "pdf-kit" },
  { icon: RotateCw, title: "ROTATE PDF", description: "Rotate PDF pages permanently and save.", href: "/rotate-pdf", colorClass: "bg-blue-500", lightBg: "bg-blue-50", category: "pdf-kit" },
  { icon: Lock, title: "PDF LOCKER", description: "Protect documents with secure AES encryption.", href: "/lock-pdf", colorClass: "bg-slate-900", lightBg: "bg-slate-50", category: "pdf-kit" },
  { icon: Unlock, title: "UNLOCK PDF", description: "Remove password protection from a PDF.", href: "/unlock-pdf", colorClass: "bg-teal-500", lightBg: "bg-slate-50", category: "pdf-kit" },
  { icon: FileArchive, title: "PDF COMPRESS", description: "Reduce PDF file size without losing text clarity.", href: "/compress-pdf", colorClass: "bg-rose-500", lightBg: "bg-rose-50", category: "pdf-kit" },
  { icon: FilePenLine, title: "EDIT PDF", description: "Add text, images, and organize pages in your PDF document.", href: "/edit-pdf", colorClass: "bg-violet-500", lightBg: "bg-violet-50", category: "pdf-kit" },

  // IMAGE TOOLS
  { icon: FileOutput, title: "IMAGE TO JPG", description: "Convert various image formats to JPG.", href: "/image-to-jpg", colorClass: "bg-orange-500", lightBg: "bg-orange-50", category: "image" },
  { icon: FileOutput, title: "IMAGE TO PNG", description: "Convert various image formats to PNG.", href: "/image-to-png", colorClass: "bg-sky-500", lightBg: "bg-sky-50", category: "image" },
  { icon: FileScan, title: "IMAGE TO TEXT (OCR)", description: "Extract text from any image locally.", href: "/image-to-text", colorClass: "bg-emerald-500", lightBg: "bg-emerald-50", category: "image" },
  { icon: Crop, title: "CROP IMAGE", description: "Easily crop your images to the perfect size.", href: "/crop-image", colorClass: "bg-sky-500", lightBg: "bg-sky-50", category: "image" },
  { icon: Maximize, title: "IMAGE RESIZE", description: "Change the dimensions of your image quickly.", href: "/image-resize", colorClass: "bg-violet-500", lightBg: "bg-violet-50", category: "image" },
];

const ToolCard = ({ icon: Icon, title, description, href, colorClass, lightBg }: any) => (
  <Link href={href} className="group block h-full">
    <div className="h-full bg-white dark:bg-[#0a040d] rounded-[2.5rem] p-2 shadow-lg hover:shadow-2xl dark:hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:-translate-y-1.5 border-2 border-slate-100/50 dark:border-primary/20 flex flex-col">
      <div className={cn("flex-1 rounded-[1.8rem] overflow-hidden flex flex-col p-5", lightBg, "dark:bg-[#0a040d]/60")}>
        <div className={cn(`size-11 rounded-2xl flex items-center justify-center mb-4 text-white transition-transform group-hover:scale-110 shadow-lg shrink-0`, colorClass)}>
          <Icon className="size-6" />
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg md:text-xl font-bold mb-1.5 text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-tight">{title}</h3>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed mb-4 uppercase opacity-60 tracking-tight">{description}</p>
          
          <div className="flex flex-wrap gap-2 mt-auto">
             <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Professional</Badge>
             <Badge variant="secondary" className="bg-white/60 dark:bg-primary/10 text-[7px] font-black uppercase text-slate-700 dark:text-primary border-none px-2 py-0.5 tracking-widest">Local RAM</Badge>
          </div>
        </div>
      </div>
      
      {/* Footer Section with Uiverse Animated Button */}
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
      <section className="relative w-full max-w-[2000px] pt-8 pb-10 overflow-hidden bg-background dark:bg-[#0a040d] border-b-2 border-border/50 rounded-b-[2.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.7)] mx-auto transition-colors duration-500 z-10">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#fdf8f9] via-[#1e73be]/5 to-[#d4e157]/10 dark:hidden" />
          <div className="hidden dark:block absolute inset-0">
            <Image 
              src={placeholderData.hero_bg.url} 
              alt="Hero Background" 
              fill 
              className="object-cover opacity-20 transition-opacity duration-700"
              priority
              data-ai-hint={placeholderData.hero_bg.hint}
            />
          </div>
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply opacity-0 dark:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/90" />
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[800px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[800px] bg-accent/10 rounded-full blur-[160px] animate-pulse" />
        </div>

        <div className="w-full px-8 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/40 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm animate-fade-in-up">
            <Sparkles className="size-3 text-yellow-400 fill-yellow-400" /> ALL-IN-ONE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tighter leading-[1.05] animate-fade-in-up font-jakarta">
            Professional Tools for <br className="hidden md:block" />
            <span className="text-gradient-hero">Images & PDFs</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-300 max-w-3xl mx-auto mb-4 font-semibold leading-relaxed animate-fade-in-up">
            Everything happens locally in your device RAM, 100% private. <br className="hidden md:block" /> Fast, secure, and ready for official submissions.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in-up">
            <Link href="/tools?tab=image" className="btn-sliding btn-sliding-blue group">
              <span className="btn-text-one">Image Tools</span>
              <span className="btn-text-two">Explore Now</span>
            </Link>
            <Link href="/tools?tab=pdf" className="btn-sliding btn-sliding-blue group">
              <span className="btn-text-one">PDF Tools</span>
              <span className="btn-text-two">Try Studio</span>
            </Link>
            <Link href="/tools?tab=calculator" className="btn-sliding btn-sliding-blue group">
              <span className="btn-text-one">Calculators</span>
              <span className="btn-text-two">Instant Result</span>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto relative group animate-fade-in-up">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-emerald-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative">
              <Input
                type="text"
                placeholder="Search tools... (e.g. 'scan', 'barcode', 'compress')"
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
        <div className="w-full max-w-[2000px] px-8 md:px-16">
          {isSearching ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-12 font-body">
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
                <div className="mb-12">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3 font-body">
                        <div className="w-12 h-2 bg-primary rounded-full" /> <span className="text-gradient-hero">IMAGE SOLUTION</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter font-body uppercase">Visual Processors</h2>
                        <Link href="/tools" className="explore-all-cta hidden sm:flex group">
                          <span className="span font-black tracking-widest uppercase">Explore All</span>
                          <span className="second">
                            <svg width="30px" height="15px" viewBox="0 0 66 43" version="1.1" xmlns="http://www.w3.org/2000/svg">
                              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <path className="one" d="M40.1543933,3.89485589 L40.3151592,2.18569696 C40.3601096,1.70693552 41.0261314,1.58550198 41.2291244,1.99616239 L45.2016838,9.75704901 C45.3090623,9.97014693 45.3090623,10.2201314 45.2016838,10.4332293 L41.2291244,18.194116 C41.0261314,18.6047764 40.3601096,18.4833428 40.3151592,18.0045814 L40.1543933,16.2954224 L0,16.2954224 L0,3.89485589 L40.1543933,3.89485589 Z" fill="#FFFFFF"></path>
                                <path className="two" d="M55.1543933,3.89485589 L55.3151592,2.18569696 C55.3601096,1.70693552 56.0261314,1.58550198 56.2291244,1.99616239 L60.2016838,9.75704901 C60.3090623,9.97014693 60.3090623,10.2201314 60.2016838,10.4332293 L56.2291244,18.194116 C56.0261314,18.6047764 55.3601096,18.4833428 55.3151592,18.0045814 L55.1543933,16.2954224 L15,16.2954224 L15,3.89485589 L55.1543933,3.89485589 Z" fill="#FFFFFF"></path>
                                <path className="three" d="M70.1543933,3.89485589 L70.3151592,2.18569696 C70.3601096,1.70693552 71.0261314,1.58550198 71.2291244,1.99616239 L75.2016838,9.75704901 C75.3090623,9.97014693 75.3090623,10.2201314 75.2016838,10.4332293 L71.2291244,18.194116 C71.0261314,18.6047764 70.3601096,18.4833428 70.3151592,18.0045814 L70.1543933,16.2954224 L30,16.2954224 L30,3.89485589 L70.1543933,3.89485589 Z" fill="#FFFFFF"></path>
                              </g>
                            </svg>
                          </span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'featured').map((tool, i) => <ToolCard key={i} {...tool} />)}
                    </div>
                </div>

                <div className="py-12 w-full flex justify-center">
                    <div className="w-full h-0.5 border-t-2 border-primary relative opacity-20">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-6">
                            <div className="size-10 rounded-full border-2 border-dashed border-primary flex items-center justify-center text-primary">
                                <Sparkles className="size-4" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-24">
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-[0.3em] mb-3 font-body">
                        <div className="w-12 h-2 bg-rose-500 rounded-full" /> <span className="text-gradient-hero">DOCUMENT ENGINE</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tighter mb-10 font-body uppercase">PDF Toolkit</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {ALL_TOOLS.filter(t => t.category === 'pdf-kit').map((tool, i) => <ToolCard key={i} {...tool} />)}
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

                        <div className="pt-8">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-background dark:bg-slate-800 border-2 rounded-2xl shadow-lg border-primary/5 dark:border-white/5 font-body">
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
