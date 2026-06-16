"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
    Download, 
    RefreshCcw, 
    Eye, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Settings2,
    Building2,
    Banknote,
    Plus,
    Trash2,
    Loader2,
    Printer,
    ImageIcon,
    UploadCloud,
    X,
    Eraser,
    Landmark,
    Calendar,
    Globe,
    Users2,
    Save,
    UserPlus,
    Database,
    Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import { PDFDocument, PDFName, rgb } from 'pdf-lib';
import confetti from 'canvas-confetti';

// --- TYPES ---

interface DynamicItem {
    id: string;
    label: string;
    type: 'fixed' | 'percentage';
    value: number | string; 
}

interface SalaryData {
    company: {
        name: string;
        address: string;
        logo: string | null;
    };
    employee: {
        name: string;
        empId: string;
        designation: string;
        department: string;
        doj: string;
        pan: string;
        uanNo: string;
        bankName: string;
        bankAccount: string;
        ifsc: string;
    };
    payPeriod: {
        month: string;
        year: string;
    };
    calc: {
        basicRate: number | string;
        presentDays: number | string;
        totalDays: number | string;
        overtimeHours: number | string;
        overtimeRate: number | string;
    };
    allowances: DynamicItem[];
    deductions: DynamicItem[];
}

const INITIAL_DATA: SalaryData = {
    company: {
        name: "GR7 TECH SOLUTIONS PVT LTD",
        address: "7th Floor, Innovation Tower, Cyber City, Bangalore - 560102",
        logo: null
    },
    employee: {
        name: "RAHUL KUMAR",
        empId: "GR7-1024",
        designation: "SOFTWARE ENGINEER",
        department: "DEVELOPMENT",
        doj: "15-JAN-2022",
        pan: "ABCDE1234F",
        uanNo: "101234567890",
        bankName: "HDFC BANK",
        bankAccount: "501004123XXXXX",
        ifsc: "HDFC0000123"
    },
    payPeriod: {
        month: "AUGUST",
        year: "2024"
    },
    calc: {
        basicRate: 1500,
        presentDays: 22,
        totalDays: 31,
        overtimeHours: 5,
        overtimeRate: 200
    },
    allowances: [
        { id: 'allow-1', label: 'House Rent', type: 'percentage', value: 16 },
        { id: 'allow-2', label: 'Washing Al', type: 'percentage', value: 3 }
    ],
    deductions: [
        { id: 'deduct-1', label: 'Provident Fund', type: 'percentage', value: 12 },
        { id: 'deduct-2', label: 'Professional Tax', type: 'fixed', value: 200 }
    ]
};

const StarIcons = () => (
    <>
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`star-${i}`}>
                <svg viewBox="0 0 784.11 815.53" className="fill-white">
                    <path d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.33 371.12,197.68 392.05,407.75 20.93,-210.06 184.09,-378.41 392.06,-407.75 -207.97,-29.33 -371.13,-197.68 -392.06,-407.78z" />
                </svg>
            </div>
        ))}
    </>
);

