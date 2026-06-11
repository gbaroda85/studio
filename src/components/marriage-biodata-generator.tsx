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
    ImageIcon,
    Clock,
    UserCircle,
    Globe
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

const COUNTRIES = [
  { name: "India", currency: "INR", locale: "en-IN" },
  { name: "USA", currency: "USD", locale: "en-US" },
  { name: "UK", currency: "GBP", locale: "en-GB" },
  { name: "Europe", currency: "EUR", locale: "de-DE" },
  { name: "UAE", currency: "AED", locale: "ar-AE" },
  { name: "Canada", currency: "CAD", locale: "en-CA" },
  { name: "Australia", currency: "AUD", locale: "en-AU" },
];

const INITIAL_DATA = {
    personal: {
        fullName: "Sanjay Singh",
        gender: "Male",
        maritalStatus: "Single",
        religion: "Hindu",
        caste: "Singh",
        subCaste: "Singh",
        gotra: "Vashishta",
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
        graduationYear: "2022",
        intermediate: "DEF College (2018)",
        highSchool: "ABC School (2016)",
        occupation: "Project Manager",
        company: "Tech Solutions Inc.",
        workLocation: "Bangalore",
        annualIncome: "15,00,000"
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
        address: "HSR Layout, Bangalore"
    },
    contact: {
        primaryPhone: "75678XXXXX",
        email: "sanjay.singh@email.com",
        address: "Bangalore, Karnataka"
    }
};

