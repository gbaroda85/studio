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
    Type,
    Mail,
    User2,
    GraduationCap,
    Users2,
    Coffee,
    ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const THEME_COLORS = [
    { name: "Royal Purple", value: "#2d0b3a" },
    { name: "Dusty Rose", value: "#7A404F" },
    { name: "Royal Maroon", value: "#800000" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Deep Gold", value: "#B8860B" },
    { name: "Premium Teal", value: "#008080" },
];

const TEMPLATES = [
    { id: 'royal-gold', name: 'Royal Gold (Premium)', description: 'Dark theme with gold ornaments' },
    { id: 'canva-pro', name: 'Pro Canvas', description: 'Side-column asymmetric layout' },
    { id: 'royal', name: 'Royal Heritage', description: 'Traditional gold & maroon accents' },
    { id: 'modern', name: 'Modern Minimal', description: 'Clean layout & airy spacing' },
    { id: 'floral', name: 'Floral Elegance', description: 'Decorative flower patterns' },
    { id: 'vintage', name: 'Vintage Classic', description: 'Double borders & serif fonts' },
];

const INITIAL_DATA = {
    personal: {
        fullName: "Sanjay Singh",
        gender: "Male",
        maritalStatus: "Single",
        religion: "Hindu",
        caste: "Singh",
        subCaste: "Singh",
        gotra: "Singh",
        dob: "22/10/2000",
        tob: "10:30 AM",
        placeOfBirth: "Bangalore",
        rashi: "Mithuna (Gemini)",
        height: "5 Feet 8 Inches",
        complexion: "Fair",
        bloodGroup: "A+",
        hobbies: "Reading, Painting",
        interests: "Traveling, Photography",
        favoriteFood: "Italian, Indian"
    },
    education: {
        qualification: "MBA in Finance",
        institution: "XYZ University",
        graduationYear: "2012",
        intermediate: "DEF College (2010)",
        highSchool: "ABC School (2008)",
        occupation: "Project Manager",
        company: "Tech Solutions Inc.",
        workLocation: "Bangalore",
        annualIncome: "₹ 15,00,000 PA"
    },
    family: {
        fatherName: "Mr. Pramod Singh",
        fatherOccupation: "A.G.M. at State Bank of India",
        motherName: "Mrs. Meena Singh",
        motherOccupation: "House Wife",
        numBrothers: "2",
        numSisters: "2",
        siblings: "2 brothers, 2 sisters",
        mamaFamily: "Bhardwaj family from Jaipur",
        address: "Bangalore"
    },
    contact: {
        primaryPhone: "75678XXXXX",
        email: "sanjay.singh@email.com",
        address: "Bangalore"
    }
};

export default function MarriageBiodataGenerator() {
    const { toast } = useToast();
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [profilePic, setProfilePic] = useState<string | null>("https://picsum.photos/seed/portrait1/400/500");
    const [godLogo, setGodLogo] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState("#2d0b3a");
    const [selectedTemplate, setSelectedTemplate] = useState('royal-gold');
    const [borderStyle, setBorderStyle] = useState('double');
    const [isExporting, setIsExporting] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

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

    const handleGodLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setGodLogo(event.target?.result as string);
            reader.readAsDataURL(file);
            toast({ title: "Logo Uploaded", description: "PNG Logo set at the center top." });
        }
    };

    const exportToPdf = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`Biodata-${formData.personal.fullName.replace(/\s+/g, '-')}.pdf`);
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
        setGodLogo(null);
        setThemeColor("#2d0b3a");
        setSelectedTemplate('royal-gold');
        setBorderStyle('double');
    };

    const getBorderStyle = () => {
        if (borderStyle === 'decorative') return 'solid';
        return borderStyle;
    };

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start px-4">
            
            {/* LEFT: INPUT FORM */}
            <div className="lg:col-span-5 space-y-6 animate-in slide-in-from-left duration-500 h-full max-h-[90vh] lg:overflow-y-auto pr-2 custom-scrollbar no-print pb-20">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Settings2 className="size-6 text-primary" /> STUDIO PANEL
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="font-black text-[10px] uppercase text-muted-foreground hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="size-3 mr-1" /> Reset</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        {/* 1. Visual Styling Section */}
                        <div className="space-y-6">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Layers className="size-3" /> Select Template Style
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

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    "size-8 rounded-xl border-2 transition-all flex items-center justify-center",
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
                                        <Camera className="size-3" /> Photo & God Logo
                                    </Label>
                                    <div className="flex flex-col gap-2">
                                        <Button size="sm" variant="outline" className="w-full h-10 rounded-xl font-black text-[10px] border-2 uppercase border-dashed" onClick={() => fileInputRef.current?.click()}>
                                            <ImageIcon className="size-3 mr-1.5" /> CANDIDATE PHOTO
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1 h-10 rounded-xl font-black text-[10px] border-2 uppercase border-dashed" onClick={() => logoInputRef.current?.click()}>
                                                <Sparkles className="size-3 mr-1.5" /> GOD LOGO (PNG)
                                            </Button>
                                            {godLogo && (
                                                <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl" onClick={() => setGodLogo(null)}>
                                                    <X className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    <input ref={logoInputRef} type="file" className="hidden" accept="image/png" onChange={handleGodLogoUpload} />
                                </div>
                             </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* 2. Personal Information Section */}
                        <div className="space-y-6">
                            <Badge className="bg-rose-500 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Personal Details</Badge>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label>
                                    <Input value={formData.personal.fullName} onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)} className="h-10 rounded-lg font-bold border-2 focus:ring-primary/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Date of Birth</Label>
                                    <Input value={formData.personal.dob} onChange={(e) => handleInputChange('personal', 'dob', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Place of Birth</Label>
                                    <Input value={formData.personal.placeOfBirth} onChange={(e) => handleInputChange('personal', 'placeOfBirth', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Rashi</Label>
                                    <Input value={formData.personal.rashi} onChange={(e) => handleInputChange('personal', 'rashi', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Religion</Label>
                                    <Input value={formData.personal.religion} onChange={(e) => handleInputChange('personal', 'religion', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Caste</Label>
                                    <Input value={formData.personal.caste} onChange={(e) => handleInputChange('personal', 'caste', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Sub Caste</Label>
                                    <Input value={formData.personal.subCaste} onChange={(e) => handleInputChange('personal', 'subCaste', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Gotra</Label>
                                    <Input value={formData.personal.gotra} onChange={(e) => handleInputChange('personal', 'gotra', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Complexion</Label>
                                    <Input value={formData.personal.complexion} onChange={(e) => handleInputChange('personal', 'complexion', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Height</Label>
                                    <Input value={formData.personal.height} onChange={(e) => handleInputChange('personal', 'height', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Marital Status</Label>
                                    <Input value={formData.personal.maritalStatus} onChange={(e) => handleInputChange('personal', 'maritalStatus', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Career & Education Section */}
                        <div className="space-y-6">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Education & Career</Badge>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Education</Label>
                                    <Input value={formData.education.qualification} onChange={(e) => handleInputChange('education', 'qualification', e.target.value)} className="h-10 rounded-lg font-bold border-2 focus:ring-primary/20" />
                                </div>
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Occupation</Label>
                                    <Input value={formData.education.occupation} onChange={(e) => handleInputChange('education', 'occupation', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Institution/College</Label>
                                    <Input value={formData.education.institution} onChange={(e) => handleInputChange('education', 'institution', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Annual Income</Label>
                                    <Input value={formData.education.annualIncome} onChange={(e) => handleInputChange('education', 'annualIncome', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Family Information Section */}
                        <div className="space-y-6">
                            <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Family Details</Badge>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Father's Name</Label>
                                    <Input value={formData.family.fatherName} onChange={(e) => handleInputChange('family', 'fatherName', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Father's Occupation</Label>
                                    <Input value={formData.family.fatherOccupation} onChange={(e) => handleInputChange('family', 'fatherOccupation', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Mother's Name</Label>
                                    <Input value={formData.family.motherName} onChange={(e) => handleInputChange('family', 'motherName', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Mother's Occupation</Label>
                                    <Input value={formData.family.motherOccupation} onChange={(e) => handleInputChange('family', 'motherOccupation', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">No. Of Brother</Label>
                                    <Input value={formData.family.numBrothers} onChange={(e) => handleInputChange('family', 'numBrothers', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">No. Of Sister</Label>
                                    <Input value={formData.family.numSisters} onChange={(e) => handleInputChange('family', 'numSisters', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 5. Contact Section */}
                        <div className="space-y-6">
                            <Badge className="bg-purple-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Contact Details</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Phone No.</Label>
                                    <Input value={formData.contact.primaryPhone} onChange={(e) => handleInputChange('contact', 'primaryPhone', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Residence Address</Label>
                                    <Textarea value={formData.contact.address} onChange={(e) => handleInputChange('contact', 'address', e.target.value)} className="rounded-xl border-2 font-bold min-h-[80px]" placeholder="Enter address..." />
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 md:p-8 border-t flex flex-col gap-4">
                         <Button onClick={exportToPdf} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 group">
                            {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Download className="mr-3 size-8 group-hover:translate-y-1 transition-transform" />}
                            EXPORT AS A4 PDF
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground font-bold uppercase tracking-widest opacity-60">Industrial 300DPI Render Output</p>
                    </CardFooter>
                </Card>
            </div>

            {/* RIGHT: REAL-TIME PREVIEW */}
            <div className="lg:col-span-7 flex flex-col items-center sticky top-24 pb-20">
                
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
                            padding: selectedTemplate === 'canva-pro' || selectedTemplate === 'royal-gold' ? '0' : '15mm',
                            color: '#333'
                        }}
                    >
                        {/* BORDER DESIGN */}
                        {selectedTemplate !== 'canva-pro' && selectedTemplate !== 'royal-gold' && (
                            borderStyle === 'decorative' ? (
                                <DecorativeBorder color={themeColor} />
                            ) : (
                                <div className="absolute inset-[10mm] pointer-events-none" style={{ 
                                    border: `4px ${getBorderStyle()} ${themeColor}`,
                                    opacity: 0.2
                                }} />
                            )
                        )}

                        {/* TEMPLATES */}
                        {selectedTemplate === 'royal-gold' ? (
                            <TemplateRoyalGold themeColor={themeColor} formData={formData} profilePic={profilePic} godLogo={godLogo} />
                        ) : selectedTemplate === 'canva-pro' ? (
                            <TemplateCanvaPro themeColor={themeColor} formData={formData} profilePic={profilePic} godLogo={godLogo} />
                        ) : (
                            <>
                                {selectedTemplate === 'royal' && <TemplateRoyal themeColor={themeColor} />}
                                {selectedTemplate === 'floral' && <TemplateFloral themeColor={themeColor} />}
                                {selectedTemplate === 'slate' && <TemplateSlate themeColor={themeColor} />}

                                <div className={cn(
                                    "relative z-10 w-full h-full flex flex-col",
                                    selectedTemplate === 'modern' && "items-start",
                                    selectedTemplate === 'vintage' && "items-center"
                                )}>
                                    <header className={cn(
                                        "w-full mb-12",
                                        selectedTemplate === 'vintage' ? 'text-center' : '',
                                        selectedTemplate === 'slate' ? 'bg-muted/30 p-8 rounded-3xl mb-8' : ''
                                    )}>
                                        {/* Center God Logo */}
                                        {godLogo && (
                                            <div className="flex justify-center mb-6">
                                                <img src={godLogo} alt="God Logo" className="h-16 w-auto object-contain" />
                                            </div>
                                        )}

                                        {selectedTemplate !== 'slate' && !godLogo && (
                                            <div className="flex items-center justify-center gap-4 text-center opacity-30 mb-6">
                                                <div className="h-px w-20 bg-current" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">OM GANESHAY NAMAHA</span>
                                                <div className="h-px w-20 bg-current" />
                                            </div>
                                        )}
                                        <h2 className={cn(
                                            "text-3xl md:text-5xl font-black font-headline tracking-widest uppercase text-center",
                                            selectedTemplate === 'vintage' && "font-serif italic capitalize tracking-normal",
                                            selectedTemplate === 'slate' && "text-left text-4xl"
                                        )} style={{ color: themeColor }}>
                                            Bio Data
                                        </h2>
                                        {selectedTemplate === 'royal' && <div className="w-48 h-1 mx-auto mt-2 rounded-full opacity-20" style={{ backgroundColor: themeColor }} />}
                                    </header>

                                    <div className="grid grid-cols-12 gap-10 w-full flex-1">
                                        <div className="col-span-8 space-y-10">
                                            <Section title="Personal Details" themeColor={themeColor} template={selectedTemplate}>
                                                <Row label="Full Name" value={formData.personal.fullName} />
                                                <Row label="Date of Birth" value={formData.personal.dob} />
                                                <Row label="Height" value={formData.personal.height} />
                                                <Row label="Hobbies" value={formData.personal.hobbies} />
                                            </Section>
                                            <Section title="Career & Education" themeColor={themeColor} template={selectedTemplate}>
                                                <Row label="Education" value={formData.education.qualification} />
                                                <Row label="Occupation" value={formData.education.occupation} />
                                                <Row label="Income" value={formData.education.annualIncome} />
                                            </Section>
                                            <Section title="Family Profile" themeColor={themeColor} template={selectedTemplate}>
                                                <Row label="Father Name" value={formData.family.fatherName} />
                                                <Row label="Mother Name" value={formData.family.motherName} />
                                                <Row label="Siblings" value={formData.family.siblings} />
                                                <div className="flex items-start gap-4 text-sm leading-relaxed mt-2">
                                                    <span className="w-32 font-black text-muted-foreground/50 shrink-0 uppercase text-[10px]">Address</span>
                                                    <span className="font-bold">{formData.family.address}</span>
                                                </div>
                                            </Section>
                                        </div>
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
                                        </div>
                                    </div>
                                    <footer className="mt-auto pt-10 border-t border-slate-100 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">GR7 PREMIUM BIODATA STUDIO • FOR AUSPICIOUS BEGINNINGS</p>
                                    </footer>
                                </div>
                            </>
                        )}
                    </div>
                </div>

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

// TEMPLATE: ROYAL GOLD (MATCHING USER IMAGE)
function TemplateRoyalGold({ themeColor, formData, profilePic, godLogo }: { themeColor: string, formData: typeof INITIAL_DATA, profilePic: string | null, godLogo: string | null }) {
    const goldColor = "#f3cc8a";
    
    return (
        <div className="w-full h-full relative p-12 overflow-hidden flex flex-col" style={{ background: `linear-gradient(to bottom, ${themeColor}, #0a040d)` }}>
            {/* Corners */}
            <div className="absolute top-6 left-6 size-24 pointer-events-none opacity-60">
                <svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5">
                    <path d="M5,40 L5,5 C5,5 35,5 35,5" />
                    <circle cx="10" cy="10" r="2" fill={goldColor} />
                    <path d="M5,15 C20,15 15,30 30,30" opacity="0.4" />
                </svg>
            </div>
            <div className="absolute top-6 right-6 size-24 pointer-events-none opacity-60 rotate-90">
                <svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5">
                    <path d="M5,40 L5,5 C5,5 35,5 35,5" />
                    <circle cx="10" cy="10" r="2" fill={goldColor} />
                </svg>
            </div>
            <div className="absolute bottom-6 left-6 size-24 pointer-events-none opacity-60 -rotate-90">
                <svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5">
                    <path d="M5,40 L5,5 C5,5 35,5 35,5" />
                    <circle cx="10" cy="10" r="2" fill={goldColor} />
                </svg>
            </div>
            <div className="absolute bottom-6 right-6 size-24 pointer-events-none opacity-60 rotate-180">
                <svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5">
                    <path d="M5,40 L5,5 C5,5 35,5 35,5" />
                    <circle cx="10" cy="10" r="2" fill={goldColor} />
                </svg>
            </div>

            {/* Ganesh Watermark */}
            <div className="absolute top-[40%] right-[5%] size-[300px] opacity-[0.08] pointer-events-none">
                 <svg viewBox="0 0 100 100" fill={goldColor}>
                    <path d="M50,10 C40,10 30,20 30,35 C30,45 35,50 40,55 C35,65 30,70 30,80 C30,90 40,95 50,95 C60,95 70,90 70,80 C70,70 65,65 60,55 C65,50 70,45 70,35 C70,20 60,10 50,10 Z M50,20 C55,20 60,25 60,35 C60,45 55,50 50,50 C45,50 40,45 40,35 C40,25 45,20 50,20 Z" />
                 </svg>
            </div>

            {/* Header */}
            <header className="flex flex-col items-center mb-10 z-10">
                <div className="size-20 mb-2 flex items-center justify-center">
                    {godLogo ? (
                        <img src={godLogo} alt="God Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                        <svg viewBox="0 0 100 100" fill={goldColor}>
                            <path d="M50,10 C40,10 30,20 30,35 C30,45 35,50 40,55 C35,65 30,70 30,80 C30,90 40,95 50,95 C60,95 70,90 70,80 C70,70 65,65 60,55 C65,50 70,45 70,35 C70,20 60,10 50,10 Z M50,20 C55,20 60,25 60,35 C60,45 55,50 50,50 C45,50 40,45 40,35 C40,25 45,20 50,20 Z" />
                        </svg>
                    )}
                </div>
                <h2 className="text-xl font-black tracking-widest text-[#f3cc8a]">ॐ गणेशाय नमः</h2>
            </header>

            <div className="grid grid-cols-12 gap-6 flex-1 z-10">
                {/* Details Section */}
                <div className="col-span-8 flex flex-col gap-6">
                    <div className="space-y-1 mb-4">
                         <h1 className="text-3xl font-black tracking-tight" style={{ color: goldColor }}>{formData.personal.fullName}</h1>
                    </div>
                    
                    <div className="space-y-2.5">
                        <RoyalRow label="Date of Birth" value={formData.personal.dob} color={goldColor} />
                        <RoyalRow label="Place of Birth" value={formData.personal.placeOfBirth} color={goldColor} />
                        <RoyalRow label="Rashi" value={formData.personal.rashi} color={goldColor} />
                        <RoyalRow label="Religion" value={formData.personal.religion} color={goldColor} />
                        <RoyalRow label="Caste" value={formData.personal.caste} color={goldColor} />
                        <RoyalRow label="Sub Caste" value={formData.personal.subCaste} color={goldColor} />
                        <RoyalRow label="Gotra" value={formData.personal.gotra} color={goldColor} />
                        <RoyalRow label="Complexion" value={formData.personal.complexion} color={goldColor} />
                        <RoyalRow label="Height" value={formData.personal.height} color={goldColor} />
                        <RoyalRow label="Education" value={formData.education.qualification} color={goldColor} />
                        <RoyalRow label="Occupation" value={formData.education.occupation} color={goldColor} />
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-black uppercase tracking-widest border-b pb-1 mb-4" style={{ color: goldColor, borderColor: `${goldColor}44` }}>Family Details</h3>
                        <div className="space-y-2.5">
                            <RoyalRow label="Father's Name" value={formData.family.fatherName} color={goldColor} />
                            <RoyalRow label="Occupation" value={formData.family.fatherOccupation} color={goldColor} />
                            <RoyalRow label="Mother's Name" value={formData.family.motherName} color={goldColor} />
                            <RoyalRow label="Occupation" value={formData.family.motherOccupation} color={goldColor} />
                            <RoyalRow label="No. Of Brother" value={formData.family.numBrothers} color={goldColor} />
                            <RoyalRow label="No. Of Sister" value={formData.family.numSisters} color={goldColor} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-black uppercase tracking-widest border-b pb-1 mb-4" style={{ color: goldColor, borderColor: `${goldColor}44` }}>Contact Details</h3>
                        <div className="space-y-2.5">
                            <RoyalRow label="Phone no." value={formData.contact.primaryPhone} color={goldColor} />
                            <RoyalRow label="Address" value={formData.contact.address} color={goldColor} />
                        </div>
                    </div>
                </div>

                {/* Photo Section */}
                <div className="col-span-4 flex flex-col items-center">
                    <div className="w-full aspect-[4/5] p-2 border-2 shadow-2xl relative bg-black/20" style={{ borderColor: goldColor }}>
                        {profilePic ? (
                            <img src={profilePic} alt="profile" className="size-full object-cover" />
                        ) : (
                            <div className="size-full flex items-center justify-center"><User2 className="size-16 opacity-20" color={goldColor} /></div>
                        )}
                    </div>
                </div>
            </div>
            
            <footer className="mt-10 pt-6 border-t flex justify-center items-center gap-4 opacity-30" style={{ borderColor: `${goldColor}22` }}>
                 <div className="size-8">
                    <svg viewBox="0 0 100 100" fill={goldColor}>
                        <path d="M50,10 C40,10 30,20 30,35 C30,45 35,50 40,55 C35,65 30,70 30,80 C30,90 40,95 50,95 C60,95 70,90 70,80 C70,70 65,65 60,55 C65,50 70,45 70,35 C70,20 60,10 50,10 Z M50,20 C55,20 60,25 60,35 C60,45 55,50 50,50 C45,50 40,45 40,35 C40,25 45,20 50,20 Z" />
                    </svg>
                 </div>
            </footer>
        </div>
    );
}

function RoyalRow({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex items-baseline text-base font-medium">
            <span className="w-44 shrink-0" style={{ color: color }}>{label}</span>
            <span className="w-8 text-center shrink-0" style={{ color: color }}>:</span>
            <span className="flex-1" style={{ color: color }}>{value || "---"}</span>
        </div>
    );
}

// TEMPLATE: CANVA PRO (SIDEBAR ASYMMETRIC)
function TemplateCanvaPro({ themeColor, formData, profilePic, godLogo }: { themeColor: string, formData: typeof INITIAL_DATA, profilePic: string | null, godLogo: string | null }) {
    const lighterColor = themeColor + '33'; // 20% opacity
    
    return (
        <div className="w-full h-full flex bg-[#FDFBF7]">
            {/* Sidebar (Left Column) */}
            <div className="w-[38%] h-full min-h-[297mm] flex flex-col text-white p-8 space-y-12" style={{ backgroundColor: themeColor }}>
                <div className="h-[120px]" /> {/* Spacer for photo */}
                
                {/* Contact Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 flex items-center gap-2"><Phone className="size-4" /> Contact</h3>
                    <div className="space-y-5">
                        <div className="flex items-start gap-3">
                            <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5"><Phone className="size-3" /></div>
                            <div><p className="text-[7px] font-black uppercase opacity-60">Mobile</p><p className="text-[10px] font-bold">{formData.contact.primaryPhone}</p></div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5"><Mail className="size-3" /></div>
                            <div className="overflow-hidden"><p className="text-[7px] font-black uppercase opacity-60">Email</p><p className="text-[10px] font-bold break-all">{formData.contact.email}</p></div>
                        </div>
                        {formData.contact.address && (
                            <div className="flex items-start gap-3">
                                <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5"><MapPin className="size-3" /></div>
                                <div><p className="text-[7px] font-black uppercase opacity-60">Residence</p><p className="text-[9px] font-bold leading-tight">{formData.contact.address}</p></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Personal Info Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 flex items-center gap-2"><User2 className="size-4" /> Personal</h3>
                    <div className="space-y-3.5">
                        <SidebarItem label="Gender" value={formData.personal.gender} />
                        <SidebarItem label="Status" value={formData.personal.maritalStatus} />
                        <SidebarItem label="Religion / Caste" value={`${formData.personal.religion} - ${formData.personal.caste}`} />
                        <SidebarItem label="Birth Date" value={formData.personal.dob} />
                        <SidebarItem label="Birth Time" value={formData.personal.tob} />
                        <SidebarItem label="Birth Place" value={formData.personal.placeOfBirth} />
                        <SidebarItem label="Height" value={formData.personal.height} />
                        <SidebarItem label="Complexion" value={formData.personal.complexion} />
                        <SidebarItem label="Blood Group" value={formData.personal.bloodGroup} />
                    </div>
                </div>

                {/* Career Section */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] border-b border-white/20 pb-2 flex items-center gap-2"><Briefcase className="size-4" /> Career</h3>
                    <div className="space-y-3.5">
                        <SidebarItem label="Occupation" value={formData.education.occupation} />
                        <SidebarItem label="Organization" value={formData.education.company} />
                        <SidebarItem label="Work Location" value={formData.education.workLocation} />
                        <SidebarItem label="Annual Income" value={formData.education.annualIncome} />
                    </div>
                </div>
            </div>

            {/* Main Content (Right Column) */}
            <div className="flex-1 p-12 space-y-12">
                <header className="flex flex-col items-center mb-8 pl-16">
                     {godLogo && (
                        <div className="flex justify-center mb-4">
                            <img src={godLogo} alt="God Logo" className="h-14 w-auto object-contain" />
                        </div>
                     )}
                     <h1 className="text-5xl font-black tracking-tighter" style={{ color: themeColor }}>
                        {formData.personal.fullName.split(' ')[0]} <span className="block text-3xl opacity-80 mt-[-5px]">{formData.personal.fullName.split(' ').slice(1).join(' ')}</span>
                     </h1>
                </header>

                {/* Relative Positioning Container for Vertical Line */}
                <div className="relative pl-8 space-y-12">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-0 top-6 bottom-6 w-0.5" style={{ backgroundColor: themeColor, opacity: 0.2 }} />

                    {/* Section: Family Details */}
                    <MainSection title="Family Details" themeColor={themeColor} lighterColor={lighterColor} icon={<Users2 className="size-4" />}>
                        <MainRow label="Father's Name" value={formData.family.fatherName} themeColor={themeColor} />
                        <MainRow label="Father's Occ." value={formData.family.fatherOccupation} themeColor={themeColor} />
                        <MainRow label="Mother's Name" value={formData.family.motherName} themeColor={themeColor} />
                        <MainRow label="Mother's Occ." value={formData.family.motherOccupation} themeColor={themeColor} />
                        <MainRow label="Siblings" value={formData.family.siblings} themeColor={themeColor} />
                        <MainRow label="Family Address" value={formData.family.address} themeColor={themeColor} />
                    </MainSection>

                    {/* Section: Education */}
                    <MainSection title="Education" themeColor={themeColor} lighterColor={lighterColor} icon={<GraduationCap className="size-4" />}>
                        <MainRow label="Highest Degree" value={formData.education.qualification} themeColor={themeColor} />
                        <MainRow label="College / Univ." value={formData.education.institution} themeColor={themeColor} />
                        <MainRow label="Grad. Year" value={formData.education.graduationYear} themeColor={themeColor} />
                        <MainRow label="Inter / +2" value={formData.education.intermediate} themeColor={themeColor} />
                        <MainRow label="High School" value={formData.education.highSchool} themeColor={themeColor} />
                    </MainSection>

                    {/* Section: Hobbies & Interests */}
                    <MainSection title="Interests" themeColor={themeColor} lighterColor={lighterColor} icon={<Coffee className="size-4" />}>
                        <MainRow label="Interests" value={formData.personal.interests} themeColor={themeColor} />
                        <MainRow label="Hobbies" value={formData.personal.hobbies} themeColor={themeColor} />
                        <MainRow label="Favorite Food" value={formData.personal.favoriteFood} themeColor={themeColor} />
                    </MainSection>
                </div>
            </div>

            {/* Profile Photo - Absolute Floating */}
            <div className="absolute top-12 left-[38%] -translate-x-1/2 z-50">
                 <div className="size-[180px] rounded-full border-[10px] border-[#FDFBF7] shadow-2xl overflow-hidden bg-white">
                    {profilePic ? (
                        <img src={profilePic} alt="bio" className="size-full object-cover" />
                    ) : (
                        <div className="size-full flex items-center justify-center bg-slate-50"><User2 className="size-20 opacity-10" /></div>
                    )}
                 </div>
                 {/* Decorative Ring */}
                 <div className="absolute inset-[-15px] rounded-full border-2 border-dashed pointer-events-none opacity-20" style={{ borderColor: themeColor }} />
            </div>

            {/* Background Decorative Shapes */}
            <div className="absolute top-0 right-0 size-64 bg-slate-100 rounded-bl-full -z-0 opacity-50" style={{ backgroundColor: lighterColor }} />
            <div className="absolute bottom-0 right-0 w-full h-12 -z-0" style={{ backgroundColor: lighterColor }} />
        </div>
    );
}

function SidebarItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-black uppercase opacity-50 tracking-wider">{label}</span>
            <span className="text-[11px] font-bold leading-tight">{value || "---"}</span>
        </div>
    );
}

function MainSection({ title, themeColor, lighterColor, icon, children }: { title: string, themeColor: string, lighterColor: string, icon?: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-8 py-2 rounded-full text-white font-black text-sm uppercase tracking-widest" style={{ backgroundColor: themeColor, boxShadow: `8px 8px 0px ${lighterColor}` }}>
                {icon} {title}
            </div>
            <div className="space-y-1.5 pt-2">
                {children}
            </div>
        </div>
    );
}

function MainRow({ label, value, themeColor }: { label: string, value: string, themeColor: string }) {
    return (
        <div className="flex items-baseline gap-4 py-1 group border-b border-slate-50 last:border-0">
            <span className="w-32 text-[11px] font-black uppercase opacity-60 tracking-tight shrink-0" style={{ color: themeColor }}>{label}</span>
            <span className="text-sm font-bold text-slate-800 leading-snug">{value || "---"}</span>
        </div>
    );
}

// TEMPLATE: ROYAL
function TemplateRoyal({ themeColor }: { themeColor: string }) {
    return (
        <>
            <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: themeColor }} />
            <div className="absolute top-0 left-0 size-40 opacity-5 rotate-45 -translate-x-20 -translate-y-20 border-[20px]" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-0 right-0 size-40 opacity-5 rotate-45 translate-x-20 translate-y-20 border-[20px]" style={{ borderColor: themeColor }} />
        </>
    );
}

// TEMPLATE: FLORAL
function TemplateFloral({ themeColor }: { themeColor: string }) {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
             <div className="absolute -top-10 -left-10 size-64 rounded-full border-[30px]" style={{ borderColor: themeColor }} />
             <div className="absolute -bottom-10 -right-10 size-64 rounded-full border-[30px]" style={{ borderColor: themeColor }} />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[400px] border-2 rounded-full" style={{ borderColor: themeColor }} />
        </div>
    );
}

// TEMPLATE: SLATE
function TemplateSlate({ themeColor }: { themeColor: string }) {
    return (
        <div className="absolute top-0 left-0 w-2 h-full opacity-20" style={{ backgroundColor: themeColor }} />
    );
}

// COMPONENT: DECORATIVE BORDER
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
