
"use client";

import React, { useState } from 'react';
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
    CheckCircle2
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
        title: "Student",
        email: "logan@email.com",
        phone: "+012 3456 7890",
        location: "123 Street, New York, NY",
        linkedin: "linkedin.com/in/logan",
    },
    summary: "Hardworking Student seeking employment. I am ready to utilize my skills and passion for furthering a company's mission. Technologically adept, offering experience with various social media platforms, office technology programs, and advanced computer skills. I am bringing forth a positive attitude, willingness, and motivation to learn new programs.",
    skills: [
        { name: "Communication Skills", level: 90 },
        { name: "Motivated Attitude", level: 85 },
        { name: "Office Technology Skills", level: 80 },
        { name: "Next.js & React", level: 75 }
    ],
    experience: [
        {
            company: "Big Apple Bookstore, New York",
            position: "Sales Associate",
            duration: "Sep 2023 - Present",
            description: "• Greeted customers and assisted them with finding books.\n• Offered literary suggestions based on needs.\n• Managed inventory with high precision."
        }
    ],
    education: [
        {
            school: "New York University",
            degree: "Bachelor of Communications",
            year: "2022 - 2026",
            honors: "GPA: 4.0/4.0"
        }
    ],
    certifications: [
        { name: "Honorary Student", year: "2024", issuer: "NYU" }
    ]
};

const TEMPLATES = [
  { id: 'canva-pro', name: 'Pro Canvas', description: 'Purple blobs & modern wavy style' },
  { id: 'royal-gold', name: 'Royal Gold', description: 'Premium dark theme with gold' },
  { id: 'heritage', name: 'Royal Heritage', description: 'Traditional gold & deep red' },
  { id: 'floral', name: 'Floral Premium', description: 'Elegant decorative patterns' },
  { id: 'modern-edge', name: 'Modern Edge', description: 'Geometric high-contrast layout' },
];

interface ResumeBuilderProps {
    isPrintMode?: boolean;
}

