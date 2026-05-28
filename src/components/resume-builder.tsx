
"use client";

import React, { useState } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    Globe, 
    MapPin, 
    Plus, 
    Trash2, 
    Download, 
    Printer, 
    RefreshCcw, 
    ChevronRight,
    Briefcase,
    GraduationCap,
    Award,
    Settings2,
    Eye,
    ShieldCheck,
    Zap,
    Sparkles,
    Layout,
    PencilLine,
    CheckCircle2,
    Target,
    Layers,
    Type,
    X,
    User2,
    Linkedin,
    Github
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

const CORPORATE_TEAL = "#0a8491";

const INITIAL_RESUME_DATA = {
    personal: {
        fullName: "Sanjay Singh",
        title: "Senior Full Stack Engineer",
        email: "sanjay.singh@email.com",
        phone: "+91 98765 43210",
        location: "Bangalore, India",
        website: "sanjaydev.me",
        linkedin: "linkedin.com/in/sanjaydev",
        github: "github.com/sanjaydev",
    },
    summary: "Expert Full Stack Developer with 5+ years of specializing in Next.js 15, React, and Firebase. Proven expertise in building high-scale industrial applications with complex logic, including real-time shift management and financial engines for EPF/HRA calculations. Committed to clean code, modular architecture, and high-performance UI/UX design.",
    skills: [
        { name: "Frontend Architecture", level: 92 },
        { name: "Next.js & React 19", level: 88 },
        { name: "Firebase (Real-time DB)", level: 85 },
        { name: "UI Engineering", level: 90 },
        { name: "Project Management", level: 78 }
    ],
    hardSkills: ["TypeScript", "Tailwind CSS", "Node.js", "Jest", "Docker", "Figma Design"],
    languages: [
        { name: "English", level: "Native / Professional" },
        { name: "Hindi", level: "Native / Bilingual" }
    ],
    experience: [
        {
            company: "Tech Solutions Inc.",
            position: "Senior UI Engineer",
            duration: "2021 - Present",
            description: "• Architected core component library using Next.js 15 and Tailwind.\n• Integrated real-time Firestore synchronization for dashboard metrics.\n• Reduced site load times by 40% using advanced ISR and caching strategies."
        },
        {
            company: "Cloud Systems Studio",
            position: "Full Stack Developer",
            duration: "2018 - 2021",
            description: "• Developed scalable REST APIs for e-commerce platforms.\n• Implemented complex UI states using Redux and Framer Motion."
        }
    ],
    projects: [
        {
            name: "Shiftrack - Industrial Suite",
            link: "shiftrack.io",
            description: "A mission-critical management app for shift workers. Engineered the frontend UI for complex data visualization, automated salary engine for HRA/EPF/Allowance calculations, and real-time attendance tracking via Firebase Cloud Functions."
        },
        {
            name: "GR7 Multi-Tools Hub",
            link: "gr7tools.com",
            description: "A premium local-first file processing suite. Built with Next.js, implementing high-fidelity PDF manipulation and image optimization logic using WASM for 100% data privacy."
        }
    ],
    education: [
        {
            school: "Indian Institute of Technology (IIT)",
            degree: "B.Tech in Computer Science",
            year: "2014 - 2018"
        }
    ],
    certifications: [
        "Google Professional Cloud Architect",
        "Meta Senior Frontend Engineer (Certified)"
    ]
};

const TEMPLATES = [
  { id: 'asymmetric', name: 'Elite Asymmetric', description: 'Two-column modern professional' },
  { id: 'classic', name: 'Classic Professional', description: 'Clean top-down academic style' },
  { id: 'minimal', name: 'Minimalist Clean', description: 'Simple typography and spacing' },
];

interface ResumeBuilderProps {
    isPrintMode?: boolean;
}

