import { ShieldCheck, Database, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Your Data Stays on Your Device',
  description: 'Learn how GR7 Tools protects your privacy. We use client-side processing, meaning your images and PDFs never leave your browser.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/privacy-policy' }
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto p-6 md:p-12 max-w-4xl animate-in fade-in duration-500">
      <div className="mb-12 text-center space-y-4">
        <div className="mx-auto size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-xl mb-6">
          <ShieldCheck className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground font-semibold">Your Data. Your Browser. Your Privacy.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <ShieldCheck className="text-green-500" /> 
              ZERO SERVER STORAGE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-lg font-medium text-muted-foreground leading-relaxed space-y-4">
            <p>
              At <strong>GR7 Tools</strong>, privacy is not just a feature—it is our core architecture. Unlike other online tools, we do not upload your images, PDFs, or documents to any remote server.
            </p>
            <p className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-primary">
              Every file transformation, compression, and edit happens 100% inside your device's memory (RAM) using client-side JavaScript.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-2 shadow-lg rounded-3xl">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Database className="size-5 text-primary" /> Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm font-medium text-muted-foreground leading-relaxed">
              We do not collect personal information, email addresses, or document data. We use standard analytics (like Google Analytics) to track anonymous website traffic and usage patterns to improve tool performance.
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg rounded-3xl">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Lock className="size-5 text-primary" /> Cookies & Ads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm font-medium text-muted-foreground leading-relaxed">
              We may use minimal cookies to save your language preferences. Third-party advertising partners (like Google AdSense) may use cookies to serve relevant ads based on your site visits.
            </CardContent>
          </Card>
        </div>

        <section className="p-8 bg-white/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed">
          <h2 className="text-xl font-black mb-4 uppercase tracking-tight">Contact Information</h2>
          <p className="text-muted-foreground font-medium">
            If you have any questions regarding this privacy policy or the functionality of our local tools, please reach out to us at:
            <br />
            <a href="mailto:gr7imagepdf@gmail.com" className="text-primary font-bold hover:underline">gr7imagepdf@gmail.com</a>
          </p>
        </section>
        
        <p className="text-center text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pb-20">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </main>
  );
}
