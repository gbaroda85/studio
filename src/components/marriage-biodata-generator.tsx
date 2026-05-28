"use client";

import React, { useState, useRef, type ChangeEvent } from 'react';
import { 
    User, 
    Home, 
    Briefcase, 
    Star, 
    Camera, 
    Download, 
    RefreshCcw, 
    Eye, 
    Heart, 
    Loader2, 
    CheckCircle2, 
    ChevronRight,
    MapPin,
    Phone,
    Plus,
    X,
    FileText,
    Palette,
    Sparkles,
    Settings2,
    ShieldCheck,
    Zap,
    Frame,
    Layers,
    Type
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const THEME_COLORS = [
    { name: "Royal Maroon", value: "#800000" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Deep Gold", value: "#B8860B" },
    { name: "Premium Teal", value: "#008080" },
    { name: "Charcoal", value: "#333333" },
];

const TEMPLATES = [
    { id: 'royal', name: 'Royal Heritage', description: 'Traditional gold & maroon accents' },
    { id: 'modern', name: 'Modern Minimal', description: 'Clean layout & airy spacing' },
    { id: 'floral', name: 'Floral Elegance', description: 'Decorative flower patterns' },
    { id: 'vintage', name: 'Vintage Classic', description: 'Double borders & serif fonts' },
    { id: 'slate', name: 'Professional Slate', description: 'Bold headers & grid layout' },
];

const BORDER_STYLES = [
    { id: 'solid', name: 'Solid Line' },
    { id: 'double', name: 'Double Line' },
    { id: 'dashed', name: 'Dashed' },
    { id: 'dotted', name: 'Dotted' },
    { id: 'decorative', name: 'Floral Design' },
];

const INITIAL_DATA = {
    personal: {
        fullName: "Aarav Sharma",
        dob: "15 May 1995",
        tob: "10:30 AM",
        placeOfBirth: "New Delhi, India",
        height: "5' 10\"",
        complexion: "Fair",
        bloodGroup: "B+",
        hobbies: "Traveling, Photography, Classical Music"
    },
    education: {
        qualification: "M.Tech in Computer Science",
        institution: "IIT Delhi",
        occupation: "Senior Software Engineer",
        company: "Google India",
        annualIncome: "₹ 35 LPA"
    },
    astrological: {
        rashi: "Leo (Simha)",
        nakshatra: "Magha",
        gotra: "Vashishta",
        manglik: "No",
        gan: "Dev"
    },
    family: {
        fatherName: "Mr. Ramesh Sharma",
        fatherOccupation: "Retired Govt. Officer",
        motherName: "Mrs. Sunita Sharma",
        motherOccupation: "Homemaker",
        siblings: "1 Elder Sister (Married)",
        mamaFamily: "Bhardwaj family from Jaipur",
        address: "H.No 142, Sector 15, Dwarka, New Delhi - 110075"
    },
    contact: {
        primaryPhone: "+91 98765 43210",
        emergencyPhone: "+91 99887 76655",
        email: "aarav.sharma@example.com"
    }
};

export default function MarriageBiodataGenerator() {
    const { toast } = useToast();
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [profilePic, setProfilePic] = useState<string | null>("https://picsum.photos/seed/portrait1/400/500");
    const [themeColor, setThemeColor] = useState("#800000");
    const [selectedTemplate, setSelectedTemplate] = useState('royal');
    const [borderStyle, setBorderStyle] = useState('double');
    const [isExporting, setIsExporting] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (section: keyof typeof INITIAL_DATA, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setProfilePic(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const exportToPdf = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Marriage-Biodata-${formData.personal.fullName.replace(/\s+/g, '-')}.pdf`);
            toast({ title: "Success!", description: "High-quality PDF downloaded." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not generate PDF.' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleReset = () => {
        setFormData(INITIAL_DATA);
        setProfilePic("https://picsum.photos/seed/portrait1/400/500");
        setThemeColor("#800000");
        setSelectedTemplate('royal');
        setBorderStyle('double');
    };

    // Helper for Border Style
    const getBorderStyle = () => {
        if (borderStyle === 'decorative') return 'solid'; // handled separately
        return borderStyle;
    };

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start px-4">
            
            {/* LEFT: INPUT FORM */}
            <div className="lg:col-span-5 space-y-6 animate-in slide-in-from-left duration-500 h-full max-h-screen lg:overflow-y-auto pr-2 custom-scrollbar no-print">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Settings2 className="size-6 text-primary" /> BIODATA STUDIO
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="font-black text-[10px] uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1" /> Reset</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        {/* Section: Design Styles */}
                        <div className="space-y-6">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Layers className="size-3" /> Select Template
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Frame className="size-3" /> Outline Border Style
                                </Label>
                                <Select value={borderStyle} onValueChange={setBorderStyle}>
                                    <SelectTrigger className="h-11 rounded-xl border-2 font-black uppercase text-[10px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        {BORDER_STYLES.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="font-bold text-[10px] uppercase">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* Section: Themes & Photo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Palette className="size-3" /> Theme Colors
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {THEME_COLORS.map(c => (
                                        <button 
                                            key={c.value} 
                                            onClick={() => setThemeColor(c.value)}
                                            className={cn(
                                                "size-10 rounded-xl border-2 transition-all flex items-center justify-center",
                                                themeColor === c.value ? "border-primary ring-4 ring-primary/10 scale-110" : "border-white/10"
                                            )}
                                            style={{ backgroundColor: c.value }}
                                        >
                                            {themeColor === c.value && <CheckCircle2 className="size-4 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Camera className="size-3" /> Photo Upload
                                </Label>
                                <Button size="sm" variant="outline" className="w-full h-11 rounded-xl font-black text-[10px] border-2 uppercase" onClick={() => fileInputRef.current?.click()}>
                                    <Plus className="size-3 mr-1.5" /> UPLOAD PHOTO
                                </Button>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* Data Sections */}
                        <div className="space-y-8">
                            {/* Personal */}
                            <div className="space-y-4">
                                <Badge className="bg-rose-500 text-white font-black text-[9px] px-3 py-1 uppercase">Personal Info</Badge>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="col-span-full space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-50">Full Name</Label>
                                        <Input value={formData.personal.fullName} onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)} className="h-10 rounded-lg font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-50">DOB</Label>
                                        <Input value={formData.personal.dob} onChange={(e) => handleInputChange('personal', 'dob', e.target.value)} className="h-10 rounded-lg font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-50">Height</Label>
                                        <Input value={formData.personal.height} onChange={(e) => handleInputChange('personal', 'height', e.target.value)} className="h-10 rounded-lg font-bold" />
                                    </div>
                                </div>
                            </div>

                            {/* Education & Career */}
                            <div className="space-y-4">
                                <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase">Education & Career</Badge>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-50">Qualification</Label>
                                        <Input value={formData.education.qualification} onChange={(e) => handleInputChange('education', 'qualification', e.target.value)} className="h-10 rounded-lg font-bold" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase opacity-50">Occupation</Label>
                                            <Input value={formData.education.occupation} onChange={(e) => handleInputChange('education', 'occupation', e.target.value)} className="h-10 rounded-lg font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase opacity-50">Income</Label>
                                            <Input value={formData.education.annualIncome} onChange={(e) => handleInputChange('education', 'annualIncome', e.target.value)} className="h-10 rounded-lg font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Family */}
                            <div className="space-y-4">
                                <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase">Family Background</Badge>
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase opacity-50">Father's Name</Label>
                                            <Input value={formData.family.fatherName} onChange={(e) => handleInputChange('family', 'fatherName', e.target.value)} className="h-10 rounded-lg font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[8px] font-black uppercase opacity-50">Father's Occ.</Label>
                                            <Input value={formData.family.fatherOccupation} onChange={(e) => handleInputChange('family', 'fatherOccupation', e.target.value)} className="h-10 rounded-lg font-bold" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[8px] font-black uppercase opacity-50">Address</Label>
                                        <Textarea value={formData.family.address} onChange={(e) => handleInputChange('family', 'address', e.target.value)} className="rounded-lg min-h-[60px]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 md:p-8 border-t">
                         <Button onClick={exportToPdf} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 group">
                            {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" />}
                            EXPORT AS A4 PDF
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: REAL-TIME PREVIEW */}
            <div className="lg:col-span-7 flex flex-col items-center sticky top-24">
                
                <div className="w-full flex items-center justify-between mb-4 no-print px-4">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Live View</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">A4 PREVIEW</Badge>
                </div>

                {/* THE A4 CANVAS */}
                <div className="w-full overflow-x-auto pb-10 flex justify-center bg-slate-200 dark:bg-slate-900 rounded-[3rem] p-4 md:p-10 shadow-inner">
                    <div 
                        ref={previewRef}
                        className={cn(
                            "bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500",
                            selectedTemplate === 'slate' ? 'font-sans' : 'font-body'
                        )}
                        style={{ 
                            width: '210mm', 
                            minHeight: '297mm', 
                            padding: '15mm',
                            color: '#333'
                        }}
                    >
                        {/* BORDER DESIGN */}
                        {borderStyle === 'decorative' ? (
                             <DecorativeBorder color={themeColor} />
                        ) : (
                            <div className="absolute inset-[10mm] pointer-events-none" style={{ 
                                border: `4px ${getBorderStyle()} ${themeColor}`,
                                opacity: 0.2
                            }} />
                        )}

                        {/* TEMPLATE SPECIFIC ELEMENTS */}
                        {selectedTemplate === 'royal' && <TemplateRoyal themeColor={themeColor} />}
                        {selectedTemplate === 'floral' && <TemplateFloral themeColor={themeColor} />}
                        {selectedTemplate === 'slate' && <TemplateSlate themeColor={themeColor} />}

                        {/* COMMON CONTENT WRAPPER */}
                        <div className={cn(
                            "relative z-10 w-full h-full flex flex-col",
                            selectedTemplate === 'modern' && "items-start",
                            selectedTemplate === 'vintage' && "items-center"
                        )}>
                            
                            {/* HEADER */}
                            <header className={cn(
                                "w-full mb-12",
                                selectedTemplate === 'vintage' ? 'text-center' : '',
                                selectedTemplate === 'slate' ? 'bg-muted/30 p-8 rounded-3xl mb-8' : ''
                            )}>
                                {selectedTemplate !== 'slate' && (
                                     <div className="flex items-center justify-center gap-4 text-center opacity-30 mb-6">
                                        <div className="h-px w-20 bg-current" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">OM GANESHAY NAMAHA</span>
                                        <div className="h-px w-20 bg-current" />
                                    </div>
                                )}
                                <h2 className={cn(
                                    "text-4xl md:text-6xl font-black font-headline tracking-widest uppercase text-center",
                                    selectedTemplate === 'vintage' && "font-serif italic capitalize tracking-normal",
                                    selectedTemplate === 'slate' && "text-left text-5xl"
                                )} style={{ color: themeColor }}>
                                    Bio Data
                                </h2>
                                {selectedTemplate === 'royal' && <div className="w-48 h-1 mx-auto mt-2 rounded-full opacity-20" style={{ backgroundColor: themeColor }} />}
                            </header>

                            <div className="grid grid-cols-12 gap-10 w-full flex-1">
                                {/* MAIN CONTENT */}
                                <div className="col-span-8 space-y-10">
                                    <Section 
                                        title="Personal Details" 
                                        themeColor={themeColor} 
                                        template={selectedTemplate}
                                    >
                                        <Row label="Full Name" value={formData.personal.fullName} />
                                        <Row label="Date of Birth" value={formData.personal.dob} />
                                        <Row label="Time of Birth" value={formData.personal.tob} />
                                        <Row label="Place of Birth" value={formData.personal.placeOfBirth} />
                                        <Row label="Height" value={formData.personal.height} />
                                        <Row label="Complexion" value={formData.personal.complexion} />
                                        <Row label="Blood Group" value={formData.personal.bloodGroup} />
                                    </Section>

                                    <Section 
                                        title="Career & Education" 
                                        themeColor={themeColor} 
                                        template={selectedTemplate}
                                    >
                                        <Row label="Education" value={formData.education.qualification} />
                                        <Row label="Institution" value={formData.education.institution} />
                                        <Row label="Occupation" value={formData.education.occupation} />
                                        <Row label="Income" value={formData.education.annualIncome} />
                                    </Section>

                                    <Section 
                                        title="Family Profile" 
                                        themeColor={themeColor} 
                                        template={selectedTemplate}
                                    >
                                        <Row label="Father Name" value={formData.family.fatherName} />
                                        <Row label="Mother Name" value={formData.family.motherName} />
                                        <Row label="Siblings" value={formData.family.siblings} />
                                        <div className="flex items-start gap-4 text-sm leading-relaxed mt-2">
                                            <span className="w-32 font-black text-muted-foreground/50 shrink-0 uppercase text-[10px]">Address</span>
                                            <span className="font-bold">{formData.family.address}</span>
                                        </div>
                                    </Section>
                                </div>

                                {/* SIDEBAR CONTENT (PHOTO) */}
                                <div className="col-span-4 flex flex-col items-center gap-12">
                                    <div className={cn(
                                        "w-full aspect-[4/5] bg-white p-2 shadow-2xl relative",
                                        selectedTemplate === 'royal' && "rotate-2 border-[1px] border-slate-200",
                                        selectedTemplate === 'modern' && "rounded-3xl overflow-hidden shadow-none border-4",
                                        selectedTemplate === 'floral' && "border-double border-4"
                                    )} style={{ borderColor: themeColor }}>
                                        {profilePic ? (
                                            <img src={profilePic} alt="profile" className="size-full object-cover rounded-[inherit]" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center bg-slate-50"><User className="size-20 opacity-10" /></div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col items-center gap-10 opacity-5">
                                        <Heart className="size-24 fill-current" style={{ color: themeColor }} />
                                        <Sparkles className="size-20" style={{ color: themeColor }} />
                                        <Star className="size-16 fill-current" style={{ color: themeColor }} />
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <footer className="mt-auto pt-10 border-t border-slate-100 text-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">GR7 PREMIUM BIODATA STUDIO • FOR AUSPICIOUS BEGINNINGS</p>
                            </footer>
                        </div>
                    </div>
                </div>

                {/* ZOOM INFO */}
                <div className="no-print mt-6 flex items-center gap-4 text-muted-foreground/60 text-[10px] font-black uppercase">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-1.5"><Heart className="size-3 text-rose-500 fill-rose-500" /> PREMIUM STUDIO</div>
                </div>

            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                }
            `}</style>

        </div>
    );
}

// SUB-COMPONENTS

function Row({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 text-sm">
            <span className="w-32 font-black text-muted-foreground/40 shrink-0 uppercase text-[9px] tracking-tight">{label}</span>
            <span className="font-bold border-b border-dotted flex-1 pb-1">{value || "---"}</span>
        </div>
    );
}

function Section({ title, themeColor, template, children }: { title: string, themeColor: string, template: string, children: React.ReactNode }) {
    return (
        <section className="space-y-5">
            <div className={cn(
                "flex items-center gap-4",
                template === 'vintage' ? 'justify-center' : ''
            )}>
                <h3 className={cn(
                    "text-lg font-black uppercase tracking-widest px-4 py-1",
                    template === 'slate' ? 'bg-muted rounded-lg' : 'border-l-4'
                )} style={{ color: themeColor, borderColor: themeColor }}>
                    {title}
                </h3>
                {template !== 'slate' && <div className="h-px bg-slate-100 flex-1" />}
            </div>
            <div className={cn(
                "grid grid-cols-1 gap-y-3",
                template === 'slate' && "bg-slate-50/50 p-6 rounded-2xl"
            )}>
                {children}
            </div>
        </section>
    );
}

// TEMPLATE OVERLAYS

function TemplateRoyal({ themeColor }: { themeColor: string }) {
    return (
        <>
            <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: themeColor }} />
            <div className="absolute top-0 left-0 size-40 opacity-5 rotate-45 -translate-x-20 -translate-y-20 border-[20px]" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-0 right-0 size-40 opacity-5 rotate-45 translate-x-20 translate-y-20 border-[20px]" style={{ borderColor: themeColor }} />
        </>
    );
}

