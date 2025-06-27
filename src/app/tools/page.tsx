'use client';

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
import { Input } from '@/components/ui/input';
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
  Copyright,
  Archive,
  ArchiveRestore,
  FileText,
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
  FileUp,
  FileCode,
  FileScan,
} from 'lucide-react';
import {useLanguage} from '@/contexts/language-context';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// This component contains the actual page content and uses the search params.
function ToolsPageContent() {
  const {t} = useLanguage();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const validTabs = ['image', 'pdf', 'file', 'calculator', 'converters'];
  const tabParam = searchParams.get('tab');
  const defaultTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'image';

  const imageFeatures = [
    {
      href: '/image-compress',
      labelKey: 'image_compress_label',
      descriptionKey: 'image_compress_description',
      icon: Shrink,
      color: 'text-green-500',
    },
    {
      href: '/image-resize',
      labelKey: 'resize_image_label',
      descriptionKey: 'resize_image_description',
      icon: Maximize,
      color: 'text-fuchsia-500',
    },
    {
      href: '/crop-image',
      labelKey: 'crop_image_label',
      descriptionKey: 'crop_image_description',
      icon: Crop,
      color: 'text-blue-500',
    },
    {
      href: '/remove-background',
      labelKey: 'remove_background_label',
      descriptionKey: 'remove_background_description',
      icon: Eraser,
      color: 'text-rose-500',
    },
    {
      href: '/enhance-photo',
      labelKey: 'enhance_photo_label',
      descriptionKey: 'enhance_photo_description',
      icon: Wand2,
      color: 'text-violet-500',
    },
    {
      href: '/image-to-text',
      labelKey: 'image_to_text_label',
      descriptionKey: 'image_to_text_description',
      icon: FileScan,
      color: 'text-teal-500',
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
      href: '/image-to-pdf',
      labelKey: 'image_to_pdf_label',
      descriptionKey: 'image_to_pdf_description',
      icon: FileDigit,
      color: 'text-red-500',
    },
  ];

  const pdfFeatures = [
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
      href: '/word-to-pdf',
      labelKey: 'word_to_pdf_label',
      descriptionKey: 'word_to_pdf_description',
      icon: FilePenLine,
      color: 'text-blue-600',
    },
    {
      href: '/pdf-to-word',
      labelKey: 'pdf_to_word_label',
      descriptionKey: 'pdf_to_word_description',
      icon: FileUp,
      color: 'text-emerald-500',
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
      href: '/protect-pdf',
      labelKey: 'protect_pdf_label',
      descriptionKey: 'protect_pdf_description',
      icon: Lock,
      color: 'text-gray-500',
    },
    {
      href: '/unlock-pdf',
      labelKey: 'unlock_pdf_label',
      descriptionKey: 'unlock_pdf_description',
      icon: Unlock,
      color: 'text-teal-500',
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

  const filterFeatures = (features: typeof imageFeatures) => {
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
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">All Tools</h1>
        <p className="mt-2 text-muted-foreground">Your one-stop-shop for file conversions, calculations, and more.</p>
      </div>

      <div className="relative mb-12 max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
            type="search"
            placeholder={t('search_tools_placeholder')}
            className="w-full pl-12 h-14 text-base rounded-full shadow-lg focus-visible:ring-primary/80 focus-visible:ring-2 border border-foreground/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isSearching ? (
        <div className="mt-8 space-y-10">
          {searchResults.length > 0 ? (
            searchResults.map(({ categoryKey, features, icon: Icon, color }) => (
              <section key={categoryKey}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Icon className={cn("h-7 w-7", color)} />
                  {t(categoryKey)}
                </h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
                  {features.map((feature) => (
                    <FeatureCard
                      key={feature.href}
                      title={t(feature.labelKey)}
                      description={t(feature.descriptionKey)}
                      href={feature.href}
                      icon={feature.icon}
                      color={feature.color}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4" />
              <p className="font-semibold">{t('no_tools_found')}</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue={defaultTab}>
          <TabsList className="flex h-auto flex-wrap justify-center gap-2">
            {allFeatureGroups.map(({ value, categoryKey, icon: Icon, color }) => (
              <TabsTrigger key={value} value={value} className="px-4 py-2 text-base font-semibold md:px-6 md:py-3 md:text-lg">
                <Icon className={cn("mr-2 h-5 w-5", color)} />
                {t(categoryKey)}
              </TabsTrigger>
            ))}
          </TabsList>

          {allFeatureGroups.map(({ value, features }) => (
            <TabsContent key={value} value={value}>
              <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
                {features.map((feature) => (
                  <FeatureCard
                    key={feature.href}
                    title={t(feature.labelKey)}
                    description={t(feature.descriptionKey)}
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
    </main>
  );
}

// A fallback component to show while the page is loading.
function ToolsPageLoadingFallback() {
  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">All Tools</h1>
        <p className="mt-2 text-muted-foreground">Your one-stop-shop for file conversions, calculations, and more.</p>
      </div>
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </main>
  );
}


// This is the main page component that will be exported.
export default function ToolsPage() {
  return (
    // Wrap the component that uses searchParams in a Suspense boundary.
    <Suspense fallback={<ToolsPageLoadingFallback />}>
      <ToolsPageContent />
    </Suspense>
  )
}
