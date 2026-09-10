"use client";

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Crop,
  FileArchive,
  FileDigit,
  FileOutput,
  Image as ImageIcon,
  Merge,
  Shrink,
  Unlock,
  Scissors,
  Maximize,
  Copyright,
  Settings,
  Archive,
  ArchiveRestore,
  Calculator,
  Landmark,
  Cake,
  Percent,
  Route,
  Coins,
  Receipt,
  Eraser,
  Wand2,
  NotebookPen,
  LayoutGrid,
  Mail,
  FileCode,
  FileScan,
  FileText,
  PenLine,
  ShieldCheck,
  ChevronDown,
  Menu,
  Languages,
  Zap,
  Home as HomeIcon,
  UserCircle,
  Infinity as InfinityIcon,
  Printer,
  Lock,
  Heart,
  Sparkles,
  FilePenLine,
  Music,
  RotateCw,
  Barcode,
  QrCode,
  IndianRupee,
  TrendingUp,
  PiggyBank,
  Layers,
  CalendarDays,
  ScanLine,
  Palette,
  Banknote,
  Video,
  Volume2,
  Gauge,
  AreaChart,
  Fuel,
  Waves,
  Facebook,
  Twitter,
  Github
} from 'lucide-react';

import {ThemeToggle} from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from '@/contexts/language-context';
import { ScrollArea } from './ui/scroll-area';

const CATEGORIES = [
  {
    name: "image_tools",
    icon: ImageIcon,
    color: "text-blue-500",
    tools: [
      { href: '/passport-date-name', label: 'passport_date_name_label', icon: CalendarDays },
      { href: '/enhance-photo', label: 'enhance_photo_label', icon: Wand2 },
      { href: '/image-to-pdf', label: 'image_to_pdf_label', icon: FileDigit },
      { href: '/image-compress', label: 'image_compress_label', icon: Shrink },
      { href: '/crop-image', label: 'crop_image_label', icon: Crop },
      { href: '/image-resize', label: 'resize_image_label', icon: Maximize },
      { href: '/remove-background', label: 'remove_background_label', icon: Eraser },
      { href: '/remove-signature', label: 'remove_signature_label', icon: PenLine },
      { href: '/passport-photo', label: 'passport_photo_label', icon: UserCircle },
      { href: '/image-to-jpg', label: 'image_to_jpg_label', icon: FileOutput },
      { href: '/image-to-png', label: 'image_to_png_label', icon: FileOutput },
      { href: '/image-to-text', label: 'image_to_text_label', icon: FileScan },
    ]
  },
  {
    name: "pdf_tools",
    icon: FileText,
    color: "text-rose-500",
    tools: [
      { href: '/organize-pdf', label: 'organize_pdf_label', icon: Layers },
      { href: '/merge-pdf', label: 'merge_pdf_label', icon: Merge },
      { href: '/rotate-pdf', label: 'rotate_pdf_label', icon: RotateCw },
      { href: '/lock-pdf', label: 'lock_pdf_label', icon: Lock },
      { href: '/compress-pdf', label: 'compress_pdf_label', icon: FileArchive },
      { href: '/edit-pdf', label: 'edit_pdf_label', icon: FilePenLine },
      { href: '/unlock-pdf', label: 'unlock_pdf_label', icon: Unlock },
      { href: '/split-pdf', label: 'split_pdf_label', icon: Scissors },
      { href: '/crop-pdf', label: 'crop_pdf_label', icon: Crop },
      { href: '/pdf-to-image', label: 'pdf_to_image_label', icon: ImageIcon },
      { href: '/html-to-pdf', label: 'html_to_pdf_label', icon: FileCode },
      { href: '/text-to-pdf', label: 'text_to_pdf_label', icon: FileText },
      { href: '/add-watermark', label: 'add_watermark_label', icon: Copyright },
      { href: '/add-page-numbers', label: 'add_page_numbers_label', icon: NotebookPen },
      { href: '/document-scan', label: 'document_scan_label', icon: ScanLine },
    ]
  },
  {
    name: "audio_tools",
    icon: Volume2,
    color: "text-indigo-600",
    tools: [
      { href: '/merge-audio', label: 'audio_merger_label', icon: Merge },
      { href: '/mp3-cutter', label: 'mp3_cutter_label', icon: Scissors },
      { href: '/audio-converter', label: 'audio_converter_label', icon: FileOutput },
    ]
  },
  {
    name: "video_tools",
    icon: Video,
    color: "text-indigo-500",
    tools: [
      { href: '/rotate-video', label: 'rotate_video_label', icon: RotateCw },
      { href: '/video-to-mp3', label: 'video_to_mp3_label', icon: Music },
    ]
  },
  {
    name: "calculator_pro",
    icon: Calculator,
    color: "text-emerald-500",
    tools: [
      { href: '/cpc-arrears-calculator', label: 'cpc_arrears_calculator_label', icon: Banknote },
      { href: '/salary-slip', label: 'salary_slip_label', icon: Banknote },
      { href: '/gst-invoice', label: 'gst_invoice_label', icon: Receipt },
      { href: '/gst-calculator', label: 'gst_calculator_label', icon: IndianRupee },
      { href: '/sip-calculator', label: 'sip_calculator_label', icon: TrendingUp },
      { href: '/fd-rd-calculator', label: 'fd_rd_calculator_label', icon: PiggyBank },
      { href: '/income-tax-calculator', label: 'income_tax_calculator_label', icon: Landmark },
      { href: '/standard-calculator', label: 'standard_calculator_label', icon: Calculator },
      { href: '/loan-calculator', label: 'loan_emi_calculator_label', icon: Landmark },
      { href: '/age-calculator', label: 'age_calculator_label', icon: Cake },
      { href: '/percentage-calculator', label: 'percentage_calculator_label', icon: Percent },
      { href: '/fuel-cost-calculator', label: 'fuel_cost_calculator_label', icon: Route },
      { href: '/interest-calculator', label: 'interest_calculator_label', icon: Coins },
      { href: '/sales-tax-calculator', label: 'sales_tax_calculator_label', icon: Receipt },
      { href: '/mortgage-calculator', label: 'mortgage_calculator_label', icon: HomeIcon },
    ]
  },
  {
    name: "converter_tools",
    icon: InfinityIcon,
    color: "text-amber-500",
    tools: [
      { href: '/color-picker', label: 'color_picker_label', icon: Palette },
      { href: '/qr-code-generator', label: 'qr_code_generator_label', icon: QrCode },
      { href: '/barcode-generator', label: 'barcode_generator_label', icon: Barcode },
      { href: '/acceleration-converter', label: 'acceleration_converter_label', icon: Gauge },
      { href: '/area-converter', label: 'area_converter_label', icon: AreaChart },
      { href: '/fuel-converter', label: 'fuel_converter_label', icon: Fuel },
      { href: '/pressure-converter', label: 'pressure_converter_label', icon: Waves },
    ]
  },
  {
    name: "file_tools",
    icon: Archive,
    color: "text-violet-500",
    tools: [
      { href: '/aadhaar-printer', label: 'aadhaar_printer_label', icon: Printer },
      { href: '/create-zip', label: 'create_zip_label', icon: Archive },
      { href: '/unzip-file', label: 'unzip_file_label', icon: ArchiveRestore },
    ]
  }
];

