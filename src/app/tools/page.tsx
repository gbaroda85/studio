
"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import {FeatureCard} from '@/components/feature-card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Archive,
  ArchiveRestore,
  Calculator,
  Landmark,
  Cake,
  Percent,
  AreaChart,
  Fuel,
  Gauge,
  Coins,
  Waves,
  Route,
  Search,
  Receipt,
  Loader2,
  Eraser,
  Wand2,
  NotebookPen,
  FileCode,
  FileScan,
  FileText,
  PenLine,
  UserCircle,
  Lock,
  Printer,
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
  Sparkles,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Menu,
  ChevronRight,
  PenTool,
  Home as HomeIcon
} from 'lucide-react';
import {useLanguage} from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';

function ToolsPageContent() {
  const {t} = useLanguage();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const validTabs = ['all', 'image', 'pdf', 'audio', 'video', 'file', 'calculator', 'converters'];
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'all';

  const imageFeatures = [
    {
      href: '/passport-date-name',
      labelKey: 'passport_date_name_label',
      descriptionKey: 'passport_date_name_description',
      icon: CalendarDays,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50'
    },
    {
      href: '/enhance-photo',
      labelKey: 'enhance_photo_label',
      descriptionKey: 'enhance_photo_description',
      icon: Wand2,
      color: 'bg-violet-600',
      lightBg: 'bg-[#f5f3ff]'
    },
    {
      href: '/signature-resizer',
      labelKey: 'signature_resizer_label',
      descriptionKey: 'signature_resizer_description',
      icon: PenTool,
      color: 'bg-orange-600',
      lightBg: 'bg-orange-50'
    },
    {
      href: '/image-to-pdf',
      labelKey: 'image_to_pdf_label',
      descriptionKey: 'image_to_pdf_description',
      icon: FileDigit,
      color: 'bg-red-500',
      lightBg: 'bg-[#fff1f2]'
    },
    {
      href: '/image-compress',
      labelKey: 'image_compress_label',
      descriptionKey: 'image_compress_description',
      icon: Shrink,
      color: 'bg-blue-600',
      lightBg: 'bg-[#fefce8]'
    },
    {
      href: '/crop-image',
      labelKey: 'crop_image_label',
      descriptionKey: 'crop_image_description',
      icon: Crop,
      color: 'bg-cyan-500',
      lightBg: 'bg-[#ecfeff]'
    },
    {
      href: '/image-resize',
      labelKey: 'resize_image_label',
      descriptionKey: 'resize_image_description',
      icon: Maximize,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/remove-background',
      labelKey: 'remove_background_label',
      descriptionKey: 'remove_background_description',
      icon: Eraser,
      color: 'bg-rose-500',
      lightBg: 'bg-rose-50'
    },
    {
      href: '/remove-signature',
      labelKey: 'remove_signature_label',
      descriptionKey: 'remove_signature_description',
      icon: PenLine,
      color: 'bg-orange-500',
      lightBg: 'bg-[#fff7ed]'
    },
    {
      href: '/passport-photo',
      labelKey: 'passport_photo_label',
      descriptionKey: 'passport_photo_description',
      icon: UserCircle,
      color: 'bg-emerald-600',
      lightBg: 'bg-[#f0fdfa]'
    },
    {
      href: '/image-to-jpg',
      labelKey: 'image_to_jpg_label',
      descriptionKey: 'image_to_jpg_description',
      icon: FileOutput,
      color: 'bg-yellow-500',
      lightBg: 'bg-[#fefce8]'
    },
    {
      href: '/image-to-png',
      labelKey: 'image_to_png_label',
      descriptionKey: 'image_to_png_description',
      icon: FileOutput,
      color: 'bg-sky-500',
      lightBg: 'bg-[#ecfeff]'
    },
    {
      href: '/image-to-text',
      labelKey: 'image_to_text_label',
      descriptionKey: 'image_to_text_description',
      icon: FileScan,
      color: 'bg-teal-500',
      lightBg: 'bg-[#f0fdfa]'
    },
  ];

  const pdfFeatures = [
    {
      href: '/organize-pdf',
      labelKey: 'organize_pdf_label',
      descriptionKey: 'organize_pdf_description',
      icon: Layers,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#eef2ff]'
    },
    {
      href: '/merge-pdf',
      labelKey: 'merge_pdf_label',
      descriptionKey: 'merge_pdf_description',
      icon: Merge,
      color: 'bg-emerald-600',
      lightBg: 'bg-[#f0fdf4]'
    },
    {
      href: '/rotate-pdf',
      labelKey: 'rotate_pdf_label',
      descriptionKey: 'rotate_pdf_description',
      icon: RotateCw,
      color: 'bg-blue-500',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/lock-pdf',
      labelKey: 'lock_pdf_label',
      descriptionKey: 'lock_pdf_description',
      icon: Lock,
      color: 'bg-slate-900',
      lightBg: 'bg-[#f8fafc]'
    },
    {
      href: '/compress-pdf',
      labelKey: 'compress_pdf_label',
      descriptionKey: 'compress_pdf_description',
      icon: FileArchive,
      color: 'bg-rose-600',
      lightBg: 'bg-[#fff1f2]'
    },
    {
      href: '/edit-pdf',
      labelKey: 'edit_pdf_label',
      descriptionKey: 'edit_pdf_description',
      icon: FilePenLine,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/document-scan',
      labelKey: 'document_scan_label',
      descriptionKey: 'document_scan_description',
      icon: Sparkles,
      color: 'bg-primary',
      lightBg: 'bg-[#f0fdf4]'
    },
    {
      href: '/unlock-pdf',
      labelKey: 'unlock_pdf_label',
      descriptionKey: 'unlock_pdf_description',
      icon: Unlock,
      color: 'bg-teal-500',
      lightBg: 'bg-[#f0fdfa]'
    },
    {
      href: '/split-pdf',
      labelKey: 'split_pdf_label',
      descriptionKey: 'split_pdf_description',
      icon: Scissors,
      color: 'bg-cyan-600',
      lightBg: 'bg-[#ecfeff]'
    },
    {
      href: '/crop-pdf',
      labelKey: 'crop_pdf_label',
      descriptionKey: 'crop_pdf_description',
      icon: Crop,
      color: 'bg-amber-600',
      lightBg: 'bg-[#fffbeb]'
    },
    {
      href: '/pdf-to-image',
      labelKey: 'pdf_to_image_label',
      descriptionKey: 'pdf_to_image_description',
      icon: ImageIcon,
      color: 'bg-orange-500',
      lightBg: 'bg-[#fff7ed]'
    },
    {
      href: '/html-to-pdf',
      labelKey: 'html_to_pdf_label',
      descriptionKey: 'html_to_pdf_description',
      icon: FileCode,
      color: 'bg-orange-600',
      lightBg: 'bg-[#fff7ed]'
    },
    {
      href: '/text-to-pdf',
      labelKey: 'text_to_pdf_label',
      descriptionKey: 'text_to_pdf_description',
      icon: FileText,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#f8fafc]'
    },
    {
      href: '/add-watermark',
      labelKey: 'add_watermark_label',
      descriptionKey: 'add_watermark_description',
      icon: Copyright,
      color: 'bg-rose-500',
      lightBg: 'bg-[#fff1f2]'
    },
    {
      href: '/add-page-numbers',
      labelKey: 'add_page_numbers_label',
      descriptionKey: 'add_page_numbers_description',
      icon: NotebookPen,
      color: 'bg-emerald-500',
      lightBg: 'bg-[#f7fee7]'
    },
  ];

  const audioFeatures = [
    {
      href: '/merge-audio',
      labelKey: 'audio_merger_label',
      descriptionKey: 'audio_merger_description',
      icon: Merge,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#eef2ff]'
    },
    {
      href: '/compress-mp3',
      labelKey: 'compress_mp3_label',
      descriptionKey: 'compress_mp3_description',
      icon: FileArchive,
      color: 'bg-violet-600',
      lightBg: 'bg-[#f5f3ff]'
    },
    {
      href: '/mp3-cutter',
      labelKey: 'mp3_cutter_label',
      descriptionKey: 'mp3_cutter_description',
      icon: Scissors,
      color: 'bg-rose-600',
      lightBg: 'bg-[#fff1f2]'
    },
    {
      href: '/audio-converter',
      labelKey: 'audio_converter_label',
      descriptionKey: 'audio_converter_description',
      icon: FileOutput,
      color: 'bg-blue-600',
      lightBg: 'bg-[#eff6ff]'
    },
  ];

  const videoFeatures = [
    {
      href: '/video-to-mp3',
      labelKey: 'video_to_mp3_label',
      descriptionKey: 'video_to_mp3_description',
      icon: Music,
      color: 'bg-indigo-500',
      lightBg: 'bg-[#eff6ff]'
    },
  ];

  const fileFeatures = [
    {
      href: '/aadhaar-printer',
      labelKey: 'aadhaar_printer_label',
      descriptionKey: 'aadhaar_printer_description',
      icon: Printer,
      color: 'bg-orange-600',
      lightBg: 'bg-[#fff7ed]'
    },
    {
      href: '/create-zip',
      labelKey: 'create_zip_label',
      descriptionKey: 'create_zip_description',
      icon: Archive,
      color: 'bg-violet-500',
      lightBg: 'bg-[#f5f3ff]'
    },
    {
      href: '/unzip-file',
      labelKey: 'unzip_file_label',
      descriptionKey: 'unzip_file_description',
      icon: ArchiveRestore,
      color: 'bg-stone-500',
      lightBg: 'bg-[#f8fafc]'
    },
  ];

  const calculatorFeatures = [
    {
      href: '/salary-slip',
      labelKey: 'salary_slip_label',
      descriptionKey: 'salary_slip_description',
      icon: Banknote,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50'
    },
    {
      href: '/gst-invoice',
      labelKey: 'gst_invoice_label',
      descriptionKey: 'gst_invoice_description',
      icon: Receipt,
      color: 'bg-emerald-600',
      lightBg: 'bg-[#f0fdf4]'
    },
    {
      href: '/gst-calculator',
      labelKey: 'gst_calculator_label',
      descriptionKey: 'gst_calculator_description',
      icon: IndianRupee,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/sip-calculator',
      labelKey: 'sip_calculator_label',
      descriptionKey: 'sip_calculator_description',
      icon: TrendingUp,
      color: 'bg-blue-600',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/fd-rd-calculator',
      labelKey: 'fd_rd_calculator_label',
      descriptionKey: 'fd_rd_calculator_description',
      icon: PiggyBank,
      color: 'bg-orange-500',
      lightBg: 'bg-[#fff7ed]'
    },
    {
      href: '/income-tax-calculator',
      labelKey: 'income_tax_calculator_label',
      descriptionKey: 'income_tax_calculator_description',
      icon: Landmark,
      color: 'bg-blue-700',
      lightBg: 'bg-[#eef2ff]'
    },
    {
      href: '/standard-calculator',
      labelKey: 'standard_calculator_label',
      descriptionKey: 'standard_calculator_description',
      icon: Calculator,
      color: 'bg-cyan-500',
      lightBg: 'bg-[#ecfeff]'
    },
    {
      href: '/loan-calculator',
      labelKey: 'loan_emi_calculator_label',
      descriptionKey: 'loan_emi_calculator_description',
      icon: Landmark,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/age-calculator',
      labelKey: 'age_calculator_label',
      descriptionKey: 'age_calculator_description',
      icon: Cake,
      color: 'bg-rose-500',
      lightBg: 'bg-[#fff1f2]'
    },
    {
      href: '/percentage-calculator',
      labelKey: 'percentage_calculator_label',
      descriptionKey: 'percentage_calculator_description',
      icon: Percent,
      color: 'bg-blue-500',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/fuel-cost-calculator',
      labelKey: 'fuel_cost_calculator_label',
      descriptionKey: 'fuel_cost_calculator_description',
      icon: Route,
      color: 'bg-rose-500',
      lightBg: 'bg-[#fff1f2]'
    },
    {
      href: '/interest-calculator',
      labelKey: 'interest_calculator_label',
      descriptionKey: 'interest_calculator_description',
      icon: Coins,
      color: 'bg-yellow-600',
      lightBg: 'bg-[#fefce8]'
    },
    {
      href: '/sales-tax-calculator',
      labelKey: 'sales_tax_calculator_label',
      descriptionKey: 'sales_tax_calculator_description',
      icon: Receipt,
      color: 'bg-indigo-500',
      lightBg: 'bg-[#eff6ff]'
    },
    {
      href: '/mortgage-calculator',
      labelKey: 'mortgage_calculator_label',
      descriptionKey: 'mortgage_calculator_description',
      icon: HomeIcon,
      color: 'bg-primary',
      lightBg: 'bg-[#f0f9ff]'
    },
  ];
  
  const converterFeatures = [
    {
      href: '/color-picker',
      labelKey: 'color_picker_label',
      descriptionKey: 'color_picker_description',
      icon: Palette,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50'
    },
    {
      href: '/qr-code-generator',
      labelKey: 'qr_code_generator_label',
      descriptionKey: 'qr_code_generator_description',
      icon: QrCode,
      color: 'bg-indigo-600',
      lightBg: 'bg-[#f5f3ff]'
    },
    {
      href: '/barcode-generator',
      labelKey: 'barcode_generator_label',
      descriptionKey: 'barcode_generator_description',
      icon: Barcode,
      color: 'bg-amber-600',
      lightBg: 'bg-[#fefce8]'
    },
    {
      href: '/acceleration-converter',
      labelKey: 'acceleration_converter_label',
      descriptionKey: 'acceleration_converter_description',
      icon: Gauge,
      color: 'bg-emerald-500',
      lightBg: 'bg-[#f0fdf4]'
    },
    {
      href: '/area-converter',
      labelKey: 'area_converter_label',
      descriptionKey: 'area_converter_description',
      icon: AreaChart,
      color: 'bg-lime-500',
      lightBg: 'bg-[#f7fee7]'
    },
    {
      href: '/fuel-converter',
      labelKey: 'fuel_converter_label',
      descriptionKey: 'fuel_converter_description',
      icon: Fuel,
      color: 'bg-orange-500',
      lightBg: 'bg-[#fff7ed]'
    },
    {
      href: '/pressure-converter',
      labelKey: 'pressure_converter_label',
      descriptionKey: 'pressure_converter_description',
      icon: Waves,
      color: 'bg-sky-500',
      lightBg: 'bg-[#f0f9ff]'
    },
  ];

  const filterFeatures = (features: any[]) => {
    if (!searchQuery.trim()) {
      return features;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return features.filter(
      (feature) =>
        t(feature.labelKey).toLowerCase().includes(lowerCaseQuery) ||
        t(feature.descriptionKey).toLowerCase().includes(lowerCaseQuery)
    );
  };
  
  const isSearching = searchQuery.trim() !== '';

  const allFeatureGroups = [
    { value: 'image', categoryKey: 'image_tools', features: imageFeatures, icon: ImageIcon, color: 'text-blue-500' },
    { value: 'pdf', categoryKey: 'pdf_tools', features: pdfFeatures, icon: FileText, color: 'text-rose-500' },
    { value: 'file', categoryKey: 'file_tools', features: fileFeatures, icon: Archive, color: 'text-purple-500' },
    { value: 'calculator', categoryKey: 'calculator_pro', features: calculatorFeatures, icon: Calculator, color: 'text-cyan-500' },
    { value: 'converters', categoryKey: 'converter_tools', features: converterFeatures, icon: Palette, color: 'text-emerald-500' },
    { value: 'audio', categoryKey: 'audio_tools', features: audioFeatures, icon: Volume2, color: 'text-indigo-600' },
    { value: 'video', categoryKey: 'video_tools', features: videoFeatures, icon: Music, color: 'text-indigo-500' },
  ];

  const searchResults = useMemo(() => {
    return allFeatureGroups
        .map(group => ({
            ...group,
            features: filterFeatures(group.features)
        }))
        .filter(group => group.features.length > 0);
  }, [searchQuery, allFeatureGroups, filterFeatures]);

  return (
    <main className="flex-1 bg-transparent w-full flex flex-col items-center">
      <section className="relative w-full max-w-[2000px] pt-10 pb-16 overflow-hidden bg-background dark:bg-[#001D39] border-b-2 border-border/50 rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.7)] mx-auto mb-10 transition-colors duration-500 z-10 transform-gpu">
        <div className="absolute inset-0 z-0">
          <Image 
            src={placeholderData.hero_bg.url} 
            alt="Tools Background" 
            fill 
            className="object-cover opacity-10 dark:opacity-20 transition-opacity duration-700"
            priority
            data-ai-hint={placeholderData.hero_bg.hint}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90" />
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[600px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[600px] bg-accent/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full px-6 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 animate-fade-in-up shadow-sm font-jakarta">
            <LayoutGrid className="size-3" /> THE COMPLETE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tighter animate-fade-in-up leading-tight uppercase font-headline text-black dark:text-white">
            All Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Hub Studio</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-semibold leading-relaxed animate-fade-in-up mb-8 font-body" style={{ animationDelay: '0.1s' }}>
            Everything happens locally in your browser for 100% privacy.
          </p>

          <div className="relative max-w-2xl w-full mx-auto z-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative">
                <input
                    type="search"
                    placeholder={t('search_tools_placeholder')}
                    className="w-full pl-14 h-14 text-base rounded-full shadow-2xl focus-visible:ring-primary/80 focus-visible:ring-4 border-2 border-foreground/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm font-bold outline-none font-body touch-manipulation"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
              </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[2000px] px-5 md:px-16 mt-4 pb-32">
        {isSearching ? (
            <div className="space-y-20 font-body">
            {searchResults.length > 0 ? (
                searchResults.map(({ categoryKey, features, icon: Icon, color }) => (
                <section key={categoryKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500 transform-gpu">
                    <div className="flex items-center gap-3 mb-10">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center bg-muted/5 shadow-md", color)}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tighter">
                        {t(categoryKey)}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                    {features.map((feature) => (
                        <FeatureCard
                        key={feature.href}
                        title={t(feature.labelKey) || feature.labelKey}
                        description={t(feature.descriptionKey) || feature.descriptionKey}
                        href={feature.href}
                        icon={feature.icon}
                        color={feature.color}
                        lightBg={feature.lightBg}
                        />
                    ))}
                    </div>
                </section>
                ))
            ) : (
                <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed">
                <Search className="mx-auto h-20 w-20 mb-6 text-muted-foreground/30" />
                <p className="text-2xl font-semibold uppercase text-muted-foreground">{t('no_tools_found')}</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">Try a different search term.</p>
                </div>
            )}
            </div>
        ) : (
            <Tabs defaultValue={defaultTab} className="w-full font-body">
            <div className="flex justify-center mb-12 md:mb-16">
              <ScrollArea className="w-full h-auto flex justify-center pb-4">
                  <TabsList className="flex h-auto justify-start md:justify-center gap-2 md:gap-4 bg-transparent border-none p-2 px-4 md:px-12 w-max mx-auto">
                      <TabsTrigger 
                        value="all" 
                        className="p-0 h-auto bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0 rounded-full transition-all duration-300"
                      >
                          <div className="uiverse-clay-btn">
                            <div className="button-outer">
                                <div className="button-inner flex items-center gap-3">
                                    <Menu className="size-4 text-primary" />
                                    <span>ALL TOOLS</span>
                                </div>
                            </div>
                          </div>
                      </TabsTrigger>
                      {allFeatureGroups.map(({ value, categoryKey, icon: Icon, color }) => (
                      <TabsTrigger 
                        key={value} 
                        value={value} 
                        className="p-0 h-auto bg-transparent border-none shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0 rounded-full transition-all duration-300"
                      >
                          <div className="uiverse-clay-btn">
                            <div className="button-outer">
                                <div className="button-inner flex items-center gap-3">
                                    <Icon className={cn("size-4 transition-transform", color)} />
                                    <span>{t(categoryKey)}</span>
                                </div>
                            </div>
                          </div>
                      </TabsTrigger>
                      ))}
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            <TabsContent value="all" className="space-y-16 md:space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none transform-gpu">
                {allFeatureGroups.map(({ categoryKey, features, icon: Icon, color }) => (
                    <section key={categoryKey} className="space-y-8 md:space-y-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={cn("size-10 rounded-xl flex items-center justify-center bg-muted/5 shadow-md", color)}>
                                <Icon className="size-6 text-white" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">
                                {t(categoryKey)}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-10">
                            {features.map((feature) => (
                                <FeatureCard
                                    key={feature.href}
                                    title={t(feature.labelKey) || feature.labelKey}
                                    description={t(feature.descriptionKey) || feature.descriptionKey}
                                    href={feature.href}
                                    icon={feature.icon}
                                    color={feature.color}
                                    lightBg={feature.lightBg}
                                />
                            ))}
                        </div>
                    </section>
                ))}
            </TabsContent>

            {allFeatureGroups.map(({ value, features }) => (
                <TabsContent key={value} value={value} className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none transform-gpu">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                    {features.map((feature) => (
                    <FeatureCard
                        key={feature.href}
                        title={t(feature.labelKey) || feature.labelKey}
                        description={t(feature.descriptionKey) || feature.descriptionKey}
                        href={feature.href}
                        icon={feature.icon}
                        color={feature.color}
                        lightBg={feature.lightBg}
                    />
                    ))}
                </div>
                </TabsContent>
            ))}
            </Tabs>
        )}
      </div>
    </main>
  );
}

function ToolsPageLoadingFallback() {
  return (
    <main className="w-full px-8 py-20">
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
      </div>
    </main>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageLoadingFallback />}>
      <ToolsPageContent />
    </Suspense>
  )
}
