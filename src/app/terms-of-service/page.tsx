import { BookOpen, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <main className="container mx-auto p-6 md:p-12 max-w-4xl animate-in fade-in duration-500">
      <div className="mb-12 text-center space-y-4">
        <div className="mx-auto size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center shadow-xl mb-6">
          <BookOpen className="size-10 text-primary" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">Terms of Service</h1>
        <p className="text-xl text-muted-foreground font-semibold">Standard Guidelines for Using GR7 Tools.</p>
      </div>

      <div className="space-y-8">
        <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-8">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <CheckCircle2 className="text-blue-500" /> 
              1. USE OF SERVICES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-lg font-medium text-muted-foreground leading-relaxed">
            By accessing <strong>GR7 Tools</strong>, you agree to use our utilities for lawful purposes only. Our tools are designed for personal and professional file manipulation. You are responsible for ensuring that you have the right to process the files you choose to edit.
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-2 shadow-lg rounded-3xl">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="size-5 text-orange-500" /> Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm font-medium text-muted-foreground leading-relaxed">
              While we strive for high precision, <strong>GR7 Tools</strong> provides its services "as is." We are not liable for any data loss, file corruption, or errors in calculations. Always keep a backup of your original files.
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg rounded-3xl">
            <CardHeader className="p-6 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Scale className="size-5 text-primary" /> Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-sm font-medium text-muted-foreground leading-relaxed">
              All branding, logos, and custom code of GR7 Tools are protected. You may not scrape, clone, or redistribute our tools without explicit permission from the developer.
            </CardContent>
          </Card>
        </div>

        <section className="p-8 bg-white/50 dark:bg-slate-900/50 rounded-3xl border-2 border-primary/5">
          <h2 className="text-xl font-black mb-4 uppercase tracking-tight">2. Limitation of Liability</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            In no event shall the owner of GR7 Tools be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use the tools provided on this website.
          </p>
        </section>
        
        <p className="text-center text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pb-20">
          Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </main>
  );
}
