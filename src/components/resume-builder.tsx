"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    Globe, 
    Linkedin, 
    Github, 
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
    Code2,
    FileText,
    History,
    Sparkles,
    Layout,
    PencilLine
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

const INITIAL_RESUME_DATA = {
    personal: {
        fullName: "Sanjay Singh",
        title: "Full Stack Next.js Developer",
        email: "sanjay.singh@email.com",
        phone: "+91 98765 43210",
        location: "Bangalore, India",
        website: "https://sanjaydev.me",
        linkedin: "linkedin.com/in/sanjaydev",
        github: "github.com/sanjaydev",
    },
    summary: "Dynamic and results-driven Next.js Developer with 4+ years of experience in building high-performance web applications. Specialized in Next.js 15, Firebase integration, and modern UI design. Proven track record of delivering scalable solutions like 'Shiftrack', reducing operational overhead by 40%.",
    skills: {
        frontend: "Next.js, React, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion",
        backend: "Firebase (Auth, Firestore, Cloud Functions), Node.js, REST APIs",
        tools: "Git, Vercel, Docker, Figma, Postman, Jest"
    },
    experience: [
        {
            company: "Tech Solutions Inc.",
            position: "Senior Frontend Engineer",
            duration: "2021 - Present",
            description: "Lead developer for core React components. Optimized site performance by 30% through advanced caching strategies."
        },
        {
            company: "Digital Studio",
            position: "UI/UX Developer",
            duration: "2019 - 2021",
            description: "Designed and implemented responsive interfaces for e-commerce platforms. Worked closely with designers to bridge Figma to Code."
        }
    ],
    projects: [
        {
            name: "Shiftrack - Pro Management Suite",
            link: "shiftrack.app",
            description: "A comprehensive shift management app for industrial workers. Features complex UI dashboard, automated salary/EPF calculation engine, and real-time shift scheduling using Firebase."
        },
        {
            name: "GR7 Tools Hub",
            link: "gr7tools.com",
            description: "All-in-one local file processing suite built with Next.js. Implemented high-fidelity PDF manipulation and image optimization logic using WASM."
        }
    ],
    education: [
        {
            school: "Indian Institute of Technology (IIT)",
            degree: "B.Tech in Computer Science",
            year: "2015 - 2019"
        }
    ],
    certifications: [
        "Certified Next.js Specialist (Vercel)",
        "Firebase Professional Developer (Google Cloud)"
    ]
};

interface ResumeBuilderProps {
    isPrintMode?: boolean;
}

