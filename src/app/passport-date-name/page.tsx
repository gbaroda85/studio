import { Metadata } from 'next';
import PassportDateNameMaker from '@/components/passport-date-name-maker';
import { HowToGuide } from '@/components/how-to-guide';
import { ToolNavigation } from '@/components/tool-navigation';
import { Sparkles, Maximize, ShieldCheck, Zap, User, Calendar, Download, X, ChevronDown } from 'lucide-react';

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
    <main className="flex-1 flex flex-col items-center w-full pt-16 md:pt-28 text-left">
        <ToolNavigation href="/tools?tab=image" label="Back to Image Tools" />

        <div className="w-full flex flex-col items-center mb-12 px-4 max-w-[1600px] mx-auto">
            <div className="w-full text-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
                {/* PREMIUM CAPSULE HEADER */}
                <div className="inline-flex items-center p-1 md:p-1.5 pr-4 md:pr-6 rounded-full bg-[#e0fdf4] dark:bg-emerald-950/30 border border-[#bbf7d0] dark:border-emerald-500/20 shadow-sm mb-4 group transition-all hover:scale-105">
                    <div className="size-7 md:size-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg shrink-0">
                        <X className="size-4 md:size-5 stroke-[4]" />
                    </div>
                    <span className="ml-3 font-black text-[10px] md:text-xs tracking-widest text-slate-800 dark:text-emerald-400 uppercase">
                        ADD NAME & PHOTO
                    </span>
                    <div className="w-px h-4 bg-slate-300/60 dark:bg-emerald-500/20 mx-4" />
                    <ChevronDown className="size-4 text-slate-800 dark:text-emerald-400 opacity-50" />
                </div>

                {/* UPDATED TITLE: ONE LINE CONTINUITY, NO CARD */}
                <h1 className="text-3xl md:text-5xl lg:text-7xl tracking-tighter leading-tight flex flex-wrap items-baseline justify-center gap-x-3 md:gap-x-5 mb-2">
                    <span className="font-['Dancing_Script'] text-primary normal-case">Add Name &</span>
                    <span className="font-jakarta font-black uppercase text-gradient-hero">Date to Photo</span>
                </h1>

                <p className="text-muted-foreground font-bold max-w-xl mx-auto text-xs md:text-sm">
                    Create passport photos with Name & Date (DOP) for SSC, UPSC and Banking portals. 100% Private.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <PassportDateNameMaker />
            </div>
        </div>

        <div className="w-full max-w-5xl mx-auto space-y-16 px-4 md:px-12 pb-20">
            <HowToGuide title="Add Name & Date to Photo" steps={steps} />

            <section className="space-y-10 py-10 border-t">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight flex items-center justify-center gap-3 text-slate-800 dark:text-white">
                        Standard Recruitment Compliance
                    </h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
                        Most government portals like <strong>Staff Selection Commission (SSC)</strong> and <strong>UPSC</strong> require the candidate's name and photo date printed clearly.
                    </p>
                </div>
                
                <div className="relative">
                    {/* Connecting Lines (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 z-0">
                        <svg className="w-full h-24 absolute -top-12" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d="M 300 50 C 400 50, 400 20, 500 50 S 600 80, 700 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-muted-foreground/20" />
                            <circle cx="330" cy="50" r="4" className="fill-cyan-500" />
                            <circle cx="660" cy="50" r="4" className="fill-indigo-500" />
                        </svg>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shadow-inner">
                                    <User className="text-cyan-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-cyan-600">STRICT 3.5x4.5CM</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Automatic aspect ratio lock ensures your photo is never stretched and fits official forms.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-indigo-400 to-purple-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shadow-inner">
                                    <Calendar className="text-indigo-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-indigo-600">DATE OF PHOTO</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Easily add the photo date. Our engine renders it in a clean, legible font for official scanners.</p>
                            </div>
                        </div>

                        <div className="group p-[2px] rounded-[2.5rem] bg-gradient-to-br from-purple-400 to-pink-600 shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 h-full flex flex-col items-center text-center space-y-4">
                                <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shadow-inner">
                                    <ShieldCheck className="text-purple-500 size-6" />
                                </div>
                                <h3 className="font-black uppercase text-sm tracking-widest text-purple-600">ZERO SERVER RISK</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold uppercase opacity-80">Your identity is sensitive. We process everything in your local device RAM for total security.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
  );
}