export default function SalarySlipGenerator() {
    const { toast } = useToast();
    const [data, setData] = useState<SalaryData>(INITIAL_DATA);
    const [savedProfiles, setSavedProfiles] = useState<SalaryData[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    
    const exportRef = useRef<HTMLDivElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // --- HYDRATION & PERSISTENCE ---
    useEffect(() => {
        const savedForm = localStorage.getItem('gr7_salary_slip_v6_persisted');
        if (savedForm) {
            try { setData(JSON.parse(savedForm)); } catch (e) { console.error(e); }
        }
        
        const savedDB = localStorage.getItem('gr7_employee_database');
        if (savedDB) {
            try { setSavedProfiles(JSON.parse(savedDB)); } catch (e) { console.error(e); }
        }
        
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            const timer = setTimeout(() => {
                localStorage.setItem('gr7_salary_slip_v6_persisted', JSON.stringify(data));
                localStorage.setItem('gr7_employee_database', JSON.stringify(savedProfiles));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [data, savedProfiles, isHydrated]);

    // --- PROFILE MANAGEMENT ---
    const saveCurrentProfile = () => {
        if (!data.employee.name) {
            toast({ variant: 'destructive', title: "Missing Name", description: "Enter employee name to save profile." });
            return;
        }

        const currentId = data.employee.empId;
        const currentName = data.employee.name;
        const profileToSave = JSON.parse(JSON.stringify(data));

        const existsIndex = savedProfiles.findIndex(p => p.employee.empId === currentId && p.employee.name === currentName);
        
        if (existsIndex >= 0) {
            setSavedProfiles(prev => {
                const updated = [...prev];
                updated[existsIndex] = profileToSave;
                return updated;
            });
            // FIXED: Move toast to a safe execution context to prevent React state update loop errors
            setTimeout(() => {
                toast({ title: "Profile Updated", description: `Data for ${currentName} saved successfully.` });
            }, 10);
        } else {
            setSavedProfiles(prev => [...prev, profileToSave]);
            setTimeout(() => {
                toast({ title: "New Profile Created", description: `Added ${currentName} to employee database.` });
            }, 10);
        }
        
        confetti({ particleCount: 50, spread: 30, origin: { y: 0.8 }, colors: ['#0d5a71', '#ffffff'] });
    };

    const loadProfile = (id: string) => {
        const profile = savedProfiles.find(p => p.employee.empId === id);
        if (profile) {
            setData(JSON.parse(JSON.stringify(profile)));
            setTimeout(() => {
                toast({ title: "Profile Loaded", description: `Switched to ${profile.employee.name}'s data.` });
            }, 10);
        }
    };

    const deleteProfile = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSavedProfiles(prev => prev.filter(p => p.employee.empId !== id));
        setTimeout(() => {
            toast({ title: "Profile Removed" });
        }, 10);
    };

    // --- CALCULATIONS ---
    const results = useMemo(() => {
        const basicRate = parseFloat(String(data.calc.basicRate)) || 0;
        const presentDays = parseFloat(String(data.calc.presentDays)) || 0;
        const otHours = parseFloat(String(data.calc.overtimeHours)) || 0;
        const otRate = parseFloat(String(data.calc.overtimeRate)) || 0;

        const basicAmt = basicRate * presentDays;
        const otAmt = otHours * otRate;

        const allowanceItems = data.allowances.map(a => {
            const val = parseFloat(String(a.value)) || 0;
            return { label: a.label, amount: a.type === 'fixed' ? val : (val / 100) * basicAmt };
        });

        const deductionItems = data.deductions.map(d => {
            const val = parseFloat(String(d.value)) || 0;
            return { label: d.label, amount: d.type === 'fixed' ? val : (val / 100) * basicAmt };
        });

        const totalEarnings = basicAmt + otAmt + allowanceItems.reduce((acc, curr) => acc + curr.amount, 0);
        const totalDeductions = deductionItems.reduce((acc, curr) => acc + curr.amount, 0);
        
        return { 
            basicAmt, 
            otAmt, 
            allowanceItems, 
            deductionItems, 
            totalEarnings, 
            totalDeductions, 
            netSalary: totalEarnings - totalDeductions 
        };
    }, [data.calc, data.allowances, data.deductions]);

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setData(prev => ({ ...prev, company: { ...prev.company, logo: ev.target?.result as string } }));
            reader.readAsDataURL(file);
        }
    };

    const updateNested = (section: keyof SalaryData, field: string, value: any) => {
        setData(prev => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } } as any));
    };

    const handleAddDynamic = (section: 'allowances' | 'deductions') => {
        const newItem: DynamicItem = { 
            id: Math.random().toString(36).substr(2, 9), 
            label: section === 'allowances' ? "Allowance" : "Deduction", 
            type: 'fixed', 
            value: "" 
        };
        setData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    };

    const removeDynamic = (section: 'allowances' | 'deductions', id: string) => 
        setData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
    
    const updateDynamic = (section: 'allowances' | 'deductions', id: string, field: keyof DynamicItem, value: any) => {
        setData(prev => ({ ...prev, [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item) }));
    };

    const handleClearAll = () => {
        setData({
            company: { ...data.company },
            employee: { name: "", empId: "", designation: "", department: "", doj: "", pan: "", uanNo: "", bankName: "", bankAccount: "", ifsc: "" },
            payPeriod: { month: "", year: "" },
            calc: { basicRate: "", presentDays: "", totalDays: "", overtimeHours: "", overtimeRate: "" },
            allowances: [],
            deductions: []
        });
        setTimeout(() => {
            toast({ title: "Form Cleared" });
        }, 10);
    };

    const handleExport = async (type: 'pdf' | 'image' = 'pdf') => {
        if (!exportRef.current) return;
        setIsExporting(true);
        
        try {
            await document.fonts.ready;
            const canvas = await html2canvas(exportRef.current, {
                scale: 3, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('[data-export-container]');
                    if (el) {
                        (el as HTMLElement).style.transform = 'none';
                        const all = el.getElementsByTagName('*');
                        for (let i = 0; i < all.length; i++) {
                            const node = all[i] as HTMLElement;
                            node.style.letterSpacing = 'normal';
                            node.style.wordSpacing = 'normal';
                            node.style.fontVariantLigatures = 'none';
                        }
                    }
                }
            });

            const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

            if (type === 'pdf') {
                const pdfDoc = await PDFDocument.create();
                const pdfWidth = 595.28;
                const pdfHeight = 841.89;
                const page = pdfDoc.addPage([pdfWidth, pdfHeight]);

                const imgBuffer = await fetch(dataUrl).then(res => res.arrayBuffer());
                const embeddedImage = await pdfDoc.embedJpg(imgBuffer);

                page.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width: pdfWidth,
                    height: pdfHeight
                });

                const catalog = pdfDoc.catalog;
                catalog.set(PDFName.of('ViewerPreferences'), pdfDoc.context.obj({
                    FitWindow: true,
                    CenterWindow: true,
                    DisplayDocTitle: true
                }));
                
                const dest = pdfDoc.context.obj([page.ref, PDFName.of('Fit')]);
                catalog.set(PDFName.of('OpenAction'), dest);

                const pdfBytes = await pdfDoc.save();
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `Salary_Slip_${data.employee.name || 'Doc'}.pdf`;
                link.click();
            } else {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `Salary_Slip_${data.employee.name || 'Doc'}.jpg`;
                link.click();
            }
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Export Successful!" });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsExporting(false);
        }
    };

    if (!isHydrated) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin size-10 text-primary opacity-20" /></div>;

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-4 pb-32 overflow-x-hidden text-left">
            
            {/* HIDDEN EXPORT CANVAS */}
            <div className="fixed top-0 -left-[5000px] z-[-1] pointer-events-none">
                <div ref={exportRef} data-export-container style={{ width: '794px', height: '1123px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                    <PayslipTemplate data={data} results={results} formatCurrency={formatCurrency} isExport />
                </div>
            </div>

            {/* SIDEBAR EDITOR */}
            <div className="lg:col-span-5 space-y-6 no-print max-h-[90vh] overflow-y-auto custom-scrollbar pr-2 text-left">
                
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10 transition-all hover:border-primary/30">
                    <CardHeader className="bg-primary/5 border-b p-6 md:p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Banknote className="size-7" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-black uppercase leading-none">Studio Panel</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase opacity-50 tracking-widest mt-1">Payroll Management</CardDescription>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleClearAll} 
                                className="h-8 text-[9px] font-black uppercase text-rose-500 border-rose-200 hover:bg-rose-500 hover:text-white dark:border-rose-900/30 dark:hover:bg-rose-500/20 transition-all duration-300"
                            >
                                <Eraser className="size-3 mr-1" /> Clear All
                            </Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 md:p-8 space-y-8">
                        
                        {/* EMPLOYEE DATABASE DROPDOWN */}
                        <div className="space-y-4 bg-muted/30 p-5 rounded-[2rem] border-2 border-dashed border-foreground/10 animate-in slide-in-from-top-4">
                            <div className="flex items-center justify-between px-1">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                    <Database className="size-3.5" /> Employee Profiles
                                </Label>
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">{savedProfiles.length} SAVED</Badge>
                            </div>
                            
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Select onValueChange={loadProfile}>
                                        <SelectTrigger className="h-12 border-2 font-bold rounded-xl bg-background shadow-sm hover:border-primary/50 transition-all">
                                            <div className="flex items-center gap-2">
                                                <Users2 className="size-4 text-muted-foreground" />
                                                <SelectValue placeholder="Quick Load Employee..." />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-2 shadow-2xl z-[200]">
                                            {savedProfiles.length === 0 ? (
                                                <div className="p-6 text-center">
                                                    <Search className="size-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-[10px] font-black uppercase opacity-40">Database Empty</p>
                                                </div>
                                            ) : (
                                                savedProfiles.map(p => (
                                                    <SelectItem key={p.employee.empId} value={p.employee.empId} className="font-bold py-4">
                                                        <div className="flex items-center justify-between w-full min-w-[250px]">
                                                            <div className="flex flex-col text-left">
                                                                <span className="uppercase text-xs font-black text-foreground">{p.employee.name}</span>
                                                                <span className="text-[8px] opacity-40 uppercase font-bold">{p.employee.empId} • {p.employee.designation}</span>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => deleteProfile(e, p.employee.empId)} 
                                                                className="ml-6 p-2 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button 
                                    onClick={saveCurrentProfile} 
                                    className="h-12 px-6 bg-primary text-white font-black rounded-xl shadow-lg border-none hover:scale-105 active:scale-95 transition-all"
                                    title="Save current details to database"
                                >
                                    <Save className="size-5 mr-2" /> SAVE
                                </Button>
                            </div>
                        </div>

                        {/* ATTENDANCE ENGINE */}
                        <div className="space-y-6 bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-inner">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Attendance Engine</Badge>
                                <Zap className="size-4 text-primary animate-pulse" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-primary">Daily Rate</Label><Input type="number" value={data.calc.basicRate} onChange={(e) => updateNested('calc', 'basicRate', e.target.value)} className="h-12 rounded-xl font-black border-2 border-primary/20 text-lg shadow-sm" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase text-primary">Days Present</Label><Input type="number" value={data.calc.presentDays} onChange={(e) => updateNested('calc', 'presentDays', e.target.value)} className="h-12 rounded-xl font-black border-2 border-primary/40 text-2xl text-center bg-white dark:bg-slate-900" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Month Total Days</Label><Input type="number" value={data.calc.totalDays} onChange={(e) => updateNested('calc', 'totalDays', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Overtime Hours</Label><Input type="number" value={data.calc.overtimeHours} onChange={(e) => updateNested('calc', 'overtimeHours', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5 col-span-2"><Label className="text-[9px] font-black uppercase opacity-60">Overtime Rate (per hour)</Label><Input type="number" value={data.calc.overtimeRate} onChange={(e) => updateNested('calc', 'overtimeRate', e.target.value)} className="h-10 rounded-xl font-bold border-2 bg-muted/10" /></div>
                            </div>
                        </div>

                        <div className="space-y-10 pt-4">
                            <div className="space-y-6">
                                <Badge className="bg-muted text-muted-foreground font-black text-[9px] px-3 py-1 uppercase tracking-widest">Business Branding</Badge>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Company Name</Label><Input value={data.company.name} onChange={(e) => updateNested('company', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Address</Label><Textarea value={data.company.address} onChange={(e) => updateNested('company', 'address', e.target.value)} className="rounded-xl border-2 font-medium" /></div>
                                    <Button variant="outline" size="sm" className="w-full h-10 rounded-xl border-2 border-dashed font-black text-[10px] uppercase" onClick={() => logoInputRef.current?.click()}><UploadCloud className="size-4 mr-2" /> {data.company.logo ? "CHANGE LOGO" : "UPLOAD LOGO"}</Button>
                                    <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-dashed">
                                <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Employee Profile</Badge>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={data.employee.name} onChange={(e) => updateNested('employee', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Designation</Label><Input value={data.employee.designation} onChange={(e) => updateNested('employee', 'designation', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Department</Label><Input value={data.employee.department} onChange={(e) => updateNested('employee', 'department', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Employee ID</Label><Input value={data.employee.empId} onChange={(e) => updateNested('employee', 'empId', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Date of Joining</Label><Input value={data.employee.doj} onChange={(e) => updateNested('employee', 'doj', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">UAN Number</Label><Input value={data.employee.uanNo} onChange={(e) => updateNested('employee', 'uanNo', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">PAN Card No.</Label><Input value={data.employee.pan} onChange={(e) => updateNested('employee', 'pan', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="col-span-2 pt-2"><Separator className="opacity-10"/></div>
                                    <div className="col-span-2 space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Bank Name</Label><Input value={data.employee.bankName} onChange={(e) => updateNested('employee', 'bankName', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Account No.</Label><Input value={data.employee.bankAccount} onChange={(e) => updateNested('employee', 'bankAccount', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">IFSC Code</Label><Input value={data.employee.ifsc} onChange={(e) => updateNested('employee', 'ifsc', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-dashed">
                                <Badge className="bg-indigo-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Pay Period</Badge>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Month</Label><Input value={data.payPeriod.month} onChange={(e) => updateNested('payPeriod', 'month', e.target.value)} className="h-10 rounded-xl font-bold border-2" placeholder="e.g. AUGUST" /></div>
                                    <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Year</Label><Input value={data.payPeriod.year} onChange={(e) => updateNested('payPeriod', 'year', e.target.value)} className="h-10 rounded-xl font-bold border-2" placeholder="e.g. 2024" /></div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-dashed">
                                <div className="flex justify-between items-center">
                                    <Badge className="bg-emerald-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Allowances (Earnings)</Badge>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleAddDynamic('allowances')} 
                                        className="h-7 text-[8px] font-black uppercase text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white dark:border-emerald-900/30 dark:hover:bg-emerald-600/20 transition-all duration-300"
                                    >
                                        <Plus className="size-3 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {data.allowances.map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/20 shadow-sm animate-in slide-in-from-left-2">
                                            <Input value={item.label} onChange={(e) => updateDynamic('allowances', item.id, 'label', e.target.value)} className="flex-1 h-8 text-[11px] font-black uppercase border-none bg-transparent" />
                                            <Input type="number" value={item.value} onChange={(e) => updateDynamic('allowances', item.id, 'value', e.target.value)} className="w-24 h-8 text-center font-black text-[11px] rounded-lg border-emerald-200" />
                                            <button onClick={() => updateDynamic('allowances', item.id, 'type', item.type === 'fixed' ? 'percentage' : 'fixed')} className="text-[8px] font-black w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 uppercase">{item.type === 'fixed' ? 'FIX' : '%'}</button>
                                            <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => removeDynamic('allowances', item.id)}><Trash2 className="size-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-dashed">
                                <div className="flex justify-between items-center">
                                    <Badge className="bg-rose-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Deductions</Badge>
                                    <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleAddDynamic('deductions')} 
                                        className="h-7 text-[8px] font-black uppercase text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white dark:border-rose-900/30 dark:hover:bg-rose-600/20 transition-all duration-300"
                                    >
                                        <Plus className="size-3 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {data.deductions.map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 p-3 bg-rose-500/5 rounded-xl border-2 border-rose-100 dark:border-rose-900/20 shadow-sm animate-in slide-in-from-right-2">
                                            <Input value={item.label} onChange={(e) => updateDynamic('deductions', item.id, 'label', e.target.value)} className="flex-1 h-8 text-[11px] font-black uppercase border-none bg-transparent" />
                                            <Input type="number" value={item.value} onChange={(e) => updateDynamic('deductions', item.id, 'value', e.target.value)} className="w-24 h-8 text-center font-black text-[11px] rounded-lg border-rose-200" />
                                            <button onClick={() => updateDynamic('deductions', item.id, 'type', item.type === 'fixed' ? 'percentage' : 'fixed')} className="text-[8px] font-black w-8 h-8 rounded-lg bg-rose-100 text-rose-700 uppercase">{item.type === 'fixed' ? 'FIX' : '%'}</button>
                                            <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => removeDynamic('deductions', item.id)}><Trash2 className="size-3.5" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                        <Button onClick={() => handleExport('pdf')} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl rounded-[1.5rem] group border-4 border-primary">
                            {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Printer className="mr-3 size-8 group-hover:scale-110 transition-transform" />}
                            EXPORT PAYSLIP PDF
                        </Button>
                        <Button onClick={() => handleExport('image')} disabled={isExporting} variant="outline" className="w-full h-12 text-xs font-black rounded-xl border-2 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                            <ImageIcon className="mr-2 size-4" /> SAVE AS IMAGE (JPG)
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* LIVE PREVIEW A4 */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
                <div className="w-full flex items-center justify-between mb-4 px-4 no-print">
                    <div className="flex items-center gap-2"><Eye className="size-4 text-primary" /><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Live View</span></div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse uppercase">A4 LAYOUT</Badge>
                </div>
                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/5 overflow-visible min-h-[1000px]">
                    <div className="relative transform-gpu scale-[0.45] sm:scale-[0.7] lg:scale-[0.85] xl:scale-100 origin-top h-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
                         <PayslipTemplate data={data} results={results} formatCurrency={formatCurrency} />
                    </div>
                </div>
                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest no-print">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> WYSIWYG ENGINE</div>
                </div>
            </div>
        </div>
    );
}

// --- PIXEL PERFECT TEMPLATE ---

function PayslipTemplate({ data, results, formatCurrency, isExport }: { data: SalaryData, results: any, formatCurrency: (v: number) => string, isExport?: boolean }) {
    return (
        <div 
            className={cn("bg-white flex flex-col text-slate-900", !isExport && "shadow-none border-0")}
            style={{ 
                width: '794px', height: '1123px', padding: '40px 40px 80px 40px',
                fontFamily: 'Arial, sans-serif', position: 'relative', boxSizing: 'border-box',
                letterSpacing: 'normal', overflow: 'hidden'
            }}
        >
            <header className="flex justify-between items-center mb-3 pb-3 border-b-4 border-slate-900 w-full">
                <div className="space-y-1 max-w-[70%] text-left">
                    <h1 className="text-3xl font-black uppercase leading-tight">{data.company.name || "COMPANY NAME"}</h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mt-1">{data.company.address}</p>
                </div>
                {data.company.logo ? <img src={data.company.logo} className="h-14 w-auto object-contain" /> : <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center border-2"><Building2 className="size-8 text-slate-300" /></div>}
            </header>

            <div className="text-center mb-3">
                <div className="flex justify-center">
                    <h2 className="text-xl font-black uppercase tracking-widest border-y-2 border-slate-900 px-12 h-10 flex items-center justify-center">Pay Slip</h2>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">MONTHLY STATEMENT OF EARNINGS & DEDUCTIONS</p>
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 gap-x-10 mb-3 bg-slate-50 p-5 rounded-[1.5rem] border border-slate-200 text-left overflow-visible">
                <Row label="Employee Name" value={data.employee.name} />
                <Row label="Employee ID" value={data.employee.empId} />
                <Row label="Designation" value={data.employee.designation} />
                <Row label="Department" value={data.employee.department} />
                <Row label="Date of Joining" value={data.employee.doj} />
                <Row label="PAN Card No." value={data.employee.pan} />
                <Row label="UAN Number" value={data.employee.uanNo} />
                <Row label="Bank Name" value={data.employee.bankName} />
                <Row label="Bank Account" value={data.employee.bankAccount} />
                <Row label="IFSC Code" value={data.employee.ifsc} />
                <Row label="Total Days" value={String(data.calc.totalDays)} />
                <Row label="Present Days" value={String(data.calc.presentDays)} />
                <Row label="Pay Period" value={`${data.payPeriod.month} ${data.payPeriod.year}`} />
            </div>

            <div className="grid grid-cols-2 border-2 border-slate-900 min-h-[250px] overflow-visible">
                <div className="border-r-2 border-slate-900 text-left flex flex-col">
                    <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-black uppercase tracking-widest">Earnings (In INR)</div>
                    <div className="p-4 space-y-1 flex-1">
                        <TableItem label="Basic Amount" value={results.basicAmt} />
                        {results.otAmt > 0 && <TableItem label={`Overtime (${data.calc.overtimeHours} Hrs)`} value={results.otAmt} />}
                        {results.allowanceItems.map((a: any, i: number) => <TableItem key={i} label={a.label} value={a.amount} />)}
                    </div>
                </div>
                <div className="text-left flex flex-col">
                    <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-black uppercase tracking-widest">Deductions (In INR)</div>
                    <div className="p-4 space-y-1 flex-1">
                        {results.deductionItems.map((d: any, i: number) => <TableItem key={i} label={d.label} value={d.amount} isDeduction />)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 border-x-2 border-b-2 border-slate-900 text-left overflow-visible">
                <div className="p-4 flex justify-between items-center border-r-2 border-slate-900 bg-slate-50/30">
                    <span className="text-[10px] font-black uppercase">Gross Earnings</span>
                    <span className="text-sm font-black">{formatCurrency(results.totalEarnings)}</span>
                </div>
                <div className="p-4 flex justify-between items-center bg-rose-50/50">
                    <span className="text-[10px] font-black uppercase">Total Deductions</span>
                    <span className="text-sm font-black text-rose-600">{formatCurrency(results.totalDeductions)}</span>
                </div>
            </div>

            <div className="mt-5 p-6 bg-slate-900 text-white rounded-[2rem] flex justify-between items-center shadow-xl text-left border-4 border-slate-800 overflow-visible">
                <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Net Monthly Take-home</p>
                    <h3 className="text-4xl font-black tracking-normal">{formatCurrency(results.netSalary)}</h3>
                </div>
                <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10"><Sparkles className="size-4 text-primary" /><span className="text-[10px] font-black uppercase tracking-widest">VERIFIED RENDER</span></div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-10 items-end pb-8 overflow-visible">
                <div className="p-6 border-l-8 border-primary bg-slate-50 rounded-r-[1.5rem] text-left">
                    <p className="text-[10px] font-black uppercase text-primary mb-2 tracking-widest">Digital Notice</p>
                    <p className="text-[10px] font-medium leading-relaxed italic text-slate-500">"This is a system-generated salary statement. It is digitally verified and does not require a physical seal."</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-56 h-14 border-b-2 border-slate-200 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Personnel</p>
                </div>
            </div>

            <footer className="mt-auto pt-6 text-center border-t border-slate-100 shrink-0">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">GENERATE SECURE PAYROLL AT WWW.GR7IMAGEPDF.COM</p>
            </footer>
        </div>
    );
}

function Row({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-baseline gap-4 min-h-5 w-full overflow-visible">
            <span className="w-32 font-black text-slate-400 shrink-0 uppercase text-[9px]">{label}</span>
            <span className="font-bold border-b border-dotted border-slate-200 flex-1 pb-0.5 text-slate-800 text-xs whitespace-normal">{value || "---"}</span>
        </div>
    );
}

function TableItem({ label, value, isDeduction }: { label: string, value: number, isDeduction?: boolean }) {
    return (
        <div className="flex justify-between items-center min-h-5 w-full overflow-visible">
            <span className="font-bold text-slate-600 uppercase text-[10px] pr-4 whitespace-normal">{label}</span>
            <span className={cn("font-black shrink-0 text-xs", isDeduction ? "text-rose-600" : "text-slate-900")}>{isDeduction && value > 0 ? '-' : ''}{Math.round(value).toLocaleString()}</span>
        </div>
    );
}
