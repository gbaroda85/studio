
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Image as ImageIcon, FileText, Calculator, ShieldCheck, Zap, DownloadCloud, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <Card className="text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20 dark:hover:shadow-primary/10 bg-card/50 backdrop-blur-sm">
      <CardHeader className="items-center">
        <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary mb-4">
          <Icon className="h-7 w-7" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background via-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-6xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-gradient-to-r from-primary to-foreground/70 text-transparent bg-clip-text">
                  {t('welcome')}
                </h1>
                <p className="max-w-4xl mx-auto text-muted-foreground md:text-xl">
                  {t('tagline')}
                </p>
                <Button asChild size="lg" className="group text-lg py-7 px-10">
                  <Link href="/tools">
                    Explore All Tools <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="relative w-full max-w-7xl group">
                 <Image
                    src="https://placehold.co/1200x800.png"
                    width="1200"
                    height="800"
                    alt="Hero Image"
                    data-ai-hint="laptop screen"
                    className="mx-auto aspect-video overflow-hidden rounded-2xl object-cover shadow-2xl shadow-primary/10 transition-all duration-300 group-hover:shadow-primary/20 group-hover:shadow-xl"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need, All in One Place</h2>
              <p className="max-w-6xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From image optimization to complex calculations, our suite of tools is designed to be powerful yet simple to use.
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-5xl sm:grid-cols-2 md:gap-12 lg:max-w-7xl lg:grid-cols-3">
              <FeatureCard
                icon={ImageIcon}
                title={t('image_tools')}
                description="Compress, resize, crop, and convert images in various formats with ease."
              />
              <FeatureCard
                icon={FileText}
                title={t('pdf_tools')}
                description="Merge, split, compress, and protect your PDF documents in seconds."
              />
              <FeatureCard
                icon={Calculator}
                title={t('calculator_pro')}
                description="From simple sums to loan interest and sales tax, we have the calculators you need."
              />
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple and Fast</h2>
                <p className="max-w-6xl text-muted-foreground md:text-xl">Get your tasks done in three easy steps.</p>
            </div>
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden sm:block"></div>
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 animate-pulse hidden sm:block"></div>

                <div className="mx-auto grid gap-12 sm:grid-cols-3 relative">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="grid size-16 place-items-center rounded-full bg-background border-2 border-primary text-primary mb-4 z-10">
                      <MousePointerClick className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">1. Choose a Tool</h3>
                    <p className="text-muted-foreground">Select from our wide range of image, PDF, and calculator tools.</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-3">
                     <div className="grid size-16 place-items-center rounded-full bg-background border-2 border-primary text-primary mb-4 z-10">
                      <Zap className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">2. Process Your File</h3>
                    <p className="text-muted-foreground">Upload your file or enter your data. All processing happens instantly in your browser.</p>
                  </div>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="grid size-16 place-items-center rounded-full bg-background border-2 border-primary text-primary mb-4 z-10">
                      <DownloadCloud className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold">3. Download</h3>
                    <p className="text-muted-foreground">Your result is ready. Download your new file with a single click.</p>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Privacy First</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Your Files are Safe and Private</h2>
              <p className="max-w-4xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We believe in privacy. That's why every tool runs entirely within your browser. Your files are never uploaded to any server, ever.
              </p>
            </div>
             <div className="flex justify-center group">
                <ShieldCheck className="w-32 h-32 text-green-500 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} GRs Multi Tools Kit. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/tools" className="text-xs hover:underline underline-offset-4">
            Tools
          </Link>
          <Link href="mailto:gaurav.thearmy@yahoo.com" className="text-xs hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
}
