
"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Plus, 
    Trash2, 
    Download, 
    Printer, 
    RefreshCcw, 
    Briefcase,
    GraduationCap,
    Settings2,
    Eye,
    ShieldCheck,
    Zap,
    Sparkles,
    CheckCircle,
    User2,
    ImageIcon,
    X,
    Layers,
    Palette,
    CheckCircle2,
    Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const IMAGE_PURPLE = "#6d28d9";
const GOLD_COLOR = "#f3cc8a";

const INITIAL_RESUME_DATA = {
    personal: {
        fullName: "Logan Osborne",
        title: "Senior UI/UX Developer",
        email: "logan@email.com",
        phone: "+012 3456 7890",
        location: "123 Street, New York, NY",
        linkedin: "linkedin.com/in/logan",
    },
    summary: "Hardworking Professional seeking employment. I am ready to utilize my skills and passion for furthering a company's mission. Technologically adept, offering experience with various social media platforms, office technology programs, and advanced computer skills. I am bringing forth a positive attitude, willingness, and motivation to learn new programs.",
    skills: [
        { name: "React & Next.js", level: 95 },
        { name: "Tailwind CSS", level: 90 },
        { name: "Firebase Architecture", level: 85 },
        { name: "UI Design (Figma)", level: 80 }
    ],
    experience: [
        {
            company: "Tech Giant Corp, New York",
            position: "Senior Frontend Lead",
            duration: "Sep 2023 - Present",
            description: "• Leading the UI development of high-performance web apps.\n• Implementing complex shift management logic in Shiftrack.\n• Managing salary and EPF calculation modules with 100% precision."
        }
    ],
    education: [
        {
            school: "New York University",
            degree: "Bachelor of Technology",
            year: "2018 - 2022",
            honors: "GPA: 4.0/4.0"
        }
    ],
    certifications: [
        { name: "Certified Web Expert", year: "2024", issuer: "NYU" }
    ]
};

const TEMPLATES = [
  { id: 'canva-pro', name: 'Pro Canvas', description: 'Purple blobs & modern wavy style' },
  { id: 'royal-gold', name: 'Royal Gold', description: 'Premium dark theme with gold' },
  { id: 'heritage', name: 'Royal Heritage', description: 'Traditional gold & deep red' },
  { id: 'floral', name: 'Floral Premium', description: 'Elegant decorative patterns' },
  { id: 'modern-edge', name: 'Modern Edge', description: 'Geometric high-contrast layout' },
];

