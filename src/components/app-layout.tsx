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
  Home,
  UserCircle,
  Infinity,
  Gauge,
  AreaChart,
  Fuel,
  Waves,
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
  Volume2
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
    name: "file_tools",
    icon: Archive,
    color: "text-violet-500",
    tools: [
      { href: '/aadhaar-printer', label: 'aadhaar_printer_label', icon: Printer },
      { href: '/create-zip', label: 'create_zip_label', icon: Archive },
      { href: '/unzip-file', label: 'unzip_file_label', icon: ArchiveRestore },
    ]
  },
  {
    name: "calculator_pro",
    icon: Calculator,
    color: "text-emerald-500",
    tools: [
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
      { href: '/mortgage-calculator', label: 'mortgage_calculator_label', icon: Home },
    ]
  },
  {
    name: "converter_tools",
    icon: Infinity,
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
    name: "audio_tools",
    icon: Volume2,
    color: "text-indigo-600",
    tools: [
      { href: '/mp3-cutter', label: 'mp3_cutter_label', icon: Volume2 },
      { href: '/audio-converter', label: 'audio_converter_label', icon: FileOutput },
    ]
  },
  {
    name: "video_tools",
    icon: Music,
    color: "text-indigo-500",
    tools: [
      { href: '/video-to-mp3', label: 'video_to_mp3_label', icon: Music },
    ]
  }
];

function GR7Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative size-8 md:size-12 flex items-center justify-center bg-white border-[1.5px] border-slate-200 rounded-lg md:rounded-xl shadow-sm overflow-hidden">
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

function NavDropdown({ category }: { category: typeof CATEGORIES[0] }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
                "h-10 px-4 font-black text-xs flex items-center gap-2 text-slate-800 dark:text-slate-200 hover:text-primary hover:bg-primary/5 transition-all focus-visible:ring-0 border-none shadow-none group",
                "data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
            )}
          >
            <category.icon className={cn("size-4 transition-transform group-hover:scale-110", category.color)} />
            <span className="hidden xl:inline">{t(category.name)}</span>
            <ChevronDown className="size-3 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-64 p-2 rounded-2xl shadow-2xl border-2 grid grid-cols-1 gap-1 bg-white dark:bg-slate-900 z-[110]"
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
            <Link href="/" onClick={() => setOpen(false)} className="inline-block">
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
                <Home className="size-4" />
                {t('home')}
              </Link>
            </div>

            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 pl-2">
                  <cat.icon className="size-3" /> {t(cat.name)}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl font-bold text-xs transition-all border border-transparent hover:border-border min-h-[48px]",
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

  return (
    <header className="h-16 md:h-20 fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm z-[100] w-full flex justify-center">
      <div className="w-full h-full flex items-center justify-between px-3 md:px-8 lg:px-12">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <MobileNav />
            <Link href="/" className="flex items-center group mr-1 md:mr-2 touch-manipulation">
              <GR7Logo />
            </Link>
            
            <Button 
              asChild
              variant="ghost" 
              className={cn(
                "hidden lg:flex h-10 px-4 font-black text-xs items-center gap-2 transition-all focus-visible:ring-0 border-none shadow-none",
                pathname === '/' ? "text-primary bg-primary/5" : "text-slate-800 dark:text-slate-200 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Link href="/">
                <Home className="size-4" />
                <span className="hidden xl:inline">{t('home')}</span>
              </Link>
            </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
            <nav className="hidden lg:flex items-center gap-1 mr-2">
                {CATEGORIES.map((cat) => (
                  <NavDropdown key={cat.name} category={cat} />
                ))}
            </nav>

            <div className="hidden h-6 w-px bg-border mx-2 xl:block" />

            <div className="flex items-center gap-1 md:gap-2">
                <a href="mailto:grs.business29@gmail.com" className="support-uiverse px-2 md:px-4 touch-manipulation h-10">
                    <span className="uiverse-tooltip hidden md:block">grs.business29@gmail.com</span>
                    <Mail className="size-4 md:mr-2" />
                    <span className="hidden md:inline text-xs font-black">Support</span>
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
    <footer className="mt-auto border-t bg-white/50 dark:bg-black/20 py-12 md:py-16 w-full flex justify-center shrink-0">
      <div className="w-full px-4 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
            <div className="md:col-span-2 space-y-4 md:space-y-6">
            <Link href="/" className="flex items-center gap-2 inline-block">
                <GR7Logo />
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed">
                A specialized collection of professional-grade web utilities for instant file transformation. Everything happens locally in your browser for 100% privacy.
            </p>
            <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-green-600 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/10">
                    <ShieldCheck className="size-3" /> Client-Side
                </div>
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-blue-600 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
                    <Zap className="size-3" /> No Server Storage
                </div>
            </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:col-span-2">
                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-4 md:mb-6">Quick Links</h4>
                    <ul className="space-y-3 md:space-y-4 text-sm font-bold text-muted-foreground">
                        <li><Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link></li>
                        <li><Link href="/tools" className="hover:text-primary transition-colors">Browse All Tools</Link></li>
                        <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">{t('privacy_policy')}</Link></li>
                        <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">{t('terms_of_service')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-4 md:mb-6">Connect</h4>
                    <ul className="space-y-3 md:space-y-4 text-sm font-bold text-muted-foreground">
                        <li><a href="mailto:grs.business29@gmail.com" className="hover:text-primary transition-colors">Email Support</a></li>
                        <li className="text-[10px] uppercase font-black opacity-50 pt-2">Developed by Gaurav S</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="w-full mt-10 md:mt-12 pt-8 border-t border-border/50 text-center">
            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] md:tracking-[0.3em]">
                © {new Date().getFullYear()} GR7 IMAGE PDF TOOLS HUB Studio
            </p>
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
