"use client";

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Crop,
  FileArchive,
  FileDigit,
  FileOutput,
  Image as ImageIcon,
  Merge,
  ScanLine,
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
  Loader2,
  LayoutGrid,
  Mail,
  FileCode,
  FileScan,
  FileText,
  PenLine,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {ThemeToggle} from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { AboutDialog } from './about-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/language-context';

function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { t } = useLanguage();

  const menuItems = [
    {href: '/image-compress', labelKey: 'image_compress_label', icon: Shrink, color: 'text-blue-500'},
    {href: '/image-resize', labelKey: 'resize_image_label', icon: Maximize, color: 'text-indigo-500'},
    {href: '/crop-image', labelKey: 'crop_image_label', icon: Crop, color: 'text-cyan-500'},
    {href: '/remove-background', labelKey: 'remove_background_label', icon: Eraser, color: 'text-rose-500'},
    {href: '/remove-signature', labelKey: 'remove_signature_label', icon: PenLine, color: 'text-orange-500'},
    {href: '/enhance-photo', labelKey: 'enhance_photo_label', icon: Wand2, color: 'text-violet-500'},
    {href: '/image-to-text', labelKey: 'image_to_text_label', icon: FileScan, color: 'text-teal-500'},
    {href: '/image-to-jpg', labelKey: 'image_to_jpg_label', icon: FileOutput, color: 'text-amber-500'},
    {href: '/image-to-png', labelKey: 'image_to_png_label', icon: FileOutput, color: 'text-sky-500'},
    {href: '/image-to-pdf', labelKey: 'image_to_pdf_label', icon: FileDigit, color: 'text-red-500'},
    {href: '/text-to-pdf', labelKey: 'text_to_pdf_label', icon: FileText, color: 'text-slate-500'},
    {href: '/html-to-pdf', labelKey: 'html_to_pdf_label', icon: FileCode, color: 'text-orange-600' },
    {href: '/pdf-to-image', labelKey: 'pdf_to_image_label', icon: ImageIcon, color: 'text-orange-500'},
    {href: '/compress-pdf', labelKey: 'compress_pdf_label', icon: FileArchive, color: 'text-purple-500'},
    {href: '/merge-pdf', labelKey: 'merge_pdf_label', icon: Merge, color: 'text-pink-500'},
    {href: '/split-pdf', labelKey: 'split_pdf_label', icon: Scissors, color: 'text-cyan-600'},
    {href: '/crop-pdf', labelKey: 'crop_pdf_label', icon: Crop, color: 'text-yellow-600'},
    {href: '/scan-to-pdf', labelKey: 'scan_to_pdf_label', icon: ScanLine, color: 'text-emerald-500'},
    {href: '/unlock-pdf', labelKey: 'unlock_pdf_label', icon: Unlock, color: 'text-green-500'},
    {href: '/add-watermark', labelKey: 'add_watermark_label', icon: Copyright, color: 'text-rose-600'},
    {href: '/add-page-numbers', labelKey: 'add_page_numbers_label', icon: NotebookPen, color: 'text-lime-600'},
    {href: '/create-zip', labelKey: 'create_zip_label', icon: Archive, color: 'text-violet-600'},
    {href: '/unzip-file', labelKey: 'unzip_file_label', icon: ArchiveRestore, color: 'text-stone-500'},
    {href: '/standard-calculator', labelKey: 'standard_calculator_label', icon: Calculator, color: 'text-blue-600'},
    {href: '/loan-calculator', labelKey: 'loan_emi_calculator_label', icon: Landmark, color: 'text-indigo-600'},
    {href: '/age-calculator', labelKey: 'age_calculator_label', icon: Cake, color: 'text-rose-500'},
    {href: '/percentage-calculator', labelKey: 'percentage_calculator_label', icon: Percent, color: 'text-blue-500'},
    {href: '/fuel-cost-calculator', labelKey: 'fuel_cost_calculator_label', icon: Route, color: 'text-amber-600'},
    {href: '/interest-calculator', labelKey: 'interest_calculator_label', icon: Coins, color: 'text-yellow-600'},
    {href: '/sales-tax-calculator', labelKey: 'sales_tax_calculator_label', icon: Receipt, color: 'text-emerald-600'},
  ];

  return (
    <Sidebar className="border-r-0 bg-slate-950">
      <SidebarHeader className="h-28 justify-center border-0 px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-premium p-3 shadow-xl shadow-primary/20 animate-pulse-subtle">
            <LayoutGrid className="h-full w-full text-white" />
          </div>
          <div className="flex flex-col">
              <span className="text-lg font-black font-headline text-white leading-none tracking-tighter">GRs HUB</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Utility Pro</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarMenu className="gap-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                size="lg"
                isActive={pathname === item.href}
                tooltip={t(item.labelKey)}
                asChild
                className="h-14 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all data-[active=true]:bg-primary/10 data-[active=true]:border-primary/30"
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)} className="flex items-center gap-4">
                  <item.icon className={cn("size-6 shrink-0 transition-transform group-hover:scale-110", item.color)} />
                  <span className="text-sm font-bold text-slate-300 group-data-[collapsible=icon]:hidden leading-tight truncate">{t(item.labelKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-slate-900/50">
        <AboutDialog />
      </SidebarFooter>
    </Sidebar>
  );
}

function SettingsMenu() {
  const { setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-primary/10">
          <Settings className="h-6 w-6 text-foreground" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl">
        <DropdownMenuLabel className="font-headline text-[10px] tracking-widest uppercase text-muted-foreground pb-2">{t('language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-xl font-bold py-3">🇺🇸 {t('english')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hi')} className="rounded-xl font-bold py-3">🇮🇳 {t('hindi')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')} className="rounded-xl font-bold py-3">🇪🇸 {t('spanish')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 h-24 glass-panel border-b-0 shadow-lg px-4 md:px-8">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <SidebarTrigger className="h-12 w-12 rounded-xl hover:bg-primary/10" />
            <div className="h-8 w-px bg-border hidden sm:block" />
            <Link href="/" className="hidden sm:flex items-center gap-2 group">
                <h1 className="text-xl font-black tracking-tighter transition-colors group-hover:text-primary">
                    <span className="text-foreground">GRs </span>
                    <span className="text-gradient-primary">Tools</span>
                </h1>
            </Link>
        </div>

        <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden lg:flex items-center gap-2 rounded-full hover:bg-primary/5 px-4 h-12">
                <a href="mailto:gaurav.thearmy@yahoo.com">
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">Support</span>
                </a>
            </Button>
            <div className="h-8 w-px bg-border mx-2" />
            <SettingsMenu />
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function AppLayoutSkeleton() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-slate-950">
            <div className="flex flex-col items-center gap-8 animate-fade-in-up">
                 <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-premium p-4 shadow-2xl animate-pulse">
                    <LayoutGrid className="h-full w-full text-white" />
                </div>
                 <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-white font-headline">GRs HUB</h1>
                    <p className="text-sm font-black text-primary uppercase tracking-[0.3em]">Initializing Core...</p>
                 </div>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    )
}

export default function AppLayout({children}: {children: React.ReactNode}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <AppLayoutSkeleton />;
  }
  
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <SidebarInset className="bg-transparent relative">
             <div className="absolute top-0 right-0 size-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse" />
             <div className="absolute bottom-0 left-0 size-[500px] bg-accent/5 blur-[150px] -z-10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
             {children}
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
