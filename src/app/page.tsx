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
  LayoutGrid,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const CategoryCard = ({ icon: Icon, title, description, onClick, colorClass }: any) => (
  <div onClick={onClick} className="group block cursor-pointer">
    <Card className="h-full relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className={cn("mb-6 grid size-16 place-items-center rounded-2xl transition-transform group-hover:scale-110", colorClass)}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-black font-headline mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-6 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </CardContent>
      <div className="absolute -bottom-4 -right-4 size-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
    </Card>
  </div>
);

const FeaturedToolCard = ({ icon: Icon, title, description, href, buttonText, popular, gradient }: any) => (
  <Card className="flex flex-col justify-between p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-border/50 bg-card overflow-hidden group">
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-6">
        <div className={cn("size-14 grid place-items-center rounded-xl shadow-lg", gradient)}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        {popular && <Badge className="bg-amber-500 text-white font-black border-0 animate-pulse">TRENDING</Badge>}
      </div>
      <h3 className="text-2xl font-black tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
    <Button asChild className={cn("mt-8 w-full h-14 text-lg font-black rounded-xl shadow-xl transition-all group-hover:scale-[1.02]", gradient)}>
      <Link href={href}>{buttonText}</Link>
    </Button>
  </Card>
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

  const handleCategoryClick = (tab: string) => {
    router.push(`/tools?tab=${tab}`);
  };

  const toolCategories = [
    {
      onClick: () => handleCategoryClick('image'),
      icon: ImageIcon,
      title: 'Image Studio',
      description: 'AI-powered compression, resizing, and background removal tools.',
      colorClass: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20',
    },
    {
      onClick: () => handleCategoryClick('pdf'),
      icon: FileText,
      title: 'PDF Factory',
      description: 'Professional suite for merging, splitting, and securing documents.',
      colorClass: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20',
    },
    {
      onClick: () => handleCategoryClick('file'),
      icon: Archive,
      title: 'File Archive',
      description: 'Fast browser-side compression and extraction for ZIP archives.',
      colorClass: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20',
    },
    {
      onClick: () => handleCategoryClick('calculator'),
      icon: Calculator,
      title: 'Calculation Hub',
      description: 'Smart calculators for finance, age, and daily utility tasks.',
      colorClass: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-purple-500/20',
    },
  ];

  return (
    <main className="flex-1">
      {/* Hero Section - Fixed background for theme awareness */}
      <section className="relative overflow-hidden pt-20 pb-32 bg-white dark:bg-slate-950 text-foreground border-b border-border/50">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 dark:bg-primary/20 blur-[120px] rounded-full" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
            <Badge variant="outline" className="mb-6 py-1.5 px-4 border-primary/50 text-primary font-black tracking-widest bg-primary/5 animate-fade-in-up">
                NEXT-GEN UTILITY SUITE
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black font-headline mb-8 tracking-tighter animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Simplify Your <span className="text-gradient-primary">Digital Workflow</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                All the tools you need to convert, compress, and calculate. 100% private, browser-based, and lightning fast.
            </p>

            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                type="search"
                placeholder={t('search_tools_placeholder')}
                className="w-full pl-16 pr-6 h-18 text-lg rounded-2xl bg-muted/50 dark:bg-white/5 border-border/50 dark:border-white/10 text-foreground dark:text-white placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary transition-all shadow-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-16 space-y-24 pb-20">
        
        {/* Categories */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <LayoutGrid className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-black font-headline">Tool Categories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {toolCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-12">
          <div className="flex justify-between items-end mb-10">
            <div>
                <h2 className="text-4xl font-black font-headline">Featured Apps</h2>
                <p className="text-muted-foreground mt-2">Most used tools by the community</p>
            </div>
            <Button variant="link" className="text-primary font-black text-lg group" onClick={() => router.push('/tools')}>
              View All <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeaturedToolCard 
                href="/image-compress"
                icon={Shrink}
                title="Ultra Compressor"
                description="The world's fastest browser-side image shrinker. Supports target KB sizes."
                buttonText="Compress Now"
                popular={true}
                gradient="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600"
            />
            <FeaturedToolCard 
                href="/pdf-to-image"
                icon={ImageIcon}
                title="PDF to Image"
                description="Extract every page of your PDF into high-definition JPEG or PNG files instantly."
                buttonText="Convert PDF"
                popular={false}
                gradient="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500"
            />
            <FeaturedToolCard 
                href="/create-zip"
                icon={Archive}
                title="ZIP Creator"
                description="Bundle multiple files into a secure ZIP archive without uploading to any server."
                buttonText="Archive Files"
                popular={false}
                gradient="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-500 hover:to-pink-600"
            />
          </div>
        </section>
        
        {/* Why Us Section */}
        <section className="bg-primary/5 rounded-[3rem] p-12 md:p-20 border border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 size-64 bg-primary/10 blur-[100px] rounded-full" />
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black font-headline mb-6">Built for Privacy & Speed</h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                We believe your files should stay yours. All our tools run directly on your hardware, not in the cloud.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {[
              { icon: Lock, title: "100% Private", desc: "No file uploads. Everything happens on your device locally." },
              { icon: Zap, title: "Instant Power", desc: "Built with WASM and Web Workers for multithreaded performance." },
              { icon: UserCheck, title: "Pure UI", desc: "Clean, distraction-free interface optimized for productivity." },
              { icon: Sparkles, title: "Forever Free", desc: "No subscriptions, no watermarks, no hidden costs." }
            ].map((f, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto mb-6 flex items-center justify-center size-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <f.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed px-4">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SEO Content Section - Added for Ranking */}
        <section className="py-20 border-t border-border/50">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center">
              <h2 className="text-3xl font-black font-headline mb-4 uppercase tracking-tighter">Comprehensive Online Toolkit</h2>
              <p className="text-muted-foreground">The most powerful and private tool hub for all your daily digital needs.</p>
            </div>

            <div className="grid gap-12 text-sm">
               <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <CheckCircle className="size-5" /> Professional PDF Management
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our <strong>PDF Factory</strong> offers a complete suite for handling documents. Use our <strong>Image to PDF converter</strong> to combine scanned images, or the <strong>PDF to Image</strong> tool to extract high-quality PNGs. Need to organize? Use <strong>Split PDF</strong> to extract pages or <strong>Merge PDF</strong> to combine reports. We also provide secure options like <strong>Aadhaar PDF Unlocker</strong> and <strong>PDF Protector</strong> to manage your document security locally.
                  </p>
               </div>

               <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <CheckCircle className="size-5" /> Advanced Image Optimization
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Stop using cloud converters that steal your data. Our <strong>Ultra Image Compressor</strong> and <strong>Smart Image Resizer</strong> run 100% on your device. We specialize in <strong>Govt Job Photo Resizing</strong>, offering one-click presets for <strong>SSC, UPSC, and IBPS</strong> forms. You can also <strong>Remove Backgrounds with AI</strong>, extract text using <strong>OCR</strong>, and create <strong>Passport Photos</strong> instantly.
                  </p>
               </div>

               <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <CheckCircle className="size-5" /> Instant Smart Calculators
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    From <strong>Loan EMI Calculators</strong> to <strong>Age and Percentage calculators</strong>, our hub provides precise results without any delay. We also offer specialized <strong>Unit Converters</strong> for area, pressure, fuel consumption, and acceleration to help professionals and students alike.
                  </p>
               </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 flex flex-col md:flex-row items-center gap-6">
                <ShieldCheck className="size-16 text-primary shrink-0" />
                <div className="space-y-2">
                    <h4 className="text-lg font-black uppercase tracking-tight">Privacy First Architecture</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Unlike other tools, GRs HUB does not upload your files to any server. All conversions, compressions, and AI processes happen inside your browser using your device's power. Your privacy is not just a policy; it's how our code is built.
                    </p>
                </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