export default function ResumeBuilder({ isPrintMode = false }: ResumeBuilderProps) {
    const { toast } = useToast();
    const [data, setData] = useState(INITIAL_RESUME_DATA);
    const [activeSection, setActiveSection] = useState('template');
    const [selectedTemplate, setSelectedTemplate] = useState('canva-pro');
    const [themeColor, setThemeColor] = useState(IMAGE_PURPLE);
    
    const handlePersonalChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setData(INITIAL_RESUME_DATA);
        toast({ title: "Reset Complete" });
    };

    if (!isPrintMode) {
        return (
            <div className="w-full max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 pb-20 no-print">
                
                {/* LEFT: STUDIO EDITOR */}
                <div className="lg:col-span-5 space-y-6">
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
                                        <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest mb-4">Choose Template</Badge>
                                        <div className="grid grid-cols-1 gap-3">
                                            {TEMPLATES.map(t => (
                                                <button 
                                                    key={t.id}
                                                    onClick={() => {
                                                        setSelectedTemplate(t.id);
                                                        if(t.id === 'royal-gold' || t.id === 'heritage') setThemeColor("#1a1a1a");
                                                        else if(t.id === 'canva-pro') setThemeColor(IMAGE_PURPLE);
                                                        else setThemeColor("#0a8491");
                                                    }}
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

                {/* RIGHT: LIVE PREVIEW */}
                <div className="lg:col-span-7 flex flex-col items-center sticky top-24 no-print">
                    <div className="w-full flex items-center justify-between mb-4 px-4">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live {selectedTemplate} View</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-xl">A4 PREVIEW</Badge>
                    </div>

                    <ScrollArea className="w-full h-[80vh] bg-slate-200 dark:bg-slate-900 rounded-[3rem] p-4 md:p-10 shadow-inner">
                        <div className="flex justify-center w-full">
                            <ResumeContent data={data} template={selectedTemplate} />
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center bg-white print-fix-container">
            <ResumeContent data={data} template={selectedTemplate} />
        </div>
    );
}

function ResumeContent({ data, template }: { data: typeof INITIAL_RESUME_DATA, template: string }) {
    if (template === 'royal-gold') return <TemplateRoyalGold data={data} />;
    if (template === 'heritage') return <TemplateHeritage data={data} />;
    if (template === 'floral') return <TemplateFloral data={data} />;
    if (template === 'modern-edge') return <TemplateModernEdge data={data} />;
    return <TemplateCanvaPro data={data} />;
}

/* --- CANVA PRO (PURPLE BLOBS) --- */
function TemplateCanvaPro({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-white relative overflow-hidden flex flex-col" style={{ width: '210mm', minHeight: '297mm', color: '#1e293b' }} id="resume-a4">
            <div className="absolute top-0 left-0 size-80 pointer-events-none opacity-20 -translate-x-20 -translate-y-20 z-0">
                <svg viewBox="0 0 100 100" fill={IMAGE_PURPLE}><path d="M0,0 C30,10 70,0 100,30 C110,60 80,90 40,100 C10,110 0,70 0,40 Z" /></svg>
            </div>
            <div className="absolute bottom-0 right-0 size-96 pointer-events-none opacity-10 translate-x-24 translate-y-24 z-0">
                <svg viewBox="0 0 100 100" fill={IMAGE_PURPLE}><path d="M100,100 C70,90 30,100 0,70 C-10,40 20,10 60,0 C90,-10 100,30 100,60 Z" /></svg>
            </div>
            <div className="relative z-10 p-12 space-y-10 flex-1 flex flex-col">
                <header className="flex items-center gap-10">
                    <div className="size-40 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-slate-50 shrink-0"><User2 className="size-full p-4 text-slate-200" /></div>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900">{data.personal.fullName}</h1>
                        <p className="text-2xl font-bold text-slate-400 uppercase tracking-widest">{data.personal.title}</p>
                    </div>
                </header>
                <div className="grid grid-cols-12 gap-12 flex-1">
                    <div className="col-span-8 space-y-10">
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight">Profile</h3>
                            <p className="text-sm leading-relaxed text-slate-600 font-medium">{data.summary}</p>
                        </section>
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight">Experience</h3>
                            {data.experience.map((exp, i) => (
                                <div key={i} className="space-y-1">
                                    <h4 className="font-black text-slate-800">{exp.position} | {exp.company}</h4>
                                    <p className="text-[11px] font-bold text-slate-400">{exp.duration}</p>
                                    <p className="text-xs text-slate-600 whitespace-pre-line mt-2">{exp.description}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                    <div className="col-span-4 space-y-10 border-l pl-8 border-purple-50">
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight">Contact</h3>
                            <div className="space-y-2 text-xs font-bold text-slate-600">
                                <p>{data.personal.email}</p><p>{data.personal.phone}</p><p>{data.personal.location}</p>
                            </div>
                        </section>
                        <section className="space-y-4">
                            <h3 className="text-xl font-black text-purple-700 uppercase tracking-tight">Skills</h3>
                            {data.skills.map((s, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-xs font-bold text-slate-700">{s.name}</p>
                                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-purple-600" style={{ width: `${s.level}%` }} /></div>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </div>
            <ResumeStyles />
        </div>
    );
}

/* --- ROYAL GOLD (DARK & GOLD) --- */
function TemplateRoyalGold({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-[#1a1a1a] p-12 text-white flex flex-col" style={{ width: '210mm', minHeight: '297mm' }} id="resume-a4">
            <header className="border-b-4 border-[#f3cc8a] pb-10 mb-10 text-center space-y-4">
                <h1 className="text-6xl font-black uppercase tracking-widest text-[#f3cc8a]">{data.personal.fullName}</h1>
                <p className="text-xl font-bold tracking-[0.3em] opacity-80">{data.personal.title}</p>
                <div className="flex justify-center gap-6 text-xs font-bold opacity-60">
                    <span>{data.personal.email}</span> • <span>{data.personal.phone}</span> • <span>{data.personal.location}</span>
                </div>
            </header>
            <div className="space-y-12">
                <section className="space-y-4">
                    <h3 className="text-2xl font-black text-[#f3cc8a] uppercase tracking-widest">Executive Summary</h3>
                    <p className="text-base leading-relaxed opacity-80 text-justify">{data.summary}</p>
                </section>
                <section className="space-y-6">
                    <h3 className="text-2xl font-black text-[#f3cc8a] uppercase tracking-widest">Professional Experience</h3>
                    {data.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center"><h4 className="text-lg font-black">{exp.position}</h4><span className="text-sm font-bold opacity-50">{exp.duration}</span></div>
                            <p className="text-md font-bold text-[#f3cc8a]/80">{exp.company}</p>
                            <p className="text-sm opacity-70 whitespace-pre-line mt-2">{exp.description}</p>
                        </div>
                    ))}
                </section>
            </div>
            <ResumeStyles />
        </div>
    );
}

/* --- ROYAL HERITAGE (TRADITIONAL) --- */
function TemplateHeritage({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-white p-10 flex flex-col" style={{ width: '210mm', minHeight: '297mm', border: '15px solid #800000' }} id="resume-a4">
            <div className="border-2 border-[#B8860B] p-8 flex-1 flex flex-col">
                <header className="text-center mb-10 space-y-2">
                    <h1 className="text-5xl font-black uppercase text-[#800000]">{data.personal.fullName}</h1>
                    <p className="text-lg font-bold text-[#B8860B] tracking-widest">{data.personal.title}</p>
                    <Separator className="bg-[#B8860B]/30 h-1 my-4" />
                </header>
                <div className="space-y-10">
                    <section className="space-y-3">
                        <h3 className="text-xl font-black text-[#800000] uppercase border-b-2 border-[#B8860B]/20 pb-1">About Me</h3>
                        <p className="text-sm leading-relaxed font-medium">{data.summary}</p>
                    </section>
                    <section className="space-y-6">
                        <h3 className="text-xl font-black text-[#800000] uppercase border-b-2 border-[#B8860B]/20 pb-1">Work History</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-1">
                                <h4 className="font-black">{exp.position} at {exp.company}</h4>
                                <p className="text-xs italic opacity-60">{exp.duration}</p>
                                <p className="text-xs mt-2 text-justify">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
            <ResumeStyles />
        </div>
    );
}

/* --- FLORAL PREMIUM --- */
function TemplateFloral({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-[#fffafa] p-16 flex flex-col gap-12 relative overflow-hidden" style={{ width: '210mm', minHeight: '297mm' }} id="resume-a4">
            <div className="absolute top-[-50px] right-[-50px] size-64 rounded-full border-[30px] border-rose-100 opacity-50" />
            <div className="absolute bottom-[-50px] left-[-50px] size-80 rounded-full border-[40px] border-rose-100 opacity-50" />
            <header className="relative z-10 space-y-4">
                <h1 className="text-6xl font-black text-rose-800 tracking-tighter">{data.personal.fullName}</h1>
                <div className="flex gap-6 text-xs font-bold text-rose-400 uppercase tracking-widest">
                    <span>{data.personal.email}</span> • <span>{data.personal.phone}</span>
                </div>
            </header>
            <div className="relative z-10 grid grid-cols-3 gap-16 flex-1">
                <div className="col-span-2 space-y-12">
                    <section className="space-y-4">
                        <h3 className="text-xl font-black text-rose-800 uppercase tracking-widest border-l-4 border-rose-800 pl-4">Introduction</h3>
                        <p className="text-md leading-relaxed text-slate-600">{data.summary}</p>
                    </section>
                    <section className="space-y-6">
                        <h3 className="text-xl font-black text-rose-800 uppercase tracking-widest border-l-4 border-rose-800 pl-4">Experience</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-2">
                                <h4 className="text-lg font-black text-slate-800">{exp.position}</h4>
                                <p className="text-xs font-bold text-rose-400">{exp.company} • {exp.duration}</p>
                                <p className="text-sm text-slate-500">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
                <div className="space-y-10">
                    <section className="space-y-6">
                        <h3 className="text-xl font-black text-rose-800 uppercase tracking-widest">Expertise</h3>
                        {data.skills.map((s, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold"><span>{s.name}</span><span>{s.level}%</span></div>
                                <div className="h-1.5 bg-rose-50 rounded-full overflow-hidden"><div className="h-full bg-rose-800" style={{ width: `${s.level}%` }} /></div>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
            <ResumeStyles />
        </div>
    );
}

/* --- MODERN EDGE --- */
function TemplateModernEdge({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-[#0f172a] p-0 flex flex-col text-white" style={{ width: '210mm', minHeight: '297mm' }} id="resume-a4">
            <header className="bg-white text-slate-900 p-16 flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">{data.personal.fullName.split(' ')[0]} <br/> {data.personal.fullName.split(' ')[1]}</h1>
                    <p className="text-2xl font-black text-blue-600 uppercase tracking-[0.2em]">{data.personal.title}</p>
                </div>
                <div className="text-right space-y-1 font-black text-xs uppercase opacity-40">
                    <p>{data.personal.email}</p><p>{data.personal.phone}</p><p>{data.personal.location}</p>
                </div>
            </header>
            <div className="p-16 grid grid-cols-12 gap-16 flex-1">
                <div className="col-span-4 space-y-12">
                    <section className="space-y-6">
                        <h3 className="text-xl font-black uppercase text-blue-500 tracking-widest">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((s, i) => <Badge key={i} className="bg-slate-800 text-white border-none py-1.5 px-3 rounded-none text-[10px] font-black">{s.name.toUpperCase()}</Badge>)}
                        </div>
                    </section>
                </div>
                <div className="col-span-8 space-y-12">
                    <section className="space-y-6">
                        <h3 className="text-xl font-black uppercase text-blue-500 tracking-widest">Profile</h3>
                        <p className="text-lg font-medium leading-relaxed opacity-60 text-justify">{data.summary}</p>
                    </section>
                    <section className="space-y-10">
                        <h3 className="text-xl font-black uppercase text-blue-500 tracking-widest">Experience</h3>
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-2 border-l-2 border-slate-800 pl-8 relative">
                                <div className="absolute left-[-5px] top-2 size-2 bg-blue-500 rounded-full" />
                                <h4 className="text-xl font-black uppercase">{exp.position}</h4>
                                <div className="flex justify-between items-center text-xs font-black opacity-40 uppercase"><span>{exp.company}</span><span>{exp.duration}</span></div>
                                <p className="text-sm opacity-60 pt-2">{exp.description}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>
            <ResumeStyles />
        </div>
    );
}

function ResumeStyles() {
    return (
        <style jsx global>{`
            @media print {
                @page {
                    size: A4 portrait;
                    margin: 0;
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    height: 297mm !important;
                    width: 210mm !important;
                    overflow: hidden !important;
                }
                body * {
                    visibility: hidden !important;
                }
                #resume-a4, #resume-a4 * {
                    visibility: visible !important;
                }
                #resume-a4 {
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    z-index: 9999999 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .no-print { display: none !important; }
            }
        `}</style>
    );
}
