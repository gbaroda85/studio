
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
    Download, 
    RefreshCcw, 
    Eye, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Sparkles, 
    Settings2,
    FileText,
    Building2,
    User2,
    Calendar,
    IndianRupee,
    Printer,
    Monitor,
    Baseline,
    Info,
    Smartphone,
    LayoutGrid,
    Receipt,
    ListFilter,
    ChevronRight,
    SearchCode,
    Plus,
    Trash2,
    Wallet,
    Briefcase,
    Banknote,
    ReceiptText,
    Loader2,
    Calculator,
    Coins,
    TrendingDown,
    CreditCard
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

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
        overtimeHours: 0,
        overtimeRate: 0
    },
    allowances: [
        { id: '1', label: 'House Rent', type: 'percentage', value: 16 },
        { id: '2', label: 'Washing Al', type: 'percentage', value: 3 }
    ],
    deductions: [
        { id: '1', label: 'Provident', type: 'percentage', value: 12 },
        { id: '2', label: 'Professior', type: 'fixed', value: 200 }
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
    
    const previewRef = useRef<HTMLDivElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setData(prev => ({ ...prev, company: { ...prev.company, logo: ev.target?.result as string } }));
                toast({ title: "Logo Set", description: "Company branding updated." });
            };
            reader.readAsDataURL(file);
        }
    };

    const updateNested = (section: keyof SalaryData, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            }
        }));
    };

    const handleAddDynamic = (section: 'allowances' | 'deductions') => {
        const newItem: DynamicItem = {
            id: Math.random().toString(36).substr(2, 9),
            label: section === 'allowances' ? "New Allowance" : "New Deduction",
            type: 'fixed',
            value: 0
        };
        setData(prev => ({ ...prev, [section]: [...prev[section], newItem] }));
    };

    const removeDynamic = (section: 'allowances' | 'deductions', id: string) => {
        setData(prev => ({ ...prev, [section]: prev[section].filter(item => item.id !== id) }));
    };

    const updateDynamic = (section: 'allowances' | 'deductions', id: string, field: keyof DynamicItem, value: any) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    // --- CALCULATIONS ---
    const results = useMemo(() => {
        const basicAmt = data.calc.basicRate * data.calc.presentDays;
        const otAmt = data.calc.overtimeHours * data.calc.overtimeRate;
        
        const allowanceItems = data.allowances.map(a => ({
            label: a.label,
            amount: a.type === 'fixed' ? a.value : (a.value / 100) * basicAmt
        }));

        const deductionItems = data.deductions.map(d => ({
            label: d.label,
            amount: d.type === 'fixed' ? d.value : (d.value / 100) * basicAmt
        }));

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

    const handleExport = async () => {
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
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            pdf.save(`Salary_Slip_${data.employee.name.replace(/\s+/g, '_')}_${data.payPeriod.month}.pdf`);
            
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            toast({ title: "Salary Slip Exported!", description: "High-resolution PDF ready." });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Export Failed' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleReset = () => {
        setData(INITIAL_DATA);
        toast({ title: "Form Restored" });
    };

    return (
        <div className="w-full max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-start px-4 pb-32">
            
            {/* LEFT: INPUTS (MATCHING IMAGE DESIGN) */}
            <div className="lg:col-span-5 space-y-6 no-print max-h-[90vh] overflow-y-auto custom-scrollbar pr-2">
                
                {/* 1. EMPLOYEE DETAILS CARD */}
                <Card className="border shadow-md rounded-[1rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Employee Name</Label>
                                <Input value={data.employee.name} onChange={(e) => updateNested('employee', 'name', e.target.value)} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Designation</Label>
                                <Input value={data.employee.designation} onChange={(e) => updateNested('employee', 'designation', e.target.value)} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">UAN No.</Label>
                                <Input value={data.employee.uanNo} onChange={(e) => updateNested('employee', 'uanNo', e.target.value)} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Date of Joining</Label>
                                <Input value={data.employee.doj} onChange={(e) => updateNested('employee', 'doj', e.target.value)} placeholder="e.g., DD/MM/YYYY" className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. BANK DETAILS CARD */}
                <Card className="border shadow-md rounded-[1rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardHeader className="py-4 px-6 bg-white border-b-0">
                         <CardTitle className="text-xl font-black flex items-center gap-3">
                            <CreditCard className="size-5 text-blue-400" /> Bank Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Bank Account No.</Label>
                                <Input value={data.employee.bankAccount} onChange={(e) => updateNested('employee', 'bankAccount', e.target.value)} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">IFSC Code</Label>
                                <Input value={data.employee.ifsc} onChange={(e) => updateNested('employee', 'ifsc', e.target.value)} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. SALARY CALCULATION CARD */}
                <Card className="border shadow-md rounded-[1rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardHeader className="py-4 px-6 bg-white border-b-0">
                         <CardTitle className="text-xl font-black flex items-center gap-3">
                            <Calculator className="size-5 text-green-500" /> Salary Calculation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Basic Salary Rate (per day, ₹)</Label>
                                <Input type="number" value={data.calc.basicRate} onChange={(e) => updateNested('calc', 'basicRate', Number(e.target.value))} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Present Days</Label>
                                <Input type="number" value={data.calc.presentDays} onChange={(e) => updateNested('calc', 'presentDays', Number(e.target.value))} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Overtime (Hours)</Label>
                                <Input type="number" value={data.calc.overtimeHours} onChange={(e) => updateNested('calc', 'overtimeHours', Number(e.target.value))} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-700">Overtime Rate (₹/hour)</Label>
                                <Input type="number" value={data.calc.overtimeRate} onChange={(e) => updateNested('calc', 'overtimeRate', Number(e.target.value))} className="h-10 bg-slate-50 border-none rounded-lg font-medium" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. ALLOWANCES CARD */}
                <Card className="border shadow-md rounded-[1rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardHeader className="py-4 px-6 bg-white border-b-0">
                         <CardTitle className="text-xl font-black flex items-center gap-3">
                            <Coins className="size-5 text-green-500" /> Allowances
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {data.allowances.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 animate-in slide-in-from-bottom-2">
                                <Input value={item.label} onChange={(e) => updateDynamic('allowances', item.id, 'label', e.target.value)} className="flex-1 h-10 bg-slate-50 border-none rounded-lg text-xs" />
                                <Select value={item.type} onValueChange={(v) => updateDynamic('allowances', item.id, 'type', v)}>
                                    <SelectTrigger className="w-32 h-10 bg-slate-50 border-none rounded-lg text-[10px] uppercase font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="number" value={item.value} onChange={(e) => updateDynamic('allowances', item.id, 'value', Number(e.target.value))} className="w-20 h-10 bg-slate-50 border-none rounded-lg text-center font-bold" />
                                <Button size="icon" variant="ghost" className="size-8 text-slate-400 hover:text-destructive" onClick={() => removeDynamic('allowances', item.id)}><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddDynamic('allowances')} className="h-10 border-none bg-slate-50 rounded-lg text-[10px] font-black uppercase hover:bg-primary/10 hover:text-primary">Add Allowance</Button>
                    </CardContent>
                </Card>

                {/* 5. DEDUCTIONS CARD */}
                <Card className="border shadow-md rounded-[1rem] overflow-hidden bg-white dark:bg-slate-950">
                    <CardHeader className="py-4 px-6 bg-white border-b-0">
                         <CardTitle className="text-xl font-black flex items-center gap-3">
                            <TrendingDown className="size-5 text-rose-500" /> Deductions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {data.deductions.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 animate-in slide-in-from-bottom-2">
                                <Input value={item.label} onChange={(e) => updateDynamic('deductions', item.id, 'label', e.target.value)} className="flex-1 h-10 bg-slate-50 border-none rounded-lg text-xs" />
                                <Select value={item.type} onValueChange={(v) => updateDynamic('deductions', item.id, 'type', v)}>
                                    <SelectTrigger className="w-32 h-10 bg-slate-50 border-none rounded-lg text-[10px] uppercase font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl border-2">
                                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input type="number" value={item.value} onChange={(e) => updateDynamic('deductions', item.id, 'value', Number(e.target.value))} className="w-20 h-10 bg-slate-50 border-none rounded-lg text-center font-bold" />
                                <Button size="icon" variant="ghost" className="size-8 text-slate-400 hover:text-destructive" onClick={() => removeDynamic('deductions', item.id)}><Trash2 className="size-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddDynamic('deductions')} className="h-10 border-none bg-slate-50 rounded-lg text-[10px] font-black uppercase hover:bg-rose-100 hover:text-rose-600">Add Deduction</Button>
                    </CardContent>
                </Card>

                {/* EXPORT SECTION */}
                <div className="space-y-4 pt-4 no-print">
                    <Button onClick={handleExport} disabled={isExporting} className="w-full h-16 text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl rounded-2xl group transition-all active:scale-95 border-4 border-primary hover:bg-transparent hover:text-primary">
                        {isExporting ? <Loader2 className="animate-spin mr-3 size-8" /> : <Printer className="mr-3 size-8 group-hover:rotate-12 transition-transform" />}
                        GENERATE SALARY SLIP
                    </Button>
                </div>
            </div>

            {/* RIGHT: A4 PREVIEW */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
                
                <div className="w-full flex items-center justify-between mb-4 px-4 no-print">
                    <div className="flex items-center gap-2">
                        <Eye className="size-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Live Preview</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-600 text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-white shadow-lg animate-pulse">A4 LAYOUT</Badge>
                </div>

                <div className="w-full flex justify-center bg-slate-300/30 dark:bg-slate-950/50 rounded-[3rem] p-4 md:p-12 shadow-inner border-[6px] border-white/5 transition-all">
                    <div className="relative transform-gpu scale-[0.45] sm:scale-[0.7] lg:scale-[0.85] xl:scale-100 origin-top h-auto shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)]">
                         
                         {/* THE ACTUAL PAYSILP CONTAINER */}
                         <div 
                            ref={previewRef}
                            className="bg-white p-[15mm] flex flex-col text-slate-900 shadow-none border-0"
                            style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Inter, sans-serif' }}
                         >
                            {/* Header Branding */}
                            <header className="flex justify-between items-center mb-10 pb-8 border-b-4 border-slate-900">
                                <div className="space-y-1 max-w-[70%] text-left">
                                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{data.company.name}</h1>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed mt-2">{data.company.address}</p>
                                </div>
                                {data.company.logo ? (
                                    <img src={data.company.logo} className="h-16 w-auto object-contain" alt="logo" />
                                ) : (
                                    <div className="size-20 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                                        <Building2 className="size-10 text-slate-300" />
                                    </div>
                                )}
                            </header>

                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black uppercase tracking-[0.3em] inline-block border-y-2 border-slate-900 py-1.5 px-10">Pay Slip</h2>
                                <p className="text-sm font-bold text-slate-500 mt-2 uppercase">MONTHLY STATEMENT OF EARNINGS & DEDUCTIONS</p>
                            </div>

                            {/* Employee Details Grid */}
                            <div className="grid grid-cols-2 gap-y-3 gap-x-12 mb-10 bg-slate-50 p-8 rounded-3xl border border-slate-200 text-left">
                                <Row label="Employee Name" value={data.employee.name} />
                                <Row label="Employee ID" value={data.employee.empId} />
                                <Row label="Designation" value={data.employee.designation} />
                                <Row label="Department" value={data.employee.department} />
                                <Row label="Date of Joining" value={data.employee.doj} />
                                <Row label="UAN Number" value={data.employee.uanNo} />
                                <Row label="Bank Account" value={data.employee.bankAccount} />
                                <Row label="IFSC Code" value={data.employee.ifsc} />
                            </div>

                            {/* Table Sections */}
                            <div className="grid grid-cols-2 border-2 border-slate-900 flex-1 min-h-[400px]">
                                {/* Earnings Column */}
                                <div className="border-r-2 border-slate-900 text-left">
                                    <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-black uppercase tracking-widest">Earnings (In INR)</div>
                                    <div className="p-4 space-y-4">
                                        <TableItem label="Basic Amount" value={results.basicAmt} />
                                        {results.otAmt > 0 && <TableItem label={`Overtime (${data.calc.overtimeHours} Hrs)`} value={results.otAmt} />}
                                        {results.allowanceItems.map((a, i) => (
                                            <TableItem key={i} label={a.label} value={a.amount} />
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Deductions Column */}
                                <div className="text-left">
                                    <div className="bg-slate-900 text-white p-3 text-center text-[10px] font-black uppercase tracking-widest">Deductions (In INR)</div>
                                    <div className="p-4 space-y-4">
                                        {results.deductionItems.map((d, i) => (
                                            <TableItem key={i} label={d.label} value={d.amount} isDeduction />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Totals Row */}
                            <div className="grid grid-cols-2 border-x-2 border-b-2 border-slate-900 text-left">
                                <div className="p-4 flex justify-between items-center border-r-2 border-slate-900">
                                    <span className="text-[11px] font-black uppercase">Gross Earnings</span>
                                    <span className="text-sm font-black">{formatCurrency(results.totalEarnings)}</span>
                                </div>
                                <div className="p-4 flex justify-between items-center bg-rose-50/50">
                                    <span className="text-[11px] font-black uppercase">Total Deductions</span>
                                    <span className="text-sm font-black text-rose-600">{formatCurrency(results.totalDeductions)}</span>
                                </div>
                            </div>

                            {/* Net Salary Section */}
                            <div className="mt-12 p-8 bg-slate-900 text-white rounded-3xl flex justify-between items-center shadow-xl text-left">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Net Monthly Take-home</p>
                                    <h3 className="text-4xl font-black tracking-tighter">{formatCurrency(results.netSalary)}</h3>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                                        <Sparkles className="size-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase">PRO RENDER SUCCESS</span>
                                    </div>
                                </div>
                            </div>

                            {/* Declarations & Signature */}
                            <div className="mt-12 grid grid-cols-2 gap-12 items-end">
                                <div className="p-6 border-l-4 border-primary bg-slate-50 rounded-r-2xl text-left">
                                    <p className="text-[9px] font-black uppercase text-primary mb-2">Notice</p>
                                    <p className="text-[10px] font-medium leading-relaxed italic text-slate-500">
                                        "This is a computer generated salary statement and does not require a physical signature for digital use."
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-48 h-16 border-b-2 border-slate-200 mb-2 relative">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                                            <span className="text-3xl font-black uppercase tracking-widest">OFFICIAL</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Signatory</p>
                                </div>
                            </div>

                            <footer className="mt-auto pt-10 text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-300">© GENERATED BY GR7 IMAGE PDF TOOLS HUB STUDIO</p>
                            </footer>

                         </div>

                    </div>
                </div>

                <div className="mt-8 flex items-center gap-6 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest no-print">
                    <div className="flex items-center gap-2"><ShieldCheck className="size-3 text-green-500" /> SECURE RAM</div>
                    <div className="flex items-center gap-2"><Zap className="size-3 text-yellow-500" /> INSTANT RENDER</div>
                    <div className="flex items-center gap-2"><Sparkles className="size-3 text-primary" /> HD STUDIO OUTPUT</div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}

// INTERNAL UTILS
function Row({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-baseline gap-4 text-[12px]">
            <span className="w-32 font-black text-slate-400 shrink-0 uppercase text-[9px] tracking-tight">{label}</span>
            <span className="font-bold border-b border-dotted border-slate-200 flex-1 pb-1 text-slate-800 truncate">{value || "---"}</span>
        </div>
    );
}

function TableItem({ label, value, isDeduction }: { label: string, value: number, isDeduction?: boolean }) {
    return (
        <div className="flex justify-between items-center text-[12px]">
            <span className="font-bold text-slate-600 uppercase tracking-tight text-[10px]">{label}</span>
            <span className={cn("font-black", isDeduction ? "text-rose-600" : "text-slate-900")}>
                {isDeduction && value > 0 ? '-' : ''}{Math.round(value).toLocaleString()}
            </span>
        </div>
    );
}
