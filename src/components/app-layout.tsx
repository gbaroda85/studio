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
  FileShield,
  BookOpen,
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
    <Sidebar className="border-r border-border/50 bg-white dark:bg-sidebar transition-colors">
      <SidebarHeader className="h-20 justify-center border-0 px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-premium p-2 shadow-xl shadow-primary/20 animate-pulse-subtle">
            <LayoutGrid className="h-full w-full text-white" />
          </div>
          <div className="flex flex-col">
              <span className="text-base font-black font-headline text-foreground leading-none tracking-tighter">GR7 HUB</span>
              <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Utility Pro</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4 pb-10">
        <SidebarMenu className="gap-1.5">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                size="lg"
                isActive={pathname === item.href}
                tooltip={t(item.labelKey)}
                asChild
                className="h-12 rounded-xl border border-transparent hover:border-border/50 hover:bg-muted transition-all data-[active=true]:bg-primary/10 data-[active=true]:border-primary/30"
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)} className="flex items-center gap-4">
                  <item.icon className={cn("size-5 shrink-0 transition-transform group-hover:scale-110", item.color)} />
                  <span className="text-[13px] font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden leading-tight truncate">{t(item.labelKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          <DropdownMenuSeparator className="my-4 opacity-50" />
          <SidebarMenuItem>
             <SidebarMenuButton asChild size="lg" className="rounded-xl hover:bg-muted" tooltip={t('privacy_policy')}>
                <Link href="/privacy-policy" onClick={() => setOpenMobile(false)}>
                   <FileShield className="size-5 text-muted-foreground" />
                   <span className="text-[13px] font-bold">{t('privacy_policy')}</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <SidebarMenuButton asChild size="lg" className="rounded-xl hover:bg-muted" tooltip={t('terms_of_service')}>
                <Link href="/terms-of-service" onClick={() => setOpenMobile(false)}>
                   <BookOpen className="size-5 text-muted-foreground" />
                   <span className="text-[13px] font-bold">{t('terms_of_service')}</span>
                </Link>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-muted/20">
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
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-primary/10">
          <Settings className="h-5 w-5 text-foreground" />
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
    <header className="h-16 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-border/50 shadow-sm px-4 md:px-8 z-50 shrink-0">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <SidebarTrigger className="h-10 w-10 rounded-xl hover:bg-primary/10" />
            <div className="h-6 w-px bg-border hidden sm:block" />
            <Link href="/" className="hidden sm:flex items-center gap-2 group">
                <h1 className="text-lg font-black tracking-tighter transition-colors group-hover:text-primary">
                    <span className="text-foreground">GR7 </span>
                    <span className="text-gradient-primary">Tools</span>
                </h1>
            </Link>
        </div>

        <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden lg:flex items-center gap-2 rounded-full hover:bg-primary/5 px-4 h-10">
                <a href="mailto:gaurav.thearmy@yahoo.com">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Support</span>
                </a>
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
            <SettingsMenu />
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto border-t bg-white/50 dark:bg-black/20 py-12 px-4 md:px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2 space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-premium p-1.5 shadow-lg">
                <LayoutGrid className="size-full text-white" />
            </div>
            <span className="text-xl font-black font-headline tracking-tighter">GR7 TOOLS</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm font-medium leading-relaxed">
            A specialized collection of professional-grade web utilities for instant file transformation. Everything happens locally in your browser for 100% privacy.
          </p>
        </div>
        
        <div>
          <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm font-bold text-muted-foreground">
            <li><Link href="/tools" className="hover:text-primary transition-colors">Browse All Tools</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">{t('privacy_policy')}</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">{t('terms_of_service')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-6">Connect</h4>
          <ul className="space-y-4 text-sm font-bold text-muted-foreground">
            <li><a href="mailto:gaurav.thearmy@yahoo.com" className="hover:text-primary transition-colors">Email Support</a></li>
            <li className="text-[10px] uppercase font-black opacity-50 pt-2">Developed by Gaurav S</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-border/50 text-center">
         <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} GR7 IMAGE PDF TOOLS HUB • ALL RIGHTS RESERVED
         </p>
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
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <AppHeader />
          <SidebarInset className="bg-transparent relative overflow-y-auto flex-1 outline-none">
             <div className="absolute top-0 right-0 size-[500px] bg-primary/5 blur-[150px] -z-10 rounded-full animate-pulse pointer-events-none" />
             <div className="absolute bottom-0 left-0 size-[500px] bg-accent/5 blur-[150px] -z-10 rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
             <div className="flex flex-col min-h-full">
                <div className="flex-1 pb-20">
                  {children}
                </div>
                <AppFooter />
             </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