export default function MarriageBiodataGenerator() {
    const { toast } = useToast();
    const [countryIndex, setCountryIndex] = useState(0);
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [profilePic, setProfilePic] = useState<string | null>("https://picsum.photos/seed/portrait1/400/500");
    const [godLogo, setGodLogo] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState("#2d0b3a");
    const [selectedTemplate, setSelectedTemplate] = useState('royal-gold');
    const [isExporting, setIsExporting] = useState(false);
    
    const previewRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const currentCountry = COUNTRIES[countryIndex];

    const formatCurrency = (val: string) => {
        const num = parseFloat(val.replace(/,/g, '')) || 0;
        return new Intl.NumberFormat(currentCountry.locale, { 
            style: 'currency', 
            currency: currentCountry.currency, 
            maximumFractionDigits: 0 
        }).format(num) + " PA";
    };

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
            pdf.save(`GR7-Tools-Biodata-${formData.personal.fullName.replace(/\s+/g, '-')}.pdf`);
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
                            <Button variant="ghost" size="sm" onClick={handleReset} className="font-black text-[10px] uppercase text-muted-foreground hover:bg-destructive/5 hover:text-destructive"><RefreshCcw className="size-3 mr-1" /> Restore</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        {/* Country/Currency Selection */}
                        <div className="space-y-4 pb-6 border-b border-dashed">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <Globe className="size-3" /> Select Country & Currency
                            </Label>
                            <Select value={String(countryIndex)} onValueChange={(v) => setCountryIndex(Number(v))}>
                                <SelectTrigger className="h-12 border-2 font-bold rounded-xl shadow-sm"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl border-2 shadow-2xl">
                                    {COUNTRIES.map((c, i) => (
                                        <SelectItem key={i} value={String(i)} className="font-bold py-2">{c.name} ({c.currency})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
                                                    themeColor === c.value ? "border-primary ring-4 ring-primary/20 scale-110" : "border-white/10"
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
                                    <Label className="text-[9px] font-black uppercase opacity-60">Gender</Label>
                                    <Input value={formData.personal.gender} onChange={(e) => handleInputChange('personal', 'gender', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Marital Status</Label>
                                    <Input value={formData.personal.maritalStatus} onChange={(e) => handleInputChange('personal', 'maritalStatus', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Date of Birth</Label>
                                    <Input value={formData.personal.dob} onChange={(e) => handleInputChange('personal', 'dob', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Birth Time</Label>
                                    <Input value={formData.personal.tob} onChange={(e) => handleInputChange('personal', 'tob', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
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
                                    <Label className="text-[9px] font-black uppercase opacity-60">Gotra</Label>
                                    <Input value={formData.personal.gotra} onChange={(e) => handleInputChange('personal', 'gotra', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Height</Label>
                                    <Input value={formData.personal.height} onChange={(e) => handleInputChange('personal', 'height', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Complexion</Label>
                                    <Input value={formData.personal.complexion} onChange={(e) => handleInputChange('personal', 'complexion', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Blood Group</Label>
                                    <Input value={formData.personal.bloodGroup} onChange={(e) => handleInputChange('personal', 'bloodGroup', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Hobbies & Interests</Label>
                                    <Input value={formData.personal.hobbies} onChange={(e) => handleInputChange('personal', 'hobbies', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 3. Career & Education Section */}
                        <div className="space-y-6">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Education & Career</Badge>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Qualification</Label>
                                    <Input value={formData.education.qualification} onChange={(e) => handleInputChange('education', 'qualification', e.target.value)} className="h-10 rounded-lg font-bold border-2 focus:ring-primary/20" />
                                </div>
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Institution/College</Label>
                                    <Input value={formData.education.institution} onChange={(e) => handleInputChange('education', 'institution', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Occupation</Label>
                                    <Input value={formData.education.occupation} onChange={(e) => handleInputChange('education', 'occupation', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Company Name</Label>
                                    <Input value={formData.education.company} onChange={(e) => handleInputChange('education', 'company', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Work Location</Label>
                                    <Input value={formData.education.workLocation} onChange={(e) => handleInputChange('education', 'workLocation', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
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
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Siblings Details</Label>
                                    <Input value={formData.family.siblings} onChange={(e) => handleInputChange('family', 'siblings', e.target.value)} className="h-10 rounded-lg font-bold border-2" placeholder="e.g. 2 Brothers, 1 Sister" />
                                </div>
                                <div className="col-span-full space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Mama's Family / Relatives</Label>
                                    <Input value={formData.family.mamaFamily} onChange={(e) => handleInputChange('family', 'mamaFamily', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                            </div>
                        </div>

                        {/* 5. Contact Section */}
                        <div className="space-y-6">
                            <Badge className="bg-purple-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Contact Details</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Mobile No.</Label>
                                    <Input value={formData.contact.primaryPhone} onChange={(e) => handleInputChange('contact', 'primaryPhone', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Email Address</Label>
                                    <Input value={formData.contact.email} onChange={(e) => handleInputChange('contact', 'email', e.target.value)} className="h-10 rounded-lg font-bold border-2" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase opacity-60">Residential Address</Label>
                                    <Textarea value={formData.family.address} onChange={(e) => handleInputChange('family', 'address', e.target.value)} className="rounded-xl border-2 font-bold min-h-[80px]" placeholder="Enter address..." />
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
            <div className="lg:col-span-7 flex flex-col items-center no-print w-full overflow-visible">
                
                <div className="w-full flex items-center justify-between mb-4 px-4">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Live View</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">A4 PREVIEW</Badge>
                </div>

                <div className="w-full overflow-x-auto pb-10 flex justify-center bg-slate-200 dark:bg-slate-950 rounded-[3rem] p-4 md:p-10 shadow-inner">
                    <div 
                        ref={previewRef}
                        className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-500"
                        style={{ width: '210mm', minHeight: '297mm', padding: '0', color: '#333' }}
                    >
                        <ResumeContent 
                            formData={formData} 
                            template={selectedTemplate} 
                            profilePic={profilePic} 
                            themeColor={themeColor} 
                            godLogo={godLogo}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-4 text-muted-foreground/60 text-[10px] font-black uppercase">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-1.5"><Heart className="size-3 text-rose-500 fill-rose-500" /> PREMIUM STUDIO</div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

// SUB-COMPONENTS

function Row({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-start gap-4 text-[13px] md:text-sm">
            <span className="w-32 font-black text-muted-foreground/40 shrink-0 uppercase text-[9px] tracking-tight pt-0.5">{label}</span>
            <span className="font-bold border-b border-dotted flex-1 pb-1 text-slate-800 leading-tight">{value || "---"}</span>
        </div>
    );
}

function Section({ title, themeColor, template, children }: { title: string, themeColor: string, template: string, children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-black uppercase tracking-widest px-4 py-1 border-l-4" style={{ color: themeColor, borderColor: themeColor }}>
                    {title}
                </h3>
                <div className="h-px bg-slate-100 flex-1" />
            </div>
            <div className="grid grid-cols-1 gap-y-2.5 px-4">
                {children}
            </div>
        </section>
    );
}

function ResumeContent({ formData, template, profilePic, themeColor, godLogo, formatCurrency }: { formData: typeof INITIAL_DATA, template: string, profilePic: string | null, themeColor: string, godLogo: string | null, formatCurrency: (v: string) => string }) {
    if (template === 'royal-gold') return <TemplateRoyalGold formData={formData} profilePic={profilePic} themeColor={themeColor} godLogo={godLogo} formatCurrency={formatCurrency} />;
    if (template === 'canva-pro') return <TemplateCanvaPro formData={formData} profilePic={profilePic} themeColor={themeColor} godLogo={godLogo} formatCurrency={formatCurrency} />;
    
    return (
        <div className="relative w-full min-h-[297mm] h-full flex flex-col p-[15mm] bg-white">
            <div className="absolute inset-[10mm] pointer-events-none" style={{ border: `4px double ${themeColor}`, opacity: 0.1 }} />
            
            {template === 'royal' && <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: themeColor }} />}
            {template === 'floral' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                    <div className="absolute -top-10 -left-10 size-64 rounded-full border-[30px]" style={{ borderColor: themeColor }} />
                    <div className="absolute -bottom-10 -right-10 size-64 rounded-full border-[30px]" style={{ borderColor: themeColor }} />
                </div>
            )}

            <header className="w-full mb-10 flex flex-col items-center">
                {godLogo ? (
                    <img src={godLogo} alt="Logo" className="h-16 w-auto object-contain mb-6" />
                ) : (
                    <div className="flex items-center gap-4 opacity-30 mb-6">
                        <div className="h-px w-20 bg-current" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">OM GANESHAY NAMAHA</span>
                        <div className="h-px w-20 bg-current" />
                    </div>
                )}
                <h2 className="text-4xl font-black font-headline tracking-[0.2em] uppercase text-center" style={{ color: themeColor }}>Bio Data</h2>
            </header>

            <div className="grid grid-cols-12 gap-10 w-full flex-1">
                <div className="col-span-8 space-y-10">
                    <Section title="Personal Info" themeColor={themeColor} template={template}>
                        <Row label="Full Name" value={formData.personal.fullName} />
                        <Row label="Gender / Status" value={`${formData.personal.gender} - ${formData.personal.maritalStatus}`} />
                        <Row label="Birth Date/Time" value={`${formData.personal.dob} @ ${formData.personal.tob}`} />
                        <Row label="Birth Place" value={formData.personal.placeOfBirth} />
                        <Row label="Religion / Caste" value={`${formData.personal.religion} - ${formData.personal.caste}`} />
                        <Row label="Gotra" value={formData.personal.gotra} />
                        <Row label="Rashi" value={formData.personal.rashi} />
                        <Row label="Height / Complex" value={`${formData.personal.height} | ${formData.personal.complexion}`} />
                    </Section>

                    <Section title="Career & Edu" themeColor={themeColor} template={template}>
                        <Row label="Education" value={formData.education.qualification} />
                        <Row label="Institution" value={formData.education.institution} />
                        <Row label="Occupation" value={formData.education.occupation} />
                        <Row label="Income" value={formatCurrency(formData.education.annualIncome)} />
                    </Section>

                    <Section title="Family Profile" themeColor={themeColor} template={template}>
                        <Row label="Father" value={`${formData.family.fatherName} (${formData.family.fatherOccupation})`} />
                        <Row label="Mother" value={`${formData.family.motherName} (${formData.family.motherOccupation})`} />
                        <Row label="Siblings" value={formData.family.siblings} />
                        <Row label="Mama Side" value={formData.family.mamaFamily} />
                    </Section>

                    <Section title="Contact" themeColor={themeColor} template={template}>
                        <Row label="Mobile" value={formData.contact.primaryPhone} />
                        <Row label="Email" value={formData.contact.email} />
                        <Row label="Address" value={formData.family.address} />
                    </Section>
                </div>

                <div className="col-span-4 flex flex-col items-center pt-10">
                    <div className="w-full aspect-[4/5] bg-white p-2 shadow-2xl border-4 relative" style={{ borderColor: themeColor }}>
                        {profilePic ? (
                            <img src={profilePic} alt="profile" className="size-full object-cover" />
                        ) : (
                            <div className="size-full flex items-center justify-center bg-slate-50"><User2 className="size-20 opacity-10" /></div>
                        )}
                    </div>
                </div>
            </div>
            
            <footer className="mt-auto pt-6 border-t border-slate-100 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">GR7 PREMIUM BIODATA STUDIO</p>
            </footer>
        </div>
    );
}

// TEMPLATE: ROYAL GOLD (DARK)
function TemplateRoyalGold({ themeColor, formData, profilePic, godLogo, formatCurrency }: { themeColor: string, formData: typeof INITIAL_DATA, profilePic: string | null, godLogo: string | null, formatCurrency: (v: string) => string }) {
    const goldColor = "#f3cc8a";
    return (
        <div className="w-[210mm] min-h-[297mm] h-full relative p-14 flex flex-col text-left" style={{ background: `linear-gradient(to bottom, ${themeColor}, #0a040d)` }}>
            <div className="absolute top-6 left-6 size-24 pointer-events-none opacity-60"><svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5"><path d="M5,40 L5,5 L40,5" /></svg></div>
            <div className="absolute top-6 right-6 size-24 pointer-events-none opacity-60 rotate-90"><svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5"><path d="M5,40 L5,5 L40,5" /></svg></div>
            <div className="absolute bottom-6 left-6 size-24 pointer-events-none opacity-60 -rotate-90"><svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5"><path d="M5,40 L5,5 L40,5" /></svg></div>
            <div className="absolute bottom-6 right-6 size-24 pointer-events-none opacity-60 rotate-180"><svg viewBox="0 0 100 100" fill="none" stroke={goldColor} strokeWidth="1.5"><path d="M5,40 L5,5 L40,5" /></svg></div>

            <header className="flex flex-col items-center mb-12">
                <div className="size-16 mb-4">
                    {godLogo ? <img src={godLogo} className="max-w-full h-auto" /> : <div className="text-3xl" style={{ color: goldColor }}>ॐ</div>}
                </div>
                <h1 className="text-3xl font-black tracking-[0.3em] uppercase" style={{ color: goldColor }}>Marriage Bio Data</h1>
            </header>

            <div className="grid grid-cols-12 gap-10 flex-1">
                <div className="col-span-8 space-y-8">
                    <div className="space-y-3">
                        <h3 className="text-lg font-black uppercase tracking-widest border-b pb-1" style={{ color: goldColor, borderColor: `${goldColor}44` }}>Candidate Profile</h3>
                        <div className="space-y-2">
                            <RoyalRow label="Full Name" value={formData.personal.fullName} color={goldColor} />
                            <RoyalRow label="Birth Date/Time" value={`${formData.personal.dob} @ ${formData.personal.tob}`} color={goldColor} />
                            <RoyalRow label="Birth Place" value={formData.personal.placeOfBirth} color={goldColor} />
                            <RoyalRow label="Horoscope" value={`${formData.personal.rashi} | ${formData.personal.gotra}`} color={goldColor} />
                            <RoyalRow label="Religion/Caste" value={`${formData.personal.religion} - ${formData.personal.caste}`} color={goldColor} />
                            <RoyalRow label="Physical" value={`${formData.personal.height} | ${formData.personal.complexion}`} color={goldColor} />
                            <RoyalRow label="Education" value={formData.education.qualification} color={goldColor} />
                            <RoyalRow label="Occupation" value={formData.education.occupation} color={goldColor} />
                            <RoyalRow label="Income" value={formatCurrency(formData.education.annualIncome)} color={goldColor} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-black uppercase tracking-widest border-b pb-1" style={{ color: goldColor, borderColor: `${goldColor}44` }}>Family Context</h3>
                        <div className="space-y-2">
                            <RoyalRow label="Father" value={`${formData.family.fatherName} (${formData.family.fatherOccupation})`} color={goldColor} />
                            <RoyalRow label="Mother" value={`${formData.family.motherName} (${formData.family.motherOccupation})`} color={goldColor} />
                            <RoyalRow label="Siblings" value={formData.family.siblings} color={goldColor} />
                            <RoyalRow label="Mama Side" value={formData.family.mamaFamily} color={goldColor} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-black uppercase tracking-widest border-b pb-1" style={{ color: goldColor, borderColor: `${goldColor}44` }}>Contact Info</h3>
                        <div className="space-y-2">
                            <RoyalRow label="Mobile" value={formData.contact.primaryPhone} color={goldColor} />
                            <RoyalRow label="Email" value={formData.contact.email} color={goldColor} />
                            <RoyalRow label="Residence" value={formData.family.address} color={goldColor} />
                        </div>
                    </div>
                </div>

                <div className="col-span-4">
                    <div className="w-full aspect-[4/5] border-2 p-1.5 shadow-2xl bg-white/5" style={{ borderColor: goldColor }}>
                        {profilePic && <img src={profilePic} className="size-full object-cover" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoyalRow({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex items-baseline text-sm">
            <span className="w-36 shrink-0 opacity-60 font-bold uppercase text-[10px]" style={{ color }}>{label}</span>
            <span className="flex-1 font-black" style={{ color }}>{value || "---"}</span>
        </div>
    );
}

// TEMPLATE: CANVA PRO (SIDEBAR)
function TemplateCanvaPro({ themeColor, formData, profilePic, godLogo, formatCurrency }: { themeColor: string, formData: typeof INITIAL_DATA, profilePic: string | null, godLogo: string | null, formatCurrency: (v: string) => string }) {
    return (
        <div className="w-[210mm] min-h-[297mm] h-full flex bg-[#FDFBF7] relative text-left">
            <div className="w-[35%] h-full min-h-[297mm] flex flex-col text-white p-8 space-y-10" style={{ backgroundColor: themeColor }}>
                <div className="h-[140px]" />
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-widest border-b border-white/20 pb-2 flex items-center gap-2"><UserCircle className="size-4" /> Personal</h3>
                    <div className="space-y-4">
                        <SidebarItem label="Status" value={formData.personal.maritalStatus} />
                        <SidebarItem label="Religion/Caste" value={`${formData.personal.religion}/${formData.personal.caste}`} />
                        <SidebarItem label="Birth" value={`${formData.personal.dob} @ ${formData.personal.tob}`} />
                        <SidebarItem label="Place" value={formData.personal.placeOfBirth} />
                        <SidebarItem label="Height" value={formData.personal.height} />
                        <SidebarItem label="Gotra" value={formData.personal.gotra} />
                        <SidebarItem label="Rashi" value={formData.personal.rashi} />
                        <SidebarItem label="Blood" value={formData.personal.bloodGroup} />
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase tracking-widest border-b border-white/20 pb-2 flex items-center gap-2"><Phone className="size-4" /> Contact</h3>
                    <div className="space-y-4">
                        <SidebarItem label="Mobile" value={formData.contact.primaryPhone} />
                        <SidebarItem label="Email" value={formData.contact.email} />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-12 space-y-10">
                <header className="flex flex-col items-center mb-6 pl-12">
                     {godLogo && <img src={godLogo} className="h-14 w-auto mb-4" />}
                     <h1 className="text-5xl font-black tracking-tighter" style={{ color: themeColor }}>{formData.personal.fullName}</h1>
                </header>

                <div className="relative pl-10 space-y-10">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: themeColor, opacity: 0.1 }} />
                    
                    <div className="space-y-4">
                        <Badge className="bg-muted text-black border-none px-6 py-1 font-black text-sm uppercase" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>Career & Edu</Badge>
                        <div className="grid gap-3 pt-2">
                            <MainRow label="Qualification" value={formData.education.qualification} />
                            <MainRow label="Institution" value={formData.education.institution} />
                            <MainRow label="Occupation" value={formData.education.occupation} />
                            <MainRow label="Company" value={formData.education.company} />
                            <MainRow label="Income" value={formatCurrency(formData.education.annualIncome)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Badge className="bg-muted text-black border-none px-6 py-1 font-black text-sm uppercase" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>Family Info</Badge>
                        <div className="grid gap-3 pt-2">
                            <MainRow label="Father Name" value={formData.family.fatherName} />
                            <MainRow label="Father Occ." value={formData.family.fatherOccupation} />
                            <MainRow label="Mother Name" value={formData.family.motherName} />
                            <MainRow label="Mother Occ." value={formData.family.motherOccupation} />
                            <MainRow label="Siblings" value={formData.family.siblings} />
                            <MainRow label="Residence" value={formData.family.address} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Badge className="bg-muted text-black border-none px-6 py-1 font-black text-sm uppercase" style={{ backgroundColor: `${themeColor}22`, color: themeColor }}>Interests</Badge>
                        <div className="grid gap-3 pt-2">
                            <MainRow label="Hobbies" value={formData.personal.hobbies} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-14 left-[35%] -translate-x-1/2 z-50">
                 <div className="size-44 rounded-full border-[8px] border-[#FDFBF7] shadow-2xl overflow-hidden bg-white">
                    {profilePic && <img src={profilePic} className="size-full object-cover" />}
                 </div>
            </div>
        </div>
    );
}

function SidebarItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[7px] font-black uppercase opacity-40 tracking-wider">{label}</span>
            <span className="text-[10px] font-bold leading-tight">{value || "---"}</span>
        </div>
    );
}

function MainRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-baseline gap-4 text-sm font-medium">
            <span className="w-32 text-[10px] font-black uppercase opacity-40 shrink-0">{label}</span>
            <span className="flex-1 text-slate-800">{value || "---"}</span>
        </div>
    );
}