export default function ResumeBuilder({ isPrintMode = false }: ResumeBuilderProps) {
    const { toast } = useToast();
    const [data, setData] = useState(INITIAL_RESUME_DATA);
    const [activeSection, setActiveSection] = useState('personal');
    
    const handlePersonalChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    };

    const handleSkillsChange = (field: string, value: string) => {
        setData(prev => ({ ...prev, skills: { ...prev.skills, [field]: value } }));
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

    const removeExperience = (index: number) => {
        setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    };

    const addProject = () => {
        setData(prev => ({
            ...prev,
            projects: [...prev.projects, { name: "", link: "", description: "" }]
        }));
    };

    const updateProject = (index: number, field: string, value: string) => {
        const updated = [...data.projects];
        updated[index] = { ...updated[index], [field]: value };
        setData(prev => ({ ...prev, projects: updated }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setData(INITIAL_RESUME_DATA);
        toast({ title: "Reset Complete", description: "Template restored to original." });
    };

    // If we are in standard mode, show the split screen editor
    if (!isPrintMode) {
        return (
            <div className="w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start px-4">
                
                {/* LEFT: EDITOR PANEL */}
                <div className="lg:col-span-5 space-y-6 no-print">
                    <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                        <CardHeader className="bg-primary/5 border-b p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                    <Settings2 className="size-6 text-primary" /> RESUME STUDIO
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={handleReset} className="font-black text-[10px] uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1" /> Reset</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30 p-1 border-b">
                                    <TabsTrigger value="personal" className="text-[9px] font-black uppercase">Identity</TabsTrigger>
                                    <TabsTrigger value="skills" className="text-[9px] font-black uppercase">Skills</TabsTrigger>
                                    <TabsTrigger value="experience" className="text-[9px] font-black uppercase">History</TabsTrigger>
                                    <TabsTrigger value="projects" className="text-[9px] font-black uppercase">Projects</TabsTrigger>
                                </TabsList>

                                <ScrollArea className="h-[600px] p-6 md:p-8">
                                    <TabsContent value="personal" className="space-y-6 mt-0">
                                        <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest mb-4">Contact Info</Badge>
                                        <div className="grid gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label>
                                                <Input value={data.personal.fullName} onChange={(e) => handlePersonalChange('fullName', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Job Title</Label>
                                                <Input value={data.personal.title} onChange={(e) => handlePersonalChange('title', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Email</Label>
                                                    <Input value={data.personal.email} onChange={(e) => handlePersonalChange('email', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[9px] font-black uppercase opacity-60">Phone</Label>
                                                    <Input value={data.personal.phone} onChange={(e) => handlePersonalChange('phone', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Professional Summary</Label>
                                                <Textarea value={data.summary} onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))} className="rounded-xl border-2 font-bold min-h-[120px]" />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="skills" className="space-y-6 mt-0">
                                        <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Stack Expertise</Badge>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Frontend Skills</Label>
                                                <Input value={data.skills.frontend} onChange={(e) => handleSkillsChange('frontend', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Backend Skills</Label>
                                                <Input value={data.skills.backend} onChange={(e) => handleSkillsChange('backend', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black uppercase opacity-60">Tools & Dev-Ops</Label>
                                                <Input value={data.skills.tools} onChange={(e) => handleSkillsChange('tools', e.target.value)} className="h-10 rounded-lg border-2 font-bold" />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="experience" className="space-y-6 mt-0">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-purple-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Employment History</Badge>
                                            <Button size="sm" onClick={addExperience} className="h-7 text-[8px] font-black bg-primary"><Plus className="size-3 mr-1" /> Add</Button>
                                        </div>
                                        {data.experience.map((exp, idx) => (
                                            <div key={idx} className="p-4 border-2 rounded-2xl relative space-y-3 bg-muted/10 group">
                                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 size-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeExperience(idx)}><Trash2 className="size-3.5"/></Button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Company</Label>
                                                        <Input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} className="h-8 text-xs font-bold" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Duration</Label>
                                                        <Input value={exp.duration} onChange={(e) => updateExperience(idx, 'duration', e.target.value)} className="h-8 text-xs font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[8px] font-black uppercase opacity-40">Role</Label>
                                                    <Input value={exp.position} onChange={(e) => updateExperience(idx, 'position', e.target.value)} className="h-8 text-xs font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[8px] font-black uppercase opacity-40">Bullets (ATS parsing focus)</Label>
                                                    <Textarea value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} className="text-xs min-h-[80px]" />
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>

                                    <TabsContent value="projects" className="space-y-6 mt-0">
                                        <div className="flex items-center justify-between">
                                            <Badge className="bg-rose-500 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Featured Projects</Badge>
                                            <Button size="sm" onClick={addProject} className="h-7 text-[8px] font-black bg-primary"><Plus className="size-3 mr-1" /> Add</Button>
                                        </div>
                                        {data.projects.map((proj, idx) => (
                                            <div key={idx} className="p-4 border-2 rounded-2xl space-y-3 bg-muted/10 group relative">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Project Name</Label>
                                                        <Input value={proj.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} className="h-8 text-xs font-bold" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[8px] font-black uppercase opacity-40">Live Link</Label>
                                                        <Input value={proj.link} onChange={(e) => updateProject(idx, 'link', e.target.value)} className="h-8 text-xs font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[8px] font-black uppercase opacity-40">Key Features & Metrics</Label>
                                                    <Textarea value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} className="text-xs min-h-[80px]" />
                                                </div>
                                            </div>
                                        ))}
                                    </TabsContent>
                                </ScrollArea>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t flex flex-col gap-4">
                            <Button onClick={handlePrint} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] group">
                                <Printer className="mr-3 size-8 group-hover:scale-110 transition-transform" />
                                SAVE AS A4 PDF
                            </Button>
                            <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground font-black uppercase opacity-60 tracking-widest">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> ATS-OPTIMIZED</div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* RIGHT: LIVE PREVIEW */}
                <div className="lg:col-span-7 flex flex-col items-center sticky top-24 no-print">
                    <div className="w-full flex items-center justify-between mb-4 px-4">
                        <div className="flex items-center gap-2">
                            <Eye className="size-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Premium Live View</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full animate-pulse">A4 PREVIEW</Badge>
                    </div>

                    <ScrollArea className="w-full h-[85vh] bg-slate-200 dark:bg-slate-900 rounded-[3rem] p-4 md:p-10 shadow-inner">
                        <div className="flex justify-center w-full">
                            <ResumeContent data={data} />
                        </div>
                    </ScrollArea>
                </div>
            </div>
        );
    }

    // PRINT MODE COMPONENT (ONLY FOR CTRL+P)
    return (
        <div className="w-full flex justify-center bg-white">
            <ResumeContent data={data} />
        </div>
    );
}

/**
 * THE CORE RESUME CONTENT (PRINT READY)
 */
function ResumeContent({ data }: { data: typeof INITIAL_RESUME_DATA }) {
    return (
        <div 
            className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col p-[20mm] print:p-0 print:shadow-none"
            style={{ 
                width: '210mm', 
                minHeight: '297mm', 
                color: '#1a202c',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {/* Header */}
            <header className="mb-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight uppercase" style={{ color: '#0d5a71' }}>{data.personal.fullName}</h1>
                        <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">{data.personal.title}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-2">{data.personal.email} <Mail className="size-3 text-primary" /></span>
                        <span className="flex items-center gap-2">{data.personal.phone} <Phone className="size-3 text-primary" /></span>
                        <span className="flex items-center gap-2">{data.personal.location} <MapPin className="size-3 text-primary" /></span>
                        <span className="flex items-center gap-2">{data.personal.github} <Github className="size-3 text-primary" /></span>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 mt-6 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-primary" />
                </div>
            </header>

            <div className="grid grid-cols-12 gap-10">
                {/* Main Body */}
                <div className="col-span-12 space-y-10">
                    
                    {/* Summary */}
                    <section className="space-y-3">
                        <SectionTitle title="Professional Summary" icon={<User className="size-4"/>} />
                        <p className="text-sm leading-relaxed text-slate-600 font-medium">
                            {data.summary}
                        </p>
                    </section>

                    {/* Skills Grid */}
                    <section className="space-y-4">
                        <SectionTitle title="Technical Expertise" icon={<Code2 className="size-4"/>} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SkillBox label="Frontend" value={data.skills.frontend} />
                            <SkillBox label="Backend" value={data.skills.backend} />
                            <SkillBox label="Tools" value={data.skills.tools} />
                        </div>
                    </section>

                    {/* Experience */}
                    <section className="space-y-6">
                        <SectionTitle title="Professional Experience" icon={<Briefcase className="size-4"/>} />
                        <div className="space-y-8">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="space-y-2 border-l-2 border-slate-100 pl-6 relative">
                                    <div className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-primary border-2 border-white" />
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="text-lg font-black text-slate-800">{exp.position}</h4>
                                        <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full">{exp.duration}</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-500 uppercase tracking-tighter">{exp.company}</p>
                                    <p className="text-[13px] leading-relaxed text-slate-600 whitespace-pre-wrap">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="space-y-6">
                        <SectionTitle title="Key Projects" icon={<Layout className="size-4"/>} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {data.projects.map((proj, i) => (
                                <div key={i} className="p-5 bg-slate-50 rounded-2xl space-y-3 border-2 border-transparent hover:border-slate-200 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-md font-black text-slate-800 uppercase tracking-tighter">{proj.name}</h4>
                                        <span className="text-[10px] font-mono text-primary">{proj.link}</span>
                                    </div>
                                    <p className="text-[12px] leading-relaxed text-slate-600 font-medium">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer Row (Edu + Certs) */}
                    <div className="grid grid-cols-2 gap-10 pt-4">
                        <section className="space-y-4">
                            <SectionTitle title="Education" icon={<GraduationCap className="size-4"/>} />
                            {data.education.map((edu, i) => (
                                <div key={i} className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800">{edu.degree}</h4>
                                    <p className="text-[11px] font-bold text-slate-500">{edu.school} • {edu.year}</p>
                                </div>
                            ))}
                        </section>
                        <section className="space-y-4">
                            <SectionTitle title="Certifications" icon={<Award className="size-4"/>} />
                            <ul className="space-y-2">
                                {data.certifications.map((cert, i) => (
                                    <li key={i} className="text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                        <div className="size-1.5 rounded-full bg-primary" /> {cert}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                </div>
            </div>

            <footer className="mt-auto pt-10 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.3em] no-print">
                GR7 Tools • Professional A4 Resume Layout
            </footer>

            {/* PRINT OVERRIDES */}
            <style jsx>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    div {
                        box-shadow: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}

function SectionTitle({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2">
            <div className="size-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800">{title}</h3>
        </div>
    );
}

function SkillBox({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">{label}</span>
            <p className="text-[12px] font-bold text-slate-700 leading-snug">{value}</p>
        </div>
    );
}
