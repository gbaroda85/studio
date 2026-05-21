'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ImageIcon,
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  Search,
  ArrowRight,
  Shrink,
  Maximize,
  FileOutput,
  FileDigit,
  Scissors,
  Merge,
  Lock,
  LayoutGrid,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ToolCard = ({ icon: Icon, title, description, href, colorClass }: any) => (
  <Link href={href} className="group">
    <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
      <CardContent className="p-6">
        <div className={`size-12 rounded-xl flex items-center justify-center mb-4 ${colorClass} text-white transition-transform group-hover:scale-110`}>
          <Icon className="size-6" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider group-hover:gap-2 transition-all">
          Try Now <ArrowRight className="ml-1 size-3" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const FeatureItem = ({ icon: Icon, title, description, iconColor }: any) => (
  <div className="flex flex-col items-center text-center px-4">
    <div className={`size-16 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white ${iconColor}`}>
      <Icon className="size-8 text-white" />
    </div>
    <h4 className="text-xl font-bold mb-3 text-slate-900">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{description}</p>
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

  return (
    <main className="flex-1 bg-slate-50">
      {/* Reference Inspired Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/seed/workstation/1920/1080"
            alt="Professional Workstation"
            fill
            className="object-cover"
            priority
            data-ai-hint="workstation laptop"
          />
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-7xl font-black mb-6 tracking-tight animate-fade-in-up">
            Professional Tools <br className="hidden md:block" />
            <span className="text-primary-foreground/90">for Images & PDFs</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto mb-10 font-medium leading-relaxed opacity-90">
            Complete suite of image compression, resizing, conversion tools and <br className="hidden md:block" />
            PDF utilities. Fast, secure, and completely free to use.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
              <Link href="/image-compress">Start Compressing</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg font-bold bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-md">
              <Link href="/tools?tab=pdf">Explore PDF Tools</Link>
            </Button>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder={t('search_tools_placeholder')}
              className="w-full pl-14 pr-6 h-16 text-lg rounded-full bg-white text-slate-900 border-none shadow-2xl focus-visible:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </section>

      {/* Image Tools Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Image Tools</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Professional image processing tools with advanced algorithms for perfect results.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ToolCard 
              icon={Shrink}
              title="Image Compress"
              description="High-quality compression with size reduction up to 90%."
              href="/image-compress"
              colorClass="bg-blue-500"
            />
            <ToolCard 
              icon={Maximize}
              title="Image Resize"
              description="Resize images to any dimension while maintaining quality."
              href="/image-resize"
              colorClass="bg-indigo-500"
            />
            <ToolCard 
              icon={FileOutput}
              title="Image Convert"
              description="Convert between JPG, PNG, WEBP and other formats."
              href="/image-to-jpg"
              colorClass="bg-orange-500"
            />
            <ToolCard 
              icon={Sparkles}
              title="Image Enhance"
              description="Auto-enhance brightness, contrast and saturation with AI."
              href="/enhance-photo"
              colorClass="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* PDF Tools Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">PDF Tools</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Complete PDF manipulation suite for all your document processing needs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ToolCard 
              icon={FileDigit}
              title="PDF Compress"
              description="Reduce PDF file size without losing text or image quality."
              href="/compress-pdf"
              colorClass="bg-rose-500"
            />
            <ToolCard 
              icon={Scissors}
              title="PDF Split"
              description="Split large PDF files into smaller documents instantly."
              href="/split-pdf"
              colorClass="bg-cyan-500"
            />
            <ToolCard 
              icon={Merge}
              title="PDF Merge"
              description="Combine multiple PDF files into one single document."
              href="/merge-pdf"
              colorClass="bg-emerald-500"
            />
            <ToolCard 
              icon={Lock}
              title="PDF Protect"
              description="Add password protection to your sensitive PDF files."
              href="/protect-pdf"
              colorClass="bg-slate-700"
            />
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild variant="ghost" className="font-bold text-primary hover:bg-primary/5" onClick={() => router.push('/tools')}>
              <Link href="/tools">View All Tools <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Why Choose GRs Hub?</h2>
            <p className="text-slate-500">Built with cutting-edge technology for professional results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <FeatureItem 
              icon={ShieldCheck}
              title="100% Secure"
              description="All files are processed locally on your browser. Nothing is uploaded to our servers, ensuring complete privacy."
              iconColor="bg-green-500"
            />
            <FeatureItem 
              icon={Zap}
              title="Lightning Fast"
              description="Advanced algorithms ensure instant processing of your files without compromising on quality or performance."
              iconColor="bg-blue-500"
            />
            <FeatureItem 
              icon={Sparkles}
              title="Professional Quality"
              description="Industry-standard compression and processing techniques deliver professional-grade results every time."
              iconColor="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Gradient Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-64 bg-white/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 size-64 bg-black/10 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to Optimize Your Files?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">Join thousands of users who trust our tools for their daily file processing needs.</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-white text-blue-600 hover:bg-slate-100 shadow-xl">
                  <Link href="/tools">Start Now - It's Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full text-lg font-bold border-white/30 text-white hover:bg-white/10">
                  <Link href="mailto:gaurav.thearmy@yahoo.com">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
