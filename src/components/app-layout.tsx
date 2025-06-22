
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
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
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

const menuItems = [
  {href: '/image-compress', label: 'Image Compress', icon: Shrink, color: 'text-green-500'},
  {href: '/image-resize', label: 'Resize Image', icon: Maximize, color: 'text-fuchsia-500'},
  {href: '/crop-image', label: 'Crop Image', icon: Crop, color: 'text-blue-500'},
  {href: '/image-to-jpg', label: 'Image to JPG', icon: FileOutput, color: 'text-yellow-500'},
  {href: '/image-to-png', label: 'Image to PNG', icon: FileOutput, color: 'text-sky-500'},
  {href: '/image-to-pdf', label: 'Image to PDF', icon: FileDigit, color: 'text-red-500'},
  {href: '/pdf-to-image', label: 'PDF to Image', icon: ImageIcon, color: 'text-orange-500'},
  {href: '/compress-pdf', label: 'Compress PDF', icon: FileArchive, color: 'text-purple-500'},
  {href: '/merge-pdf', label: 'Merge PDF', icon: Merge, color: 'text-pink-500'},
  {href: '/edit-pdf', label: 'Edit PDF', icon: FilePenLine, color: 'text-lime-500'},
  {href: '/split-pdf', label: 'Split PDF', icon: Scissors, color: 'text-cyan-500'},
  {href: '/scan-to-pdf', label: 'Scan to PDF', icon: ScanLine, color: 'text-indigo-500'},
  {href: '/protect-pdf', label: 'Protect PDF', icon: Lock, color: 'text-gray-500'},
  {href: '/unlock-pdf', label: 'Unlock PDF', icon: Unlock, color: 'text-teal-500'},
];

function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

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
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                size="lg"
                variant="outline"
                isActive={pathname === item.href}
                tooltip={item.label}
                asChild
              >
                <Link href={item.href} onClick={() => setOpenMobile(false)}>
                  <item.icon className={cn("size-5", item.color)} />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm animate-header-glow lg:h-[60px] lg:px-6">
      <div className="flex flex-1 items-center">
        <SidebarTrigger className="md:hidden" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Link href="/" className="font-headline text-xl font-bold tracking-wider text-primary lg:text-2xl whitespace-nowrap">
            Welcome to ShrinkRay
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end">
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
