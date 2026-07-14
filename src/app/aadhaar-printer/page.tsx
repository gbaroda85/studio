import { Metadata } from 'next';
import AadhaarPrinter from '@/components/aadhaar-printer';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreditCard, LayoutGrid, HelpCircle, ShieldCheck, Layout, Scan, Maximize, Printer, Sparkles, HelpCircle as InfoIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Smart Aadhaar Card Printer - Auto-Crop e-Aadhaar PDF for PVC Print',
  description: 'Easy print studio for Indian ID cards. Auto-crop A4 e-Aadhaar strips or separate PAN, DL, and Voter ID photos into wallet-sized formats. 100% private and secure.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/aadhaar-printer' },
  openGraph: {
    title: 'Smart ID Card Printer - Auto-Crop Aadhaar, PAN & DL Online',
    description: 'The fastest way to crop and resize Indian ID cards for perfect wallet printing. No server uploads.',
    url: 'https://www.gr7imagepdf.com/aadhaar-printer',
    type: 'website',
  }
};

export default function AadhaarPrinterPage() {
  const deepSteps = [
    {
      title: "Workflow Selection",
      description: "Choose between 'A4 e-Aadhaar' for official PDF strips or 'Individual Sides' for separate PAN/DL/Voter photos taken at angles.",
      icon: "LayoutGrid"
    },
    {
      title: "Perspective Calibration",
      description: "Use the 8-dot industrial scanner to straighten tilted photos. Our engine uses homography matrices to flatten angled documents instantly.",
      icon: "Scan"
    },
    {
      title: "ISO Standard Sizing",
      description: "The tool automatically scales both sides to the standard ISO/IEC 7810 ID-1 size (85.6mm x 54mm) for a perfect wallet fit.",
      icon: "Maximize"
    },
    {
      title: "Print-Ready Render",
      description: "Generate a high-fidelity A4 sheet preview. Click 'Print Now' to output a 300DPI document ready for physical PVC printing.",
      icon: "Printer"
    }
  ];

  // Unique Page Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GR7 Aadhaar Card Printer",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Windows, macOS, Android, iOS",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "description": "Professional tool to auto-crop and arrange Indian ID cards like Aadhaar and PAN for standard PVC printing."
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gr7imagepdf.com" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://www.gr7imagepdf.com/tools" },
      { "@type": "ListItem", "position": 3, "name": "Aadhaar Printer", "item": "https://www.gr7imagepdf.com/aadhaar-printer" }
    ]
  };

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        
        <ToolNavigation href="/tools?tab=file" label="Back to File Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] font-bold text-primary normal-case">
                        Aadhaar Card Printer
                    </span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-2xl mx-auto text-xs md:text-base">
                    Auto-crop Aadhaar, PAN, DL and Voter ID for perfect wallet-sized printing. 100% private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <AadhaarPrinter />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="ID Card Printer" steps={deepSteps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Professional ID Printing Studio
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Whether it is your <strong>PAN Card, Driving Licence, or e-Aadhaar</strong>, our studio uses smart canvas technology to lock your documents to exact dimensions. We solve the common problem of "too small" or "blurry" prints by using 300DPI local rendering.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    <div className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <CreditCard className="text-cyan-500 size-10 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600 mb-2">Multi-ID Protocol</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Supports all standard Indian IDs including Health Cards, E-Shram, and Ayushman Bharat cards.</p>
                    </div>

                    <div className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <Layout className="text-indigo-500 size-10 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600 mb-2">High-Density Mapping</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Uses sub-pixel interpolation to ensure that chota text and QR codes remain scannable after resizing.</p>
                    </div>

                    <div className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl hover:scale-[1.02] transition-all">
                        <ShieldCheck className="text-purple-500 size-10 mb-4" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-purple-600 mb-2">Zero Data Leak</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Passwords and photos are processed in volatile RAM. No data ever reaches a cloud database.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-8 py-10 border-t">
                <div className="text-center">
                    <HelpCircle className="mx-auto size-16 text-primary mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Aadhaar Printing FAQs</h2>
                </div>

                <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                    <AccordionItem value="item-1" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">How to crop Aadhaar for PVC print?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Simply upload your **A4 e-Aadhaar PDF**. If it's locked, enter the standard password (First 4 letters of NAME in CAPS + Year of Birth). Our tool will automatically render the page, allowing you to crop the front and back strips together for a standard 85.6mm PVC card.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Is it safe to enter my Aadhaar password here?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Yes. **GR7 Studio** is built on a client-side architecture. This means your password and PDF data are processed locally in your browser's memory. We do not store or see any of your private details.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-b-2 py-2">
                        <AccordionTrigger className="text-xl font-bold text-left">Which printer settings should I use?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg leading-relaxed pt-2">
                            Download the final print sheet and open it. When printing, ensure the **"Scale"** is set to **"100%"** or **"Actual Size"**. Do not use "Fit to Page" as it will change the ID-1 dimensions.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    </main>
  );
}
