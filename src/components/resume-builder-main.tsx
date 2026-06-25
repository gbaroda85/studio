
"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
    User, 
    Briefcase, 
    GraduationCap, 
    Wand2, 
    Download, 
    RefreshCcw, 
    Eye, 
    CheckCircle2, 
    Plus, 
    Trash2, 
    ChevronRight, 
    ChevronLeft, 
    Settings2, 
    Sparkles, 
    Camera, 
    Layout, 
    Trophy, 
    FileBadge, 
    Heart, 
    UserPlus,
    X,
    Loader2,
    Save,
    ArrowLeftRight,
    Search,
    Type,
    Maximize,
    Smartphone,
    Monitor,
    Zap,
    History,
    ShieldCheck,
    Palette,
    Layers,
    RotateCcw,
    Printer,
    Menu,
    Clock,
    User2,
    CheckCircle,
    LayoutGrid,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ResumeTemplates from './resume-templates';
import { RESUME_SUGGESTIONS } from './resume-suggestions';

// --- TYPES ---

export type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'achievements' | 'interests' | 'references';

export interface ResumeData {
    personal: {
        fullName: string;
        title: string;
        email: string;
        phone: string;
        city: string;
        state: string;
        linkedin: string;
        portfolio: string;
        photo: string | null;
    };
    summary: string;
    experience: {
        id: string;
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string;
    }[];
    education: {
        id: string;
        degree: string;
        school: string;
        board: string;
        startYear: string;
        endYear: string;
        score: string;
    }[];
    skills: {
        technical: string[];
        soft: string[];
        languages: string[];
        tools: string[];
    };
    projects: {
        id: string;
        title: string;
        tech: string;
        link: string;
        description: string;
    }[];
    certifications: {
        id: string;
        name: string;
        issuer: string;
        date: string;
    }[];
    achievements: string[];
    interests: string[];
    references: string;
    sectionOrder: SectionType[];
}

const INITIAL_RESUME: ResumeData = {
    personal: {
        fullName: "Rahul S. Kumar",
        title: "Full Stack Developer",
        email: "rahul.kumar@email.com",
        phone: "+91 9876543210",
        city: "Bangalore",
        state: "Karnataka",
        linkedin: "linkedin.com/in/rahulkumar",
        portfolio: "rahul.dev",
        photo: null
    },
    summary: "Dedicated professional with 5+ years of experience in building scalable web applications. Passionate about problem-solving and clean code. Looking for a challenging role in a dynamic organization.",
    experience: [
        {
            id: 'exp-1',
            title: "Senior Developer",
            company: "Tech Solutions India",
            location: "Bangalore",
            startDate: "Jan 2021",
            endDate: "Present",
            current: true,
            description: "• Led a team of 5 developers in building a high-traffic e-commerce platform.\n• Optimized database queries resulting in 40% faster load times.\n• Mentored junior developers and conducted code reviews."
        }
    ],
    education: [
        {
            id: 'edu-1',
            degree: "B.Tech in Computer Science",
            school: "Indian Institute of Technology",
            board: "IIT Delhi",
            startYear: "2016",
            endYear: "2020",
            score: "8.5 CGPA"
        }
    ],
    skills: {
        technical: ["React.js", "Node.js", "TypeScript", "Next.js", "Python"],
        soft: ["Team Leadership", "Communication", "Problem Solving"],
        languages: ["English", "Hindi", "Kannada"],
        tools: ["VS Code", "Git", "Docker", "Figma"]
    },
    projects: [
        {
            id: 'proj-1',
            title: "E-Commerce App",
            tech: "Next.js, Tailwind, Stripe",
            link: "github.com/rahul/shop",
            description: "A full-featured shopping cart with secure payments and real-time inventory tracking."
        }
    ],
    certifications: [
        { id: 'cert-1', name: "AWS Certified Developer", issuer: "Amazon Web Services", date: "Dec 2022" }
    ],
    achievements: ["Employee of the Year 2022", "Winner of National Hackathon 2019"],
    interests: ["Traveling", "Photography", "Cricket"],
    references: "Available upon request.",
    sectionOrder: ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'interests', 'references']
};

