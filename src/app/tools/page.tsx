"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {FeatureCard} from '@/components/feature-card';
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
  ScanLine,
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
  Infinity,
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
  LayoutGrid,
  UserCircle,
  Lock,
  Heart,
  Sparkles,
  Printer
} from 'lucide-react';
import {useLanguage} from '@/contexts/language-context';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function ToolsPageContent() {
  const {t} = useLanguage();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const validTabs = ['image', 'pdf', 'file', 'calculator', 'converters'];
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'image';

  const imageFeatures = [
    {
      href: '/image-to-pdf',
      labelKey: 'image_to_pdf_label',
      descriptionKey: 'image_to_pdf_description',
      icon: FileDigit,
      color: 'text-red-500',
    },
    {
      href: '/image-compress',
      labelKey: 'image_compress_label',
      descriptionKey: 'image_compress_description',
      icon: Shrink,
      color: 'text-green-500',
    },
    {
      href: '/crop-image',
      labelKey: 'crop_image_label',
      descriptionKey: 'crop_image_description',
      icon: Crop,
      color: 'text-blue-500',
    },
    {
      href: '/image-resize',
      labelKey: 'resize_image_label',
      descriptionKey: 'resize_image_description',
      icon: Maximize,
      color: 'text-fuchsia-500',
    },
    {
      href: '/remove-background',
      labelKey: 'remove_background_label',
      descriptionKey: 'remove_background_description',
      icon: Eraser,
      color: 'text-rose-500',
    },
    {
      href: '/remove-signature',
      labelKey: 'remove_signature_label',
      descriptionKey: 'remove_signature_description',
      icon: PenLine,
      color: 'text-orange-500',
    },
    {
      href: '/enhance-photo',
      labelKey: 'enhance_photo_label',
      descriptionKey: 'enhance_photo_description',
      icon: Sparkles,
      color: 'text-violet-500',
    },
    {
      href: '/passport-photo',
      labelKey: 'passport_photo_label',
      descriptionKey: 'passport_photo_description',
      icon: UserCircle,
      color: 'text-emerald-500',
    },
    {
      href: '/image-to-jpg',
      labelKey: 'image_to_jpg_label',
      descriptionKey: 'image_to_jpg_description',
      icon: FileOutput,
      color: 'text-yellow-500',
    },
    {
      href: '/image-to-png',
      labelKey: 'image_to_png_label',
      descriptionKey: 'image_to_png_description',
      icon: FileOutput,
      color: 'text-sky-500',
    },
    {
      href: '/image-to-text',
      labelKey: 'image_to_text_label',
      descriptionKey: 'image_to_text_description',
      icon: FileScan,
      color: 'text-teal-500',
    },
  ];

  const pdfFeatures = [
    {
      href: '/docx-to-pdf',
      labelKey: 'word_to_pdf_label',
      descriptionKey: 'word_to_pdf_description',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      href: '/lock-pdf',
      labelKey: 'lock_pdf_label',
      descriptionKey: 'lock_pdf_description',
      icon: Lock,
      color: 'text-slate-900',
    },
    {
      href: '/unlock-pdf',
      labelKey: 'unlock_pdf_label',
      descriptionKey: 'unlock_pdf_description',
      icon: Unlock,
      color: 'text-teal-500',
    },
    {
      href: '/text-to-pdf',
      labelKey: 'text_to_pdf_label',
      descriptionKey: 'text_to_pdf_description',
      icon: FileText,
      color: 'text-gray-500',
    },
    {
      href: '/html-to-pdf',
      labelKey: 'html_to_pdf_label',
      descriptionKey: 'html_to_pdf_description',
      icon: FileCode,
      color: 'text-orange-600',
    },
    {
      href: '/pdf-to-image',
      labelKey: 'pdf_to_image_label',
      descriptionKey: 'pdf_to_image_description',
      icon: ImageIcon,
      color: 'text-orange-500',
    },
    {
      href: '/compress-pdf',
      labelKey: 'compress_pdf_label',
      descriptionKey: 'compress_pdf_description',
      icon: FileArchive,
      color: 'text-purple-500',
    },
    {
      href: '/merge-pdf',
      labelKey: 'merge_pdf_label',
      descriptionKey: 'merge_pdf_description',
      icon: Merge,
      color: 'text-pink-500',
    },
    {
      href: '/split-pdf',
      labelKey: 'split_pdf_label',
      descriptionKey: 'split_pdf_description',
      icon: Scissors,
      color: 'text-cyan-500',
    },
    {
      href: '/crop-pdf',
      labelKey: 'crop_pdf_label',
      descriptionKey: 'crop_pdf_description',
      icon: Crop,
      color: 'text-amber-500',
    },
    {
      href: '/scan-to-pdf',
      labelKey: 'scan_to_pdf_label',
      descriptionKey: 'scan_to_pdf_description',
      icon: ScanLine,
      color: 'text-indigo-500',
    },
    {
      href: '/add-watermark',
      labelKey: 'add_watermark_label',
      descriptionKey: 'add_watermark_description',
      icon: Copyright,
      color: 'text-rose-500',
    },
    {
      href: '/add-page-numbers',
      labelKey: 'add_page_numbers_label',
      descriptionKey: 'add_page_numbers_description',
      icon: NotebookPen,
      color: 'text-lime-500',
    },
  ];

  const fileFeatures = [
    {
      href: '/create-zip',
      labelKey: 'create_zip_label',
      descriptionKey: 'create_zip_description',
      icon: Archive,
      color: 'text-violet-500',
    },
    {
      href: '/unzip-file',
      labelKey: 'unzip_file_label',
      descriptionKey: 'unzip_file_description',
      icon: ArchiveRestore,
      color: 'text-stone-500',
    },
  ];

  const calculatorFeatures = [
    {
      href: '/standard-calculator',
      labelKey: 'standard_calculator_label',
      descriptionKey: 'standard_calculator_description',
      icon: Calculator,
      color: 'text-cyan-500',
    },
    {
      href: '/loan-calculator',
      labelKey: 'loan_emi_calculator_label',
      descriptionKey: 'loan_emi_calculator_description',
      icon: Landmark,
      color: 'text-sky-500',
    },
    {
      href: '/age-calculator',
      labelKey: 'age_calculator_label',
      descriptionKey: 'age_calculator_description',
      icon: Cake,
      color: 'text-teal-500',
    },
    {
      href: '/percentage-calculator',
      labelKey: 'percentage_calculator_label',
      descriptionKey: 'percentage_calculator_description',
      icon: Percent,
      color: 'text-blue-500',
    },
    {
      href: '/fuel-cost-calculator',
      labelKey: 'fuel_cost_calculator_label',
      descriptionKey: 'fuel_cost_calculator_description',
      icon: Route,
      color: 'text-rose-500',
    },
    {
      href: '/interest-calculator',
      labelKey: 'interest_calculator_label',
      descriptionKey: 'interest_calculator_description',
      icon: Coins,
      color: 'text-yellow-500',
    },
    {
      href: '/sales-tax-calculator',
      labelKey: 'sales_tax_calculator_label',
      descriptionKey: 'sales_tax_calculator_description',
      icon: Receipt,
      color: 'text-indigo-500',
    },
  ];
  
  const converterFeatures = [
    {
      href: '/acceleration-converter',
      labelKey: 'acceleration_converter_label',
      descriptionKey: 'acceleration_converter_description',
      icon: Gauge,
      color: 'text-emerald-500',
    },
    {
      href: '/area-converter',
      labelKey: 'area_converter_label',
      descriptionKey: 'area_converter_description',
      icon: AreaChart,
      color: 'text-lime-500',
    },
    {
      href: '/fuel-converter',
      labelKey: 'fuel_converter_label',
      descriptionKey: 'fuel_converter_description',
      icon: Fuel,
      color: 'text-orange-500',
    },
    {
      href: '/pressure-converter',
      labelKey: 'pressure_converter_label',
      descriptionKey: 'pressure_converter_description',
      icon: Waves,
      color: 'text-sky-500',
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
    { value: 'pdf', categoryKey: 'pdf_tools', features: pdfFeatures, icon: FileText, color: 'text-red-500' },
    { value: 'file', categoryKey: 'file_tools', features: fileFeatures, icon: Archive, color: 'text-purple-500' },
    { value: 'calculator', categoryKey: 'calculator_pro', features: calculatorFeatures, icon: Calculator, color: 'text-cyan-500' },
    { value: 'converters', categoryKey: 'converter_tools', features: converterFeatures, icon: Infinity, color: 'text-emerald-500' },
  ];

  const searchResults = allFeatureGroups
    .map(group => ({
        ...group,
        features: filterFeatures(group.features)
    }))
    .filter(group => group.features.length > 0);

  return (
    <main className="flex-1 bg-transparent w-full flex flex-col items-center">
      {/* Hero Header Section */}
      <section className="relative w-full max-w-[2000px] pt-12 pb-12 overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 rounded-b-[3rem] shadow-2xl shadow-primary/5 mx-auto mb-6">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-48 -left-48 size-[600px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
          <div className="absolute top-1/2 -right-48 size-[600px] bg-accent/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full px-8 md:px-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.2em] mb-4 animate-fade-in-up shadow-sm">
            <LayoutGrid className="size-2.5" /> THE COMPLETE GR7 TOOLKIT
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tighter animate-fade-in-up leading-tight font-headline uppercase">
            All Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Hub Studio</span>
          </h1>
          
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-semibold leading-relaxed animate-fade-in-up mb-6" style={{ animationDelay: '0.1s' }}>
            Everything happens locally in your browser for 100% privacy.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto z-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-accent rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="search"
                    placeholder={t('search_tools_placeholder')}
                    className="w-full pl-14 h-14 text-base rounded-full shadow-2xl focus-visible:ring-primary/80 focus-visible:ring-4 border-2 border-foreground/10 bg-white dark:bg-slate-900 font-bold outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-[2000px] px-8 md:px-16 mt-4 pb-32">
        {isSearching ? (
            <div className="space-y-20">
            {searchResults.length > 0 ? (
                searchResults.map(({ categoryKey, features, icon: Icon, color }) => (
                <section key={categoryKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-10">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center bg-muted/50 shadow-md", color)}>
                        <Icon className="size-6" />
                      </div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">
                        {t(categoryKey)}
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {features.map((feature) => (
                        <FeatureCard
                        key={feature.href}
                        title={t(feature.labelKey) || feature.labelKey}
                        description={t(feature.descriptionKey) || feature.descriptionKey}
                        href={feature.href}
                        icon={feature.icon}
                        color={feature.color}
                        />
                    ))}
                    </div>
                </section>
                ))
            ) : (
                <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-4 border-dashed">
                <Search className="mx-auto h-20 w-20 mb-6 text-muted-foreground/30" />
                <p className="text-2xl font-black uppercase text-muted-foreground">{t('no_tools_found')}</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">Try a different search term like 'PDF', 'Biodata', or 'Calc'.</p>
                </div>
            )}
            </div>
        ) : (
            <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="flex h-auto flex-wrap justify-center gap-4 bg-transparent p-0 mb-10">
                {allFeatureGroups.map(({ value, categoryKey, icon: Icon, color }) => (
                <TabsTrigger key={value} value={value} className="px-8 py-3 h-auto text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border-2 bg-white dark:bg-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all tabs-trigger-lift">
                    <Icon className={cn("mr-2 h-4 w-4", color)} />
                    {t(categoryKey)}
                </TabsTrigger>
                ))}
            </TabsList>

            {allFeatureGroups.map(({ value, features }) => (
                <TabsContent key={value} value={value} className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {features.map((feature) => (
                    <FeatureCard
                        key={feature.href}
                        title={t(feature.labelKey) || feature.labelKey}
                        description={t(feature.descriptionKey) || feature.descriptionKey}
                        href={feature.href}
                        icon={feature.icon}
                        color={feature.color}
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
