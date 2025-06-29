'use client';

import Link from 'next/link';
import {
  ImageIcon,
  FileText,
  Archive,
  Shrink,
  ArrowRight,
  Lock,
  Zap,
  UserCheck,
  Sparkles,
  Search,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const CategoryCard = ({ icon: Icon, title, description, onClick }) => (
  <div onClick={onClick} className="group block cursor-pointer">
    <Card className="h-full text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border-foreground/20">
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
  <Card className="flex flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 border-foreground/20">
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

const FeatureHighlightCard = ({ icon: Icon, title, description }) => (
  <div className="text-center p-6 rounded-2xl transition-all duration-300 hover:bg-card hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
    <div className="mx-auto mb-6 flex items-center justify-center size-20 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110">
      <Icon className="h-10 w-10" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function Page() {
  const { t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
      icon: Calculator,
      title: 'Calculators & More',
      description: 'Calculators and other utilities',
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
      buttonClassName: 'bg-gradient-to-r from-gradient-blue to-gradient-purple hover:from-gradient-blue/90 hover:to-gradient-purple/90 text-white',
    },
    {
      href: '/pdf-to-image',
      icon: ImageIcon,
      title: t('pdf_to_image_label'),
      description: t('pdf_to_image_description'),
      buttonText: 'Convert Now',
      popular: false,
      buttonClassName: 'bg-gradient-to-r from-gradient-green to-gradient-cyan hover:from-gradient-green/90 hover:to-gradient-cyan/90 text-white',
    },
    {
      href: '/create-zip',
      icon: Archive,
      title: t('create_zip_label'),
      description: t('create_zip_description'),
      buttonText: 'Create Archive',
      popular: false,
      buttonClassName: 'bg-gradient-to-r from-gradient-purple to-gradient-magenta hover:from-gradient-purple/90 hover:to-gradient-magenta/90 text-white',
    },
  ];

  const whyUsFeatures = [
    {
      icon: Lock,
      title: "100% Private",
      description: "All tools process your files directly in your browser. Nothing is ever uploaded to a server."
    },
    {
      icon: Zap,
      title: "Incredibly Fast",
      description: "Engineered for performance, our tools deliver results in seconds, not minutes."
    },
    {
      icon: UserCheck,
      title: "Easy to Use",
      description: "With a clean and intuitive design, anyone can use our tools without a learning curve."
    },
    {
      icon: Sparkles,
      title: "Absolutely Free",
      description: "Enjoy full access to all our tools without any costs, ads, or hidden subscriptions."
    }
  ];

  return (
    <main className="flex-1 bg-muted/40">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Search Bar */}
        <section>
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search_tools_placeholder')}
              className="w-full pl-16 pr-6 h-16 text-lg rounded-full shadow-lg focus-visible:ring-primary/80 focus-visible:ring-2 border border-foreground/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </section>

        {/* Flashing Link Section */}
        <section className="text-center">
          <Link href="https://grsnewss.blogspot.com" target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg bg-gradient-to-r from-gradient-purple to-gradient-magenta p-1 animate-pulse">
            <div className="rounded-md bg-background px-6 py-3">
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-gradient-purple to-gradient-magenta">
                Visit our News Blog for the latest updates!
              </span>
            </div>
          </Link>
        </section>

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
        
        {/* Why Choose Us Section */}
        <section>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Why GRs Multi Tools Kits Hub?</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl mx-auto">
                Our toolkit is designed to be your go-to solution for everyday digital tasks. We prioritize your privacy, speed, and a seamless user experience, all for free.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUsFeatures.map((feature) => (
              <FeatureHighlightCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