export default function ResumeBuilder() {
    const { toast } = useToast();
    const [data, setData] = useState(INITIAL_RESUME_DATA);
    const [profilePic, setProfilePic] = useState<string | null>("https://picsum.photos/seed/portrait1/400/500");
    const [activeSection, setActiveSection] = useState('template');
    const [selectedTemplate, setSelectedTemplate] = useState('canva-pro');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePersonalChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    };

    const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setProfilePic(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setData(INITIAL_RESUME_DATA);
        setProfilePic("https://picsum.photos/seed/portrait1/400/500");
        toast({ title: "Reset Complete" });
    };

    return (
        <div className="w-full max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 pb-20 relative">
            
            {/* LEFT: STUDIO EDITOR (Hidden on Print) */}
            <div className="lg:col-span-5 space-y-6 no-print">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Settings2 className="size-6 text-primary" /> CV STUDIO
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="font-black text-[10px] uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1" /> Restore</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/30 p-1 border-b">
                                <TabsTrigger value="template" className="text-[8px] md:text-[9px] font-black uppercase">Styles</TabsTrigger>
                                <TabsTrigger value="personal" className="text-[8px] md:text-[9px] font-black uppercase">Identity</TabsTrigger>
                                <TabsTrigger value="skills" className="text-[8px] md:text-[9px] font-black uppercase">Skills</TabsTrigger>
                                <TabsTrigger value="experience" className="text-[8px] md:text-[9px] font-black uppercase">Exp</TabsTrigger>
                                <TabsTrigger value="education" className="text-[8px] md:text-[9px] font-black uppercase">Edu</TabsTrigger>
                            </TabsList>

                            <ScrollArea className="h-[600px] p-6 md:p-8">
                                <TabsContent value="template" className="space-y-6 mt-0">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                            <Layers className="size-3" /> Select Template Style
                                        </Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {TEMPLATES.map(t => (
                                                <button 
                                                    key={t.id}
                                                    onClick={() => setSelectedTemplate(t.id)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 text-left transition-all",
                                                        selectedTemplate === t.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted hover:border-primary/40"
                                                    )}
                                                >
                                                    <p className="font-black text-[10px] uppercase tracking-wider">{t.name}</p>
                                                    <p className="text-[8px] text-muted-foreground font-bold mt-1 uppercase">{t.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 pt-6 border-t">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                            <Camera className="size-3" /> Profile Photo
                                        </Label>
                                        <Button variant="outline" className="w-full h-12 border-2 border-dashed font-black text-xs uppercase" onClick={() => fileInputRef.current?.click()}>
                                            <ImageIcon className="mr-2 size-4" /> CHANGE PHOTO
                                        </Button>
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="personal" className="space-y-5 mt-0">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label>
                                        <Input value={data.personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase opacity-60">Professional Title</Label>
                                        <Input value={data.personal.title} onChange={(e) => handlePersonalChange('title', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase opacity-60">Email</Label>
                                            <Input value={data.personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className="h-10 rounded-lg border-2" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase opacity-60">Phone</Label>
                                            <Input value={data.personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className="h-10 rounded-lg border-2" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase opacity-60">Summary</Label>
                                        <Textarea value={data.summary} onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))} className="rounded-xl border-2 font-medium min-h-[120px]" />
                                    </div>
                                </TabsContent>

                                <TabsContent value="skills" className="space-y-4 mt-0">
                                    {data.skills.map((s, i) => (
                                        <div key={i} className="flex gap-2">
                                            <Input value={s.name} onChange={(e) => {
                                                const updated = [...data.skills];
                                                updated[i].name = e.target.value;
                                                setData(prev => ({ ...prev, skills: updated }));
                                            }} className="h-9 text-xs font-bold" />
                                            <Input type="number" value={s.level} onChange={(e) => {
                                                const updated = [...data.skills];
                                                updated[i].level = Number(e.target.value);
                                                setData(prev => ({ ...prev, skills: updated }));
                                            }} className="h-9 w-20 text-xs font-bold" />
                                        </div>
                                    ))}
                                </TabsContent>

                                <TabsContent value="experience" className="space-y-4 mt-0">
                                    {data.experience.map((exp, idx) => (
                                        <Card key={idx} className="p-4 border-2 rounded-xl space-y-3 bg-muted/5">
                                            <Input value={exp.company} onChange={(e) => {
                                                const updated = [...data.experience];
                                                updated[idx].company = e.target.value;
                                                setData(prev => ({ ...prev, experience: updated }));
                                            }} placeholder="Company" className="h-9 text-xs font-bold" />
                                            <Input value={exp.position} onChange={(e) => {
                                                const updated = [...data.experience];
                                                updated[idx].position = e.target.value;
                                                setData(prev => ({ ...prev, experience: updated }));
                                            }} placeholder="Position" className="h-9 text-xs font-bold" />
                                            <Textarea value={exp.description} onChange={(e) => {
                                                const updated = [...data.experience];
                                                updated[idx].description = e.target.value;
                                                setData(prev => ({ ...prev, experience: updated }));
                                            }} placeholder="Description" className="text-xs min-h-[80px]" />
                                        </Card>
                                    ))}
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 border-t flex flex-col gap-4">
                        <Button onClick={handlePrint} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] group">
                            <Printer className="mr-3 size-8 group-hover:scale-110 transition-transform" />
                            PRINT AS A4 PDF
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: LIVE FULL PAGE PREVIEW (Direct A4 View) */}
            <div className="lg:col-span-7 flex flex-col items-center no-print">
                <div className="w-full flex items-center justify-between mb-6 px-4">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Page Direct View</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-xl">STUDIO PREVIEW</Badge>
                </div>

                {/* THE WRAPPER THAT ALLOWS FULL NATURAL HEIGHT */}
                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/5 transition-all">
                    <div className="relative transform-gpu scale-[0.6] sm:scale-[0.8] lg:scale-[0.95] xl:scale-100 origin-top">
                         <ResumeContent data={data} template={selectedTemplate} profilePic={profilePic} />
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-2"><Sparkles className="size-3 text-primary" /> ATS OPTIMIZED</div>
                </div>
            </div>

            {/* THE ACTUAL PRINT LAYER - VISIBLE ONLY ON PRINT */}
            <div className="hidden print:block fixed inset-0 bg-white z-[99999]">
                 <div className="w-[210mm] min-h-[297mm] mx-auto bg-white flex justify-center items-start pt-0">
                    <ResumeContent data={data} template={selectedTemplate} profilePic={profilePic} />
                 </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    html, body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        width: 100% !important;
                        overflow: visible !important;
                    }
                    body * {
                        visibility: hidden !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    .print-target, .print-target * {
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print { display: none !important; }
                    
                    /* Force the target to sit at the absolute top of the print paper */
                    .print-target {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        display: block !important;
                        background: white !important;
                        z-index: 99999999 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

function ResumeContent({ data, template, profilePic }: { data: typeof INITIAL_RESUME_DATA, template: string, profilePic: string | null }) {
    const templates: Record<string, React.ReactNode> = {
        'royal-gold': <TemplateRoyalGold data={data} profilePic={profilePic} />,
        'heritage': <TemplateHeritage data={data} profilePic={profilePic} />,
        'floral': <TemplateFloral data={data} profilePic={profilePic} />,
        'modern-edge': <TemplateModernEdge data={data} profilePic={profilePic} />,
        'canva-pro': <TemplateCanvaPro data={data} profilePic={profilePic} />,
    };
    
    return (
        <div className="print-target shadow-2xl border">
            {templates[template] || templates['canva-pro']}
        </div>
    );
}

/* --- CANVA PRO (PURPLE BLOBS) --- */
function TemplateCanvaPro({ data, profilePic }: { data: typeof INITIAL_RESUME_DATA, profilePic: string | null }) {
    return (
        <div className="bg-white relative overflow-hidden flex flex-col" style={{ width: '210mm', minHeight: '297mm', color: '#1e293b' }}>
            <div className="absolute top-0 left-0 size-80 pointer-events-none opacity-20 -translate-x-20 -translate-y-20 z-0">
                <svg viewBox="0 0 100 100" fill={IMAGE_PURPLE}><path d="M0,0 C30,10 70,0 100,30 C110,60 80,90 40,100 C10,110 0,70 0,40 Z" /></svg>
            </div>
            <div className="absolute bottom-0 right-0 size-96 pointer-events-none opacity-10 translate-x-24 translate-y-24 z-0">
                <svg viewBox="0 0 100 100" fill={IMAGE_PURPLE}><path d="M100,100 C70,90 30,100 0,70 C-10,40 20,10 60,0 C90,-10 100,30 100,60 Z" /></svg>
            </div>
            <div className="relative z-10 p-12 space-y-10 flex-1 flex flex-col">
                <header className="flex items-center gap-10">
                    <div className="size-40 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-slate-50 shrink-0">
                        {profilePic ? <img src={profilePic} className="size-full object-cover" alt="profile" /> : <User2 className="size-full p-4 text-slate-200" />}
                    </div>
                    <div className="space-y-1 text-left">
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900">{data.personal.fullName}</h1>
                        <p className="text-2xl font-bold text-purple-600/60 uppercase tracking-widest">{data.personal.title}</p>
                    </div>
                </header>
                <div className="grid grid-cols-12 gap-12 flex-1">
                    <div className="col-span-8 space-y-10 text-left">
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight border-b-2 border-purple-50 pb-2">Profile</h3>
                            <p className="text-sm leading-relaxed text-slate-600 font-medium">{data.summary}</p>
                        </section>
                        <section className="space-y-6">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight border-b-2 border-purple-50 pb-2">Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} className="space-y-1">
                                    <h4 className="font-black text-slate-800">{exp.position} | {exp.company}</h4>
                                    <p className="text-[11px] font-bold text-slate-400">{exp.duration}</p>
                                    <p className="text-xs text-slate-600 whitespace-pre-line mt-2">{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                    <div className="col-span-4 space-y-10 border-l pl-8 border-purple-50 text-left">
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight">Contact</h3>
                            <div className="space-y-3 text-xs font-bold text-slate-600">
                                <div className="flex items-center gap-2"><Mail className="size-3 text-purple-500"/> {data.personal.email}</div>
                                <div className="flex items-center gap-2"><Phone className="size-3 text-purple-500"/> {data.personal.phone}</div>
                                <div className="flex items-center gap-2"><MapPin className="size-3 text-purple-500"/> {data.personal.location}</div>
                            </div>
                        </section>
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight">Expertise</h3>
                            <div className="space-y-4">
                                {data.skills.map((s, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between items-center"><p className="text-[10px] font-black text-slate-700 uppercase">{s.name}</p><span className="text-[8px] font-bold opacity-40">{s.level}%</span></div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-purple-600" style={{ width: `${s.level}%` }} /></div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- ROYAL GOLD (DARK & GOLD) --- */
function TemplateRoyalGold({ data, profilePic }: { data: typeof INITIAL_RESUME_DATA, profilePic: string | null }) {
    return (
        <div className="bg-[#1a1a1a] p-12 text-white flex flex-col" style={{ width: '210mm', minHeight: '297mm' }}>
            <header className="border-b-4 border-[#f3cc8a] pb-10 mb-10 text-center relative">
                <div className="flex flex-col items-center gap-6">
                    <div className="size-32 rounded-lg border-2 border-[#f3cc8a] p-1 rotate-3 bg-[#1a1a1a] shadow-2xl overflow-hidden shrink-0">
                        {profilePic ? <img src={profilePic} className="size-full object-cover" alt="profile" /> : <User2 className="size-full opacity-20" color="#f3cc8a" />}
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black uppercase tracking-widest text-[#f3cc8a]">{data.personal.fullName}</h1>
                        <p className="text-lg font-bold tracking-[0.3em] opacity-80 uppercase">{data.personal.title}</p>
                    </div>
                </div>
                <div className="flex justify-center gap-6 text-[10px] font-black uppercase opacity-40 mt-6 tracking-widest">
                    <span>{data.personal.email}</span> • <span>{data.personal.phone}</span> • <span>{data.personal.location}</span>
                </div>
            </header>
            <div className="space-y-12">
                <section className="space-y-4 text-center">
                    <h3 className="text-xl font-black text-[#f3cc8a] uppercase tracking-widest flex items-center gap-4">
                        <span className="h-px bg-[#f3cc8a]/20 flex-1"></span> Executive Summary <span className="h-px bg-[#f3cc8a]/20 flex-1"></span>
                    </h3>
                    <p className="text-sm leading-relaxed opacity-70 text-center font-medium px-8">{data.summary}</p>
                </section>
                <section className="space-y-8 text-left">
                    <h3 className="text-xl font-black text-[#f3cc8a] uppercase tracking-widest flex items-center gap-4">
                        <span className="h-px bg-[#f3cc8a]/20 flex-1"></span> Professional Experience <span className="h-px bg-[#f3cc8a]/20 flex-1"></span>
                    </h3>
                    <div className="space-y-8">
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between items-center"><h4 className="text-lg font-black uppercase">{exp.position}</h4><span className="text-[10px] font-black opacity-40">{exp.duration}</span></div>
                                <p className="text-sm font-bold text-[#f3cc8a]/80 uppercase tracking-widest">{exp.company}</p>
                                <p className="text-xs opacity-60 whitespace-pre-line mt-2 leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

/* --- ROYAL HERITAGE (TRADITIONAL) --- */
function TemplateHeritage({ data, profilePic }: { data: typeof INITIAL_RESUME_DATA, profilePic: string | null }) {
    return (
        <div className="bg-white p-8 flex flex-col" style={{ width: '210mm', minHeight: '297mm', border: '15px solid #800000' }}>
            <div className="border-2 border-[#B8860B] p-8 flex-1 flex flex-col relative">
                <header className="flex flex-col items-center mb-10 text-center gap-4">
                    <div className="size-36 rounded-sm border-4 border-[#800000] p-1 bg-white shadow-xl overflow-hidden shrink-0">
                         {profilePic ? <img src={profilePic} className="size-full object-cover" alt="profile" /> : <User2 className="size-full opacity-10" />}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black uppercase text-[#800000] tracking-tighter">{data.personal.fullName}</h1>
                        <p className="text-lg font-bold text-[#B8860B] tracking-[0.3em] uppercase">{data.personal.title}</p>
                    </div>
                    <div className="w-full bg-[#B8860B]/10 h-0.5 my-2" />
                    <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                         <span>{data.personal.email}</span> • <span>{data.personal.phone}</span> • <span>{data.personal.location}</span>
                    </div>
                </header>
                <div className="space-y-10 text-left">
                    <section className="space-y-3">
                        <h3 className="text-lg font-black text-[#800000] uppercase border-b-2 border-[#B8860B]/20 pb-1 tracking-widest">Professional Profile</h3>
                        <p className="text-xs leading-relaxed font-bold text-slate-600 text-justify">{data.summary}</p>
                    </section>
                    <section className="space-y-8">
                        <h3 className="text-lg font-black text-[#800000] uppercase border-b-2 border-[#B8860B]/20 pb-1 tracking-widest">Career Milestones</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-1">
                                <h4 className="font-black text-sm text-slate-900 uppercase">{exp.position} | {exp.company}</h4>
                                <p className="text-[10px] font-bold text-[#B8860B]">{exp.duration}</p>
                                <p className="text-[11px] mt-2 text-slate-500 whitespace-pre-line leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}

/* --- FLORAL PREMIUM --- */
function TemplateFloral({ data, profilePic }: { data: typeof INITIAL_RESUME_DATA, profilePic: string | null }) {
    return (
        <div className="bg-[#fffafa] p-16 flex flex-col gap-12 relative overflow-hidden" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="absolute top-[-50px] right-[-50px] size-64 rounded-full border-[30px] border-rose-100 opacity-50" />
            <div className="absolute bottom-[-50px] left-[-50px] size-80 rounded-full border-[40px] border-rose-100 opacity-50" />
            <header className="relative z-10 flex items-center justify-between text-left">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black text-rose-800 tracking-tighter">{data.personal.fullName}</h1>
                    <div className="flex gap-6 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                        <span>{data.personal.email}</span> • <span>{data.personal.phone}</span>
                    </div>
                </div>
                <div className="size-32 rounded-3xl border-4 border-rose-200 rotate-6 overflow-hidden bg-white shadow-2xl">
                     {profilePic ? <img src={profilePic} className="size-full object-cover" alt="profile" /> : <User2 className="size-full p-4 opacity-10" />}
                </div>
            </header>
            <div className="relative z-10 grid grid-cols-3 gap-16 flex-1 text-left">
                <div className="col-span-2 space-y-12">
                    <section className="space-y-4">
                        <h3 className="text-xl font-black text-rose-800 uppercase tracking-widest border-l-4 border-rose-800 pl-4">Introduction</h3>
                        <p className="text-sm leading-relaxed text-slate-600 font-medium">{data.summary}</p>
                    </section>
                    <section className="space-y-8">
                        <h3 className="text-xl font-black text-rose-800 uppercase tracking-widest border-l-4 border-rose-800 pl-4">Employment</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">{exp.position}</h4>
                                <div className="flex justify-between text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                    <span>{exp.company}</span>
                                    <span>{exp.duration}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed pt-2">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
                <div className="space-y-10">
                    <section className="space-y-6">
                        <h3 className="text-xl font-black text-rose-800 uppercase tracking-widest">Expertise</h3>
                        {data.skills.map((s, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase opacity-60"><span>{s.name}</span><span>{s.level}%</span></div>
                                <div className="h-1.5 bg-rose-50 rounded-full overflow-hidden"><div className="h-full bg-rose-800" style={{ width: `${s.level}%` }} /></div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}

/* --- MODERN EDGE --- */
function TemplateModernEdge({ data, profilePic }: { data: typeof INITIAL_RESUME_DATA, profilePic: string | null }) {
    return (
        <div className="bg-[#0f172a] p-0 flex flex-col text-white" style={{ width: '210mm', minHeight: '297mm' }}>
            <header className="bg-white text-slate-900 p-12 flex items-center justify-between border-b-[10px] border-blue-600 text-left">
                <div className="flex items-center gap-8">
                    <div className="size-32 rounded-2xl bg-slate-100 overflow-hidden border-4 border-white shadow-2xl">
                         {profilePic ? <img src={profilePic} className="size-full object-cover" alt="profile" /> : <User2 className="size-full p-4 opacity-20" />}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">{data.personal.fullName}</h1>
                        <p className="text-xl font-black text-blue-600 uppercase tracking-[0.2em]">{data.personal.title}</p>
                    </div>
                </div>
                <div className="text-right space-y-1 font-black text-[10px] uppercase opacity-40">
                    <p>{data.personal.email}</p><p>{data.personal.phone}</p><p>{data.personal.location}</p>
                </div>
            </header>
            <div className="p-12 grid grid-cols-12 gap-16 flex-1 text-left">
                <div className="col-span-4 space-y-12">
                    <section className="space-y-6">
                        <h3 className="text-xl font-black uppercase text-blue-500 tracking-widest">Core Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((s, i) => <Badge key={i} className="bg-slate-800 text-white border-none py-2 px-4 rounded-none text-[9px] font-black tracking-widest">{s.name.toUpperCase()}</Badge>)}
                        </div>
                    </section>
                </div>
                <div className="col-span-8 space-y-12">
                    <section className="space-y-4">
                        <h3 className="text-xl font-black uppercase text-blue-500 tracking-widest">Profile Statement</h3>
                        <p className="text-sm font-medium leading-relaxed opacity-60 text-justify">{data.summary}</p>
                    </section>
                    <section className="space-y-10">
                        <h3 className="text-xl font-black uppercase text-blue-500 tracking-widest">Experience</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-2 border-l-2 border-slate-800 pl-8 relative">
                                <div className="absolute left-[-5px] top-2 size-2 bg-blue-500 rounded-full" />
                                <h4 className="text-lg font-black uppercase tracking-tight">{exp.position}</h4>
                                <div className="flex justify-between items-center text-[10px] font-black opacity-40 uppercase tracking-widest"><span>{exp.company}</span><span>{exp.duration}</span></div>
                                <p className="text-xs opacity-60 pt-3 leading-relaxed">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
        </div>
    );
}

