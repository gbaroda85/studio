
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
    ListFilter
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
import jsPDF from 'jspdf';
import { PDFDocument, PDFName } from 'pdf-lib';
import confetti from 'canvas-confetti';

// --- TYPES ---

interface DynamicItem {
    id: string;
    label: string;
    type: 'fixed' | 'percentage';
    value: number;
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
        basicRate: number;
        presentDays: number;
        totalDays: number;
        overtimeHours: number;
        overtimeRate: number;
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
        { id: 'deduct-1', label: 'Provident', type: 'percentage', value: 12 },
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
    const [isExporting, setIsExporting] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    
    const exportRef = useRef<HTMLDivElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('gr7_salary_slip_data_v2_persisted');
        if (saved) {
            try { setData(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('gr7_salary_slip_data_v2_persisted', JSON.stringify(data));
        }
    }, [data, isHydrated]);

    const results = useMemo(() => {
        const basicAmt = (data.calc.basicRate || 0) * (data.calc.presentDays || 0);
        const otAmt = (data.calc.overtimeHours || 0) * (data.calc.overtimeRate || 0);
        const allowanceItems = data.allowances.map(a => ({ label: a.label, amount: a.type === 'fixed' ? a.value : (a.value / 100) * basicAmt }));
        const deductionItems = data.deductions.map(d => ({ label: d.label, amount: d.type === 'fixed' ? d.value : (d.value / 100) * basicAmt }));
        const totalEarnings = basicAmt + otAmt + allowanceItems.reduce((acc, curr) => acc + curr.amount, 0);
        const totalDeductions = deductionItems.reduce((acc, curr) => acc + curr.amount, 0);
        return { basicAmt, otAmt, allowanceItems, deductionItems, totalEarnings, totalDeductions, netSalary: totalEarnings - totalDeductions };
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
        const newItem: DynamicItem = { id: Math.random().toString(36).substr(2, 9), label: section === 'allowances' ? "Allowance" : "Deduction", type: 'fixed', value: 0 };
        setData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    };

    const removeDynamic = (section: 'allowances' | 'deductions', id: string) => setData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
    
    const updateDynamic = (section: 'allowances' | 'deductions', id: string, field: keyof DynamicItem, value: any) => {
        setData(prev => ({ ...prev, [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item) }));
    };

    const handleClearAll = () => {
        setData({
            company: { ...data.company },
            employee: { name: "", empId: "", designation: "", department: "", doj: "", pan: "", uanNo: "", bankName: "", bankAccount: "", ifsc: "" },
            payPeriod: { month: "AUGUST", year: "2024" },
            calc: { basicRate: 0, presentDays: 0, totalDays: 30, overtimeHours: 0, overtimeRate: 0 },
            allowances: [],
            deductions: []
        });
        localStorage.removeItem('gr7_salary_slip_data_v2_persisted');
        toast({ title: "Form Cleared" });
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
                const pdf = new jsPDF({ 
                    orientation: 'portrait', 
                    unit: 'pt', 
                    format: 'a4' 
                });
                
                // Standard A4 in points is 595 x 842
                const pdfWidth = 595.28;
                const pdfHeight = 841.89;

                pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                
                pdf.viewerPreferences({
                    'FitWindow': true,
                    'CenterWindow': true,
                    'DisplayDocTitle': true
                });

                pdf.save(`Salary_Slip_${data.employee.name || 'document'}.pdf`);
            } else {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `Salary_Slip_${data.employee.name || 'document'}.jpg`;
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
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start px-4 pb-32 overflow-x-hidden">
            
            {/* HIDDEN EXPORT CANVAS */}
            <div className="fixed top-0 -left-[5000px] z-[-1] pointer-events-none">
                <div ref={exportRef} data-export-container style={{ width: '794px', height: '1123px', background: 'white', position: 'relative', overflow: 'hidden' }}>
                    <PayslipTemplate data={data} results={results} formatCurrency={formatCurrency} isExport />
                </div>
            </div>

            {/* SIDEBAR EDITOR */}
            <div className="lg:col-span-5 space-y-6 no-print max-h-[90vh] overflow-y-auto custom-scrollbar pr-2 text-left">
                <Card className="border-2 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-950 border-primary/10">
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
                            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-[9px] font-black uppercase text-rose-600 hover:bg-rose-50"><Eraser className="size-3 mr-1" /> Clear All</Button>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 md:p-8 space-y-10">
                        <div className="space-y-6">
                            <Badge className="bg-primary text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Business Details</Badge>
                            <div className="grid gap-4">
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Company Name</Label><Input value={data.company.name} onChange={(e) => updateNested('company', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Address</Label><Textarea value={data.company.address} onChange={(e) => updateNested('company', 'address', e.target.value)} className="rounded-xl border-2 font-medium" /></div>
                                <Button variant="outline" size="sm" className="w-full h-10 rounded-xl border-2 border-dashed font-black text-[10px] uppercase" onClick={() => logoInputRef.current?.click()}><UploadCloud className="size-4 mr-2" /> {data.company.logo ? "CHANGE LOGO" : "UPLOAD LOGO"}</Button>
                                <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Badge className="bg-blue-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Employee Profile</Badge>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Full Name</Label><Input value={data.employee.name} onChange={(e) => updateNested('employee', 'name', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Designation</Label><Input value={data.employee.designation} onChange={(e) => updateNested('employee', 'designation', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Department</Label><Input value={data.employee.department} onChange={(e) => updateNested('employee', 'department', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Employee ID</Label><Input value={data.employee.empId} onChange={(e) => updateNested('employee', 'empId', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">UAN Number</Label><Input value={data.employee.uanNo} onChange={(e) => updateNested('employee', 'uanNo', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Account No.</Label><Input value={data.employee.bankAccount} onChange={(e) => updateNested('employee', 'bankAccount', e.target.value)} className="h-10 rounded-xl font-bold border-2" /></div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Badge className="bg-purple-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Calculation Engine</Badge>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Basic Rate (Daily)</Label><Input type="number" value={data.calc.basicRate} onChange={(e) => updateNested('calc', 'basicRate', Number(e.target.value))} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Days Present</Label><Input type="number" value={data.calc.presentDays} onChange={(e) => updateNested('calc', 'presentDays', Number(e.target.value))} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Total Days</Label><Input type="number" value={data.calc.totalDays} onChange={(e) => updateNested('calc', 'totalDays', Number(e.target.value))} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Overtime Hours</Label><Input type="number" value={data.calc.overtimeHours} onChange={(e) => updateNested('calc', 'overtimeHours', Number(e.target.value))} className="h-10 rounded-xl font-bold border-2" /></div>
                                <div className="col-span-2 space-y-1.5"><Label className="text-[9px] font-black uppercase opacity-60">Overtime Rate (Hourly)</Label><Input type="number" value={data.calc.overtimeRate} onChange={(e) => updateNested('calc', 'overtimeRate', Number(e.target.value))} className="h-10 rounded-xl font-bold border-2" /></div>
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div className="flex justify-between items-center"><Badge className="bg-green-600 text-white font-black text-[9px] px-3 py-1 uppercase tracking-widest">Earnings/Deductions</Badge></div>
                             <div className="grid gap-3"><Button size="sm" variant="outline" onClick={() => handleAddDynamic('allowances')} className="h-10 rounded-xl border-dashed font-black text-[9px] uppercase text-primary">ADD ALLOWANCE</Button><Button size="sm" variant="outline" onClick={() => handleAddDynamic('deductions')} className="h-10 rounded-xl border-dashed font-black text-[9px] uppercase text-rose-50">ADD DEDUCTION</Button></div>
                             <div className="space-y-4">
                                {data.allowances.concat(data.deductions).map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl border-2">
                                        <Input value={item.label} onChange={(e) => updateDynamic(data.allowances.includes(item) ? 'allowances' : 'deductions', item.id, 'label', e.target.value)} className="flex-1 h-8 text-[10px] font-bold border-none" />
                                        <Input type="number" value={item.value} onChange={(e) => updateDynamic(data.allowances.includes(item) ? 'allowances' : 'deductions', item.id, 'value', Number(e.target.value))} className="w-16 h-8 text-center font-black text-[10px]" />
                                        <Button size="icon" variant="ghost" className="size-7 text-destructive" onClick={() => removeDynamic(data.allowances.includes(item) ? 'allowances' : 'deductions', item.id)}><Trash2 className="size-3.5" /></Button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/10 p-8 border-t flex flex-col gap-4">
                        <Button onClick={() => handleExport('pdf')} disabled={isExporting} className="w-full h-16 md:h-20 text-lg md:text-xl font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-[1.5rem] group border-4 border-primary">
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
                width: '794px', height: '1123px', padding: '40px 40px 60px 40px',
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
                <h2 className="text-xl font-black uppercase tracking-widest inline-block border-y-2 border-slate-900 py-2 px-12">Pay Slip</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">MONTHLY STATEMENT OF EARNINGS & DEDUCTIONS</p>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-10 mb-3 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-200 text-left overflow-visible">
                <Row label="Employee Name" value={data.employee.name} />
                <Row label="Employee ID" value={data.employee.empId} />
                <Row label="Designation" value={data.employee.designation} />
                <Row label="Department" value={data.employee.department} />
                <Row label="UAN Number" value={data.employee.uanNo} />
                <Row label="Bank Account" value={data.employee.bankAccount} />
                <Row label="Total Days" value={String(data.calc.totalDays)} />
                <Row label="Present Days" value={String(data.calc.presentDays)} />
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
                    <span className="text-sm font-black text-rose-600">({formatCurrency(results.totalDeductions)})</span>
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
                    <p className="text-[11px] font-medium leading-relaxed italic text-slate-500">"This is a system-generated salary statement. It is digitally verified and does not require a physical seal."</p>
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