function GR7Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative size-8 md:size-12 flex items-center justify-center bg-white border-[1.5px] border-slate-200 rounded-lg md:rounded-xl shadow-sm overflow-hidden text-left">
        <svg viewBox="0 0 1000 1000" className="w-full h-full p-0.5 md:p-1">
          <text 
            x="80" 
            y="720" 
            style={{ 
              fill: '#0d5a71', 
              fontSize: '440px', 
              fontWeight: 900, 
              fontFamily: 'Arial Black, sans-serif'
            }}
          >
            GR
          </text>
          <text 
            x="620" 
            y="740" 
            style={{ 
              fill: '#ef4444', 
              fontSize: '640px', 
              fontWeight: 900, 
              fontFamily: 'Arial Black, sans-serif'
            }}
          >
            7
          </text>
        </svg>
      </div>
      <span className="font-headline font-black text-base md:text-xl tracking-tighter text-slate-800 dark:text-white uppercase">
        Tools
      </span>
    </div>
  );
}

function NavDropdown({ 
  category, 
  activeMenu, 
  setActiveMenu 
}: { 
  category: typeof CATEGORIES[0],
  activeMenu: string | null,
  setActiveMenu: (name: string | null) => void
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  
  const [isHovering, setIsHovering] = useState(false);
  const [isForceClosed, setIsForceClosed] = useState(false);

  const isPinned = activeMenu === category.name;
  
  const isOpen = isPinned || (isHovering && !isForceClosed);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isPinned) {
      setActiveMenu(null);
      setIsForceClosed(true);
    } else {
      setActiveMenu(category.name);
      setIsForceClosed(false);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsForceClosed(false);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsForceClosed(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DropdownMenu 
        open={isOpen} 
        onOpenChange={(val) => {
          if (!val) {
              setIsHovering(false);
              if (isPinned) setActiveMenu(null);
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            onClick={handleToggle}
            onPointerDown={(e) => {
               e.preventDefault();
            }}
            className={cn(
                "h-10 px-1.5 xl:px-2 font-black text-[10px] flex items-center gap-1 text-slate-800 dark:text-slate-200 hover:text-primary hover:bg-primary/5 transition-all focus-visible:ring-0 border-none shadow-none group tracking-tighter",
                isOpen && "bg-primary/10 text-primary"
            )}
          >
            <category.icon className={cn("size-3.5 transition-transform group-hover:scale-110", category.color)} />
            <span className="hidden xl:inline">{t(category.name)}</span>
            <ChevronDown className={cn("size-2.5 opacity-50 transition-transform duration-200", isOpen && "rotate-180")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-64 p-2 rounded-2xl shadow-2xl border-2 grid grid-cols-1 gap-1 bg-white dark:bg-slate-900 z-[110]"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pb-2 px-3 text-left">
            {t(category.name)}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {category.tools.map((tool) => (
            <DropdownMenuItem 
                key={tool.href} 
                asChild 
                className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer transition-colors"
                onClick={() => {
                  setIsHovering(false);
                  setActiveMenu(null);
                }}
            >
              <Link href={tool.href} className={cn(
                "flex items-center gap-3 py-2.5 px-3 cursor-pointer transition-colors min-h-[44px]", 
                pathname === tool.href ? "bg-primary/10 text-primary" : ""
              )}>
                <tool.icon className={cn("size-4", category.color)} />
                <span className="font-bold text-xs">{t(tool.label) || tool.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SettingsMenu() {
  const { setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10 border-none shadow-none touch-manipulation">
          <Settings className="h-5 w-5 text-slate-800 dark:text-slate-200" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12} className="w-48 p-2 rounded-2xl shadow-2xl border-2 z-[110]">
        <DropdownMenuLabel className="font-headline text-[10px] tracking-widest uppercase text-muted-foreground pb-2 text-left">{t('language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-xl font-bold py-3 min-h-[44px]">🇺🇸 {t('english')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hi')} className="rounded-xl font-bold py-3 min-h-[44px]">🇮🇳 {t('hindi')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')} className="rounded-xl font-bold py-3 min-h-[44px]">🇪🇸 {t('spanish')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl touch-manipulation">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:w-[380px] p-0 border-r-2 z-[150] rounded-r-[2.5rem]">
        <SheetHeader className="p-6 border-b text-left shrink-0">
          <SheetTitle>
            <Link href="/" onClick={() => setOpen(false)} className="inline-block text-left">
              <GR7Logo />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-8 pb-32">
            <div className="space-y-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl font-black text-sm transition-all border border-transparent shadow-sm",
                  pathname === '/' ? "bg-primary text-white shadow-primary/20" : "hover:bg-muted text-slate-800 dark:text-slate-200"
                )}
              >
                <HomeIcon className="size-4" />
                {t('home')}
              </Link>
            </div>

            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 pl-2 text-left">
                  <cat.icon className="size-3" /> {t(cat.name)}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-border min-h-[48px] text-left",
                        pathname === tool.href ? "bg-primary/5 text-primary border-primary/20" : "hover:bg-muted"
                      )}
                    >
                      <tool.icon className={cn("size-4", cat.color)} />
                      {t(tool.label) || tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function AppHeader() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <header className="h-16 md:h-20 fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm z-[100] w-full flex justify-center">
      <div className="w-full h-full flex items-center justify-between px-3 md:px-8 lg:px-12 max-w-[2000px] mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <MobileNav />
            <Link href="/" className="flex items-center group mr-1 md:mr-2 touch-manipulation">
              <GR7Logo />
            </Link>
            
            <Button 
              asChild
              variant="ghost" 
              className={cn(
                "hidden lg:flex h-10 px-2 font-black text-xs items-center gap-2 transition-all focus-visible:ring-0 border-none shadow-none",
                pathname === '/' ? "text-primary bg-primary/5" : "text-slate-800 dark:text-slate-200 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Link href="/" onClick={() => setActiveMenu(null)}>
                <HomeIcon className="size-4" />
                <span className="hidden xl:inline">{t('home')}</span>
              </Link>
            </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 mr-1 xl:mr-2">
                {CATEGORIES.map((cat) => (
                  <NavDropdown 
                    key={cat.name} 
                    category={cat} 
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                  />
                ))}
            </nav>

            <div className="hidden h-6 w-px bg-border mx-1 xl:mx-2 xl:block" />

            <div className="flex items-center gap-1 md:gap-2">
                <a href="mailto:gr7imagepdf@gmail.com" className="support-uiverse px-2 md:px-4 touch-manipulation h-10">
                    <span className="uiverse-tooltip hidden md:block">gr7imagepdf@gmail.com</span>
                    <Mail className="size-4 md:mr-2" />
                    <span className="hidden md:inline text-[10px] font-black uppercase tracking-tighter">Support</span>
                </a>
                
                <SettingsMenu />
                <ThemeToggle />
            </div>
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto border-t bg-white/50 dark:bg-black/20 py-12 md:py-20 w-full flex justify-center shrink-0 no-print">
      <div className="w-full px-6 md:px-12 lg:px-20 max-w-[2000px] mx-auto flex flex-col gap-12 md:gap-20">
        
        {/* Main Grid for 58+ Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            
            {/* Column 1: Branding & Intro */}
            <div className="space-y-6 lg:col-span-1">
                <Link href="/" className="inline-block">
                    <GR7Logo />
                </Link>
                <p className="text-xs text-muted-foreground font-bold uppercase leading-relaxed tracking-tight opacity-70">
                    GR7 Tools Hub is a professional, high-fidelity studio for all your digital document and image needs. 100% Private local RAM processing.
                </p>
                <div className="flex items-center gap-4 pt-4">
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="size-4" /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="size-4" /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="size-4" /></a>
                </div>
            </div>

            {/* Column 2: Image Tools */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-primary/10 pb-2">Image Engine</h4>
                <ul className="grid gap-2">
                    {CATEGORIES.find(c => c.name === 'image_tools')?.tools.map(tool => (
                        <li key={tool.href}>
                            <Link href={tool.href} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">
                                {t(tool.label)}
                            </Link>
                        </li>
                    ))}
                    <li><Link href="/ai-upscaler" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">AI Image Upscaler</Link></li>
                    <li><Link href="/marriage-biodata" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">Marriage Biodata Maker</Link></li>
                </ul>
            </div>

            {/* Column 3: PDF Studio */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 border-b border-rose-500/10 pb-2">PDF Toolkit</h4>
                <ul className="grid gap-2">
                    {CATEGORIES.find(c => c.name === 'pdf_tools')?.tools.map(tool => (
                        <li key={tool.href}>
                            <Link href={tool.href} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">
                                {t(tool.label)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Column 4: Finance & Calc */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 border-b border-emerald-600/10 pb-2">Finance Hub</h4>
                <ul className="grid gap-2">
                    {CATEGORIES.find(c => c.name === 'calculator_pro')?.tools.map(tool => (
                        <li key={tool.href}>
                            <Link href={tool.href} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">
                                {t(tool.label)}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Column 5: Converters & Media */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-600/10 pb-2">Utilities</h4>
                <div className="space-y-6">
                    <ul className="grid gap-2">
                        {CATEGORIES.find(c => c.name === 'converter_tools')?.tools.map(tool => (
                            <li key={tool.href}>
                                <Link href={tool.href} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">
                                    {t(tool.label)}
                                </Link>
                            </li>
                        ))}
                        {CATEGORIES.find(c => c.name === 'file_tools')?.tools.map(tool => (
                            <li key={tool.href}>
                                <Link href={tool.href} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">
                                    {t(tool.label)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2">
                         <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-600/10 pb-2 mb-3">Multimedia</h4>
                         <ul className="grid gap-2">
                            <li><Link href="/video-to-mp3" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">Video to MP3</Link></li>
                            <li><Link href="/rotate-video" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">Rotate Video</Link></li>
                            <li><Link href="/merge-audio" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">Audio Merger</Link></li>
                            <li><Link href="/mp3-cutter" className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight">MP3 Cutter Studio</Link></li>
                         </ul>
                    </div>
                </div>
            </div>

        </div>

        <div className="w-full h-px bg-border/50" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} GR7 TOOLS HUB STUDIO
                </p>
                <div className="flex items-center gap-6">
                    <Link href="/privacy-policy" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest">{t('privacy_policy')}</Link>
                    <Link href="/terms-of-service" className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest">{t('terms_of_service')}</Link>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-green-600 bg-green-500/5 px-4 py-1.5 rounded-full border border-green-500/10 shadow-sm">
                    <ShieldCheck className="size-3.5" /> Client-Side Processing
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-600 bg-blue-500/5 px-4 py-1.5 rounded-full border border-blue-100/10 shadow-sm">
                    <Zap className="size-3.5" /> No Data Storage
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}

export default function AppLayout({children}: {children: React.ReactNode}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  
  return (
    <div className="flex flex-col min-h-screen w-full bg-transparent relative overflow-x-hidden pt-16 md:pt-20">
      <AppHeader />
      <main className="flex-1 flex flex-col w-full relative min-h-[calc(100vh-80px)] overflow-x-hidden">
         <div className="w-full flex-1 flex flex-col items-center px-0 p-0 m-0">
            <div className="w-full flex-1 flex flex-col items-center bg-transparent min-h-[75vh]">
              {children}
            </div>
            <AppFooter />
         </div>
      </main>
    </div>
  );
}
