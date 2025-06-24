
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
  Lock,
  Merge,
  ScanLine,
  Shrink,
  Unlock,
  Scissors,
  Maximize,
  FilePenLine,
  Info,
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
    {href: '/image-compress', labelKey: 'image_compress_label', icon: Shrink, color: 'text-green-500'},
    {href: '/image-resize', labelKey: 'resize_image_label', icon: Maximize, color: 'text-fuchsia-500'},
    {href: '/crop-image', labelKey: 'crop_image_label', icon: Crop, color: 'text-blue-500'},
    {href: '/image-to-jpg', labelKey: 'image_to_jpg_label', icon: FileOutput, color: 'text-yellow-500'},
    {href: '/image-to-png', labelKey: 'image_to_png_label', icon: FileOutput, color: 'text-sky-500'},
    {href: '/image-to-pdf', labelKey: 'image_to_pdf_label', icon: FileDigit, color: 'text-red-500'},
    {href: '/pdf-to-image', labelKey: 'pdf_to_image_label', icon: ImageIcon, color: 'text-orange-500'},
    {href: '/compress-pdf', labelKey: 'compress_pdf_label', icon: FileArchive, color: 'text-purple-500'},
    {href: '/merge-pdf', labelKey: 'merge_pdf_label', icon: Merge, color: 'text-pink-500'},
    {href: '/split-pdf', labelKey: 'split_pdf_label', icon: Scissors, color: 'text-cyan-500'},
    {href: '/crop-pdf', labelKey: 'crop_pdf_label', icon: Crop, color: 'text-amber-500'},
    {href: '/scan-to-pdf', labelKey: 'scan_to_pdf_label', icon: ScanLine, color: 'text-indigo-500'},
    {href: '/protect-pdf', labelKey: 'protect_pdf_label', icon: Lock, color: 'text-gray-500'},
    {href: '/unlock-pdf', labelKey: 'unlock_pdf_label', icon: Unlock, color: 'text-teal-500'},
    {href: '/add-watermark', labelKey: 'add_watermark_label', icon: Copyright, color: 'text-rose-500'},
    {href: '/create-zip', labelKey: 'create_zip_label', icon: Archive, color: 'text-violet-500'},
    {href: '/unzip-file', labelKey: 'unzip_file_label', icon: ArchiveRestore, color: 'text-stone-500'},
    {href: '/standard-calculator', labelKey: 'standard_calculator_label', icon: Calculator, color: 'text-cyan-500'},
    {href: '/loan-calculator', labelKey: 'loan_emi_calculator_label', icon: Landmark, color: 'text-sky-500'},
    {href: '/age-calculator', labelKey: 'age_calculator_label', icon: Cake, color: 'text-teal-500'},
    {href: '/percentage-calculator', labelKey: 'percentage_calculator_label', icon: Percent, color: 'text-blue-500'},
    {href: '/fuel-cost-calculator', labelKey: 'fuel_cost_calculator_label', icon: Route, color: 'text-rose-500'},
    {
      href: '/interest-calculator',
      labelKey: 'interest_calculator_label',
      icon: Coins,
      color: 'text-yellow-500',
    },
    {
      href: '/sales-tax-calculator',
      labelKey: 'sales_tax_calculator_label',
      icon: Receipt,
      color: 'text-indigo-500',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="justify-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shrink className="h-6 w-6 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden">GRs Tools</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="grid grid-cols-2 flex-row gap-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                size="lg"
                variant="outline"
                isActive={pathname === item.href}
                tooltip={t(item.labelKey)}
                asChild
                className="h-32 flex-col justify-center gap-2 group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:flex-row transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 dark:hover:shadow-primary/10 hover:ring-2 hover:ring-primary/50 data-[active=true]:ring-2 data-[active=true]:ring-foreground"
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)}>
                  <item.icon className={cn("size-12", item.color)} />
                  <span className="text-xl text-center leading-tight whitespace-normal group-data-[collapsible=icon]:hidden">{t(item.labelKey)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AboutDialog />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SettingsMenu() {
  const { setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-slate-700 hover:text-primary-foreground h-12 w-12">
          <Settings className="h-[1.5rem] w-[1.5rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLanguage('en')} className="text-base">{t('english')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hi')} className="text-base">{t('hindi')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')} className="text-base">{t('spanish')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');

  useEffect(() => {
    // This ensures the title is set only on the client-side, avoiding hydration mismatch.
    setTitle(t('site_title'));
  }, [t]);


  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between gap-4 border-b border-b-slate-800 bg-slate-900 px-4 shadow-md lg:h-20 lg:px-6">
      <div className="flex flex-1 items-center">
        <SidebarTrigger className="text-primary-foreground hover:bg-slate-700 h-12 w-12 [&>svg]:h-6 [&>svg]:w-6" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Link href="/" className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary p-2">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full text-primary-foreground"
              >
                  <path d="M10 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 10h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M5 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {title && (
                <span className="font-sans text-3xl font-bold tracking-wider text-primary-foreground whitespace-nowrap lg:text-4xl">
                    {title}
                </span>
            )}
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <SettingsMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function AppLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <SidebarInset>{children}</SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
