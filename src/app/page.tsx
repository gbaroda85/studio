
'use client';

import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import {useLanguage} from '@/contexts/language-context';

export default function Home() {
  const {t} = useLanguage();
  const searchParams = useSearchParams();

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
      href: '/edit-pdf',
      labelKey: 'edit_pdf_label',
      descriptionKey: 'edit_pdf_description',
      icon: FilePenLine,
      color: 'text-lime-500',
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
  ];


  return (
    <main className="flex-1 p-4 md:p-8">
      <div className="mb-8 max-w-2xl">
        <p className="mt-2 text-muted-foreground">{t('tagline')}</p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 md:max-w-4xl">
          <TabsTrigger value="image">
            <ImageIcon className="mr-2 h-4 w-4 text-blue-500" />
            {t('image_tools')}
          </TabsTrigger>
          <TabsTrigger value="pdf">
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            {t('pdf_tools')}
          </TabsTrigger>
          <TabsTrigger value="file">
            <Archive className="mr-2 h-4 w-4 text-purple-500" />
            {t('file_tools')}
          </TabsTrigger>
          <TabsTrigger value="calculator">
            <Calculator className="mr-2 h-4 w-4 text-cyan-500" />
            {t('calculator_pro')}
          </TabsTrigger>
           <TabsTrigger value="converters">
            <Infinity className="mr-2 h-4 w-4 text-emerald-500" />
            {t('converter_tools')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="image">
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {imageFeatures.map((feature) => (
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
        <TabsContent value="pdf">
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {pdfFeatures.map((feature) => (
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
        <TabsContent value="file">
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {fileFeatures.map((feature) => (
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
        <TabsContent value="calculator">
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {calculatorFeatures.map((feature) => (
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
        <TabsContent value="converters">
          <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {converterFeatures.map((feature) => (
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
      </Tabs>
    </main>
  );
}