export default function ResumeBuilder({ isPrintMode = false }: ResumeBuilderProps) {
    const { toast } = useToast();
    const [data, setData] = useState(INITIAL_RESUME_DATA);
    const [activeSection, setActiveSection] = useState('personal');
    const [selectedTemplate, setSelectedTemplate] = useState('asymmetric');
    
    const handlePersonalChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    };

    const addExperience = () => {
        setData(prev => ({
            ...prev,
            experience: [...prev.experience, { company: "", position: "", duration: "", description: "" }]
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        const updated = [...data.experience];
        updated[index] = { ...updated[index], [field]: value };
        setData(prev => ({ ...prev, experience: updated }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setData(INITIAL_RESUME_DATA);
        toast({ title: "Template Reset", description: "Standard data restored." });
    };

    if (!isPrintMode) {
        return (
            <div className="w-full max-w-[1700px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 pb-20">
                
                {/* LEFT: STUDIO EDITOR */}
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
                                    <TabsTrigger value="personal" className="text-[8px] md:text-[9px] font-black uppercase">Bio</TabsTrigger>
                                    <TabsTrigger value="skills" className="text-[8px] md:text-[9px] font-black uppercase">Skills</TabsTrigger>
                                    <TabsTrigger value="experience" className="text-[8px] md:text-[9px] font-black uppercase">Exp</TabsTrigger>
                                    <TabsTrigger value="projects" className="text-[8px] md:text-[9px] font-black uppercase">Work</TabsTrigger>
                                </TabsList>

                                <ScrollArea className="h-[650px] p-6 md:p-10">
                                    <TabsContent value="template" className="space-y-6 mt-0">
                                        <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest mb-4">Choose Layout</Badge>
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
                                    </TabsContent>

                                    <TabsContent value="personal" className="space-y-6 mt-0">
                                        <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest mb-4">Core Identity</Badge>
                                        <div className="grid gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label>
                                                <Input value={data.personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className="h-11 rounded-xl border-2 font-bold focus:ring-primary/20" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Professional Job Title</Label>
                                                <Input value={data.personal.title} onChange={(e) => handlePersonalChange('title', e.target.value)} className="h-11 rounded-xl border-2 font-bold" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Professional Email</Label>
                                                    <Input value={data.personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className="h-11 rounded-xl border-2 font-bold" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Mobile Number</Label>
                                                    <Input value={data.personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className="h-11 rounded-xl border-2 font-bold" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Impactful Profile Summary</Label>
                                                <Textarea value={data.summary} onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))} className="rounded-2xl border-2 font-bold min-h-[140px] leading-relaxed" />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="skills" className="space-y-8 mt-0">
                                        <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Technical Matrix</Badge>
                                        <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed space-y-4">
                                            <p className="text-[10px] font-bold text-muted-foreground italic uppercase">Pro Tip: Use the 'Bio' tab to update names, and the templates will automatically visualize your expertise.</p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="experience" className="space-y-6 mt-0">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-purple-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Work History</Badge>
                                            <Button size="sm" onClick={addExperience} className="h-8 text-[9px] font-black bg-primary rounded-lg"><Plus className="size-3 mr-1" /> Add Role</Button>
                                        </div>
                                        {data.experience.map((exp, idx) => (
                                            <Card key={idx} className="p-5 border-2 rounded-2xl relative space-y-4 bg-muted/5 group border-muted">
                                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 size-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))}><Trash2 className="size-4"/></Button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Company Name</Label>
                                                        <Input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} className="h-9 text-xs font-bold" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Time Period</Label>
                                                        <Input value={exp.duration} onChange={(e) => updateExperience(idx, 'duration', e.target.value)} className="h-9 text-xs font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase opacity-40">Role / Position</Label>
                                                    <Input value={exp.position} onChange={(e) => updateExperience(idx, 'position', e.target.value)} className="h-9 text-xs font-bold" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase opacity-40">Details (Use bullets)</Label>
                                                    <Textarea value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} className="text-xs min-h-[100px] font-medium" />
                                                </div>
                                            </Card>
                                        ))}
                                    </TabsContent>
                                    
                                    <TabsContent value="projects" className="space-y-6 mt-0">
                                         <div className="flex items-center justify-between">
                                            <Badge className="bg-rose-500 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Complex Projects</Badge>
                                            <Button size="sm" onClick={() => setData(prev => ({ ...prev, projects: [...prev.projects, { name: "", link: "", description: "" }] }))} className="h-8 text-[9px] font-black bg-primary rounded-lg"><Plus className="size-3 mr-1" /> Add Project</Button>
                                        </div>
                                        {data.projects.map((proj, idx) => (
                                            <Card key={idx} className="p-5 border-2 rounded-2xl space-y-4 bg-muted/5 group relative border-muted">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Title</Label>
                                                        <Input value={proj.name} onChange={(e) => {
                                                            const updated = [...data.projects];
                                                            updated[idx] = { ...updated[idx], name: e.target.value };
                                                            setData(prev => ({ ...prev, projects: updated }));
                                                        }} className="h-9 text-xs font-bold" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Link</Label>
                                                        <Input value={proj.link} onChange={(e) => {
                                                            const updated = [...data.projects];
                                                            updated[idx] = { ...updated[idx], link: e.target.value };
                                                            setData(prev => ({ ...prev, projects: updated }));
                                                        }} className="h-9 text-xs font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[8px] font-black uppercase opacity-40">Details</Label>
                                                    <Textarea value={proj.description} onChange={(e) => {
                                                         const updated = [...data.projects];
                                                         updated[idx] = { ...updated[idx], description: e.target.value };
                                                         setData(prev => ({ ...prev, projects: updated }));
                                                    }} className="text-xs min-h-[100px] font-medium" />
                                                </div>
                                            </Card>
                                        ))}
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-10 border-t flex flex-col gap-5">
                            <Button onClick={handlePrint} className="w-full h-16 md:h-20 text-lg md:text-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] group active:scale-95 transition-all">
                                <Printer className="mr-3 size-8 group-hover:scale-110 transition-transform" />
                                PRINT AS A4 PDF
                            </Button>
                            <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase opacity-50 tracking-[0.2em]">
                                <div className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-2"><Zap className="size-3.5 text-yellow-500" /> 300DPI PRINT</div>
                                <div className="flex items-center gap-2"><Target className="size-3.5 text-blue-500" /> ATS-READY</div>
                            </div>
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
                        <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-xl animate-pulse">A4 PREVIEW</Badge>
                    </div>

                    <ScrollArea className="w-full h-[85vh] bg-slate-200 dark:bg-slate-900 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/10">
                        <div className="flex justify-center w-full">
                            <ResumeContent data={data} template={selectedTemplate} />
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center bg-white">
            <ResumeContent data={data} template={selectedTemplate} />
        </div>
    );
}

