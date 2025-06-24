
'use client';

import Link from 'next/link';
import {
  ImageIcon,
  FileText,
  Archive,
  ScanLine,
  Shrink,
  ArrowRight,
  FileDigit,
  Maximize,
  Crop,
  FileOutput,
  Merge,
  Scissors,
  Lock,
  Unlock,
  Copyright,
  ArchiveRestore,
  Calculator,
  Landmark,
  Cake,
  Percent,
  Infinity as InfinityIcon,
  AreaChart,
  Fuel,
  Gauge,
  Coins,
  Waves,
  Route,
  Receipt,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const CategoryCard = ({ icon: Icon, title, description, onClick }) => (
  <div onClick={onClick} className="group block cursor-pointer">
    <Card className="h-full text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <CardContent className="p-6">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm font-semibold text-primary group-hover:underline">
          Explore Tools <ArrowRight className="inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
        </p>
      </CardContent>
    </Card>
  </div>
);

const FeaturedToolCard = ({ icon: Icon, title, description, href, buttonText, popular, buttonClassName }) => (
  <Card className="flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
    <div>
      <div className="flex items-start justify-between">
        <div className="mb-4 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" />
        </div>
        {popular && <Badge variant="secondary" className="border-green-500 bg-green-100 text-green-700 font-bold">Popular</Badge>}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
    <Button asChild className={cn("mt-6 w-full text-lg h-12 font-bold", buttonClassName)}>
      <Link href={href}>{buttonText}</Link>
    </Button>
  </Card>
);

const AllToolLink = ({ icon: Icon, title, href }) => (
  <Link href={href}>
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-200 hover:bg-muted hover:shadow-md hover:-translate-y-0.5">
      <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-semibold">{title}</span>
    </div>
  </Link>
);


export default function Page() {
  const { t } = useLanguage();
  const router = useRouter();

  const handleCategoryClick = (tab) => {
    router.push(`/tools?tab=${tab}`);
  };

  const handleViewAllClick = () => {
    router.push('/tools');
  };
  
  const toolCategories = [
    {
      onClick: () => handleCategoryClick('image'),
      icon: ImageIcon,
      title: 'Image Tools',
      description: 'Compress, resize, convert and edit images',
    },
    {
      onClick: () => handleCategoryClick('pdf'),
      icon: FileText,
      title: 'PDF Tools',
      description: 'Edit, convert, protect and manage PDF files',
    },
    {
      onClick: () => handleCategoryClick('file'),
      icon: Archive,
      title: 'Archive Tools',
      description: 'Create, extract and manage ZIP files',
    },
    {
      onClick: () => handleCategoryClick('calculator'),
      icon: ScanLine,
      title: 'Scan & More',
      description: 'Scan documents and other utilities',
    },
  ];

  const featuredTools = [
    {
      href: '/image-compress',
      icon: Shrink,
      title: t('image_compress_label'),
      description: t('image_compress_description'),
      buttonText: 'Compress Image',
      popular: true,
      buttonClassName: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
    },
    {
      href: '/pdf-to-image',
      icon: ImageIcon,
      title: t('pdf_to_image_label'),
      description: t('pdf_to_image_description'),
      buttonText: 'Convert Now',
      popular: false,
      buttonClassName: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
    },
    {
      href: '/create-zip',
      icon: Archive,
      title: t('create_zip_label'),
      description: t('create_zip_description'),
      buttonText: 'Create Archive',
      popular: false,
      buttonClassName: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
    },
  ];

  const allTools = [
    { href: '/image-compress', icon: Shrink, labelKey: 'image_compress_label' },
    { href: '/image-resize', icon: Maximize, labelKey: 'resize_image_label' },
    { href: '/crop-image', icon: Crop, labelKey: 'crop_image_label' },
    { href: '/image-to-jpg', icon: FileOutput, labelKey: 'image_to_jpg_label' },
    { href: '/image-to-png', icon: FileOutput, labelKey: 'image_to_png_label' },
    { href: '/image-to-pdf', icon: FileDigit, labelKey: 'image_to_pdf_label' },
    { href: '/pdf-to-image', icon: ImageIcon, labelKey: 'pdf_to_image_label' },
    { href: '/compress-pdf', icon: Archive, labelKey: 'compress_pdf_label' },
    { href: '/merge-pdf', icon: Merge, labelKey: 'merge_pdf_label' },
    { href: '/split-pdf', icon: Scissors, labelKey: 'split_pdf_label' },
    { href: '/crop-pdf', icon: Crop, labelKey: 'crop_pdf_label' },
    { href: '/scan-to-pdf', icon: ScanLine, labelKey: 'scan_to_pdf_label' },
    { href: '/protect-pdf', icon: Lock, labelKey: 'protect_pdf_label' },
    { href: '/unlock-pdf', icon: Unlock, labelKey: 'unlock_pdf_label' },
    { href: '/add-watermark', icon: Copyright, labelKey: 'add_watermark_label' },
    { href: '/create-zip', icon: Archive, labelKey: 'create_zip_label' },
    { href: '/unzip-file', icon: ArchiveRestore, labelKey: 'unzip_file_label' },
    { href: '/standard-calculator', icon: Calculator, labelKey: 'standard_calculator_label' },
    { href: '/loan-calculator', icon: Landmark, labelKey: 'loan_emi_calculator_label' },
    { href: '/age-calculator', icon: Cake, labelKey: 'age_calculator_label' },
    { href: '/percentage-calculator', icon: Percent, labelKey: 'percentage_calculator_label' },
    { href: '/fuel-cost-calculator', icon: Route, labelKey: 'fuel_cost_calculator_label' },
    { href: '/interest-calculator', icon: Coins, labelKey: 'interest_calculator_label' },
    { href: '/sales-tax-calculator', icon: Receipt, labelKey: 'sales_tax_calculator_label' },
    { href: '/acceleration-converter', icon: Gauge, labelKey: 'acceleration_converter_label' },
    { href: '/area-converter', icon: AreaChart, labelKey: 'area_converter_label' },
    { href: '/fuel-converter', icon: Fuel, labelKey: 'fuel_converter_label' },
    { href: '/pressure-converter', icon: Waves, labelKey: 'pressure_converter_label' },
  ];

  return (
    <main className="flex-1 bg-muted/40">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Category Selection */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Select Tool Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </section>

        {/* Featured Tools */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Featured Tools</h2>
            <Button variant="link" className="text-primary font-semibold" onClick={handleViewAllClick}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool) => (
              <FeaturedToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        {/* All Available Tools */}
        <section id="all-tools">
          <h2 className="text-3xl font-bold mb-6">All Available Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allTools.map((tool) => (
              <AllToolLink key={tool.href} href={tool.href} icon={tool.icon} title={t(tool.labelKey)} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
