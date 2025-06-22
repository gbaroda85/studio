"use client";

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
  Crop,
  FileArchive,
  FileDigit,
  FileOutput,
  Image as ImageIcon,
  Merge,
  ScanLine,
  Shrink,
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
} from '@/components/ui/sidebar';
import {ThemeToggle} from '@/components/theme-toggle';
import {Button} from '@/components/ui/button';

const menuItems = [
  {href: '/image-compress', label: 'Image Compress', icon: Shrink},
  {href: '/crop-image', label: 'Crop Image', icon: Crop},
  {href: '/image-to-jpg', label: 'Image to JPG', icon: FileOutput},
  {href: '/image-to-png', label: 'Image to PNG', icon: FileOutput},
  {href: '/image-to-pdf', label: 'Image to PDF', icon: FileDigit},
  {href: '/pdf-to-image', label: 'PDF to Image', icon: ImageIcon},
  {href: '/compress-pdf', label: 'Compress PDF', icon: FileArchive},
  {href: '/merge-pdf', label: 'Merge PDF', icon: Merge},
  {href: '/scan-to-pdf', label: 'Scan to PDF', icon: ScanLine},
];

function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            size="icon"
            className="group-data-[collapsible=icon]:hidden"
          >
            <Link href="/">
              <Shrink className="h-6 w-6 text-primary" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">
            ShrinkRay
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
                asChild
              >
                <Link href={item.href}>
                  <item.icon />
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
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <ThemeToggle />
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