/**
 * THE CORE RESUME CONTENT COMPONENT
 */
function ResumeContent({ data, template }: { data: typeof INITIAL_RESUME_DATA, template: string }) {
    if (template === 'classic') return <TemplateClassic data={data} />;
    if (template === 'minimal') return <TemplateMinimal data={data} />;
    return <TemplateAsymmetric data={data} />;
}

/* --- ASYMMETRIC TEMPLATE --- */
function TemplateAsymmetric({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-[#FCFCFA] relative overflow-hidden flex flex-col print-fix-container" style={{ width: '210mm', minHeight: '297mm', color: '#1e293b', fontFamily: "'Inter', sans-serif" }} id="resume-a4">
            <header className="relative w-full h-[140px] flex items-center px-12 overflow-hidden shrink-0" style={{ backgroundColor: CORPORATE_TEAL }}>
                <div className="absolute top-0 right-0 h-full w-[40%] bg-black/10 -skew-x-12 translate-x-12" />
                <div className="relative z-20 space-y-1">
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">{data.personal.fullName}</h1>
                    <p className="text-xl font-bold text-white/70 uppercase tracking-[0.2em]">{data.personal.title}</p>
                </div>
                <div className="absolute right-12 bottom-[-50px] z-30 size-[160px] rounded-full border-[10px] border-[#FCFCFA] bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                    <div className="size-full bg-slate-50 flex items-center justify-center"><User className="size-20 text-slate-200" /></div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-12 w-full h-full">
                <aside className="col-span-4 bg-slate-50 p-10 pt-16 flex flex-col gap-12 border-r border-slate-100">
                    <div className="space-y-6">
                        <SidebarSectionTitle title="CONTACT" color={CORPORATE_TEAL} />
                        <div className="space-y-4">
                            <ContactItem icon={<Mail className="size-3.5"/>} label="Email" value={data.personal.email} />
                            <ContactItem icon={<Phone className="size-3.5"/>} label="Phone" value={data.personal.phone} />
                            <ContactItem icon={<MapPin className="size-3.5"/>} label="Location" value={data.personal.location} />
                        </div>
                    </div>
                    <div className="space-y-5">
                        <SidebarSectionTitle title="PROFILE SUMMARY" color={CORPORATE_TEAL} />
                        <p className="text-[13px] leading-relaxed text-slate-500 font-medium">{data.summary}</p>
                    </div>
                    <div className="space-y-6">
                        <SidebarSectionTitle title="LANGUAGES" color={CORPORATE_TEAL} />
                        <div className="space-y-3">
                            {data.languages.map((l, i) => (
                                <div key={i} className="flex justify-between items-center text-[12px] font-bold">
                                    <span className="text-slate-700">{l.name}</span>
                                    <span className="text-slate-400 font-medium italic">{l.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="col-span-8 p-12 pt-20 flex flex-col gap-12">
                    <div className="space-y-8">
                        <MainSectionTitle title="WORK EXPERIENCE" color={CORPORATE_TEAL} icon={<Briefcase className="size-4"/>} />
                        <div className="space-y-10">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="space-y-3 relative page-break-avoid">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">{exp.position}</h4>
                                            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider">{exp.company}</p>
                                        </div>
                                        <span className="font-black text-[10px] py-1 px-2 border border-slate-200 rounded-lg">{exp.duration}</span>
                                    </div>
                                    <div className="text-[13px] leading-relaxed text-slate-500 font-medium whitespace-pre-line pl-2 border-l-2 border-slate-100">{exp.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <MainSectionTitle title="SKILL PROFICIENCY" color={CORPORATE_TEAL} icon={<Sparkles className="size-4"/>} />
                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                            {data.skills.map((s, i) => (
                                <div key={i} className="space-y-2.5">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>{s.name}</span>
                                        <span>{s.level}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full print-force-color" style={{ width: `${s.level}%`, backgroundColor: CORPORATE_TEAL }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <ResumeStyles />
        </div>
    );
}

/* --- CLASSIC TEMPLATE --- */
function TemplateClassic({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-white p-12 flex flex-col gap-10 print-fix-container" style={{ width: '210mm', minHeight: '297mm', color: '#333', fontFamily: 'serif' }} id="resume-a4">
            <header className="text-center space-y-3 border-b-4 border-black pb-8">
                <h1 className="text-5xl font-black uppercase tracking-widest">{data.personal.fullName}</h1>
                <div className="flex justify-center items-center gap-6 text-sm font-bold uppercase tracking-wider opacity-60">
                    <span>{data.personal.email}</span>
                    <span className="size-1.5 rounded-full bg-black"/>
                    <span>{data.personal.phone}</span>
                    <span className="size-1.5 rounded-full bg-black"/>
                    <span>{data.personal.location}</span>
                </div>
            </header>

            <div className="space-y-12">
                <ClassicSection title="Professional Summary">
                    <p className="text-base leading-relaxed text-justify">{data.summary}</p>
                </ClassicSection>

                <ClassicSection title="Work Experience">
                    <div className="space-y-8">
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-2 page-break-avoid">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-black uppercase">{exp.position}</h4>
                                    <span className="font-bold italic">{exp.duration}</span>
                                </div>
                                <p className="text-md font-bold opacity-60 uppercase">{exp.company}</p>
                                <div className="text-sm leading-relaxed whitespace-pre-line">{exp.description}</div>
                            </div>
                        ))}
                    </div>
                </ClassicSection>

                <ClassicSection title="Key Expertise">
                   <div className="flex flex-wrap gap-x-12 gap-y-4">
                       {data.hardSkills.map((s, i) => (
                           <div key={i} className="flex items-center gap-2 font-bold uppercase text-sm">
                               <span className="size-2 bg-black rounded-full" /> {s}
                           </div>
                       ))}
                   </div>
                </ClassicSection>
            </div>
            <ResumeStyles />
        </div>
    );
}

/* --- MINIMAL TEMPLATE --- */
function TemplateMinimal({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div className="bg-white p-16 flex flex-col gap-16 print-fix-container" style={{ width: '210mm', minHeight: '297mm', color: '#111', fontFamily: "'Inter', sans-serif" }} id="resume-a4">
            <header className="space-y-6">
                <h1 className="text-6xl font-black tracking-tighter leading-none">{data.personal.fullName}</h1>
                <div className="flex flex-wrap gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="flex items-center gap-2"><Mail className="size-3"/> {data.personal.email}</div>
                    <div className="flex items-center gap-2"><Phone className="size-3"/> {data.personal.phone}</div>
                    <div className="flex items-center gap-2"><MapPin className="size-3"/> {data.personal.location}</div>
                </div>
            </header>

            <div className="space-y-16">
                 <div className="grid grid-cols-3 gap-12">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">The Profile</h2>
                    <p className="col-span-2 text-base leading-relaxed font-medium">{data.summary}</p>
                 </div>

                 <div className="grid grid-cols-3 gap-12">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">The History</h2>
                    <div className="col-span-2 space-y-12">
                        {data.experience.map((exp, i) => (
                            <div key={i} className="space-y-4 page-break-avoid">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black tracking-tight">{exp.position}</h4>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-40">
                                        <span>{exp.company}</span>
                                        <span>{exp.duration}</span>
                                    </div>
                                </div>
                                <div className="text-[14px] leading-relaxed font-medium opacity-80 whitespace-pre-line">{exp.description}</div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
            <ResumeStyles />
        </div>
    );
}

// HELPERS

function ClassicSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h3 className="text-xl font-black uppercase border-b-2 border-slate-200 pb-1">{title}</h3>
            {children}
        </section>
    );
}

function SidebarSectionTitle({ title, color }: { title: string, color: string }) {
    return <h3 className="text-[11px] font-black uppercase tracking-[0.25em] border-b-2 pb-1.5" style={{ color, borderColor: `${color}22` }}>{title}</h3>;
}

function MainSectionTitle({ title, color, icon }: { title: string, color: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4">
            <div className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">{icon}</div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] border-b-2 flex-1 pb-1.5" style={{ borderColor: `${color}11` }}>{title}</h3>
        </div>
    );
}

function ContactItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="size-7 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100"><span className="text-slate-400">{icon}</span></div>
            <div className="space-y-0.5 overflow-hidden">
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider leading-none">{label}</p>
                <p className="text-[11px] font-bold text-slate-600 truncate">{value || "---"}</p>
            </div>
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
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                }
                /* Hide EVERYTHING except our resume target */
                body > *:not(main),
                header, footer, nav, 
                .no-print, 
                button, 
                [role="navigation"],
                [role="banner"] {
                    display: none !important;
                }
                /* Target the specific resume component rendered in the hidden print block */
                .print-fix-container {
                    display: block !important;
                    visibility: visible !important;
                    position: fixed !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 210mm !important;
                    height: 297mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    background-color: white !important;
                    z-index: 999999 !important;
                }
                .page-break-avoid {
                    page-break-inside: avoid !important;
                }
                .print-force-color {
                    background-color: #0a8491 !important;
                    color: white !important;
                }
            }
        `}</style>
    );
}
