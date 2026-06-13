import { Metadata } from 'next';
import PassportDateNameMaker from '@/components/passport-date-name-maker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles, Maximize, ShieldCheck, Zap, User, Calendar, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Add Name & Date on Photo Online – Free Photo Text Tool - GR7 Tools',
  description: 'How to Add Name & Date on Photo Online (Step-by-Step) · Step 1: Open the Tool · Step 2: Upload Your Photo · Step 3: Enter Name & Date · Step 4: Download Optimized JPG for SSC, UPSC & IBPS.',
  alternates: { canonical: 'https://www.gr7imagepdf.com/passport-date-name' }
};

export default function PassportDateNamePage() {
  const steps = [
    {
        title: "Personal Identity",
        description: "Enter your full name and the date the photo was taken. These will be rendered at the bottom in the standard govt-compliant font.",
        icon: "Type"
    },
    {
        title: "Photo Import",
        description: "Select your portrait. Our engine initializes a 3.5cm x 4.5cm high-fidelity canvas in your browser RAM to ensure 100% privacy.",
        icon: "UploadCloud"
    },
    {
        title: "Smart Centering",
        description: "The tool automatically scales and centers your face. It adds a standard white strip at the bottom for your name and date details.",
        icon: "Maximize"
    },
    {
        title: "HD Studio Save",
        description: "Click 'Download Passport'. Your photo is rendered at 300DPI in JPG format, ready for all government portal submissions.",
        icon: "Download"
    }
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4">
            <div className="w-full max-w-5xl text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[9px] font-black uppercase tracking-[0.2em] mb-2 shadow-sm">
                    <Sparkles className="size-2.5" /> RECRUITMENT STUDIO
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-none">
                    Add Name & <span className="text-gradient-hero">Date to Photo</span>
                </h1>
                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Create passport photos with Name & Date (DOP) for SSC, UPSC and Banking portals. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PassportDateNameMaker />
            </div>
        </div>

        <div className="w-full max-w-7xl mx-auto space-y-16 px-4 pb-20">
            <HowToGuide title="Add Name & Date to Photo" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
                        Standard Recruitment Compliance
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base font-medium">
                        Most government portals like <strong>Staff Selection Commission (SSC)</strong> and <strong>UPSC</strong> require the candidate's name and photo date printed clearly. Our studio handles the complex pixel math for you.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-primary/50 transition-all">
                        <User className="text-primary size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Strict 3.5x4.5cm</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Automatic aspect ratio lock ensures your photo is never stretched and fits the official form requirements perfectly.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-blue-500/50 transition-all">
                        <Calendar className="text-blue-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Date of Photo (DOP)</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Easily add the photo date. Our engine renders it in a clean, legible font that scanners can read accurately.</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 shadow-xl space-y-4 hover:border-teal-500/50 transition-all">
                        <ShieldCheck className="text-teal-500 size-10" />
                        <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 dark:text-white">Zero Server Risk</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold">Your identity is sensitive. We process everything in your local device RAM. We never store or see your photos.</p>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