const FORM_STEPS = [
    { id: 'personal', label: 'Identity', icon: User },
    { id: 'summary', label: 'Profile', icon: Wand2 },
    { id: 'experience', label: 'Work', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Zap },
    { id: 'projects', label: 'Projects', icon: LayoutGrid },
    { id: 'certifications', label: 'Certs', icon: FileBadge },
    { id: 'achievements', label: 'Awards', icon: Trophy },
    { id: 'interests', label: 'Interests', icon: Heart },
    { id: 'references', label: 'Refs', icon: UserPlus },
];

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i} pointer-events-none`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function ResumeBuilderMain() {
    const { toast } = useToast();
    const [data, setData] = useState<ResumeData>(INITIAL_RESUME);
    const [stepIndex, setStepIndex] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState('modern-corporate');
    const [isExporting, setIsExporting] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isHydrated, setIsHydrated] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // --- HYDRATION ---
    useEffect(() => {
        const saved = localStorage.getItem('gr7_resume_draft_v1');
        if (saved) {
            try { setData(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('gr7_resume_draft_v1', JSON.stringify(data));
        }
    }, [data, isHydrated]);

    // --- FORM HANDLERS ---
    const updatePersonal = (field: keyof ResumeData['personal'], value: string | null) => {
        setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
    };

    const addArrayItem = (section: 'experience' | 'education' | 'projects' | 'certifications') => {
        const id = Math.random().toString(36).substr(2, 9);
        let newItem: any;
        if (section === 'experience') newItem = { id, title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
        if (section === 'education') newItem = { id, degree: "", school: "", board: "", startYear: "", endYear: "", score: "" };
        if (section === 'projects') newItem = { id, title: "", tech: "", link: "", description: "" };
        if (section === 'certifications') newItem = { id, name: "", issuer: "", date: "" };
        
        setData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    };

    const updateArrayItem = (section: 'experience' | 'education' | 'projects' | 'certifications', id: string, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map((item: any) => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const removeArrayItem = (section: 'experience' | 'education' | 'projects' | 'certifications', id: string) => {
        setData(prev => ({ ...prev, [section]: prev[section].filter((i: any) => i.id !== id) }));
    };

    const handleTagInput = (category: keyof ResumeData['skills'], val: string) => {
        if (!val.trim()) return;
        setData(prev => ({
            ...prev,
            skills: { ...prev.skills, [category]: [...prev.skills[category], val.trim()] }
        }));
    };

    const removeTag = (category: keyof ResumeData['skills'], tag: string) => {
        setData(prev => ({
            ...prev,
            skills: { ...prev.skills, [category]: prev.skills[category].filter(t => t !== tag) }
        }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => updatePersonal('photo', ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    // --- EXPORT LOGIC ---
    const executeExport = async (type: 'pdf' | 'image' = 'pdf') => {
        if (!previewRef.current) return;
        setIsExporting(true);
        toast({ title: "Preparing Export", description: "Calculating high-DPI layout..." });
        
        try {
            const html2canvas = (await import('html2canvas')).default;
            const element = previewRef.current;
            const canvas = await html2canvas(element, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                   const el = clonedDoc.querySelector('[data-resume-canvas]');
                   if (el) (el as HTMLElement).style.transform = 'none';
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);

            if (type === 'pdf') {
                const { jsPDF } = await import('jspdf');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Resume_${data.personal.fullName.replace(/\s+/g, '_')}.pdf`);
            } else {
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `Resume_${data.personal.fullName.replace(/\s+/g, '_')}.jpg`;
                link.click();
            }
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Resume Downloaded!" });
        } catch (e) {
            toast({ variant: 'destructive', title: "Export Error" });
        } finally {
            setIsExporting(false);
        }
    };

    const completeness = useMemo(() => {
        let score = 0;
        if (data.personal.fullName) score += 10;
        if (data.personal.photo) score += 5;
        if (data.personal.email && data.personal.phone) score += 10;
        if (data.summary.length > 50) score += 15;
        if (data.experience.length > 0) score += 20;
        if (data.education.length > 0) score += 20;
        if (data.skills.technical.length > 2) score += 10;
        if (data.skills.tools.length > 1) score += 10;
        return score;
    }, [data]);

    const activeStepId = FORM_STEPS[stepIndex].id;

    if (!isHydrated) return null;

    return (
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-700">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full max-h-[90vh]">
                
                {/* 1. STEPPER & FORM COLUMN */}
                <div className="lg:col-span-5 flex flex-col gap-4 no-print h-full">
                    
                    {/* Completeness Bar */}
                    <Card className="rounded-3xl border-2 border-primary/10 shadow-lg overflow-hidden bg-white/50 backdrop-blur-xl">
                        <CardContent className="p-4 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "size-10 rounded-xl flex items-center justify-center text-white shadow-xl transition-all",
                                    completeness > 80 ? "bg-green-500" : "bg-primary"
                                )}>
                                    <Trophy className="size-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">ATS Strength</p>
                                    <p className="text-lg font-black tracking-tighter">{completeness}% Complete</p>
                                </div>
                            </div>
                            <div className="flex-1 max-w-[150px]">
                                <Progress value={completeness} className="h-1.5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 flex flex-col border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/20 h-full min-h-0">
                        <CardHeader className="bg-primary/5 border-b p-4 md:p-6 shrink-0">
                            <ScrollArea className="w-full whitespace-nowrap pb-2">
                                <div className="flex gap-2">
                                    {FORM_STEPS.map((step, i) => (
                                        <button 
                                            key={step.id} 
                                            onClick={() => setStepIndex(i)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-2 border-2",
                                                stepIndex === i 
                                                    ? "bg-primary text-white border-primary shadow-lg scale-105" 
                                                    : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            <step.icon className="size-3" /> {step.label}
                                        </button>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-10 text-left">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={activeStepId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    {/* STEP 1: PERSONAL */}
                                    {activeStepId === 'personal' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase">Personal Identity</Badge>
                                                <div className="size-16 rounded-2xl border-4 border-dashed border-primary/20 overflow-hidden bg-muted cursor-pointer hover:border-primary transition-all flex items-center justify-center group" onClick={() => photoInputRef.current?.click()}>
                                                    {data.personal.photo ? <img src={data.personal.photo} className="size-full object-cover" /> : <Camera className="size-6 text-muted-foreground group-hover:scale-110" />}
                                                </div>
                                                <input ref={photoInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="col-span-full space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={data.personal.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} className="h-11 rounded-xl font-bold" /></div>
                                                <div className="col-span-full space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Professional Title</Label><Input value={data.personal.title} onChange={(e) => updatePersonal('title', e.target.value)} className="h-11 rounded-xl font-bold" placeholder="e.g. Senior Frontend Engineer" /></div>
                                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Email Address</Label><Input value={data.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} className="h-10 rounded-xl" /></div>
                                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Phone Number</Label><Input value={data.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} className="h-10 rounded-xl" /></div>
                                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">City</Label><Input value={data.personal.city} onChange={(e) => updatePersonal('city', e.target.value)} className="h-10 rounded-xl" /></div>
                                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">State</Label><Input value={data.personal.state} onChange={(e) => updatePersonal('state', e.target.value)} className="h-10 rounded-xl" /></div>
                                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">LinkedIn</Label><Input value={data.personal.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} className="h-10 rounded-xl" /></div>
                                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Portfolio</Label><Input value={data.personal.portfolio} onChange={(e) => updatePersonal('portfolio', e.target.value)} className="h-10 rounded-xl" /></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: SUMMARY */}
                                    {activeStepId === 'summary' && (
                                        <div className="space-y-6">
                                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase">Professional Summary</Badge>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase opacity-60">Describe your career profile</Label>
                                                <Textarea 
                                                    value={data.summary} 
                                                    onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))} 
                                                    className="min-h-[200px] rounded-2xl border-2 font-medium p-4 text-sm leading-relaxed"
                                                    placeholder="Focus on your years of experience and core results..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: EXPERIENCE */}
                                    {activeStepId === 'experience' && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase">Work History</Badge>
                                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase text-primary border-primary/20" onClick={() => addArrayItem('experience')}><Plus className="size-3 mr-1"/> ADD EMPLOYMENT</Button>
                                            </div>
                                            <div className="space-y-6">
                                                {data.experience.map((exp) => (
                                                    <Card key={exp.id} className="p-5 border-2 rounded-2xl bg-muted/10 relative group">
                                                        <Button size="icon" variant="destructive" className="absolute top-2 right-2 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('experience', exp.id)}><Trash2 className="size-4" /></Button>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="col-span-full space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Job Title</Label><Input value={exp.title} onChange={(e) => updateArrayItem('experience', exp.id, 'title', e.target.value)} className="h-9 font-bold" /></div>
                                                            <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Company Name</Label><Input value={exp.company} onChange={(e) => updateArrayItem('experience', exp.id, 'company', e.target.value)} className="h-9" /></div>
                                                            <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Location</Label><Input value={exp.location} onChange={(e) => updateArrayItem('experience', exp.id, 'location', e.target.value)} className="h-9" /></div>
                                                            <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Start Date</Label><Input value={exp.startDate} onChange={(e) => updateArrayItem('experience', exp.id, 'startDate', e.target.value)} className="h-9" placeholder="e.g. Jan 2021" /></div>
                                                            <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">End Date</Label><Input value={exp.endDate} onChange={(e) => updateArrayItem('experience', exp.id, 'endDate', e.target.value)} className="h-9" disabled={exp.current} placeholder={exp.current ? "Current" : "e.g. Dec 2023"} /></div>
                                                            <div className="col-span-full space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Responsibilities</Label><Textarea value={exp.description} onChange={(e) => updateArrayItem('experience', exp.id, 'description', e.target.value)} className="min-h-[100px] text-xs font-medium" /></div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: EDUCATION */}
                                    {activeStepId === 'education' && (
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase">Academic Profile</Badge>
                                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-black uppercase text-primary border-primary/20" onClick={() => addArrayItem('education')}><Plus className="size-3 mr-1"/> ADD EDUCATION</Button>
                                            </div>
                                            <div className="space-y-6">
                                                {data.education.map((edu) => (
                                                    <Card key={edu.id} className="p-5 border-2 rounded-2xl bg-muted/10 relative group">
                                                        <Button size="icon" variant="destructive" className="absolute top-2 right-2 size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('education', edu.id)}><Trash2 className="size-4" /></Button>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="col-span-full space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Degree</Label><Input value={edu.degree} onChange={(e) => updateArrayItem('education', edu.id, 'degree', e.target.value)} className="h-9 font-bold" /></div>
                                                            <div className="col-span-full space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">School / University</Label><Input value={edu.school} onChange={(e) => updateArrayItem('education', edu.id, 'school', e.target.value)} className="h-9" /></div>
                                                            <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Start Year</Label><Input value={edu.startYear} onChange={(e) => updateArrayItem('education', edu.id, 'startYear', e.target.value)} className="h-9" /></div>
                                                            <div className="space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">End Year</Label><Input value={edu.endYear} onChange={(e) => updateArrayItem('education', edu.id, 'endYear', e.target.value)} className="h-9" /></div>
                                                            <div className="col-span-full space-y-1"><Label className="text-[8px] font-black uppercase opacity-40">Score</Label><Input value={edu.score} onChange={(e) => updateArrayItem('education', edu.id, 'score', e.target.value)} className="h-9" /></div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 5: SKILLS */}
                                    {activeStepId === 'skills' && (
                                        <div className="space-y-10">
                                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase">Expertise & Skills</Badge>
                                            {(['technical', 'soft', 'languages', 'tools'] as const).map(cat => (
                                                <div key={cat} className="space-y-4">
                                                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest">{cat} Skills</Label>
                                                    <div className="flex flex-wrap gap-2 p-4 bg-muted/10 border-2 border-dashed rounded-2xl shadow-inner min-h-[60px]">
                                                        {data.skills[cat].map(tag => (
                                                            <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 h-7 pl-3 pr-1 rounded-lg gap-2 text-[10px] font-bold uppercase">
                                                                {tag}
                                                                <button onClick={() => removeTag(cat, tag)} className="hover:text-rose-500"><X className="size-3" /></button>
                                                            </Badge>
                                                        ))}
                                                        <Input 
                                                            className="flex-1 min-w-[120px] h-7 border-none bg-transparent shadow-none text-xs focus-visible:ring-0 p-0" 
                                                            placeholder="Type & Enter..." 
                                                            onKeyDown={(e) => { if(e.key === 'Enter') { handleTagInput(cat, e.currentTarget.value); e.currentTarget.value = ""; } }} 
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </CardContent>
                        
                        <CardFooter className="bg-muted/10 p-6 md:p-8 border-t shrink-0 flex items-center justify-between">
                            <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl" onClick={() => setStepIndex(prev => Math.max(0, prev - 1))} disabled={stepIndex === 0}>
                                <ChevronLeft className="mr-1.5 size-4" /> PREVIOUS
                            </Button>
                            
                            <div className="flex items-center gap-1">
                                {FORM_STEPS.map((_, i) => (
                                    <div key={i} className={cn("size-1.5 rounded-full transition-all", i === stepIndex ? "bg-primary w-6" : "bg-muted-foreground/20")} />
                                ))}
                            </div>

                            <Button className="bg-primary text-white font-black text-[10px] uppercase tracking-widest h-10 px-8 rounded-xl shadow-lg" onClick={() => setStepIndex(prev => Math.min(FORM_STEPS.length - 1, prev + 1))} disabled={stepIndex === FORM_STEPS.length - 1}>
                                NEXT <ChevronRight className="ml-1.5 size-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* 2. PREVIEW COLUMN */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-full relative">
                    <Card className="overflow-hidden glass-card border-none shadow-3xl flex flex-col bg-card/50 rounded-[2.5rem] h-full">
                        <CardHeader className="bg-muted/30 border-b py-3 px-6 flex flex-row items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Layout className="h-4 w-4 text-primary" />
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">PREVIEW STUDIO</CardTitle>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="size-3.5"/></Button>
                                    <span className="text-[10px] font-black w-8 text-center">{zoom}%</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="size-3.5"/></Button>
                                </div>
                                <Badge variant="secondary" className="bg-green-600 text-white font-black text-[9px] px-3 py-1 rounded-full border-2 border-white shadow-md">A4 FORMAT</Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 flex-1 bg-slate-100 dark:bg-slate-900/50 shadow-inner overflow-hidden relative flex flex-col">
                            <ScrollArea className="flex-1 w-full h-full p-4 md:p-12 lg:p-20 overflow-visible">
                                <div className="flex justify-center min-h-full items-start p-4">
                                    <div 
                                        data-resume-canvas
                                        ref={previewRef}
                                        className="relative transform-gpu transition-all duration-500 origin-top bg-white shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]"
                                        style={{ transform: `scale(${zoom / 100})`, width: '210mm', minHeight: '297mm' }}
                                    >
                                        <ResumeTemplates type={selectedTemplate as any} data={data} />
                                    </div>
                                </div>
                                <ScrollBar orientation="vertical" />
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </CardContent>

                        <CardFooter className="bg-white dark:bg-slate-950 border-t p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
                            <div className="flex flex-col items-center md:items-start gap-1 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] shrink-0">
                                <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE LOCAL RENDER</div>
                                <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> 1200DPI PRECISION</div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <Button 
                                    size="lg" 
                                    className="relative flex items-center justify-between gap-0 p-0 overflow-hidden bg-[#00aeef] hover:bg-[#009bd1] text-white font-black rounded-xl transition-all duration-300 group h-14 md:h-16 shadow-[0_8px_20px_-10px_rgba(0,174,239,0.5)] border-none active:scale-95 flex-[2] min-w-[220px]" 
                                    onClick={() => executeExport('pdf')}
                                    disabled={isExporting}
                                >
                                    <StarIcons />
                                    <div className="absolute left-6 w-0.5 h-8 bg-white/40 rounded-full" />
                                    <span className="flex-1 px-12 text-center tracking-widest text-[11px] md:text-sm uppercase">
                                        {isExporting ? "GENERATING..." : "DOWNLOAD PDF"}
                                    </span>
                                    <div className="bg-white h-full pl-6 pr-10 flex items-center justify-center text-[#00aeef] transition-all group-hover:pl-7 group-hover:pr-11 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-15px' }}>
                                        {isExporting ? <Loader2 className="size-6 animate-spin" /> : <Download className="size-6 md:size-8 group-hover:scale-110 transition-transform" />}
                                        <div className="absolute right-4 w-0.5 h-6 bg-[#00aeef]/20 rounded-full" />
                                    </div>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}

