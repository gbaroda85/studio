
"use client";

import Link from 'next/link';
import {usePathname} from 'next/navigation';
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
    {href: '/edit-pdf', labelKey: 'edit_pdf_label', icon: FilePenLine, color: 'text-lime-500'},
    {href: '/split-pdf', labelKey: 'split_pdf_label', icon: Scissors, color: 'text-cyan-500'},
    {href: '/crop-pdf', labelKey: 'crop_pdf_label', icon: Crop, color: 'text-amber-500'},
    {href: '/scan-to-pdf', labelKey: 'scan_to_pdf_label', icon: ScanLine, color: 'text-indigo-500'},
    {href: '/protect-pdf', labelKey: 'protect_pdf_label', icon: Lock, color: 'text-gray-500'},
    {href: '/unlock-pdf', labelKey: 'unlock_pdf_label', icon: Unlock, color: 'text-teal-500'},
    {href: '/add-watermark', labelKey: 'add_watermark_label', icon: Copyright, color: 'text-rose-500'},
    {href: '/create-zip', labelKey: 'create_zip_label', icon: Archive, color: 'text-violet-500'},
    {href: '/unzip-file', labelKey: 'unzip_file_label', icon: ArchiveRestore, color: 'text-stone-500'},
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shrink className="h-6 w-6 text-primary" />
            <span className="group-data-[collapsible=icon]:hidden">ShrinkRay</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                size="lg"
                variant="outline"
                isActive={pathname === item.href}
                tooltip={t(item.labelKey)}
                asChild
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)}>
                  <item.icon className={cn("size-5", item.color)} />
                  <span>{t(item.labelKey)}</span>
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
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setLanguage('en')}>{t('english')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('hi')}>{t('hindi')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('es')}>{t('spanish')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppHeader() {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm animate-header-glow lg:h-[60px] lg:px-6">
      <div className="flex flex-1 items-center">
        <SidebarTrigger className="md:hidden" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Link href="/" className="font-headline text-xl font-bold tracking-wider text-primary lg:text-2xl whitespace-nowrap">
            {t('welcome')}
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
    <SidebarProvider>
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
