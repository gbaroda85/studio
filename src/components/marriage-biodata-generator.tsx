
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
    Sparkles
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const THEME_COLORS = [
    { name: "Royal Maroon", value: "#800000" },
    { name: "Navy Blue", value: "#000080" },
    { name: "Deep Gold", value: "#B8860B" },
    { name: "Premium Teal", value: "#008080" },
    { name: "Charcoal", value: "#333333" },
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
                scale: 3, // High quality
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
    };

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start px-4">
            
            {/* LEFT: INPUT FORM */}
            <div className="lg:col-span-5 space-y-6 animate-in slide-in-from-left duration-500 h-full max-h-screen lg:overflow-y-auto pr-2 custom-scrollbar no-print">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
                    <CardHeader className="bg-primary/5 border-b p-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <Settings2 className="size-6 text-primary" /> STUDIO PANEL
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="font-black text-[10px] uppercase text-muted-foreground"><RefreshCcw className="size-3 mr-1" /> Reset</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-10">
                        
                        {/* Section: Photo */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <Camera className="size-3" /> Profile Picture
                            </Label>
                            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/30 rounded-3xl border-2 border-dashed">
                                <div className="size-24 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-xl shrink-0">
                                    {profilePic ? (
                                        <img src={profilePic} alt="prev" className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full flex items-center justify-center text-muted-foreground/30"><User className="size-10" /></div>
                                    )}
                                </div>
                                <div className="space-y-3 w-full">
                                    <p className="text-[10px] font-bold text-muted-foreground text-center sm:text-left leading-tight uppercase">High-res portrait recommended.</p>
                                    <Button size="sm" variant="outline" className="w-full h-10 rounded-xl font-black text-[10px] border-2 uppercase" onClick={() => fileInputRef.current?.click()}>
                                        <Plus className="size-3 mr-1.5" /> UPLOAD NEW PHOTO
                                    </Button>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Themes */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <Palette className="size-3" /> Visual Themes
                            </Label>
                            <div className="flex flex-wrap gap-3">
                                {THEME_COLORS.map(c => (
                                    <button 
                                        key={c.value} 
                                        onClick={() => setThemeColor(c.value)}
                                        className={cn(
                                            "h-10 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all",
                                            themeColor === c.value ? "border-primary ring-4 ring-primary/10 shadow-lg scale-105" : "border-white/10 hover:border-primary/40"
                                        )}
                                    >
                                        <div className="size-4 rounded-full shadow-inner" style={{ backgroundColor: c.value }} />
                                        <span className="text-[10px] font-black uppercase">{c.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Separator className="opacity-10" />

                        {/* Section: Personal Info */}
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center w-fit gap-2">
                                <User className="size-3" /> Personal Information
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-1 sm:col-span-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Full Name</Label>
                                    <Input value={formData.personal.fullName} onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)} className="h-12 rounded-xl font-bold border-2" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Date of Birth</Label>
                                    <Input value={formData.personal.dob} onChange={(e) => handleInputChange('personal', 'dob', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Time of Birth</Label>
                                    <Input value={formData.personal.tob} onChange={(e) => handleInputChange('personal', 'tob', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Place of Birth</Label>
                                    <Input value={formData.personal.placeOfBirth} onChange={(e) => handleInputChange('personal', 'placeOfBirth', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Height</Label>
                                    <Input value={formData.personal.height} onChange={(e) => handleInputChange('personal', 'height', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Career & Education */}
                        <div className="space-y-6 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center w-fit gap-2">
                                <Briefcase className="size-3" /> Education & Career
                            </Label>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Highest Qualification</Label>
                                    <Input value={formData.education.qualification} onChange={(e) => handleInputChange('education', 'qualification', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase opacity-50">Occupation</Label>
                                        <Input value={formData.education.occupation} onChange={(e) => handleInputChange('education', 'occupation', e.target.value)} className="h-11 rounded-xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase opacity-50">Annual Income</Label>
                                        <Input value={formData.education.annualIncome} onChange={(e) => handleInputChange('education', 'annualIncome', e.target.value)} className="h-11 rounded-xl font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Family */}
                        <div className="space-y-6 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center w-fit gap-2">
                                <Home className="size-3" /> Family Background
                            </Label>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase opacity-50">Father's Name</Label>
                                        <Input value={formData.family.fatherName} onChange={(e) => handleInputChange('family', 'fatherName', e.target.value)} className="h-11 rounded-xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase opacity-50">Father's Occupation</Label>
                                        <Input value={formData.family.fatherOccupation} onChange={(e) => handleInputChange('family', 'fatherOccupation', e.target.value)} className="h-11 rounded-xl font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Mama's Family / Background</Label>
                                    <Input value={formData.family.mamaFamily} onChange={(e) => handleInputChange('family', 'mamaFamily', e.target.value)} className="h-11 rounded-xl font-bold" placeholder="e.g. Sethi family from Mumbai" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Residential Address</Label>
                                    <Textarea value={formData.family.address} onChange={(e) => handleInputChange('family', 'address', e.target.value)} className="rounded-xl font-medium text-sm min-h-[80px]" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Astrology */}
                        <div className="space-y-6 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 flex items-center w-fit gap-2">
                                <Star className="size-3" /> Astrological Info
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-black uppercase opacity-50">Rashi</Label>
                                    <Input value={formData.astrological.rashi} onChange={(e) => handleInputChange('astrological', 'rashi', e.target.value)} className="h-10 rounded-lg font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-black uppercase opacity-50">Nakshatra</Label>
                                    <Input value={formData.astrological.nakshatra} onChange={(e) => handleInputChange('astrological', 'nakshatra', e.target.value)} className="h-10 rounded-lg font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[8px] font-black uppercase opacity-50">Gotra</Label>
                                    <Input value={formData.astrological.gotra} onChange={(e) => handleInputChange('astrological', 'gotra', e.target.value)} className="h-10 rounded-lg font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact */}
                        <div className="space-y-6 pt-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center w-fit gap-2">
                                <Phone className="size-3" /> Contact Details
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Mobile Number</Label>
                                    <Input value={formData.contact.primaryPhone} onChange={(e) => handleInputChange('contact', 'primaryPhone', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-black uppercase opacity-50">Email Address</Label>
                                    <Input value={formData.contact.email} onChange={(e) => handleInputChange('contact', 'email', e.target.value)} className="h-11 rounded-xl font-bold" />
                                </div>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/10 p-6 md:p-8 border-t">
                         <Button onClick={exportToPdf} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 group">
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
                        className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden"
                        style={{ 
                            width: '210mm', 
                            minHeight: '297mm', 
                            padding: '15mm',
                            color: '#333'
                        }}
                    >
                        {/* THEME ELEMENTS */}
                        <div className="absolute inset-0 border-[15px] border-double opacity-10 pointer-events-none" style={{ borderColor: themeColor }} />
                        <div className="absolute top-0 left-0 w-full h-2 pointer-events-none" style={{ backgroundColor: themeColor }} />
                        
                        {/* HEADER */}
                        <div className="flex flex-col items-center mb-10 space-y-4">
                            <div className="flex items-center justify-center gap-4 text-center">
                                <div className="h-px w-20 bg-muted-foreground/30" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">OM GANESHAY NAMAHA</span>
                                <div className="h-px w-20 bg-muted-foreground/30" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black font-headline text-center uppercase tracking-widest pt-4" style={{ color: themeColor }}>
                                Bio Data
                            </h2>
                            <div className="w-48 h-1 mx-auto rounded-full" style={{ backgroundColor: themeColor, opacity: 0.2 }} />
                        </div>

                        <div className="grid grid-cols-12 gap-10">
                            
                            {/* CONTENT AREA */}
                            <div className="col-span-8 space-y-10">
                                
                                {/* 1. PERSONAL */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-black border-b-2 pb-1 inline-block uppercase tracking-widest" style={{ color: themeColor, borderColor: themeColor }}>
                                        Personal Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-y-3">
                                        <DataRow label="Full Name" value={formData.personal.fullName} />
                                        <DataRow label="Date of Birth" value={formData.personal.dob} />
                                        <DataRow label="Time of Birth" value={formData.personal.tob} />
                                        <DataRow label="Place of Birth" value={formData.personal.placeOfBirth} />
                                        <DataRow label="Height" value={formData.personal.height} />
                                        <DataRow label="Complexion" value={formData.personal.complexion} />
                                        <DataRow label="Blood Group" value={formData.personal.bloodGroup} />
                                    </div>
                                </section>

                                {/* 2. EDUCATION & CAREER */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-black border-b-2 pb-1 inline-block uppercase tracking-widest" style={{ color: themeColor, borderColor: themeColor }}>
                                        Career & Education
                                    </h3>
                                    <div className="grid grid-cols-1 gap-y-3">
                                        <DataRow label="Education" value={formData.education.qualification} />
                                        <DataRow label="Institution" value={formData.education.institution} />
                                        <DataRow label="Occupation" value={formData.education.occupation} />
                                        <DataRow label="Annual Income" value={formData.education.annualIncome} />
                                    </div>
                                </section>

                                {/* 3. FAMILY */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-black border-b-2 pb-1 inline-block uppercase tracking-widest" style={{ color: themeColor, borderColor: themeColor }}>
                                        Family Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-y-3">
                                        <DataRow label="Father Name" value={formData.family.fatherName} />
                                        <DataRow label="Father Occ." value={formData.family.fatherOccupation} />
                                        <DataRow label="Mother Name" value={formData.family.motherName} />
                                        <DataRow label="Mother Occ." value={formData.family.motherOccupation} />
                                        <DataRow label="Siblings" value={formData.family.siblings} />
                                        <DataRow label="Mama's Family" value={formData.family.mamaFamily} />
                                        <div className="flex items-start gap-4 text-sm leading-relaxed">
                                            <span className="w-32 font-black text-muted-foreground/60 shrink-0 uppercase text-[10px]">Address</span>
                                            <span className="font-bold">{formData.family.address}</span>
                                        </div>
                                    </div>
                                </section>

                                {/* 4. HOROSCOPE */}
                                <section className="space-y-4">
                                    <h3 className="text-lg font-black border-b-2 pb-1 inline-block uppercase tracking-widest" style={{ color: themeColor, borderColor: themeColor }}>
                                        Astrological Info
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                                        <DataRow label="Rashi" value={formData.astrological.rashi} />
                                        <DataRow label="Gotra" value={formData.astrological.gotra} />
                                        <DataRow label="Nakshatra" value={formData.astrological.nakshatra} />
                                        <DataRow label="Gan" value={formData.astrological.gan} />
                                        <DataRow label="Manglik" value={formData.astrological.manglik} />
                                    </div>
                                </section>

                                {/* 5. CONTACT */}
                                <section className="bg-muted/30 p-6 rounded-3xl space-y-4">
                                    <h3 className="text-lg font-black uppercase tracking-widest" style={{ color: themeColor }}>
                                        Contact Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-y-2">
                                        <div className="flex items-center gap-3">
                                            <Phone className="size-4 opacity-40" />
                                            <span className="font-black text-sm">{formData.contact.primaryPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText className="size-4 opacity-40" />
                                            <span className="font-black text-sm">{formData.contact.email}</span>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* RIGHT SIDEBAR OF A4: PHOTO & ICONOGRAPHY */}
                            <div className="col-span-4 space-y-12">
                                {/* Photo Container */}
                                <div className="space-y-3">
                                     <div 
                                        className="w-full aspect-[4/5] bg-white p-2 shadow-2xl border-[1px] border-slate-200 flex items-center justify-center overflow-hidden"
                                        style={{ transform: 'rotate(2deg)' }}
                                    >
                                        {profilePic ? (
                                            <img src={profilePic} alt="profile" className="size-full object-cover" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center bg-slate-50 text-slate-300">
                                                <User className="size-20" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-center text-muted-foreground uppercase tracking-widest opacity-50">LATEST PHOTOGRAPH</p>
                                </div>

                                <div className="space-y-10 pt-10 text-center opacity-10 flex flex-col items-center">
                                     <Heart className="size-20" style={{ fill: themeColor }} />
                                     <Sparkles className="size-16" style={{ color: themeColor }} />
                                     <MapPin className="size-20" style={{ color: themeColor }} />
                                </div>
                            </div>

                        </div>
                        
                        {/* FOOTER */}
                        <div className="absolute bottom-10 left-0 w-full px-12">
                             <div className="h-px w-full bg-slate-200 mb-4" />
                             <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-[0.4em]">GR7 SMART GENERATOR • PREMIUM IDENTITY STUDIO</p>
                        </div>
                    </div>
                </div>

                {/* ZOOM INFO */}
                <div className="no-print mt-6 flex items-center gap-4 text-muted-foreground/60 text-[10px] font-black uppercase">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-1.5"><Zap className="size-3 text-yellow-500" /> 100% PRIVATE</div>
                    <div className="flex items-center gap-1.5"><Heart className="size-3 text-rose-500 fill-rose-500" /> MADE WITH LOVE</div>
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

function DataRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 text-sm">
            <span className="w-32 font-black text-muted-foreground/60 shrink-0 uppercase text-[10px] tracking-tight">{label}</span>
            <span className="font-bold border-b border-dotted flex-1 pb-1">{value || "---"}</span>
        </div>
    );
}