function TemplateFloral({ themeColor }: { themeColor: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
             <div className="absolute -top-10 -left-10 size-64 rounded-full border-[30px]" style={{ borderColor: themeColor }} />
             <div className="absolute -bottom-10 -right-10 size-64 rounded-full border-[30px]" style={{ borderColor: themeColor }} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] border-2 rounded-full" style={{ borderColor: themeColor }} />
        </div>
    );
}

function TemplateSlate({ themeColor }: { themeColor: string }) {
    return (
        <div className="absolute top-0 left-0 w-2 h-full opacity-20" style={{ backgroundColor: themeColor }} />
    );
}

function DecorativeBorder({ color }: { color: string }) {
    return (
        <div className="absolute inset-[8mm] pointer-events-none">
             <div className="absolute top-0 left-0 size-16 border-t-8 border-l-8" style={{ borderColor: color }} />
             <div className="absolute top-0 right-0 size-16 border-t-8 border-r-8" style={{ borderColor: color }} />
             <div className="absolute bottom-0 left-0 size-16 border-b-8 border-l-8" style={{ borderColor: color }} />
             <div className="absolute bottom-0 right-0 size-16 border-b-8 border-r-8" style={{ borderColor: color }} />
             <div className="absolute inset-0 border-2 opacity-10" style={{ borderColor: color }} />
        </div>
    );
}
